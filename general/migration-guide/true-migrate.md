<script setup>

</script>
# Migration Guide

## Migrating froxlor to a new server

### Requirements
We assume that your new server is set up and running to a point where we can install froxlor. It is not necessary to use the same packages or even the same versions as on the old server.

::: warning
This guide is for advanced users only. Only use it if you know what you are doing, if you are able and willing to debug scripts and read log files. It would also help if you have a vague understanding of shell scripting and SQL.
:::

You will need to transfer files between your servers. This could be done using `scp`, or you could mount the filesystem of your old server to a folder on your new server using `sshfs`. However, since there are endless possibilities and everyone has their own preferences, we will not describe any single method in detail here. Instead, we will describe a "fail-safe" version using `tar`. If you feel comfortable using `rsync`, we strongly recommend that you do so. However, it is important that file ownership and permissions are transferred to the new server.

### Considerations up front
This method gives you the flexibility to switch your services and versions. For example, you could use MySQL on your old server and MariaDB on your new server. However, in order for everything to go as smoothly as possible, you should be aware of a few things.

You see, when your customers create new databases, froxlor only keeps an index of which ones it has created. The actual credentials are stored by the DBMS itself. This is also the part where this guide gets more involved than the [cloning method](clone.html) (which we would still recommend for most users). Since froxlor does not actually know the passwords of the database users, it will not be able to recreate them on a new host.

For most users, the main difference between MariaDB and MySQL will be that MySQL 8 deprecates the old `mysql_native_password` hashing algorithm for storing passwords, while MariaDB does not support MySQL's new `caching_sha2_password` (and instead sticks with the former).

You should be aware of this. If you are switching from **MySQL 8 to MariaDB**, be prepared to update passwords. If you are switching from **MariaDB to MySQL**, be prepared to update passwords. If you are staying with MySQL, check if you need to update passwords. If you are staying with MariaDB, no password changes are expected.

### (MySQL only) Step 0: Consult `/var/log/mysql/error.log`
Currently (as of writing: 8.0.36) MySQL warns in its error log file about the use of `mysql_native_password` if a user still uses this hashing method. Since Oracle plans to drop support for this method in a future release, you should upgrade to the new hashing algorithm to avoid problems down the road.

To do this, you would log on to your MySQL server:
```shell
mysql --user=root --password --database=mysql
```
and query for users using the old plugin:
```sql
SELECT User FROM user WHERE plugin = 'mysql_native_password' GROUP BY User;
```

On a system that only runs froxlor and websites for customers, there are not too many users that we care about. We can safely ignore:
* root (which will be recreated on the new server anyway)
* froxroot (which will be recreated on the new server anyway)
* mysql.infoschema (we won't carry that one over)
* mysql.session (we won't carry that one over)
* mysql.sys (we won't carry that one over)
* debian-sys-maint (if it exists - we won't carry that one over)

Where we would need to update passwords is if **froxlor** or any customer database users are using the old hashing algorithm. The password for the `froxlor` username is easy enough to get, it can be found in `/var/www/html/froxlor/lib/userdata.inc.php`. Your customers' passwords are a bit trickier. You may want to grep your customers' files for the username (e.g. `johndoesql69`). Many applications that use MySQL (e.g. WordPress) store the credentials side-by-side, so these passwords should be fairly easy to find that way.

You should create a map in a text editor where you store all the users whose passwords you need to update.

Login to MySQL with your root credentials:
```shell
mysql --user=root --password
```

And run this query for each user who needs a password update:

```sql
ALTER USER 'username' IDENTIFIED BY 'password';
```

### Preparation
Before you start, you should stop any services that might create user data, as this will not be part of our backup. Think about your web server, FTP daemon, and mail server. For a basic installation with Apache, ProFTPd, Postfix and Dovecot, this would be your line (you may want to adjust this for the services you actually use):
```shell
systemctl stop apache2 proftpd postfix dovecot
```

This will (obviously) cause most of your server to go down, so prepare your customers beforehand. Note that we did not shut down MySQL/MariaDB because we need to dump the databases.

### Dumping all your databases
Dumping all your databases is quite simple. You can use a script to do this. Put it in a safe place like `~/froxlor-migration/` and name it `dump-em-all.sh`. Also give it execute permissions (`chmod +x ~/froxlor-migration/dump-em-all.sh`). It should look like this (change MYSQL_PWD to your root password):
```bash
#!/bin/bash

IFS="
"

export MYSQL_PWD=MySecretRootPasswordHere

DBLIST=`mktemp`

mysqlshow --user=root | awk '{print $2}' | grep -v 'Databases' | grep -v 'information_schema' | grep -v 'performance_schema' > $DBLIST

for DB in `cat $DBLIST`; do
    if [ "$DB" == "sys" ]; then
        continue;
    fi;

    echo "Dumping "$DB"..."
    mysqldump --user=root --opt --max_allowed_packet=1G --single-transaction --default-character-set=utf8mb4 $DB > $DB.sql;
done;

rm $DBLIST
echo "All done!"

```

### Transfer files
Now it's time to transfer your data to the new server. That would be your SQL dumps (if you followed the example, it's in `~/froxlor-migration/`), your froxlor installation (by default in `/var/www/html/froxlor`) and your customer data (by default in `/var/customers/`).

### Pretend to install froxlor
Make sure that your new server has all the software installed that is needed to run froxlor.

If you are using non-default packages, such as custom PHP versions or a different database server, now is the time to add the necessary repositories and install the packages accordingly.

Consult the [installation guide](../installation/) to see the current system requirements and how to install froxlor. Follow your preferred installation guide up to the point where you create the privileged database user. Use the same username and password you used on your old server.

### Preparing and importing databases
We created a dump of all the databases on the old server. Now it's time to recreate them. To do this, go to the folder with your *.sql dumps and create a new file, name it `create-db.sh` and give it execute permissions. It should look like this (again change MYSQL_PWD to your MySQL root password):
```bash
#!/bin/bash

IFS="
"

export MYSQL_PWD=MySecretRootPasswordHere

for DBFile in `ls -1 *.sql`; do
    if [ "$DBFile" == "mysql.sql" ]; then
        continue;
    fi;

    DB=${DBFile//".sql"/}

    echo "Importing "$DB" from "$DBFile"..."

    echo "CREATE DATABASE $DB;" | mysql --user=root
    mysql --user=root --default-character-set=utf8mb4 --database=$DB < $DBFile
done;

echo "All done!"

```

After this script has finished, the databases will be imported again. All that is left is the users. And this is the fun part, which is not to say the part where you could use some SQL knowledge.

Open mysql.sql in your favorite editor. Delete everything from the top up to
```sql
INSERT INTO `db` VALUES
```
(do not delete this line)
After that statement, delete everything from the comment until you find
```sql
INSERT INTO `user` VALUES
```
(again, do not delete this line)
And again, after that statement, there should be a comment, and from there to the end, you delete everything.

Now you want to do some search and replace magic for better readability. You want to find `),(` and replace it with `),\n(` (or however you would tell your editor that you want a line break after the comma). For example, if you are using `mcedit`, you could achieve this by searching for `\),\(` and replacing it with `),\n(` in `Regular Expression` mode.

You should now see a bunch of lines. These represent your databases' privileges and your database users. Navigate to the lines that contain either of these:
* `performance_schema`
* `mysql.sys`
* `mysql.infoschema`
* `mysql.session`
* `froxroot`
* `root`
and delete them.

Once the editor is open, you would now do a little search and replace for your old IP addresses and replace them with your new IP addresses.

When done, save the file and import it into your mysql:
```shell
mysql --user=root --database=mysql < mysql.sql
```

~~For good measure~~ Because we have done something that a sane service would not really appreciate, you should now restart MySQL, which will also cause it to reload all the user data:
```shell
service mysql restart
```

If MySQL seems happy enough, then congratulations, you have done the hard part. The rest should be easy.

#### Have froxlor create its environment
Earlier, we search-replace'd IP addresses, but that was for the database and frankly, we only did it because it was convenient at the time. But froxlor also has a list of IP addresses that most likely need to be changed. Froxlor comes with a CLI tool to replace the old ones with the new ones:
```shell
cd /var/www/html/froxlor
bin/froxlor-cli froxlor:switch-server-ip --switch=123.10.20.30,234.30.20.10
bin/froxlor-cli froxlor:switch-server-ip --switch=2001:db8:beef::69,2001:db8:cafe::420
```

Now we have to let froxlor configure all the necessary services like your web server (e.g. Apache or nginx), the mail configuration, FTP and everything else. For this, we use froxlor's CLI tool, since the web interface would probably not work yet.
```shell
cd /var/www/html/froxlor
bin/froxlor-cli froxlor:config-services -c
```

Froxlor CLI will now ask you about your Linux distribution and the services you want to use and create a configuration list. At the end of the process, it'll offer you to make any necessary changes to the configuration files that you want to accept.

### Finishing touches
Almost done! Froxlor and all your customer's projects should work now. As a last step you should login to froxlor and go to System -> Settings -> System Settings. Here you might want to adjust the hostname. If so, you will also have to reconfigure the mail server but this is no problem with froxlor's automatic configuration.

All that remains is to change the DNS settings and shut down the old server.

<script setup>

</script>
# Migration Guide

## Migrate Froxlor to a new server

### Requirements
We assume your new server is set up and running to a point at which we could install Froxlor. It is not necessary that you use the same packages, or the same versions even, than you did on the old server.

**This guide is for advanced users only. Only use it if you know what you are doing, if you are able and willing to debug scripts and to read log files. It would also help if you have a vague understanding of shell scripting and SQL.**

In the process, you will have to transfer files between your servers. This could be achieved using `scp`, or you could mount your old server's file system into a folder on your new server using `sshfs`. However, since there are endless possibilities and everyone has their own preferences, we will not describe one single method here in detail. Instead, we vaguely describe a "fail-safe" version with `tar`. If you feel confident with the use of `rsync`, we strongly suggest you go for that. It is important however that file ownerships and file permissions are carried over to the new server.

### Considerations beforehand
This method gives you the flexibility to switch your services and versions around. For example, you could use MySQL on your old server and MariaDB on your new server. However, for everything to go as smooth as possible, you should be aware of a few things.

See, when you add databases in Froxlor, Froxlor itself actually just keeps an index of which databases it created. The actual credentials are stored by the DBMS itself. This also is mostly the part where this guide becomes more involved than the [cloning method](clone.html) (that we would still recommend for most users). Because Froxlor does not actually know the database user's password, it will not be able to re-create them on a new host.

For most users, the main difference between MariaDB and MySQL will be that MySQL 8 deprecates the old `mysql_native_password` hashing algorithm for storing passwords, whereas MariaDB does not support MySQL's new `caching_sha2_password` (and sticks with the former instead).

You should be aware of this. If you change from **MySQL 8 to MariaDB**, prepare to change passwords. If you change from **MariaDB to MySQL**, prepare to change passwords. If you stick with MySQL, check if you might have to change passwords. If you stick with MariaDB, no password changes are to be expected.

### (MySQL only) Step 0: Consult `/var/log/mysql/error.log`
Currently (as of writing: 8.0.36) MySQL warns in its error log file about the usage of `mysql_native_password` if any user still uses this hashing method. Since Oracle plans on removing support for this method in a future version, you should update to the new hashing algorithm to avoid problems in the future.

To do that, you would log in to your MySQL server
````shell
mysql --user=root --password --database=mysql
````
and query for users that use the old plugin:
````sql
SELECT User FROM user WHERE plugin = 'mysql_native_password' GROUP BY User;
````

On a system that only runs Froxlor and websites for the customers, there not all that many users we care about. We can safely ignore:
* root (which is re-created on the new server anyway)
* froxroot (which is re-created on the new server anyway)
* mysql.infoschema (we won't carry that over)
* mysql.session (we won't carry that over)
* mysql.sys (we won't carry that over)
* debian-sys-maint (if exists - we won't carry that over)

Where we would have to change passwords would be if **froxlor** or any customer database users use the old hashing algorithm. The password for the `froxlor` username is easy enough to get, it can be read from `/var/www/html/froxlor/lib/userdata.inc.php`. Your customers' passwords are a bit harder. Here you might want to grep your customers' files for the username (e.g. `johndoesql69`). Many applications using MySQL (e.g. WordPress) store the credentials next to each other, so these passwords should be fairly easy to find that way.

You should create yourself a map in a text editor where you store all the users that you would have to change the passwords for.

Login to MySQL with your root credentials:
````shell
mysql --user=root --password
````

And run this query for each user that needs a password update:

````sql
ALTER USER 'username' IDENTIFIED BY 'password';
````

Before you start, you should stop services that could create user data as this would not be part of our backup. Think of your web server, FTP daemon and mail server. For a basic installation using Apache, ProFTPd, Postfix, and Dovecot, this would be your line (you might want to adjust this for the services you are actually using):
````shell
systemctl stop apache2 proftpd postfix dovecot
````

This will (obviously) cause most of your server to go down, so prepare your customers beforehand. Please note that we did not shut down MySQL/MariaDB because we need to dump the databases.

### Dump all your databases
Dumping all your databases is fairly straight-forward. You can use a script for that. Put it in a safe location, such as `~/froxlor-migration/` and call it `dump-em-all.sh`. Also, give it execution rights (`chmod +x ~/froxlor-migration/dump-em-all.sh`). It should have the following content (adjust MYSQL_PWD to your root password):
````bash
#!/bin/bash

IFS="
"

export MYSQL_PWD=MySecretRootPasswordHere

DBLIST=`mktemp`

mysqlshow --user=root | awk '{print $2}' | grep -v 'Databases' | grep -v 'information_schema' | grep -v 'performance_schema' | grep -v 'sys'  > $DBLIST

for DB in `cat $DBLIST`; do
    echo "Dumping "$DB"..."
    mysqldump --user=root --opt --max_allowed_packet=1G --single-transaction --default-character-set=utf8mb4 $DB > $DB.sql;
done;

rm $DBLIST
echo "All done!"

````

### Transfer files
Now it's time to transfer your data to the new server. That would be your SQL dumps (if you followed the example, it's in `~/froxlor-migration/`), your Froxlor installation (by default in `/var/www/html/froxlor`) and your customers' data (by default in `/var/customers/`).

### Pretend to install Froxlor
Make sure your new server has installed all the software that is required to run Froxlor.

If you were using non-default packages, such as custom PHP versions or another database server, now it would be the time to add the necessary repositories and install the packages accordingly.

Consult the [installation guide](../installation/) to see the current system requirements and how to install Froxlor. Follow your prefered installation guide up to the point where you create the privileged database user. Use the same username and password that you also used on your old server.

### Prepare and import databases
On the old server, we created a dump of all databases. Now it's time to create them anew. For that, head over to the folder that includes your *.sql dumps and create a new file, call it `create-db.sh` and give it execution permissions. Its contents should be:
````bash
#!/bin/bash

IFS="
"

export MYSQL_PWD=MySecretRootPasswordHere

for DBFile in `ls -1 *.sql`; do
    if [ "$DBFile" -eq "mysql.sql" ];
        continue;
    done;

    DB=`echo $DBFile | tr -d '.sql'`

    echo "Importing "$DB" from "$DBFile"..."

    echo "CREATE DATABASE '$DB';" | mysql --user=root
    mysql --user=root --default-character-set=utf8mb4 --database=$DB < $DBFile
done;

echo "All done!"

````

After this script is done, the databases would be re-imported. All that is left now is the users. And this is the fun part, which is not to say, the part where you could use some SQL knowledge.

Open mysql.sql in your favorite editor. Delete everything from the beginning until
````sql
INSERT INTO `db` VALUES
````
(do not delete this line)
After that statement, delete everything from the comment until you find
````sql
INSERT INTO `user` VALUES
````
(again, do not delete this line)
And once again, after that statement, there should be a comment and from there until the end, you are deleting everything.

Now you want to do a little search and replace magic for better readability. You want to find `),(` and replace it with `),\n(` (or however you would tell your editor that you want a line break after the comma). If you for example use `mcedit`, you could achieve this by searching for `\),\(` and replacing with `),\n(` in `Regular Expression` mode.

You should see a bunch of lines now. These represent your databases permissions and your database users. Navigate to lines that include either of those:
* `performance_schema`
* `mysql.sys`
* `mysql.infoschema`
* `mysql.session`
* `froxroot`
* `root`
and delete them.

Once the editor is open, you would do a little search and replace now for your old IP addresses and replace them with your new IP addresses.

When done, save the file and import it to your mysql:
````shell
mysql --user=root --database=mysql < mysql.sql
````

~~For good measurement~~ Because we did something a sane service would not really appreciate, you should restart MySQL now which would also make it re-load all the user data:
````shell
service mysql restart
````

If MySQL seems happy enough, then congratulations, you did the hardest part. The rest should be easy.

#### Have Froxlor create its environment
Earlier, we search-replace'd IP adresses, but that was for the database and quite frankly, we only did it because it was convenient at this point. But Froxlor also has a list of IP addresses that most likely need changing. Froxlor comes with a CLI tool to change the old ones with the new ones:
````shell
cd /var/www/html/froxlor/bin
./froxlor-cli froxlor:switch-server-ip --switch=123.10.20.30,234.30.20.10
````

Now we have to configure Froxlor all the necessary services such as your web server (e.g. Apache or nginx), the mail configuration, FTP and everything else. For that, we use Froxlor's CLI tool as the web interface would likely not yet work.
````shell
cd /var/www/html/froxlor/bin
./froxlor-cli froxlor:config-services -c
````

Froxlor CLI will now ask you about your distro and the services you want to use and create a configuration list. At the end of the process, it'll offer you to apply all the necessary changes to the config files which you want to accept.

### Finishing touches
Almost done! Froxlor and all your customer's projects should work now. As a final step, you want to login into Froxlor and head to System, Settings, System Settings. Here you may want to adjust the hostname. If so, this would also yield a re-configuration of the mail server but this is no big deal with Froxlor's automatic configuration.

All that is left now is to change DNS settings and shut down the old server.
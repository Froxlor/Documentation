<script setup>

</script>
# Migration Guide

## Cloning froxlor to a new server

### Requirements
We assume that your new server is (or will be) set up in the same way as the old server. This means that you are using the same operating system, the same version, the same flavor of MySQL or MariaDB.

In preparation, you should make sure that everything on your old host is up to date, i.e. your web server, PHP versions, froxlor, and so on.

It would also be a good idea to have a way to transfer files between your servers. This could be done using `scp`, or you could mount the filesystem of your old server to a folder on your new server using `sshfs`. However, since there are endless possibilities and everyone has their own preferences, we will not describe any single method in detail here. Instead, we will describe a "fail-safe" version using `tar`. If you feel comfortable using `rsync`, we strongly recommend that you do so. However, it is important that file ownership and permissions are transferred to the new server.

Before you start, you should stop any services that might create user data, as this will not be part of our backup. Think about your web server, database, FTP daemon, and mail server. For a basic installation with Apache, MySQL, ProFTPd, Postfix and Dovecot, this would be your line (you may want to adjust this for the services you actually use):
```shell
systemctl stop apache2 mysql proftpd postfix dovecot
```

This will (obviously) cause most of your server to go down, so prepare your customers beforehand.

### Pretend to install froxlor
Make sure your new server has all the software needed to run froxlor installed.

If you are using non-default packages, such as custom PHP versions or a different database server, now is the time to add the necessary repositories and install the packages accordingly.

Consult the [installation guide](../installation/) to see the current system requirements and how to install froxlor. Follow your preferred installation guide up to the point where you **would** create the privileged database user.

### Moving files from the old host
In general, we now need data from three sources:
* Froxlor's configuration files
* MySQL/MariaDB databases
* Customer documents

#### Froxlor
Assuming froxlor is installed in its default location (`/var/www/html/froxlor/`), we need at least one file:
* `/var/www/html/froxlor/lib/userdata.inc.php`
* `/var/www/html/froxlor/lib/config.inc.php` (if it exists)

Copy them to `/var/www/html/froxlor/lib/` on your new server.

#### Databases
Next up is the database. We will take the easy, straightforward route here, but this is the point where it is **most important** that both your old and your new server are running the same software, i.e. the same flavor of your DBMS (i.e. MariaDB vs. MySQL), with the same configuration! The version on your old server may be older, so when you first start the new server, all your data should be checked and updated if necessary. However, if you were running the exact same version, you also have a little sanity check that everything worked before the migration (fewer possible points of failure).

First, stop the database service on **both** servers (depending on your configuration, this may take a while, please be patient):
```shell
service mysql stop
```

On the old server, we now get the database files. The `tar` command may also take a while.
```shell
cd /var/lib/
tar cfvz ~/mysqlfiles.tar.gz ./mysql/
```

The resulting archive is stored in your home folder. This archive needs to be copied to the new server. Let's assume you put `mysqlfiles.tar.gz` in your home folder there as well.

As a reminder: It's important that your database service is not running at the moment! Because we are now going to move over the database files.
```shell
cd /var/lib/
mv ./mysql ./mysql.backup
tar xfvz ~/mysqlfiles.tar.gz .
```

After the extraction, we can start the database service again (this may also take a moment):
```shell
service mysql start
```

#### Have froxlor create its environment
What we have created so far is the bare minimum for your web server to work. However, your new server probably also comes with new IP addresses. Froxlor comes with a CLI tool to replace the old ones with the new ones:
```shell
cd /var/www/html/froxlor
bin/froxlor-cli froxlor:switch-server-ip --switch=123.10.20.30,234.30.20.10
bin/froxlor-cli froxlor:switch-server-ip --switch=2001:db8:beef::69,2001:db8:cafe::420
```

Now we have to let froxlor configure all the necessary services like your web server (e.g. Apache or nginx), the mail configuration, FTP and everything else. For this we use froxlor's CLI tool, since the web interface would probably not work yet.
```shell
cd /var/www/html/froxlor
bin/froxlor-cli froxlor:config-services -c
```

Froxlor CLI will now ask you about your Linux distribution and the services you want to use and create a configuration list. At the end of the process, it'll offer you to make any necessary changes to the configuration files that you want to accept.

#### Customer data
Finally, we need to transfer any customer data. If you didn't change it, they are located in `/var/customers/`, so this is the folder we want to backup and transfer to the new server.
```shell
cd /var/
tar cfvz ~/customerfiles.tar.gz ./customers/
```

Again, the resulting archive is in your home folder, and you want to copy it to the new server.

On the new server, and assuming customerfiles.tar.gz is in your home folder, you want to run the following commands (please adapt the systemctl calls with the services you actually use!):
```shell
systemctl stop apache2 proftpd postfix dovecot
cd /var/
mv ./customers ./customers.backup
tar xfvz ~/customerfiles.tar.gz .
systemctl start apache2 proftpd postfix dovecot
```

### Finishing touches
Almost done! Froxlor and all your customer's projects should work now. As a last step you should login to froxlor and go to System -> Settings -> System Settings. Here you might want to adjust the hostname. If so, you will also have to reconfigure the mail server but this is no problem with froxlor's automatic configuration.

All that remains is to change the DNS settings and shut down the old server.

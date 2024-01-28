<script setup>

</script>
# Migration Guide

## Cloning Froxlor to a new server

### Requirements
We assume your new server is set up (or will be set up) the same way the old server is. This means you are using the same operating system, in the same version, the same flavor of MySQL or MariaDB.

In preparation, you should make sure everything on your old host is up-to-date, i.e. your webserver, PHP versions, Froxlor and so on.

Also, it would be a good idea to have a way to transfer files between your servers. This could be achieved using `scp`, or you could mount your old server's file system into a folder on your new server using `sshfs`. However, since there are endless possibilities and everyone has their own preferences, we will not describe one single method here in detail. Instead, we vaguely describe a "fail-safe" version with `tar`. If you feel confident with the use of `rsync`, we strongly suggest you go for that. It is important however that file ownerships and file permissions are carried over to the new server.

Before you start, you should stop services that could create user data as this would not be part of our backup. Think of your web server, database, FTP daemon and mail server. For a basic installation using Apache, MySQL, ProFTPd, Postfix, and Dovecot, this would be your line (you might want to adjust this for the services you are actually using):
```shell
systemctl stop apache2 mysql proftpd postfix dovecot
```

This will (obviously) cause most of your server to go down, so prepare your customers beforehand.

### Pretend to install Froxlor
Make sure your new server has installed all the software that is required to run Froxlor.

If you were using non-default packages, such as custom PHP versions or another database server, now would be the time to add the necessary repositories and install the packages accordingly.

Consult the [installation guide](../installation/) to see the current system requirements and how to install Froxlor. Follow your prefered installation guide up to the point where you **would** create the privileged database user.

### Move over files from the old host
Generally, we need data from three sources now:
* Froxlor's configuration files
* MySQL/MariaDB databases
* Customer documents

#### Froxlor
Assuming Froxlor is installed in its default location (`/var/www/html/froxlor/`), we need at least one file:
* `/var/www/html/froxlor/lib/userdata.inc.php`
* `/var/www/html/froxlor/lib/config.inc.php` (if it exists)

Copy them into `/var/www/html/froxlor/lib/` on your new server.

#### Databases
Next up is the database. Here we go the easy, straight-forward route, however, this is the point where it is of **upmost importance** that your old and your new server are running the same software, which means the same flavour of your DBMS (i.e. MariaDB vs. MySQL), with the same configuration! The version on your old server may be older, upon first startup on the new server all of your data should be checked and updated as needed. However, if you were running the exact same version, you also have a little sanity check that everything worked before migration (fewer possible points of failure).

First of all, stop the database service on **both** servers (depending on your configuration, this may take a while, please be patient):
```shell
service mysql stop
```

On the old server, we now go get the database files. The `tar` command may take a while too.
```shell
cd /var/lib/
tar cfvz ~/mysqlfiles.tar.gz ./mysql/
```

The resulting archive will be stored in your home folder. This archive needs to be transferred to the new server. Let's assume you put `mysqlfiles.tar.gz` in your home folder there as well.

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

#### Have Froxlor create its environment
What we have created so far is the bare minimum for your web server to work. However, your new server likely also comes with new IP addresses. Froxlor comes with a CLI tool to change the old ones with the new ones:
```shell
cd /var/www/html/froxlor/bin
./froxlor-cli froxlor:switch-server-ip --switch=123.10.20.30,234.30.20.10
```

Now we have to configure Froxlor all the necessary services such as your web server (e.g. Apache or nginx), the mail configuration, FTP and everything else. For that, we use Froxlor's CLI tool as the web interface would likely not yet work.
```shell
cd /var/www/html/froxlor/bin
./froxlor-cli froxlor:config-services -c
```

Froxlor CLI will now ask you about your distro and the services you want to use and create a configuration list. At the end of the process, it'll offer you to apply all the necessary changes to the config files which you want to accept.

#### Customer's data
Finally, we have to carry over any customer data. If you didn't change it, they are located in `/var/customers/`, so this is the folder we want to back up and transfer to the new server.
```shell
cd /var/customers/
tar cfvz ~/customerfiles.tar.gz ./
```

Again, the resulting archive is in your home folder, and you want to transfer it to the new server.

On the new server, and assuming customerfiles.tar.gz is in your home folder, you want to run the following commands (pease adjust the systemctl calls with the services you actually use!):
```shell
systemctl stop apache2 proftpd postfix dovecot
cd /var/customers/
tar xfvz ~/customerfiles.tar.gz .
systemctl start apache2 proftpd postfix dovecot
```

### Finishing touches
Almost done! Froxlor and all your customer's projects should work now. As a final step, you want to login into Froxlor and head to System, Settings, System Settings. Here you may want to adjust the hostname. If so, this would also yield a re-configuration of the mail server but this is no big deal with Froxlor's automatic configuration.

All that is left now is to change DNS settings and shut down the old server.
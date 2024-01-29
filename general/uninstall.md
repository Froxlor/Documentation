# Uninstall froxlor

## 1. Backup

Before you remove anything, make sure to back up the froxlor database in case you want to go back. By default, the database name is froxlor. If unsure of the details, you can open the `froxlor/lib/userdata.inc.php` file to get all the necessary information.

```shell
mysqldump -u root -p froxlor > /tmp/backup_froxlor-YYYYMMDD.sql
```

Also backup your old **userdata.inc.php** from the `froxlor/lib/` folder. Additionally, if you have uploaded custom header logos, you need to copy them over too:

```shell
mkdir -p /tmp/froxlor-backup/
cp /var/www/html/froxlor/lib/userdata.inc.php /tmp/froxlor-backup/
cp /var/www/html/froxlor/img/* /tmp/froxlor-backup/
```


## 2.1 Remove froxlor

As froxlor is mainly a web-ui, all you need to remove are the files within `/var/www/html/froxlor`. If you have installed froxlor via apt-package, you should of course use `apt` to uninstall the package.

## 2.2 Remove database

To also remove the database in which froxlor stores its data, you can do so using mysql directly (e.g. `DROP DATABASE`) or any tool like `phpmyadmin` to remove the database.

The default name of the database is `froxlor` but depending on your installation and what you've specified, it might differ. You can find the database information in the `lib/userdata.inc.php` file if you're unsure.

## 2.3 Remove customer data

By default, all customer-related data (except for databases) is stored within the directory `/var/customers/`. If you've adjusted this setting, your base-directory for customer-data might be different.

## 2.4 Remove services configuration

Froxlor installs a cronjob for its regular tasks, the default filename is `/etc/cron.d/froxlor`. You can safely delete this file and restart your cron-daemon.

To reset the configurations of the other system services (i.e. mail-services, ftpd, webserver) you can either manually check against any usage of the froxlor mysql-database or, to be sure, re-install the service with fresh/default configurations. In case of the webserver virtual-host configurations, it is safe to remove files with the pattern `*_froxlor_*` in the corresponding directory, e.g. `/etc/apache2/sites-enabled/` (depending on your settings).

## 2.5 Remove acme.sh and its cronjob

Froxlor installs the shell script `acme.sh` which manages SSL certificates using acme such as Let's Encrypt. You will find the necessary files in your root user's home directory.

```shell
rm -r ~root/.acme.sh/
```

With `acme.sh` comes a cronjob for the `root` user. You can remove it by typing this in your shell:
```shell
crontab -u root -e
```

Delete the line and save the file.

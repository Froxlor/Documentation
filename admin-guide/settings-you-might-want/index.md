# Settings you might want

There are many things you can do with froxlor. However, some defaults may not seem very intuitive to you. This is - for the most part - intentional. Froxlor tries to be as lightweight as possible. It tries to modify your system only where necessary, and otherwise make do with the defaults. Things that are changed are for froxlor and its own services to work. **Froxlor is a toolkit. It is not meant to replace the administrator!**

Still, there are settings you may want to change in your installation. This guide will give you some items you might want to set for yourself as it's common to have them - or for web software to work.

# Apache

## `mod_rewrite`
A lot of PHP software nowadays uses `mod_rewrite` to create so-called clean URLs, e.g. `/my-first-post/` instead of `/index.php?p=69`. For this to work, you need the `rewrite` module which is not enabled by default. To enable it, run these commands as root:
```shell
a2enmod rewrite
service apache2 restart
```

## HTTP/2
You can enable HTTP/2 support globally in froxlor and then on a per-domain basis. However, it must also be enabled in the web server itself. Also, it only works with Apache's Multi-Processing Module (MPM) `event`, while the default is `prefork`.

If you want to enable HTTP/2 and thus `mpm_event`, you must first check your PHP settings and possibly adjust and reconfigure them. Because `mpm_event` will not work with `mod_php` enabled. You would have to use FCGId or PHP-FPM instead.

If you meet all the requirements, you can enter these commands as root in your shell to enable HTTP/2 and mpm_event.
```shell
a2dismod php* mpm_prefork
a2enmod http2 mpm_event
```

Apache will check to see if there are any other incompatibilities and tell you if there is anything that needs your attention. If not, restart Apache now:
```shell
service apache2 restart
```

After you've enabled `mpm_event`, you may want to adjust the settings. You can find them in `/etc/apache2/mods-available/mpm_event.conf`. Each time you change something, you will need to restart Apache for your changes to take effect.

## Hide `ServerSignature` and `ServerTokens`
Apache is a bit chatty about itself in error messages and HTTP response headers. It is considered bad practice to make it reveal version numbers, or better yet, loaded extensions. While you should make sure all your packages are up to date, we don't need to hand an attacker more information than necessary on a silver platter.

To make Apache more discreet about itself, point your favorite editor to the file `/etc/apache2/conf-available/security.conf` and find the lines that start with `ServerTokens` and `ServerSignature` (and that are not comments, starting with a hash (`#`)). Change them accordingly:
```
ServerTokens Prod
ServerSignature Off
```

Again, don't forget to restart Apache for these changes to take effect.
```shell
service apache2 restart
```

# HTTPS/SSL

## What settings should I use?
Froxlor allows you to specify settings related to SSL. You can find them in System -> Settings -> SSL settings. The most common use case is HTTPS. Froxlor comes with defaults that were chosen with two considerations in mind: What supported Linux distributions offer out of the box and what is the best compromise between security and compatibility.

### TLS protocol version
The choice here is fairly straightforward; TLSv1.2 is fine for most use cases. If your software is new enough to support it, it won't hurt to **additionally** select TLSv1.3 (because clients and your server will decide which to use on the first handshake). TLSv1 and TLSv1.1 are considered insecure so only select them if you know you need them. If you don't, don't.

## SSL ciphers
This is a list of methods for how a client should talk to the server. There are ciphers that are more or less considered broken, and there are those that are still considered good. However, relying only on modern ciphers means that you're potentially excluding older browsers or services from being able to connect. Since the list of what to use may change over time, we recommend getting [a recent one from Mozilla](https://ssl-config.mozilla.org/).

## Other settings that will get you an A+ on SSLLabs
The other settings that would make most SSL testers happy can be found in your domain settings. You should enable `SSL redirect` so the first order of business is to redirect a user from http to https. The other is to enable `HTTP Strict Transport Security` and set it to at least one year (i.e. `31536000` seconds). Also, using `OCSP stapling` is considered best practice, e.g. [from Let's Encrypt](https://letsencrypt.org/docs/integration-guide/#implement-ocsp-stapling).

# MySQL/MariaDB
MySQL and MariaDB come with defaults from the last century (literally). They are meant to work universally, but may not work well on modern systems.

If you want to use your own settings, you should create a file in `/etc/mysql/conf.d/` that ends with `.cnf`, e.g. `/etc/mysql/conf.d/own.cnf`. You only need to change what you want to change, everything else is inherited from the defaults.

::: tip
We will start our listings with the option group, e.g. `[mysqld]`. If you want to change several settings in the same group, it is sufficient to have it only once in your file.

After each change to the configuration, you must restart your database service for the changes to take effect:
```shell
service mysql restart
```
:::

## `max_connections`
One of the most common database error messages is `Too many connections`. This happens when MySQL's `max_connections` is lower than the maximum number of clients your web server can serve at one time. So it would be advisable to set this value higher than that - also to have a little buffer for edge cases (such as some migrations from one software to another, e.g. Drupal to WordPress). So if your web server is allowed to serve 500 clients at once, this setting should be around 550.

You can find the appropriate options in your web server configuration. For Apache using `mpm_event`, this would be in `/etc/apache2/mods-available/mpm_event.conf`, the `MaxRequestWorkers` setting.
```
[mysqld]
max_connections = 550
```

## `innodb_buffer_pool_size`
Nowadays, databases use InnoDB as their data structure which is much more robust than the old MyISAM, but also requires more resources. Unfortunately, the default values that come out of the box are such that it works on a small Raspberry Pi, but on a real server, these values will result in poor performance.

The most important setting for InnoDB tables is `innodb_buffer_pool_size`. The database uses this as a buffer for frequently used data, both for read and write operations. So a pool size that is too small means more disk accesses which are slower than your RAM.

As a rule of thumb, the pool should be set to half of your available system memory. You should definitely check from time to time to see if this is working for your system, i.e. if it is not swapping too hard, and see if you can make adjustments. For example, on a host with a total of 64 GB of RAM and 50 GB available, set it to 25 GB:
```
[mysqld]
innodb_buffer_pool_size = 25G
```

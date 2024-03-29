# Configure Apache2 with FCGID

## 1. Introduction

### Why setting up PHP with suexec?

Because you can run PHP with different users according to the vHost, which means it's easier to protect each vHost from attacks by another vHost. On the other site there are no more problems between permissions of the FTP- and the Webserver-user or compromised hosts.

### Why FastCGI?

Running PHP as a CGI would require reloading the PHP binary for every request which would lead to a massive overhead. This is why there is FastCGI, it loads the binary only once and hands requests to PHP by redirecting stdin and stdout by pipes/sockets.

### Why mod_fcgid?

The old `mod_fastcgi` doesn't seem to be in development anymore and wasn't released under the GPL. `mod_fcgid` is the implementation of the FastCGI protocol under the GPL, its actively developed and has a better process management (Supports MPM and Thread Management).

**Pro:**

* Fast + Secure. PHP is thread safe that way so you can use Apache mpm-worker for better performance.
* Individual php.ini per customer
* No permission problems between the FTP- and Webserver-users

**Cons:**

* Complex to set up
* Wrong installations can cause more security holes than using the original mod_php5 module
* A lot of RAM is used when there are a lot of vHosts (can be limited slightly)

I assume that you have froxlor already running and the database set up.

## 2. Configure froxlor Settings

::: danger VERY IMPORTANT
**It is very important that you first adjust all settings** according to your needs before configuring the services. This is because some configuration-templates/commands change dynamically depending on the settings you chose.
:::

To adjust settings, login as admin and click on **Settings** in the menu on the left side.

```
FCGID
    Enabled: Yes
        Save

Froxlor VirtualHost settings
    Make froxlor directly accessible by hostname: Yes
    Use FCGID in froxlor host: Yes
        Save

System settings
    Use libnss-extrausers instead of libnss-mysql: Yes
        Save
```

## 3. Installation

### 3.1. Quick installation

This method is especially useful for freshly installed froxlor instances.

#### 3.1.1 Run the config-services script

```shell
cd /var/www/html/froxlor
bin/froxlor-cli froxlor:config-services --create
```

The installer will guide you through the configuration of froxlor, at least the following options must be selected when configuring the 'SYSTEM':

* `libnssextrausers`
* `fcgid`

Done!

### 3.2. Manual installation

If your system has already been heavily modified, manual installation is recommended.

#### 3.2.1. Setting up the environment

You should ensure that the froxlor cronjob isn't executed while you set up `fcgid`. This could produce unwanted results!

```shell
service cron stop
```

#### 3.2.2. Setting up apache2

Please execute the commands from the froxlor configuration page:

```
Configuration » Ubuntu Focal (20.04) » Webserver (HTTP) » Apache 2.4
```

#### 3.2.3. Setting up libnss-extrausers

Please execute the commands from the froxlor configuration page:

```
Configuration » Ubuntu Focal (20.04) » Others (System) » libnss-extrausers
```

#### 3.2.4. Setting up FCGID

Please execute the commands from the froxlor configuration page:

```
Configuration » Ubuntu Focal (20.04) » Others (System) » FCGID
```

#### 3.2.5. Final Steps

Log in to froxlor and click on 'Rebuild Configuration Files'.

Run froxlor's global cron job once to immediately produce `fcgid` configurations for all VirtualHosts:

```shell
cd /var/www/html/froxlor
bin/froxlor-cli froxlor:cron -f
```

If you have set up all correctly it should be now possible to open the customer domains in your browser. If there are PHP child processes under the Apache process all is working fine. You can also check that by running phpinfo(); from a file within a customer domain.

## 4. Possible problems you might run into

There are like 1 billion problems you might have to face ;)
* suexec is often a problem. Make sure you configure it right at compile time. For the default distribution packages check `/var/log/apache2/suexec.log` for errors.
* 500 Internal Server Error - Check the logs! Often you can find the solution by the given errors. This may help you further [http://htmlfixit.com/cgi-tutes/tutorial_Common_Web_dev_error_messages_and_what_they_mean.php](http://htmlfixit.com/cgi-tutes/tutorial_Common_Web_dev_error_messages_and_what_they_mean.php)
* Enabled debug logging for apache and restart it. (**LogLevel debug** in `/etc/apache2/apache2.conf`) Be sure to uncomment this line and do a restart of apache after debugging!
* Be sure that `/etc/apache2/logs/fcgidsock` is owned by `www-data`. Otherwise, you will get the typical error Premature end of script headers, which says that PHP isn't able to communicate with the apache process.
* Look at the logs!!!
* ps faux and look if there is a PHP process running under the apache process.
* `strace -s 2000 -ff -o /tmp/fastcgi -p <PID of fcgi-pm>` Very useful if you know how to debug!
* If you edit config files, please don't use WinSCP. This adds Windows format and Linux can't work with this.

### Got problems?

If you run into any problems or have difficulties understanding / setting-up / whatever - don't hesitate to contact us either via e-mail ([team@froxlor.org](mailto:team@froxlor.org)) or the preferred way: on Discord ([https://discord.froxlor.org](https://discord.froxlor.org)) and our forums ([https://forum.froxlor.org/](https://forum.froxlor.org/))


## 5. Links and references

* [https://httpd.apache.org/mod_fcgid/mod/mod_fcgid.html](https://httpd.apache.org/mod_fcgid/mod/mod_fcgid.html)
* [https://httpd.apache.org/docs/2.4/suexec.html](https://httpd.apache.org/docs/2.4/suexec.html)

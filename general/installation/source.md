# Install froxlor from source using git

::: warning ATTENTION
Please execute the following instructions only if you know what will happen. This is a development version and should only be used for testing purposes as new features may not be tested.
:::

::: tip HELP WANTED
We are happy about everyone who actively supports froxlor in development, feel free to test new features and leave feedback on our Discord.
:::

## 1. Download/install git

In order to use git you have to install git on your target-system. See the official git-scm page for more: [https://git-scm.com/download/linux](https://git-scm.com/download/linux)

## 2. Get the files

Connect to a shell on your server and change the directory to `/var/www/html/`.

```shell
cd /var/www/html/
```

Now you can 'clone' the froxlor repository using the following command. It will store the files into the given target-directory froxlor (/var/www/html/froxlor/).

```shell
git clone https://github.com/Froxlor/Froxlor.git froxlor
```

## 3. Download dependencies

Froxlor 2.x is composer and npm based. In order to use the development version you need to install [composer](https://getcomposer.org/download/) and [npm](https://nodejs.org/).

```shell
cd /var/www/html/froxlor
```

Download required libraries via composer:

```shell
composer install --no-dev
```

Download and build javascript/css:

```shell
npm install
npm run build
```

## 4. Proceed with installation and configuration

Now follow the general installation documentation starting with **step 2**: [Install froxlor from tarball](tarball.html#_2-set-permissions)

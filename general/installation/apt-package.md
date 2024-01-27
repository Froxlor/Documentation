# Install froxlor on Debian/Ubuntu using apt

froxlor provides packages for __Debian__ and __Ubuntu__ systems via its own repository.

## 0. Supported distribution versions and recommendations

Packages will be built for all supported debian/ubuntu distribution,
see [configuration templates](https://github.com/Froxlor/Froxlor/tree/main/lib/configfiles).

| Distro  |                    Version                    |                              Notes |             Recommended source for ISO |
|---------|:---------------------------------------------:|-----------------------------------:|---------------------------------------:|
| Debian* | 12 (bookworm/stable), 11 (bullseye/oldstable) | *oldoldstable* is mostly supported | https://www.debian.org/distrib/netinst |
| Ubuntu  |         22.04 (jammy), 20.04 (focal)          |                  LTS releases only |     https://ubuntu.com/download/server |

<small>*Debian is the recommended and most likely best supported distribution for froxlor.</small>

## 1. Edit apt sources

In order to install froxlor, we need to add the GPG keys and the repository to the APT sources (
key: `FD88018B6F2D5390D051343FF6B4A8704F9E9BBC`).

### Debian

```shell
apt-get -y install apt-transport-https lsb-release ca-certificates curl gnupg
curl -sSLo /usr/share/keyrings/deb.froxlor.org-froxlor.gpg https://deb.froxlor.org/froxlor.gpg
sh -c 'echo "deb [signed-by=/usr/share/keyrings/deb.froxlor.org-froxlor.gpg] https://deb.froxlor.org/debian $(lsb_release -sc) main" > /etc/apt/sources.list.d/froxlor.list'
```

### Ubuntu

```shell
apt-get -y install apt-transport-https lsb-release ca-certificates curl gnupg
curl -sSLo /usr/share/keyrings/deb.froxlor.org-froxlor.gpg https://deb.froxlor.org/froxlor.gpg
sh -c 'echo "deb [signed-by=/usr/share/keyrings/deb.froxlor.org-froxlor.gpg] https://deb.froxlor.org/ubuntu $(lsb_release -sc) main" > /etc/apt/sources.list.d/froxlor.list'
```

## 2. Update package list

To update the packages list and all the packages installed to the latest version, run the following command.:

```shell
apt-get update && apt-get upgrade
```

## 3. Install froxlor

Install froxlor together with all needed packages (e.g. webserver):

```shell
apt-get install froxlor
```

## 4. Proceed with installation and configuration

Now follow the general installation documentation starting with **step 3**: [Create privileged database user](tarball.html#_3-create-privileged-database-user)

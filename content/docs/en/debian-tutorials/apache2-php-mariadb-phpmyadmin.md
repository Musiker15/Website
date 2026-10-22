---
title: "Apache 2, PHP 8, MariaDB and phpMyAdmin"
description: "Full LAMP stack: install and configure Apache 2, PHP 8.4 via FPM, MariaDB and phpMyAdmin."
date: 2026-06-13
updated: 2026-10-22
order: 3
tags: ["debian", "apache", "php", "mariadb", "phpmyadmin"]
---

## Installing Apache 2, PHP 8.4 and MariaDB

In this guide PHP runs through **PHP-FPM**, in its own processes next to Apache
rather than as an Apache module (`mod_php`). Apache only passes PHP requests
on. That has three advantages: Apache can use the leaner `mpm_event`, PHP can
be updated and restarted independently of Apache, and you avoid the variant
that was hit hardest by the
[php2shell flaws of October 2026](/en/news/php2shell-2026-10).

```bash
# Update and install some dependencies
apt update && apt full-upgrade -y
apt install ca-certificates apt-transport-https lsb-release gnupg curl nano unzip -y

# Add Ondrej's repo source and signing key along with dependencies
curl -sSLo /usr/share/keyrings/deb.sury.org-php.gpg https://packages.sury.org/php/apt.gpg
sh -c 'echo "deb [signed-by=/usr/share/keyrings/deb.sury.org-php.gpg] https://packages.sury.org/php/ $(lsb_release -sc) main" > /etc/apt/sources.list.d/php.list'
apt update

# Install apache2 package
apt install apache2 -y

# Install PHP 8.4 with FPM (no Apache module)
apt install php8.4-fpm php8.4-common php8.4-cli php8.4-{bz2,curl,mbstring,intl} -y
apt install php8.4-mysql php8.4-opcache php8.4-xml php8.4-xsl php8.4-zip php8.4-apcu -y

# Hand PHP requests from Apache over to FPM
a2enmod proxy_fcgi setenvif
a2enconf php8.4-fpm
systemctl restart apache2

# Install MySQL/MariaDB packages
curl -LsS https://r.mariadb.com/downloads/mariadb_repo_setup | sudo bash
apt update
apt install mariadb-server mariadb-client -y

# Start MySQL Installation
mysql_secure_installation
```

<Callout type="warning">
Don't install the plain `php8.4` package. It is a metapackage, and as long as
`php8.4-fpm` is not installed it pulls in `libapache2-mod-php8.4`, exactly the
Apache module this guide avoids. With the commands above you don't need it.
</Callout>

### Checking that PHP runs through FPM

```bash
apache2ctl -M | grep -E 'mpm|proxy_fcgi|php'
systemctl is-active php8.4-fpm
```

The output should list `mpm_event_module` and `proxy_fcgi_module`, but no
`php_module`. If you want to see it in the browser, create a test file for a
moment:

```bash
echo '<?php phpinfo();' > /var/www/html/info.php
```

At `http://your-domain.com/info.php`, **Server API** must then read
`FPM/FastCGI`. Delete the file again right away, it reveals a lot about the
server:

```bash
rm /var/www/html/info.php
```

## Managing the PHP version

The active PHP CLI version can be switched at any time:

```bash
update-alternatives --config php
```

That only affects the command line, meaning `php` in scripts and cron jobs.
Which version serves your websites is decided by the FPM configuration enabled
in Apache. Switching from 8.3 to 8.4 looks like this:

```bash
a2disconf php8.3-fpm
a2enconf php8.4-fpm
systemctl reload apache2
```

### Restart after every PHP update

An installed update only takes effect once the running PHP processes have been
restarted. The package usually restarts FPM by itself during the update. You
can check it like this:

```bash
grep ' upgrade php8.4-fpm' /var/log/dpkg.log | tail -1
systemctl show -p ActiveEnterTimestamp php8.4-fpm
```

The start time must be after the update. If it isn't:

```bash
systemctl restart php8.4-fpm
```

### Switching from the Apache module to PHP-FPM

If your server still runs PHP as an Apache module, for example because you
followed an earlier version of this guide, this is how to switch. Whether that
is the case shows `apache2ctl -M | grep php_module`.

```bash
# Install PHP 8.4 with FPM, as above
apt install php8.4-fpm php8.4-common php8.4-cli php8.4-{bz2,curl,mbstring,intl} -y
apt install php8.4-mysql php8.4-opcache php8.4-xml php8.4-xsl php8.4-zip php8.4-apcu -y

# Switch off the old Apache module (use your version, e.g. php7.4 or php8.3)
a2dismod php8.3
a2dismod mpm_prefork
a2enmod mpm_event

# Hand PHP requests from Apache over to FPM
a2enmod proxy_fcgi setenvif
a2enconf php8.4-fpm
systemctl restart apache2
```

Then check as described [above](#checking-that-php-runs-through-fpm) that no
`php_module` is loaded anymore. Two things easily get lost in the switch:

- **Extensions**: if you installed further packages for the old version, such
  as `php8.3-gd`, you need them again for 8.4 (`php8.4-gd`).
- **Your own settings**: the module reads `/etc/php/<version>/apache2/php.ini`,
  FPM reads `/etc/php/8.4/fpm/php.ini`. Whatever you changed there, such as
  `upload_max_filesize` or `memory_limit`, carry over into FPM's file and
  restart `php8.4-fpm`.

Once everything works, remove the old module and, if you no longer need it,
the old PHP version:

```bash
apt-get purge -y 'libapache2-mod-php*'
# Old PHP version, adjust to yours
apt-get purge -y 'php7.4*'
```

## Automatic installation of phpMyAdmin

<Callout type="tip">
I recommend the [manual installation](#manual-installation-of-phpmyadmin).
</Callout>

It's possible that the package can't be found. If that's the case, you have to
do the manual installation. It's also possible that the phpMyAdmin package
isn't the latest one. The advantage, however, is that you can conveniently
keep it up to date via `apt update && apt upgrade -y`.

```bash
apt install phpmyadmin
```

With the Sury repository the package also pulls in the PHP CLI in the newest
version (currently 8.5). Nothing changes for your websites, they keep running
through FPM with PHP 8.4.

You'll now be asked which web server is being used. Here we select **apache**
and confirm with ENTER. We confirm the next question with ENTER as well.

Next you'll be asked for a password. It's best to use the same password as
before, when you set up the MariaDB server.

Once we've confirmed everything with ENTER, phpMyAdmin is now installed. You
can now try to open the page at `www.your-domain.com/phpmyadmin`. If that
doesn't work, however, we include the bundled Apache configuration cleanly via
`conf-available` (instead of appending it to `apache2.conf`):

```bash
ln -s /etc/phpmyadmin/apache.conf /etc/apache2/conf-available/phpmyadmin.conf
a2enconf phpmyadmin
systemctl reload apache2
```

phpMyAdmin should now be accessible without any issues.

## Manual installation of phpMyAdmin

If phpMyAdmin is to be installed manually, the following has to be done. Note,
however, that phpMyAdmin itself then has to be kept up to date. The manual
installation is nevertheless my personal recommendation.

```bash
cd /usr/share
wget https://www.phpmyadmin.net/downloads/phpMyAdmin-latest-all-languages.zip -O phpmyadmin.zip
unzip phpmyadmin.zip
rm phpmyadmin.zip
mv phpMyAdmin-*-all-languages phpmyadmin
chmod -R 0755 phpmyadmin
nano /etc/apache2/conf-available/phpmyadmin.conf
```

Now the following text has to be inserted:

```apache
# phpMyAdmin Apache configuration
Alias /phpmyadmin /usr/share/phpmyadmin
<Directory /usr/share/phpmyadmin>
    Options SymLinksIfOwnerMatch
    DirectoryIndex index.php
</Directory>

# Disallow web access to directories that don't need it
<Directory /usr/share/phpmyadmin/templates>
    Require all denied
</Directory>
<Directory /usr/share/phpmyadmin/libraries>
    Require all denied
</Directory>
<Directory /usr/share/phpmyadmin/setup>
    Require all denied
</Directory>
```

With `Ctrl+X`, then `Y` and then `ENTER` everything is saved and you exit.

```bash
a2enconf phpmyadmin
systemctl reload apache2
```

Now we can go back to the home directory with `cd`.

```bash
mkdir /usr/share/phpmyadmin/tmp/
chown -R www-data:www-data /usr/share/phpmyadmin/tmp/
```

In addition, phpMyAdmin needs its own configuration file with a random
`blowfish_secret` (32 characters, for cookie encryption), otherwise a
corresponding warning appears in the web interface:

```bash
cp /usr/share/phpmyadmin/config.sample.inc.php /usr/share/phpmyadmin/config.inc.php
# Generate a random value and enter it into the $cfg['blowfish_secret'] line:
openssl rand -base64 24
nano /usr/share/phpmyadmin/config.inc.php
```

In principle the MySQL / MariaDB server is now fully configured, but for
security reasons you can't log in to phpMyAdmin directly as the root user.
You can, however, create a new user and grant them all privileges.

<Callout type="warning">
Replace `username` and `password` with the desired username and password.
</Callout>

```sql
mysql -u root
CREATE USER 'username'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON *.* TO 'username'@'localhost' WITH GRANT OPTION;
exit
```

<Callout type="warning">
`GRANT ALL PRIVILEGES ON *.*` with `WITH GRANT OPTION` effectively makes this
user an administrator (root-equivalent). For a pure application or database
user you should instead restrict the privileges to a specific database, e.g.:
`GRANT ALL PRIVILEGES ON my_db.* TO 'username'@'localhost';`
</Callout>

Now the MySQL / MariaDB server is fully configured and you can log in via the
browser with the user and password you just created.

To do so, simply open: `www.your-domain.com/phpmyadmin`

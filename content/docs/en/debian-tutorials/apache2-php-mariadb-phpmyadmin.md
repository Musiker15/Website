---
title: "Apache 2, PHP 8, MariaDB and phpMyAdmin"
description: "Full LAMP stack: install and configure Apache 2, PHP 8, MariaDB and phpMyAdmin."
order: 2
tags: ["debian", "apache", "php", "mariadb", "phpmyadmin"]
---

## Installing Apache 2, PHP 8.3 and MariaDB

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

# Install PHP 8.3 packages
apt install php8.3 php8.3-common php8.3-cli php8.3-{bz2,curl,mbstring,intl} -y
apt install php8.3-mysql php8.3-opcache php8.3-xml php8.3-xsl php8.3-zip php8.3-apcu -y

# Install MySQL/MariaDB packages
curl -LsS https://r.mariadb.com/downloads/mariadb_repo_setup | sudo bash
apt update
apt install mariadb-server mariadb-client -y

# Start MySQL Installation
mysql_secure_installation
```

## Managing the PHP version

The active PHP CLI version can be switched at any time:

```bash
update-alternatives --config php
```

### Upgrade from PHP 7.4 to PHP 8.3

If you're coming from an older PHP version (e.g. 7.4), disable the old Apache
module after installing PHP 8.3 and clean up the old packages:

```bash
a2dismod php7.4
a2enmod php8.3
systemctl restart apache2
apt-get purge -y php7.*
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
<Directory /usr/share/phpmyadmin/setup/lib>
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
`blowfish_secret` (32 characters, for cookie encryption) — otherwise a
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

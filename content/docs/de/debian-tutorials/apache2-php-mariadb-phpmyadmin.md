---
title: "Apache2, PHP 8, MariaDB und phpMyAdmin"
description: "Kompletter LAMP-Stack: Apache 2, PHP 8, MariaDB und phpMyAdmin installieren und konfigurieren."
order: 2
tags: ["debian", "apache", "php", "mariadb", "phpmyadmin"]
---

## PHP-Version wechseln

```bash
update-alternatives --config php
```

## Update von PHP 7.4 auf PHP 8.3

Falls Du ein Upgrade von PHP 7.4 auf PHP 8.3 durchführen möchtest, mache
bitte folgendes nach der Installation von PHP 8.3:

```bash
a2dismod php7.4
a2enmod php8.3
systemctl restart apache2
apt-get purge -y php7.*
```

## Installation von Apache 2, PHP 8.3 und MariaDB

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
apt install php8.3 php8.3-common php8.3-cli php8.3-{bz2,curl,mbstring,intl}
apt install php8.3-mysql php8.3-opcache php8.3-xml php8.3-xsl php8.3-zip php8.3-apcu -y

# Install MySQL/MariaDB packages
curl -LsS https://r.mariadb.com/downloads/mariadb_repo_setup | sudo bash
apt update
apt install mariadb-server mariadb-client -y

# Start MySQL Installation
mysql_secure_installation
```

## Automatische Installation von phpMyAdmin

<Callout type="tip">
Ich empfehle die [manuelle Installation](#manuelle-installation-von-phpmyadmin).
</Callout>

Es kann sein, dass das Paket nicht gefunden wird. Wenn das der Fall sein
sollte, muss die manuelle Installation durchgeführt werden. Es kann außerdem
sein, dass das phpMyAdmin-Paket nicht das aktuellste ist. Der Vorteil ist
jedoch, dass man `apt update && apt upgrade -y` benötigt, um das ganze zu
aktualisieren.

```bash
apt install phpmyadmin
```

Man wird nun gefragt, welcher Webserver genutzt wird. Hier wählen wir
**apache** aus und bestätigen mit ENTER. Die nächste Frage bestätigen wir
ebenfalls mit ENTER.

Als nächstes wird nach einem Passwort gefragt. Hier sollte am besten das
selbe Passwort genutzt werden wie vorhin bereits beim Erstellen des
MariaDB-Servers.

Sobald wir das ganze mit ENTER bestätigt haben, wurde phpMyAdmin nun
installiert. Man kann nun versuchen, die Seite mit
`www.deine-domain.de/phpmyadmin` aufzurufen. Falls das allerdings nicht
klappt, müssen wir noch zwei Befehle eingeben:

```bash
echo Include /etc/phpmyadmin/apache.conf >> /etc/apache2/apache2.conf
/etc/init.d/apache2 restart
```

Jetzt sollte phpMyAdmin problemlos aufrufbar sein.

## Manuelle Installation von phpMyAdmin

Wenn phpMyAdmin manuell installiert werden soll, dann muss folgendes getan
werden. Zu beachten gilt jedoch, dass phpMyAdmin selbst auf dem neusten
Stand gehalten werden muss. Die manuelle Installation ist dennoch meine
persönliche Empfehlung.

```bash
cd /usr/share
wget https://www.phpmyadmin.net/downloads/phpMyAdmin-latest-all-languages.zip -O phpmyadmin.zip
unzip phpmyadmin.zip
rm phpmyadmin.zip
mv phpMyAdmin-*-all-languages phpmyadmin
chmod -R 0755 phpmyadmin
nano /etc/apache2/conf-available/phpmyadmin.conf
```

Nun muss folgender Text eingefügt werden:

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

Mit `Strg+X`, dann `Y` und dann `ENTER` wird das ganze gespeichert und
verlassen.

```bash
a2enconf phpmyadmin
systemctl reload apache2
```

Nun können wir mit `cd` wieder zurück ins Hauptverzeichnis.

```bash
mkdir /usr/share/phpmyadmin/tmp/
chown -R www-data:www-data /usr/share/phpmyadmin/tmp/
```

Im Prinzip ist der MySQL bzw. MariaDB Server nun fertig konfiguriert,
allerdings kann man sich aus Sicherheitsgründen nicht direkt als Root-Nutzer
im phpMyAdmin anmelden. Man kann allerdings einen neuen Nutzer erstellen
und diesem alle Rechte gewähren.

<Callout type="warning">
`username` und `password` durch den gewünschten Nutzernamen und das
gewünschte Passwort ersetzen.
</Callout>

```sql
mysql -u root
CREATE USER 'username'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON *.* TO 'username'@'localhost' WITH GRANT OPTION;
exit
```

Jetzt ist der MySQL bzw. MariaDB Server fertig konfiguriert und man kann
sich im Browser mit dem soeben erstellten Nutzer und Passwort anmelden.

Dafür einfach folgendes aufrufen: `www.deine-domain.de/phpmyadmin`

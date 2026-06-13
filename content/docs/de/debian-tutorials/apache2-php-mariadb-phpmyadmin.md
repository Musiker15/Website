---
title: "Apache2, PHP 8, MariaDB und phpMyAdmin"
description: "Kompletter LAMP-Stack: Apache 2, PHP 8, MariaDB und phpMyAdmin installieren und konfigurieren."
order: 2
tags: ["debian", "apache", "php", "mariadb", "phpmyadmin"]
---

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
apt install php8.3 php8.3-common php8.3-cli php8.3-{bz2,curl,mbstring,intl} -y
apt install php8.3-mysql php8.3-opcache php8.3-xml php8.3-xsl php8.3-zip php8.3-apcu -y

# Install MySQL/MariaDB packages
curl -LsS https://r.mariadb.com/downloads/mariadb_repo_setup | sudo bash
apt update
apt install mariadb-server mariadb-client -y

# Start MySQL Installation
mysql_secure_installation
```

## PHP-Version verwalten

Die aktive PHP-CLI-Version lässt sich jederzeit umstellen:

```bash
update-alternatives --config php
```

### Upgrade von PHP 7.4 auf PHP 8.3

Falls Du von einer älteren PHP-Version (z.B. 7.4) kommst, deaktivierst Du nach
der Installation von PHP 8.3 das alte Apache-Modul und räumst die alten Pakete
auf:

```bash
a2dismod php7.4
a2enmod php8.3
systemctl restart apache2
apt-get purge -y php7.*
```

## Automatische Installation von phpMyAdmin

<Callout type="tip">
Ich empfehle die [manuelle Installation](#manuelle-installation-von-phpmyadmin).
</Callout>

Es kann sein, dass das Paket nicht gefunden wird. Wenn das der Fall sein
sollte, muss die manuelle Installation durchgeführt werden. Es kann außerdem
sein, dass das phpMyAdmin-Paket nicht das aktuellste ist. Der Vorteil ist aber,
dass man es bequem über `apt update && apt upgrade -y` mit aktuell hält.

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
klappt, binden wir die mitgelieferte Apache-Konfiguration sauber über
`conf-available` ein (statt sie an `apache2.conf` anzuhängen):

```bash
ln -s /etc/phpmyadmin/apache.conf /etc/apache2/conf-available/phpmyadmin.conf
a2enconf phpmyadmin
systemctl reload apache2
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

Außerdem braucht phpMyAdmin eine eigene Konfigurationsdatei mit einem
zufälligen `blowfish_secret` (32 Zeichen, für die Cookie-Verschlüsselung) —
sonst erscheint im Webinterface eine entsprechende Warnung:

```bash
cp /usr/share/phpmyadmin/config.sample.inc.php /usr/share/phpmyadmin/config.inc.php
# Zufälligen Wert erzeugen und in die Zeile $cfg['blowfish_secret'] eintragen:
openssl rand -base64 24
nano /usr/share/phpmyadmin/config.inc.php
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

<Callout type="warning">
`GRANT ALL PRIVILEGES ON *.*` mit `WITH GRANT OPTION` macht diesen Nutzer
faktisch zum Administrator (Root-äquivalent). Für einen reinen Anwendungs-
oder Datenbank-Nutzer solltest Du die Rechte stattdessen auf eine konkrete
Datenbank einschränken, z.B.:
`GRANT ALL PRIVILEGES ON meine_db.* TO 'username'@'localhost';`
</Callout>

Jetzt ist der MySQL bzw. MariaDB Server fertig konfiguriert und man kann
sich im Browser mit dem soeben erstellten Nutzer und Passwort anmelden.

Dafür einfach folgendes aufrufen: `www.deine-domain.de/phpmyadmin`

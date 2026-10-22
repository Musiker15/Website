---
title: "Apache2, PHP 8, MariaDB und phpMyAdmin"
description: "Kompletter LAMP-Stack: Apache 2, PHP 8.4 über FPM, MariaDB und phpMyAdmin installieren und konfigurieren."
date: 2026-05-27
updated: 2026-10-22
order: 3
tags: ["debian", "apache", "php", "mariadb", "phpmyadmin"]
---

## Installation von Apache 2, PHP 8.4 und MariaDB

PHP läuft in dieser Anleitung über **PHP-FPM**, also in eigenen Prozessen neben
Apache und nicht als Apache-Modul (`mod_php`). Apache reicht PHP-Anfragen nur
weiter. Das hat drei Vorteile: Apache kann das sparsamere `mpm_event` nutzen,
PHP lässt sich unabhängig von Apache aktualisieren und neu starten, und Du
vermeidest die Variante, die bei den
[php2shell-Lücken vom Oktober 2026](/de/news/php2shell-2026-10) am stärksten
betroffen war.

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
Installiere nicht das Paket `php8.4` ohne Zusatz. Es ist ein Metapaket, und
solange `php8.4-fpm` nicht installiert ist, holt es `libapache2-mod-php8.4`
dazu, also genau das Apache-Modul, das hier vermieden werden soll. Mit den
Befehlen oben brauchst Du es nicht.
</Callout>

### Prüfen, ob PHP über FPM läuft

```bash
apache2ctl -M | grep -E 'mpm|proxy_fcgi|php'
systemctl is-active php8.4-fpm
```

In der Ausgabe sollten `mpm_event_module` und `proxy_fcgi_module` stehen, aber
kein `php_module`. Wer es im Browser sehen will, legt kurz eine Testdatei an:

```bash
echo '<?php phpinfo();' > /var/www/html/info.php
```

Unter `http://deine-domain.de/info.php` muss bei **Server API** dann
`FPM/FastCGI` stehen. Lösche die Datei danach sofort wieder, sie verrät viel
über den Server:

```bash
rm /var/www/html/info.php
```

## PHP-Version verwalten

Die aktive PHP-CLI-Version lässt sich jederzeit umstellen:

```bash
update-alternatives --config php
```

Das betrifft nur die Kommandozeile, also `php` in Skripten und Cronjobs. Welche
Version Deine Webseiten ausliefert, entscheidet die FPM-Konfiguration, die in
Apache eingebunden ist. Ein Wechsel von 8.3 auf 8.4 sieht so aus:

```bash
a2disconf php8.3-fpm
a2enconf php8.4-fpm
systemctl reload apache2
```

### Nach jedem PHP-Update neu starten

Ein installiertes Update wirkt erst, wenn die laufenden PHP-Prozesse neu
gestartet sind. Das Paket startet FPM beim Update normalerweise selbst neu.
Prüfen kannst Du es so:

```bash
grep ' upgrade php8.4-fpm' /var/log/dpkg.log | tail -1
systemctl show -p ActiveEnterTimestamp php8.4-fpm
```

Der Startzeitpunkt muss nach dem Update liegen. Falls nicht:

```bash
systemctl restart php8.4-fpm
```

### Umstieg vom Apache-Modul auf PHP-FPM

Falls Dein Server PHP noch als Apache-Modul ausführt, etwa weil Du einer
früheren Fassung dieser Anleitung gefolgt bist, stellst Du so um. Ob das der
Fall ist, zeigt `apache2ctl -M | grep php_module`.

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

Danach prüfst Du wie [oben](#pruefen-ob-php-ueber-fpm-laeuft) beschrieben, dass
kein `php_module` mehr geladen ist. Zwei Dinge gehen beim Umstieg leicht
verloren:

- **Erweiterungen**: Hast Du für die alte Version weitere Pakete installiert,
  etwa `php8.3-gd`, brauchst Du sie für 8.4 noch einmal (`php8.4-gd`).
- **Eigene Einstellungen**: Das Modul liest `/etc/php/<version>/apache2/php.ini`,
  FPM liest `/etc/php/8.4/fpm/php.ini`. Was Du dort geändert hattest, etwa
  `upload_max_filesize` oder `memory_limit`, überträgst Du in die Datei von FPM
  und startest `php8.4-fpm` neu.

Läuft alles, entfernst Du das alte Modul und, falls Du sie nicht mehr brauchst,
die alte PHP-Version:

```bash
apt-get purge -y 'libapache2-mod-php*'
# Old PHP version, adjust to yours
apt-get purge -y 'php7.4*'
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

Mit der Paketquelle von Sury zieht das Paket zusätzlich die PHP-CLI in der
neuesten Version nach (derzeit 8.5). Für Deine Webseiten ändert das nichts, die
laufen weiter über FPM mit PHP 8.4.

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
<Directory /usr/share/phpmyadmin/setup>
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
zufälligen `blowfish_secret` (32 Zeichen, für die Cookie-Verschlüsselung),
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

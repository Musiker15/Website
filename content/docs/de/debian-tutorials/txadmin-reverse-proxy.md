---
title: "txAdmin hinter einem Apache-Reverse-Proxy"
description: "FXServer mit txAdmin auf Debian aufsetzen und das Webpanel über Apache 2.4 mit HTTPS, WebSockets und einem Port erreichbar machen, der nicht nach außen offen steht."
date: 2026-08-25
order: 9
tags: ["debian", "apache", "fivem", "txadmin", "reverse-proxy", "websocket", "systemd"]
---

txAdmin ist die Weboberfläche, mit der ein FiveM-Server verwaltet wird: starten,
stoppen, Live-Konsole, Spielerliste, Bans, geplante Neustarts. Es steckt seit
2021 direkt im FXServer und lauscht standardmäßig auf Port 40120, unverschlüsselt
und auf allen Netzwerkschnittstellen.

Genau das ist das Problem, das dieses Tutorial löst. Ein Panel, über das sich der
komplette Server steuern lässt, hat auf einem offenen HTTP-Port nichts verloren.
Am Ende dieser Anleitung läuft txAdmin nur noch auf `127.0.0.1`, Apache nimmt die
Anfragen unter einer eigenen Subdomain per HTTPS entgegen, die Live-Konsole
bekommt eine echte WebSocket-Verbindung, und Port 40120 ist von außen tot.

<Callout type="note">
Der Spielport (Standard 30120, TCP **und** UDP) bleibt davon unberührt. Der geht
nicht durch Apache, das ist kein HTTP. Nur das Webpanel wandert hinter den Proxy.
</Callout>

## Voraussetzungen

- Debian 11 oder neuer mit root-Zugang
- Apache 2.4 mit funktionierendem HTTPS, entweder über
  [Certbot](/de/docs/debian-tutorials/certbot) oder über ein
  [Wildcard-Zertifikat](/de/docs/debian-tutorials/acme-sh-wildcard-ionos)
- eine Subdomain, die auf den Server zeigt, im Beispiel `tx.example.de`
- einen Server-Key aus dem [Cfx.re Keymaster](https://portal.cfx.re/)

Die Apache-Version ist wichtiger als sie aussieht. Ab 2.4.47 gibt es die Option
`upgrade=websocket` an `ProxyPass`, und damit wird die WebSocket-Weiche zu einer
einzigen Zeile. Darunter braucht es den Umweg über `mod_rewrite`, beide Varianten
stehen unten in Schritt 7.

```bash
apache2 -v
```

## Schritt 1: Benutzer und Verzeichnisse

FXServer läuft nicht als root. Der Prozess lädt Skripte nach, die von Dritten
stammen, und braucht dafür keine Systemrechte.

```bash
adduser --system --group --home /opt/fivem --shell /usr/sbin/nologin fivem
mkdir -p /opt/fivem/server /opt/fivem/server-data
chown -R fivem:fivem /opt/fivem
```

```bash
apt update
apt install -y curl xz-utils git ca-certificates
```

## Schritt 2: FXServer-Artefakt installieren

Die Linux-Builds liegen unter
[runtime.fivem.net/artifacts/fivem/build_proot_linux/master/](https://runtime.fivem.net/artifacts/fivem/build_proot_linux/master/).
Jeder Eintrag ist ein Ordner aus Buildnummer und Hash. Nimm einen aus der
Recommended-Zeile, nicht blind den obersten.

```bash
cd /opt/fivem/server
curl -fsSL -o fx.tar.xz \
  "https://runtime.fivem.net/artifacts/fivem/build_proot_linux/master/<NUMMER>-<HASH>/fx.tar.xz"
tar -xf fx.tar.xz
rm fx.tar.xz
chown -R fivem:fivem /opt/fivem/server
```

Danach liegen dort `run.sh`, `alpine/` und `opt/`.

<Callout type="warning">
**Der Linux-Build läuft in einem proot-Container.** `run.sh` ist nur ein
Startskript, das eine Alpine-Umgebung aufspannt und den eigentlichen Server
darin ausführt. proot arbeitet mit `ptrace`, und das hat Folgen für die
systemd-Unit in Schritt 5: die üblichen Hardening-Optionen
(`SystemCallFilter=@system-service`, `RestrictNamespaces=true`,
`NoNewPrivileges=true`) sperren genau diesen Mechanismus aus. Der Dienst startet
dann nicht, mit einer Fehlermeldung, die nach allem Möglichen aussieht, nur
nicht nach systemd.
</Callout>

## Schritt 3: Server-Daten holen

```bash
sudo -u fivem git clone https://github.com/citizenfx/cfx-server-data.git \
  /opt/fivem/server-data
```

Eine `server.cfg` brauchst Du an dieser Stelle noch nicht. Die legt der
Setup-Assistent von txAdmin später selbst an, samt Lizenzschlüssel und
Ressourcenliste.

## Schritt 4: txAdmin an localhost binden

Das ist der Kern der ganzen Sache. Ohne diesen Schritt hört txAdmin weiterhin
auf `0.0.0.0:40120`, und der Reverse Proxy ist nur eine zweite Tür neben einer
offenen ersten.

```
+set txAdminInterface 127.0.0.1
+set txAdminPort 40120
```

<Callout type="danger">
**Diese beiden Convars gehören an `run.sh`, nicht in die `server.cfg`.** Die
`server.cfg` liest der Spielserver, und den startet txAdmin. Zu dem Zeitpunkt,
an dem die Datei gelesen wird, läuft txAdmin längst und hat seinen Port
gebunden. Ein `set txAdminPort` in der `server.cfg` wird schlicht ignoriert,
ohne Fehlermeldung, und man sucht den Fehler an der falschen Stelle.
</Callout>

Ein erster Start von Hand, um zu sehen, ob das greift:

```bash
sudo -u fivem /opt/fivem/server/run.sh \
  +set serverProfile default \
  +set txAdminInterface 127.0.0.1 \
  +set txAdminPort 40120
```

In einer zweiten Sitzung gegenprüfen:

```bash
ss -tlnp | grep 40120
```

Erwartet wird `127.0.0.1:40120`. Steht dort `0.0.0.0:40120` oder `*:40120`, hat
die Convar nicht gegriffen. Das kann an einem älteren Artefakt liegen, das den
Namen noch nicht kennt. Dann bleibt die Firewall aus Schritt 9 als Absicherung.
Verlass Dich aber nicht darauf, dass die Convar schon funktioniert haben wird,
sondern sieh es Dir an.

Den Testlauf danach mit `Strg+C` beenden.

## Schritt 5: systemd-Unit

```bash
nano /etc/systemd/system/fivem.service
```

```ini
[Unit]
Description=FXServer mit txAdmin
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=fivem
Group=fivem
WorkingDirectory=/opt/fivem
ExecStart=/opt/fivem/server/run.sh \
    +set serverProfile default \
    +set txAdminInterface 127.0.0.1 \
    +set txAdminPort 40120
Restart=always
RestartSec=10s
KillSignal=SIGTERM
TimeoutStopSec=30s
LimitNOFILE=65535

# Zurueckhaltendes Hardening. Alles, was ptrace oder Namespaces einschraenkt,
# bricht den proot-Build, siehe Schritt 2.
PrivateTmp=true
ProtectHome=true
ProtectKernelTunables=true
ProtectControlGroups=true

[Install]
WantedBy=multi-user.target
```

```bash
systemctl daemon-reload
systemctl enable --now fivem
systemctl status fivem
journalctl -u fivem -f
```

<Callout type="tip">
`Restart=always` ist hier nicht nur Bequemlichkeit. txAdmin startet den
Spielserver selbst neu, wenn der abstürzt. Bricht aber txAdmin selbst weg, steht
alles. Der Dienst kommt so von allein zurück, und geplante Neustarts bleiben
trotzdem txAdmins Aufgabe.
</Callout>

## Schritt 6: Apache-Module aktivieren

```bash
a2enmod ssl proxy proxy_http proxy_wstunnel headers rewrite
systemctl restart apache2
```

`proxy_wstunnel` wird auch dann gebraucht, wenn Du die Variante mit
`upgrade=websocket` nimmst. Die Option an `ProxyPass` stellt nur die Weiche, das
Tunneln selbst macht weiterhin dieses Modul.

## Schritt 7: vHost anlegen

```bash
nano /etc/apache2/sites-available/tx.example.de.conf
```

```apache
<VirtualHost *:80>
    ServerName tx.example.de
    Redirect permanent / https://tx.example.de/
</VirtualHost>

<VirtualHost *:443>
    ServerName   tx.example.de
    ServerAdmin  info@example.de

    SSLEngine on
    SSLCertificateFile    /etc/apache2/ssl/example.de/fullchain.cer
    SSLCertificateKeyFile /etc/apache2/ssl/example.de/example.de.key

    # Security-Header
    Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"
    Header always set X-Content-Type-Options       "nosniff"
    Header always set X-Frame-Options              "SAMEORIGIN"
    Header always set Referrer-Policy              "strict-origin-when-cross-origin"
    Header always set Cross-Origin-Opener-Policy   "same-origin"
    Header always set Cross-Origin-Resource-Policy "same-origin"

    # Reverse Proxy inklusive WebSocket-Upgrade
    ProxyPreserveHost On
    ProxyTimeout      600

    ProxyPass        / http://127.0.0.1:40120/ upgrade=websocket
    ProxyPassReverse / http://127.0.0.1:40120/

    RequestHeader set X-Forwarded-Proto "https"
</VirtualHost>
```

```bash
a2ensite tx.example.de.conf
apachectl -t && systemctl reload apache2
```

### Wenn Apache älter als 2.4.47 ist

Dann kennt `ProxyPass` die Option `upgrade=websocket` nicht und quittiert mit
`Unknown parameter`. Stattdessen übernimmt `mod_rewrite` die Weiche, und zwar
**vor** dem `ProxyPass`:

```apache
    RewriteEngine On
    RewriteCond %{HTTP:Upgrade} =websocket [NC]
    RewriteRule ^/?(.*) ws://127.0.0.1:40120/$1 [P,L]

    ProxyPass        / http://127.0.0.1:40120/
    ProxyPassReverse / http://127.0.0.1:40120/
```

<Callout type="warning">
**Nicht auf die Idee kommen, `/socket.io/` pauschal auf `ws://` zu legen.** Das
sieht naheliegend aus und bricht die Verbindung zuverlässig. Socket.io beginnt
jede Sitzung mit einem gewöhnlichen HTTP-Handshake unter genau diesem Pfad und
steigt erst danach auf WebSocket um. Wer den Pfad komplett auf `ws://` mappt,
tötet den Handshake und bekommt eine Endlosschleife aus abgebrochenen
Verbindungen.

Die Unterscheidung muss über den `Upgrade`-Header laufen, nicht über den Pfad.
</Callout>

### Was der Live-Konsole sonst noch das Genick bricht

`ProxyTimeout 600` ist kein Schmuck. Ohne die Zeile gilt der globale `Timeout`,
also 60 Sekunden. Eine Live-Konsole, auf der eine Minute lang nichts passiert,
zählt damit als tote Verbindung und wird gekappt. Sichtbar wird das als Panel,
das sich alle paar Minuten neu verbindet und dabei den Konsolenpuffer verliert.

## Schritt 8: Zwei Fallen in typischen Konfigurationen

Beides sieht man häufig, beides funktioniert scheinbar, und beides ist falsch.

### `X-Forwarded-For` nicht von Hand setzen

```apache
# Nicht so:
RequestHeader set X-Forwarded-For "%{REMOTE_ADDR}s"
```

`mod_proxy_http` setzt `X-Forwarded-For`, `X-Forwarded-Host` und
`X-Forwarded-Server` von allein. Die `RequestHeader`-Zeile läuft davor, danach
hängt das Modul die Client-IP an den vorhandenen Wert an. Beim Backend kommt
dann `1.2.3.4, 1.2.3.4` an. Für txAdmin heißt das: die IP in den Logs und in der
Ban-Ansicht ist unbrauchbar, und Ratenbegrenzungen greifen an der falschen
Stelle.

`X-Forwarded-Proto` setzt das Modul dagegen **nicht**, diese Zeile bleibt also
stehen.

### Die CSP muss zur eigenen Domain passen

Der Wert `connect-src` entscheidet, wohin der Browser die WebSocket-Verbindung
aufbauen darf. Steht dort eine Domain aus einer alten Konfiguration, blockiert
der Browser die Verbindung und die Live-Konsole bleibt leer.

```apache
# Aus einer anderen Installation uebernommen, passt hier nicht:
connect-src 'self' wss://irgendeine-andere-domain.de;
```

<Callout type="tip">
Am einfachsten ist es, im Proxy **gar keine** CSP zu setzen. txAdmin liefert
eigene Security-Header aus, und zwei Policies für dasselbe Dokument werden nicht
zusammengeführt, sondern beide durchgesetzt. Es gilt dann jeweils die strengere
Regel, und das Ergebnis ist schwer vorherzusagen.

Nachsehen, was tatsächlich ankommt:

```bash
curl -sI https://tx.example.de/ | grep -i -E 'content-security|x-frame|strict-transport'
```

Taucht ein Header doppelt auf, setzen ihn Apache und txAdmin gleichzeitig. Dann
den Apache-Eintrag entfernen oder mit `Header always unset` neutralisieren,
bevor Du ihn neu setzt.
</Callout>

Brauchst Du trotzdem eine eigene CSP, muss `connect-src` die eigene Subdomain
nennen:

```apache
Header always set Content-Security-Policy "connect-src 'self' wss://tx.example.de; frame-ancestors 'self';"
```

<Callout type="note">
`X-XSS-Protection` gehört in keine neue Konfiguration mehr. Der Header ist in
allen aktuellen Browsern wirkungslos, in älteren Chrome-Versionen konnte er
sogar zusätzliche Lücken aufreißen. Abgelöst wurde er von der CSP.
</Callout>

## Schritt 9: Firewall

```bash
ufw allow 30120/tcp
ufw allow 30120/udp
ufw allow 443/tcp
ufw deny  40120/tcp
ufw status verbose
```

Der Spielport muss offen sein, sonst findet niemand den Server. Der Panel-Port
wird ausdrücklich verboten. Wenn Schritt 4 sauber gegriffen hat, hört dort
ohnehin nichts mehr nach außen, aber zwei Schlösser an einer Tür, die den
kompletten Server steuert, sind angemessen.

## Schritt 10: Erstsetup über HTTPS

Beim ersten Start schreibt txAdmin eine PIN ins Log. Die gilt nur wenige
Minuten.

```bash
journalctl -u fivem -n 50 | grep -i pin
```

Dann `https://tx.example.de/` im Browser öffnen, PIN eingeben, Master-Account
anlegen. Danach führt der Assistent durch Lizenzschlüssel, Serververzeichnis
(`/opt/fivem/server-data`) und die erste `server.cfg`.

Direkt im Anschluss unter **Settings → General** die txAdmin-URL auf
`https://tx.example.de` setzen. Aus dieser Adresse baut txAdmin die Links, die
es an Discord und in Einladungen verschickt. Ohne die Angabe stehen dort
`http://<server-ip>:40120`-Adressen, die von außen nicht mehr erreichbar sind.

## Prüfen

```bash
# Hoert txAdmin wirklich nur lokal
ss -tlnp | grep 40120

# Ist der Port von aussen dicht (von einem anderen Rechner aus)
curl -m 5 http://<server-ip>:40120/ ; echo "exit: $?"

# Antwortet der Proxy
curl -sI https://tx.example.de/ | head -1

# Kommt das WebSocket-Upgrade durch
curl -si "https://tx.example.de/socket.io/?EIO=4&transport=websocket" \
  -H "Connection: Upgrade" -H "Upgrade: websocket" \
  -H "Sec-WebSocket-Version: 13" \
  -H "Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==" | head -1
```

Die letzte Zeile muss `HTTP/1.1 101 Switching Protocols` liefern. Kommt
stattdessen `200` oder `400`, greift die Weiche aus Schritt 7 nicht, und
socket.io fällt auf HTTP-Polling zurück. Die Oberfläche funktioniert dann
trotzdem, nur träge, und die Live-Konsole hinkt hinterher. Genau deshalb fällt
dieser Fehler oft monatelang nicht auf.

## Häufige Fehler

| Meldung oder Symptom                                 | Ursache                                      | Lösung                                                |
| ---------------------------------------------------- | -------------------------------------------- | ----------------------------------------------------- |
| `503 Service Unavailable`                            | FXServer läuft nicht oder hört woanders      | `systemctl status fivem`, `ss -tlnp`                  |
| Panel lädt, Live-Konsole bleibt leer                 | WebSocket-Upgrade kommt nicht durch          | Weiche aus Schritt 7 prüfen, `101` erwarten           |
| Panel verbindet sich alle paar Minuten neu           | `ProxyTimeout` zu kurz                       | `ProxyTimeout 600` setzen                             |
| CSP-Verletzung zu `wss://` in der Browser-Konsole    | falsche Domain in `connect-src`              | eigene Subdomain eintragen oder CSP weglassen         |
| Alle Zugriffe kommen mit derselben IP an             | `X-Forwarded-For` doppelt gesetzt            | manuelle `RequestHeader`-Zeile entfernen              |
| `Unknown parameter: upgrade=websocket`               | Apache älter als 2.4.47                      | Rewrite-Variante aus Schritt 7 nehmen                 |
| Dienst startet nicht, kein brauchbarer Fehler im Log | systemd-Hardening blockiert proot            | `SystemCallFilter` und `RestrictNamespaces` entfernen |
| Port 40120 weiterhin von außen erreichbar            | Convar in der `server.cfg` statt an `run.sh` | siehe Schritt 4                                       |
| PIN im Log abgelaufen                                | die PIN gilt nur wenige Minuten              | `systemctl restart fivem`, Log sofort lesen           |

## Artefakt aktualisieren

FiveM verlangt regelmäßig neuere Builds, sonst verweigern aktuelle Clients die
Verbindung.

```bash
systemctl stop fivem
mv /opt/fivem/server /opt/fivem/server.alt

mkdir -p /opt/fivem/server
cd /opt/fivem/server
curl -fsSL -o fx.tar.xz \
  "https://runtime.fivem.net/artifacts/fivem/build_proot_linux/master/<NEUE-NUMMER>-<HASH>/fx.tar.xz"
tar -xf fx.tar.xz && rm fx.tar.xz
chown -R fivem:fivem /opt/fivem/server

systemctl start fivem
journalctl -u fivem -n 30
```

Das alte Verzeichnis bleibt liegen, bis der neue Build ein paar Tage sauber
gelaufen ist. Der Rückweg besteht dann aus zwei `mv` und einem Neustart.

Die Serverdaten, die `server.cfg` und das txAdmin-Profil liegen unter
`/opt/fivem/server-data` beziehungsweise im Profilverzeichnis und werden dabei
nicht angefasst. Am Apache-vHost ändert sich nichts.

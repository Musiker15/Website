---
title: "Schritt 2: txAdmin hinter einem Apache-Reverse-Proxy"
description: "Das txAdmin-Panel über Apache 2.4 mit HTTPS auf einer eigenen Subdomain erreichbar machen, inklusive WebSocket-Weiche für die Live-Konsole und den Fallen, die dabei niemand bemerkt."
date: 2026-08-25
order: 3
tags: ["fivem", "txadmin", "apache", "reverse-proxy", "websocket", "debian", "ssl"]
---

Das hier ist der zweite Teil der [FiveM-Reihe](/de/docs/fivem). Nach
[Schritt 1](/de/docs/fivem/installation) ist Port 40120 von außen gesperrt und
das Panel nur über einen SSH-Tunnel erreichbar. Das ist sicher, aber unbequem,
und für mehr als eine Person taugt es nicht.

Am Ende dieses Teils nimmt Apache die Anfragen unter einer eigenen Subdomain per
HTTPS entgegen, die Live-Konsole bekommt eine echte WebSocket-Verbindung, und
der Tunnel ist überflüssig. Port 40120 bleibt dabei geschlossen, das ist der
ganze Punkt.

<Callout type="note">
Der Spielport (30120, TCP **und** UDP) bleibt davon unberührt. Der geht nicht
durch Apache, das ist kein HTTP. Nur das Webpanel wandert hinter den Proxy.
</Callout>

## Voraussetzungen

- ein laufender FXServer nach [Schritt 1](/de/docs/fivem/installation), das
  Panel ist lokal unter `127.0.0.1:40120` erreichbar und von außen gesperrt
- Apache 2.4 mit funktionierendem HTTPS, entweder über
  [Certbot](/de/docs/debian-tutorials/certbot) oder über ein
  [Wildcard-Zertifikat](/de/docs/debian-tutorials/acme-sh-wildcard-ionos)
- eine Subdomain, die auf den Server zeigt, im Beispiel `tx.example.de`

Die Apache-Version ist wichtiger als sie aussieht. Ab 2.4.47 gibt es die Option
`upgrade=websocket` an `ProxyPass`, und damit wird die WebSocket-Weiche zu einer
einzigen Zeile. Darunter braucht es den Umweg über `mod_rewrite`, beide
Varianten stehen unten.

```bash
apache2 -v
```

## Schritt 2.1: Apache-Module aktivieren

```bash
a2enmod ssl proxy proxy_http proxy_wstunnel headers rewrite
systemctl restart apache2
```

`proxy_wstunnel` wird auch dann gebraucht, wenn Du die Variante mit
`upgrade=websocket` nimmst. Die Option an `ProxyPass` stellt nur die Weiche, das
Tunneln selbst macht weiterhin dieses Modul.

## Schritt 2.2: vHost anlegen

Die Konfiguration unten gibt es als kommentierte Vorlage:

```bash
curl -fsSL https://uploads.musiker15.de/fivem/txadmin-vhost.conf \
  -o /etc/apache2/sites-available/tx.example.de.conf
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

## Schritt 2.3: Zwei Fallen in typischen Konfigurationen

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

## Schritt 2.4: txAdmin die eigene Adresse mitteilen

Unter **Settings → General** die txAdmin-URL auf `https://tx.example.de`
setzen. Aus dieser Adresse baut txAdmin die Links, die es an Discord und in
Einladungen verschickt. Ohne die Angabe stehen dort
`http://<server-ip>:40120`-Adressen, die von außen nicht erreichbar sind.

Ab jetzt ist der SSH-Tunnel aus [Schritt 1](/de/docs/fivem/installation)
überflüssig. Die `ufw`-Regel `deny 40120/tcp` bleibt selbstverständlich stehen.

## Prüfen

```bash
# Ist der Port von aussen dicht (von einem anderen Rechner aus)
curl -m 5 http://<server-ip>:40120/ ; echo "exit: $?"

# Antwortet der Proxy
curl -sI https://tx.example.de/ | head -1
```

### Den WebSocket-Upgrade misst man im Browser, nicht mit curl

<Callout type="danger">
**Ein von Hand zusammengesetzter Handshake mit `curl` taugt als Test nicht.**
engine.io lehnt ihn mit `400` ab, und zwar auch dann, wenn man direkt am Backend
vorbei am Proxy misst und eine gültige Sitzung hat. Man misst dann sein eigenes
Testwerkzeug und hält einen funktionierenden Proxy für kaputt.
</Callout>

Richtig ist der echte Browser. Panel öffnen, Entwicklerwerkzeuge, Netzwerk,
Filter **WS**. Dort muss eine Verbindung mit Status **101** stehen. Oder in der
Konsole:

```js
new WebSocket("wss://tx.example.de/socket.io/?EIO=4&transport=websocket").onopen = () =>
  console.log("Upgrade steht");
```

Bleibt es beim Polling, siehst Du im Netzwerk-Tab stattdessen alle paar Sekunden
neue `transport=polling`-Anfragen.

### Wenn der Upgrade nicht durchgeht

`upgrade=websocket` ist die Standardantwort, und sie reicht nicht immer. Auf
einem meiner Server blieb es trotz `upgrade=websocket`, `upgrade=ANY`,
`mod_proxy_wstunnel` mit Rewrite-Weiche und abgeschaltetem `h2c` bei Status
`400`.

Die Messung, die dort weitergeholfen hat, ist der Vergleich der
**Antwortgröße**. Das Backend antwortet auf denselben Handshake mit 34 Bytes,
durch den Proxy kamen 1414. Der `400` stammte also von Apache selbst, nicht von
txAdmin:

```bash
# Direkt am Backend, auf dem Server
curl -s -o /dev/null -w '%{size_download}\n' \
  "http://127.0.0.1:40120/socket.io/?EIO=4&transport=websocket"

# Durch den Proxy
curl -s -o /dev/null -w '%{size_download}\n' \
  "https://tx.example.de/socket.io/?EIO=4&transport=websocket"
```

**Regel daraus: liefern Proxy und Backend denselben Statuscode, ist der
Statuscode kein Beweis.** Erst Größe oder Rumpf sagen, wer geantwortet hat. Wer
weitersucht, beginnt bei `LogLevel alert proxy:trace3`.

<Callout type="note">
**Dringend ist das Ganze nicht.** socket.io beginnt jede Verbindung mit
HTTP-Longpolling und versucht den Upgrade erst danach. Scheitert er, bleibt es
still beim Polling. Das Panel funktioniert, Live-Konsole und Log-Stream laufen
weiter, nur mit mehr Anfragen und etwas Verzögerung. Im Log steht dazu nichts,
deshalb fällt es oft monatelang nicht auf, und deshalb lohnt der Blick in den
Netzwerk-Tab einmal nach der Einrichtung.
</Callout>

## Häufige Fehler

| Meldung oder Symptom                              | Ursache                                   | Lösung                                        |
| ------------------------------------------------- | ----------------------------------------- | --------------------------------------------- |
| `503 Service Unavailable`                         | FXServer läuft nicht                      | `systemctl status fivem`, `ss -tlnp`          |
| Panel lädt, Live-Konsole nur traege (Polling)     | WebSocket-Upgrade kommt nicht durch       | Weiche aus Schritt 2.2 prüfen, `101` erwarten |
| Panel verbindet sich alle paar Minuten neu        | `ProxyTimeout` zu kurz                    | `ProxyTimeout 600` setzen                     |
| CSP-Verletzung zu `wss://` in der Browser-Konsole | falsche Domain in `connect-src`           | eigene Subdomain eintragen oder CSP weglassen |
| Alle Zugriffe kommen mit derselben IP an          | `X-Forwarded-For` doppelt gesetzt         | manuelle `RequestHeader`-Zeile entfernen      |
| `Unknown parameter: upgrade=websocket`            | Apache älter als 2.4.47                   | Rewrite-Variante aus Schritt 2.2 nehmen       |
| Zertifikatswarnung mit fremder Domain             | kein passender `:443`-vHost, SNI-Fallback | `ServerName` prüfen, `apache2ctl -S`          |
| Discord-Links zeigen auf `:40120`                 | txAdmin-URL nicht gesetzt                 | siehe Schritt 2.4                             |

## Weiter mit Schritt 3

Der Server läuft, das Panel ist sicher erreichbar. Bleibt die Frage, wer die
Artefakte aktuell hält. Der letzte Teil automatisiert das:

**[Schritt 3: Artefakte automatisch aktualisieren](/de/docs/fivem/auto-update)**

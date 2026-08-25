---
title: "Wildcard-SSL mit acme.sh und IONOS-DNS"
description: "Wildcard-Zertifikate automatisch beziehen und erneuern: acme.sh, DNS-01 über die IONOS-API, ZeroSSL und ein Apache-Deploy, das sich nicht selbst abschießt."
date: 2026-08-05
order: 9
tags: ["debian", "apache", "ssl", "acme", "wildcard", "ionos", "zerossl"]
---

Ein Wildcard-Zertifikat deckt alle Subdomains einer Domain auf einen Schlag ab.
Statt für jede neue Subdomain ein eigenes Zertifikat auszustellen, gibt es
einmal `*.example.de` und die Sache ist erledigt. Der Preis dafür: die
Validierung läuft zwingend über DNS, nicht über die Webserver-Datei, und das
braucht einen Client, der mit der DNS-API des Providers sprechen kann.

Dieses Tutorial richtet das komplett ein: Zertifikat ausstellen, nach
`/etc/apache2/ssl` deployen, automatisch erneuern lassen. Am Ende läuft ein
systemd-Timer, der sich um alles kümmert, und es gibt einen Deploy-Schritt, der
Apache im Fehlerfall lieber gar nicht neu lädt statt kaputt.

<Callout type="note">
Wenn Du kein Wildcard brauchst, sondern nur ein paar feste Domains, ist
[Certbot](/de/docs/debian-tutorials/certbot) der kürzere Weg. Der kann
HTTP-01 und braucht keine DNS-API.
</Callout>

## Voraussetzungen

- Debian mit Apache 2.4 und root-Zugang
- eine Domain, deren **DNS-Zone** bei IONOS liegt, nicht nur die Registrierung
- `curl`, `tar` und `openssl` (auf einem normalen Debian alles vorhanden)

Der Unterschied zwischen Registrierung und DNS-Zone ist wichtig: DNS-01 setzt
einen TXT-Record über die API des DNS-Anbieters. Zeigen die Nameserver der
Domain auf Cloudflare, brauchst Du das Cloudflare-Plugin und nicht das von
IONOS, auch wenn die Domain bei IONOS gekauft wurde.

## Warum DNS-01 und warum acme.sh

Es gibt zwei gängige Wege, einer Zertifizierungsstelle zu beweisen, dass die
Domain Dir gehört:

| Verfahren | Wie                                                | Wildcard möglich |
| --------- | -------------------------------------------------- | ---------------- |
| HTTP-01   | Datei unter `/.well-known/acme-challenge/` ablegen | nein             |
| DNS-01    | TXT-Record `_acme-challenge.example.de` setzen     | ja               |

Für ein Wildcard gibt es keine Wahl, es muss DNS-01 sein. Damit fällt Certbot
als bequeme Option weg: es bringt kein offizielles Plugin für IONOS-DNS mit,
man landet bei Drittanbieter-Plugins über pip.

[acme.sh](https://github.com/acmesh-official/acme.sh) hat `dns_ionos` eingebaut,
ist ein reines Shellscript ohne Python-Umgebung und schreibt `fullchain.cer`
nativ. Das passt zu Apache, der die Zwischenzertifikate seit 2.4 direkt aus der
Fullchain liest.

## Welche Zertifizierungsstelle

acme.sh spricht jeden ACME-Server. Drei kommen bei einer IONOS-Domain in Frage:

| CA            | EAB nötig                    | Laufzeit    | Wurzel                   |
| ------------- | ---------------------------- | ----------- | ------------------------ |
| ZeroSSL       | nein, acme.sh holt es selbst | 90 Tage     | USERTrust (über Sectigo) |
| Let's Encrypt | nein                         | 90 Tage     | ISRG                     |
| IONOS ACME    | ja, von Hand                 | wie gekauft | Sectigo                  |

<Callout type="warning">
**Der IONOS-ACME-Server stellt nicht frei aus.** Er bindet jede Anfrage an ein
*verfügbares* Zertifikat im Kundenkonto. Ein bereits ausgestelltes und
heruntergeladenes Zertifikat gilt als verbraucht. Das Produkt "SSL Starter
Wildcard" wird von IONOS selbst validiert, von Sectigo signiert und liegt
danach als Datei zum Download im Konto. Es speist die ACME-Schiene in **keinem**
Zustand.

Der Abbruch kommt spät und liest sich harmlos:

```
Verifying: example.de
Success
Let's finalize the order.
Signing failed. Finalize code was not 200.
{"detail":"No available certificate found for the requested domain(s).",
 "type":"urn:ietf:params:acme:error:unauthorized"}
```

Order angelegt, Domain validiert, Finalize abgelehnt. Genau diese Stelle im
Ablauf ist das Erkennungsmerkmal: scheitert es früher, ist es ein Client-,
DNS- oder Validierungsproblem, scheitert es erst am Finalize, ist es die
Kontoseite.
</Callout>

Dieses Tutorial nimmt deshalb **ZeroSSL**. Der Grund ist nicht Willkür: wer von
einem gekauften IONOS-Zertifikat kommt, behält damit die Sectigo-Vertrauenskette.

```
example.de
  └─ ZeroSSL RSA DV SSL CA 2
      └─ Sectigo Public Server Authentication Root R46
          └─ USERTrust RSA Certification Authority
```

IONOS-Zertifikate laufen über `Sectigo Public Server Authentication CA DV R36`
und damit über denselben Root R46. Oberhalb des Zwischenzertifikats sind die
Ketten identisch, es ändert sich nur die Ausstellerzeile.

Wer das nicht braucht, nimmt Let's Encrypt. Alles Weitere ist gleich, nur die
`--server`-URL unterscheidet sich.

## Schritt 1: DNS-API-Key bei IONOS erzeugen

Auf [developer.hosting.ionos.de](https://developer.hosting.ionos.de/) einen
API-Key anlegen. Der wird als eine lange Zeichenkette der Form `prefix.secret`
angezeigt. Der **erste Punkt** trennt die beiden Teile:

```bash
export IONOS_PREFIX="<Teil vor dem ersten Punkt>"
export IONOS_SECRET="<Rest dahinter>"
```

Ein Key gilt für alle Zonen des Kontos. Für weitere Domains im selben Konto
brauchst Du also keinen zweiten.

## Schritt 2: acme.sh installieren

<Callout type="warning">
**Nicht über `https://get.acme.sh` installieren, wenn Du eigene Flags mitgeben
willst.** Dieser Wrapper interpretiert sein erstes Argument als
`email=...`-Paar und baut daraus intern

```sh
_email="--$(echo "$1" | tr '=' ' ')"
```

Ein führendes `--home` wird dadurch zu `----home`, und acme.sh bricht mit
`Unknown parameter: ----home` ab. Der Tarball ist der dokumentierte
Offline-Installer und nimmt normale Flags.
</Callout>

```bash
cd /tmp
curl -fsSL https://github.com/acmesh-official/acme.sh/archive/master.tar.gz -o acme.tar.gz
tar -xzf acme.tar.gz
cd acme.sh-master

sh ./acme.sh --install \
    --home /root/.acme.sh \
    --nocron \
    --noprofile
```

`--nocron` unterdrückt den eigenen Cronjob, wir nehmen später einen
systemd-Timer. `--noprofile` spart die Shell-Aliase, wir rufen acme.sh mit
vollem Pfad auf.

```bash
/root/.acme.sh/acme.sh --home /root/.acme.sh --version
```

## Schritt 3: ACME-Account registrieren

```bash
/root/.acme.sh/acme.sh --home /root/.acme.sh \
    --register-account \
    --server https://acme.zerossl.com/v2/DV90 \
    -m info@example.de
```

<Callout type="danger">
**Die ZeroSSL-URL muss exakt so geschrieben sein.** acme.sh entscheidet über
einen Stringvergleich `[ "$ACME_DIRECTORY" = "$CA_ZEROSSL" ]`, ob es die
EAB-Zugangsdaten automatisch von `api.zerossl.com` holt. Schon ein fehlendes
`/DV90` schaltet den Automatismus ab, und die Registrierung scheitert ohne
brauchbare Fehlermeldung. Die E-Mail-Adresse ist dabei Pflicht, daran hängt die
EAB-Beschaffung.
</Callout>

acme.sh hält **pro CA genau einen Account**, abgelegt unter
`/root/.acme.sh/ca/acme.zerossl.com/v2/DV90/`. Wenn Du später weitere Domains
aufnimmst, nimm dieselbe Adresse, sonst wird der Accountschlüssel ersetzt.

## Schritt 4: Zertifikat ausstellen

```bash
export IONOS_PREFIX="..."
export IONOS_SECRET="..."

/root/.acme.sh/acme.sh --home /root/.acme.sh \
    --issue \
    --server https://acme.zerossl.com/v2/DV90 \
    --dns dns_ionos \
    --keylength 2048 \
    -d example.de \
    -d '*.example.de'
```

Zwei Details, die leicht untergehen:

**Das Wildcard deckt den Apex nicht ab.** `*.example.de` passt auf
`www.example.de` und `shop.example.de`, aber nicht auf `example.de` selbst.
Deshalb stehen beide in der Liste.

**Ein Wildcard deckt genau ein Label ab.** `*.example.de` passt auch auf
`b.example.de`, aber nicht auf `a.b.example.de`. Für tiefere Namen ergänzt Du
entweder den Namen einzeln oder eine zweite Wildcard-Ebene:

```bash
-d example.de -d '*.example.de' -d '*.b.example.de'
```

<Callout type="tip">
`--keylength 2048` erzwingt RSA. Ohne Angabe nimmt acme.sh 3.x ein ECDSA-Schlüsselpaar
(`ec-256`) und legt das Zertifikat in einem Verzeichnis mit `_ecc`-Suffix ab.
Das ist völlig in Ordnung, nur brauchen alle weiteren Befehle dann zusätzlich
`--ecc`, sonst finden sie nichts.
</Callout>

Schlägt die Validierung mit einem Timeout fehl, ist meist die DNS-Propagation
zu langsam. Dann `--dnssleep 180` anhängen und den Aufruf wiederholen.

## Schritt 5: Zielverzeichnis prüfen, bevor Du installierst

Der nächste Schritt verknüpft acme.sh dauerhaft mit Pfaden unter
`/etc/apache2/ssl`. Bevor das passiert, lohnt ein Blick, was dort schon liegt.

<Callout type="danger">
**`--install-cert` überschreibt seine Zielpfade ohne Rückfrage.** Gefährlich
wird das durch die Teilüberdeckung: überschrieben werden nur die Namen, die das
neue Schema vergibt. Ein vhost, der die **neue** `fullchain.cer` mit einem
**alten**, nicht überschriebenen Schlüssel kombiniert, passt nicht mehr
zusammen:

```
AH02565: Certificate and private key example.de:443:0 from
/etc/apache2/ssl/fullchain.cer and /etc/apache2/ssl/alter-key.key do not match
AH00020: Configuration Failed, exiting
```

Und `apachectl -t` meldet dabei **Syntax OK**. Der Configtest prüft die
Grammatik, nicht ob Zertifikat und Schlüssel zueinander gehören. Das fällt erst
beim Laden auf, also beim Start oder beim Reload, und dann trifft es den
laufenden Prozess.
</Callout>

Also vorher nachsehen, welche Dateien belegt sind und wer sie referenziert:

```bash
ls -la /etc/apache2/ssl/
grep -RnE 'SSLCertificate(File|KeyFile|ChainFile)' \
     /etc/apache2/sites-available/ /etc/apache2/conf-available/
```

<Callout type="warning">
**`grep -r` folgt keinen Symlinks.** `sites-enabled`, `conf-enabled` und
`mods-enabled` bestehen unter Debian ausschließlich aus Symlinks nach
`*-available`. Eine Suche mit `-r` in `sites-enabled` kommt deshalb leer zurück,
obwohl dort zwei Dutzend vhosts hängen. Ein leeres Suchergebnis liest sich aber
wie eine Antwort, und dann löscht oder überschreibt man eine Datei, die sehr
wohl in Benutzung ist. Deshalb `-R` nehmen oder gleich in `*-available` suchen.
</Callout>

Am saubersten ist ein eigenes Unterverzeichnis pro Domain. Dann kann sich nichts
in die Quere kommen, auch nicht bei der zweiten Domain später:

```bash
mkdir -p /etc/apache2/ssl/example.de
chmod 0710 /etc/apache2/ssl/example.de
```

## Schritt 6: Deploy-Script anlegen

acme.sh kann nach jeder Erneuerung ein Kommando aufrufen. Genau dort gehört die
Sicherung hin, die `apachectl -t` nicht leisten kann: der Abgleich, ob
Schlüssel und Zertifikat wirklich zusammengehören.

```bash
nano /usr/local/sbin/ssl-deploy.sh
```

```bash
#!/usr/bin/env bash
set -euo pipefail

SSL_DIR="/etc/apache2/ssl/example.de"
KEY="$SSL_DIR/example.de.key"
CERT="$SSL_DIR/example.de.cer"
FULLCHAIN="$SSL_DIR/fullchain.cer"

for f in "$KEY" "$CERT" "$FULLCHAIN"; do
    [[ -s "$f" ]] || { echo "Datei fehlt oder ist leer: $f" >&2; exit 1; }
done

# Gehoeren Schluessel und Zertifikat zusammen? Vergleich der oeffentlichen
# Schluessel, weil apachectl -t das nicht prueft.
a="$(openssl pkey  -in "$KEY"  -pubout        | openssl sha256)"
b="$(openssl x509  -in "$CERT" -noout -pubkey | openssl sha256)"
if [[ "$a" != "$b" ]]; then
    echo "Privater Schluessel passt nicht zum Zertifikat. Kein Reload." >&2
    exit 1
fi

chmod 0710 "$SSL_DIR"
chmod 0600 "$KEY"
chmod 0644 "$CERT" "$FULLCHAIN"

if ! apachectl -t; then
    echo "Apache-Konfiguration fehlerhaft. Kein Reload." >&2
    exit 1
fi

systemctl reload apache2
echo "Aktiv bis: $(openssl x509 -in "$FULLCHAIN" -noout -enddate | cut -d= -f2)"
```

```bash
chmod 0755 /usr/local/sbin/ssl-deploy.sh
```

Bricht das Script ab, wird nicht reloadet und der Timer meldet die Unit als
fehlgeschlagen. Der Server läuft in dem Fall mit dem alten Zertifikat weiter,
was deutlich besser ist als ein Apache, der nicht mehr startet.

## Schritt 7: Zielpfade und Reload-Hook verdrahten

```bash
/root/.acme.sh/acme.sh --home /root/.acme.sh \
    --install-cert -d example.de \
    --key-file       /etc/apache2/ssl/example.de/example.de.key \
    --cert-file      /etc/apache2/ssl/example.de/example.de.cer \
    --ca-file        /etc/apache2/ssl/example.de/ca.cer \
    --fullchain-file /etc/apache2/ssl/example.de/fullchain.cer \
    --reloadcmd      "/usr/local/sbin/ssl-deploy.sh"
```

Das ist ein einmaliger Schritt. acme.sh merkt sich die Pfade und den
`reloadcmd` pro Zertifikat und wendet sie bei jeder künftigen Erneuerung selbst
an.

<Callout type="tip">
`--install-cert` ruft den `reloadcmd` sofort mit auf. Der Befehl ist damit
gleichzeitig der Test der ganzen Kette, ohne dass ein Zertifikat neu
ausgestellt werden muss. Läuft er sauber durch, funktioniert auch die
automatische Erneuerung.
</Callout>

## Schritt 8: Apache umstellen

```apache
<VirtualHost *:443>
    ServerName  example.de
    ServerAlias www.example.de

    SSLEngine on
    SSLCertificateFile    /etc/apache2/ssl/example.de/fullchain.cer
    SSLCertificateKeyFile /etc/apache2/ssl/example.de/example.de.key

    # ...
</VirtualHost>
```

`SSLCertificateChainFile` wird nicht mehr gebraucht, Apache 2.4 liest die
Zwischenzertifikate direkt aus der Fullchain.

<Callout type="warning">
**Der `:443`-vhost braucht Apex und www als `ServerName` beziehungsweise
`ServerAlias`.** Fehlt einer der Namen, greift der SNI-Fallback: Apache liefert
für unbekannte Hostnamen das Zertifikat des **ersten geladenen** `:443`-vhosts
aus, und Debian bindet `conf-enabled` vor `sites-enabled` ein. Der Besucher
bekommt dann eine Namensfehlermeldung mit einer völlig fremden Domain im
Zertifikat.
</Callout>

```bash
apachectl -t && systemctl reload apache2
```

## Schritt 9: Automatische Erneuerung per systemd-Timer

acme.sh bringt einen eigenen Cronjob mit, den wir mit `--nocron` unterdrückt
haben. Ein systemd-Timer ist übersichtlicher, protokolliert ins Journal und
lässt sich mit `systemctl` abfragen.

```bash
nano /etc/systemd/system/acme-renew.service
```

```ini
[Unit]
Description=ACME-Zertifikate erneuern
After=network-online.target
Wants=network-online.target

[Service]
Type=oneshot
Environment=IONOS_PREFIX=...
Environment=IONOS_SECRET=...
ExecStart=/root/.acme.sh/acme.sh --home /root/.acme.sh --cron
```

```bash
nano /etc/systemd/system/acme-renew.timer
```

```ini
[Unit]
Description=Taegliche Pruefung der ACME-Zertifikate

[Timer]
OnCalendar=*-*-* 03:17:00
RandomizedDelaySec=45m
Persistent=true

[Install]
WantedBy=timers.target
```

```bash
chmod 0600 /etc/systemd/system/acme-renew.service
systemctl daemon-reload
systemctl enable --now acme-renew.timer
systemctl list-timers acme-renew.timer
```

<Callout type="note">
Der Zufallsversatz ist kein Schmuck. Würden alle Server der Welt um Punkt 03:17
bei derselben CA anklopfen, wäre das ein selbstgebauter Lastspitzen-Generator.
`Persistent=true` holt einen Lauf nach, der verpasst wurde, weil die Maschine
aus war.

Die API-Zugangsdaten stehen hier in der Unit, deshalb `0600`. acme.sh speichert
sie zwar zusätzlich pro Zertifikat in seiner eigenen Konfiguration, aber sich
darauf zu verlassen ist unnötig fragil.
</Callout>

acme.sh erneuert nur, was alt genug ist. Ein Lauf, der nichts zu tun hat, endet
mit `Skipping. Next renewal time is: ...` und das ist der Normalfall.

```bash
# Trockenlauf, erneuert nichts
/root/.acme.sh/acme.sh --home /root/.acme.sh --cron

journalctl -u acme-renew -n 50
```

<Callout type="warning">
**Kein `--server` beim `--cron`.** Die CA steht pro Zertifikat in der
acme.sh-Konfiguration. Ein globaler Wert an dieser Stelle könnte bei der
automatischen Erneuerung die falsche erzwingen, und das fällt erst Monate
später auf.
</Callout>

## Mehrere Domains auf einem Server

Zwei Eigenschaften von acme.sh legen zusammen fest, wie das aussehen muss:

- **`--cron` erneuert immer alle Zertifikate** im `--home`. Es gibt keine
  Möglichkeit, den Durchlauf auf eine Domain zu beschränken. Zwei Timer
  bedeuten also zwei vollständige Durchläufe, die sich gegenseitig ins Gehege
  kommen.
- **Der `reloadcmd` steht pro Zertifikat** in `<home>/<domain>/<domain>.conf`,
  als `Le_ReloadCmd`. Jede Domain kann also nach ihrer Erneuerung ein anderes
  Kommando ausführen.

Daraus folgt: **ein Timer, ein `--cron`, aber ein eigener `reloadcmd` je
Domain.** Für die zweite Domain also einfach noch einmal Schritt 4, 6 und 7 mit
eigenen Pfaden und einem eigenen Deploy-Script:

```bash
/root/.acme.sh/acme.sh --home /root/.acme.sh \
    --issue --server https://acme.zerossl.com/v2/DV90 \
    --dns dns_ionos --keylength 2048 \
    -d zweite-domain.de -d '*.zweite-domain.de'

/root/.acme.sh/acme.sh --home /root/.acme.sh \
    --install-cert -d zweite-domain.de \
    --key-file       /etc/apache2/ssl/zweite-domain.de/zweite-domain.de.key \
    --cert-file      /etc/apache2/ssl/zweite-domain.de/zweite-domain.de.cer \
    --ca-file        /etc/apache2/ssl/zweite-domain.de/ca.cer \
    --fullchain-file /etc/apache2/ssl/zweite-domain.de/fullchain.cer \
    --reloadcmd      "/usr/local/sbin/ssl-deploy-zweite-domain.sh"
```

Am Timer ändert sich nichts, er deckt die neue Domain automatisch mit ab.

<Callout type="danger">
**Zwei Domains dürfen niemals auf dieselbe Datei zeigen.** Die Namen `ca.cer`
und `fullchain.cer` sind generisch. Legst Du beide Zertifikate direkt nach
`/etc/apache2/ssl/`, überschreibt das zweite `--install-cert` die Dateien des
ersten, und der nächste Reload kombiniert eine fremde Fullchain mit dem alten
Schlüssel. Deshalb pro Domain ein eigenes Unterverzeichnis.
</Callout>

Kontrollieren, was tatsächlich gespeichert ist: der Wert steht base64-kodiert
in der Konfiguration, ein einfaches `grep` zeigt ihn also nicht im Klartext.

```bash
grep -i reloadcmd /root/.acme.sh/*/*.conf \
  | grep -o '__ACME_BASE64__START_[^_]*' | sed 's/.*START_//' | base64 -d
```

## Prüfen

```bash
# Was liegt lokal
openssl x509 -in /etc/apache2/ssl/example.de/fullchain.cer \
        -noout -subject -issuer -dates -ext subjectAltName

# Wie viele Zertifikate sind in der Kette (Leaf + Zwischenzertifikate)
grep -c 'BEGIN CERTIFICATE' /etc/apache2/ssl/example.de/fullchain.cer

# Was liefert der Server wirklich aus
for h in example.de www.example.de shop.example.de; do
  echo "== $h"
  echo | openssl s_client -servername "$h" -connect "$h":443 2>/dev/null \
    | openssl x509 -noout -subject -issuer
done

# Was kennt acme.sh
/root/.acme.sh/acme.sh --home /root/.acme.sh --list
```

Der `s_client`-Test mit `-servername` ist der wichtigste davon. Nur er zeigt,
was ein Browser tatsächlich bekommt, inklusive der Frage, ob der richtige vhost
greift.

## Häufige Fehler

| Meldung                                                       | Ursache                                             | Lösung                                   |
| ------------------------------------------------------------- | --------------------------------------------------- | ---------------------------------------- |
| `Unknown parameter: ----home`                                 | Installation über `get.acme.sh` mit eigenen Flags   | Tarball-Weg nehmen, siehe Schritt 2      |
| `No available certificate found for the requested domain(s).` | IONOS-ACME, kein freies Kontingent im Konto         | ZeroSSL oder Let's Encrypt nehmen        |
| Registrierung bei ZeroSSL scheitert ohne klare Meldung        | Server-URL nicht exakt                              | genau `https://acme.zerossl.com/v2/DV90` |
| `AH02565: ... do not match`                                   | neue Fullchain mit altem Schlüssel kombiniert       | vhost-Pfade prüfen, siehe Schritt 5      |
| `is already verified, skipping dns-01`                        | IONOS autorisiert eigene Domains vorab              | kein Fehler, nur eine Info               |
| Validierung läuft in einen Timeout                            | DNS-Propagation zu langsam                          | `--dnssleep 180` anhängen                |
| `AH02218: no OCSP URI in certificate`                         | Let's Encrypt liefert seit 2025 keine OCSP-URL mehr | `SSLUseStapling off` oder CA wechseln    |
| `--install-cert` findet nichts                                | ECDSA-Zertifikat ohne `--ecc` angesprochen          | `--ecc` ergänzen                         |

## Warum sich das ohnehin lohnt

Manuelle Zertifikatspflege läuft branchenweit aus. Das CA/Browser Forum hat mit
Ballot SC-081v3 einen Stufenplan für alle öffentlichen CAs beschlossen:

| ab         | maximale Laufzeit |
| ---------- | ----------------- |
| 15.03.2026 | 200 Tage          |
| 15.03.2027 | 100 Tage          |
| 15.03.2029 | 47 Tage           |

Ein Zertifikat, das alle 47 Tage von Hand getauscht werden muss, tauscht
irgendwann niemand mehr rechtzeitig. Die 90 Tage von ZeroSSL und Let's Encrypt
sind vor diesem Hintergrund kein Nachteil, sondern nur der Zustand, auf den
alles zuläuft.

## Deinstallation

```bash
systemctl disable --now acme-renew.timer
rm /etc/systemd/system/acme-renew.{timer,service}
systemctl daemon-reload

/root/.acme.sh/acme.sh --home /root/.acme.sh --remove -d example.de
/root/.acme.sh/acme.sh --home /root/.acme.sh --uninstall
```

Die Dateien unter `/etc/apache2/ssl/` bleiben dabei liegen, `--remove` streicht
das Zertifikat nur aus der Erneuerungsliste. Erst den vhost umstellen, dann
löschen.

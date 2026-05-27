# Security Policy

## Supported Versions

Diese Website wird kontinuierlich vom `main`-Branch deployed. Patches werden
ausschließlich für die aktuelle Production-Version bereitgestellt — es gibt
keine LTS-Branches oder versionierten Releases.

| Version | Supported |
|---|---|
| `main` (Production) | ✅ |
| Sonstige Branches / Tags | ❌ |

## Reporting a Vulnerability

Sicherheitslücken bitte **nicht** über öffentliche GitHub-Issues melden,
sondern auf einem der folgenden vertraulichen Wege:

### 1. GitHub Security Advisory (bevorzugt)

Auf der Repository-Seite unter dem **„Security"**-Tab → **„Report a vulnerability"**.
Damit wird ein privater Kanal zwischen Dir und dem Maintainer eingerichtet.

### 2. E-Mail (Fallback)

Wenn Du keinen GitHub-Account nutzt oder den oben genannten Weg nicht
verwenden kannst:

> **E-Mail:** `info@musiker15.de`
> **Betreff:** `Security · <Kurzbeschreibung>`

Bitte verschlüssele sensible Details, wenn möglich (PGP-Key auf Anfrage).

### Was wir uns wünschen

- **Reproduktionsschritte** (Curl-Calls, URLs, Eingaben, Browser-Versionen)
- **Erwartetes vs. tatsächliches Verhalten**
- **Impact-Einschätzung** (Auswirkung, betroffene Daten / Funktionen)
- **Vorschläge zur Behebung**, falls bekannt
- Deinen **Namen / Handle** für Acknowledgments (optional)

## Response Timeline

| Phase | Ziel |
|---|---|
| Eingangsbestätigung | innerhalb von **72 Stunden** |
| Erste Einschätzung (Triage) | innerhalb von **7 Tagen** |
| Fix in Production | abhängig von Severity (kritisch: ASAP; hoch: ≤ 30 Tage; mittel/niedrig: best-effort) |
| Coordinated Disclosure | typischerweise 90 Tage nach Fix-Deployment |

## Out-of-Scope

Folgende Reports werden in der Regel **nicht** als Vulnerability gewertet:

- Fehlende Security-Header auf `*.musiker15.de`-Subdomains außerhalb dieses
  Projekts
- Reports, die ausschließlich von Self-Hosted Browser-Plugins oder
  Browser-Extensions verursacht werden
- Theoretische CSRF-Lücken auf Formularen, die es nicht gibt (die Site hat
  keine User-Inputs außer der clientseitigen Suche)
- Rate-Limiting auf statischen Endpoints
- Public-Information-Disclosure (Impressum, technische Stack-Details, etc.)

## Scope

In Scope sind:

- Die Production-Site unter [www.musiker15.de](https://www.musiker15.de)
- Der zugehörige Quellcode in diesem Repository
- Apache-vHost und systemd-Service ([deploy/](deploy/))
- GitHub-Actions-Workflows ([.github/workflows/](.github/workflows/))

Out-of-Scope:

- Externe Dienste (GitHub, Discord, MSK Scripts), die nur verlinkt sind
- Hosting-Provider (netcup) — bitte direkt an [netcup](https://www.netcup.com/de)
  reporten

## Bekannte Härtungen

Diese Site ist gegen die häufigsten Web-Vektoren gehärtet:

- **Mozilla Observatory: A+** (135/135)
- **Nonce-basierte CSP** mit `'strict-dynamic'` (kein `'unsafe-inline'` für
  Scripts), `default-src 'none'`
- **HSTS preload** (2 Jahre, `includeSubDomains`)
- **COOP / CORP / COEP** (`credentialless`)
- **Permissions-Policy** für alle nicht benötigten Browser-APIs deaktiviert
- **Keine Drittanbieter-Skripte, keine Tracker, keine externen Fonts**
- **Cookies:** ausschließlich `NEXT_LOCALE` (technisch erforderlich nach § 25
  Abs. 2 Nr. 2 TDDDG), mit `Secure`, `HttpOnly`, `SameSite=Lax`
- **systemd-Hardening:** `ProtectSystem=strict`, `NoNewPrivileges`,
  `SystemCallFilter`, eingeschränkter Run-User `musiker15:musiker15`

Details: Abschnitt „Datenschutz-Audit" in [CLAUDE.md](CLAUDE.md).

## Acknowledgments

Reporter, die sich an Coordinated Disclosure halten, werden — sofern gewünscht —
nach erfolgreichem Fix hier namentlich genannt:

_— bisher keine Einträge._

## Lizenzhinweis

Diese Security Policy ist Teil eines Projekts unter der
[MSK Source Available License (MSK-SAL)](LICENSE.md) — Reverse Engineering mit
dem Ziel der Reproduktion von Algorithmen, Strukturen oder Geschäftslogik
ist nicht gestattet. Sicherheitsforschung im Sinne von Penetration-Testing
und Vulnerability-Reporting bleibt davon unberührt und ist ausdrücklich
willkommen.

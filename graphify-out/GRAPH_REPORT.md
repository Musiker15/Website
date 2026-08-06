# Graph Report - .  (2026-08-06)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 742 nodes · 1187 edges · 82 communities (54 shown, 28 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 78 edges (avg confidence: 0.87)
- Token cost: 4,860 input · 930 output

## Graph Freshness
- Built from commit: `a1bf31b9`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Next.js Documentation Pages
- MDX Components
- TypeScript Configuration
- Search and Home Pages
- Development Dependencies
- Security and Vulnerabilities
- Package Metadata
- Footer Configuration
- Brand and Profile Info
- Project News and Updates
- Search Index Generation
- Privacy and Legal
- Licensing and Security Policy
- German Database and Sinusbot
- English Server Tutorials
- Server Hardening and CSP
- German Apache and pgAdmin
- Content Authoring Guide
- German Debian Upgrade Guide
- Database Security Best Practices
- Navigation and Header
- Dependency Management Groups
- English LAMP Stack Guide
- Apache and pgAdmin Config
- Deployment Strategy
- CI/CD Build Workflow
- OpenGraph Image Branding
- Core UI Dependencies
- German Server Runbooks
- English Server Runbooks
- English Debian Maintenance
- Repository Mirroring
- Code Quality Workflows
- Content Validation
- German phpMyAdmin Setup
- German MariaDB Management
- German TeamSpeak Setup
- German Hardware and Profiles
- English Hardware and Landing
- Cookie Compliance
- German ACME Tutorial
- Brand Assets
- OpenGraph Metadata
- Web Server Rationale
- Legal Disclaimer
- Consumer Arbitration Policy
- English ACME Tutorial
- JetBrains Mono Font
- Geist Font
- Markdown Parser
- Icon Library
- Next.js Framework
- Internationalization Library
- MDX Remote Rendering
- Theme Management
- Radix Dialog Component
- Radix Dropdown Component
- Radix Navigation Component
- Radix Slot Primitive
- Common UI Components
- React Core
- React DOM
- Heading Autolinks
- Heading Slugs
- GitHub Flavored Markdown
- Table of Contents Plugin
- Syntax Highlighting
- Tailwind Class Merger
- Schema Validation
- PostCSS Configuration
- Site Metadata and Sitemap
- Social Media Profiles
- GitHub Profile Link
- News and Card Components
- Hero and Icon Components
- Search Dialog Components
- German SSL Tutorial
- English SSL Tutorial
- Code Block Styling

## God Nodes (most connected - your core abstractions)
1. `Locale` - 49 edges
2. `cn()` - 27 edges
3. `compilerOptions` - 21 edges
4. `t()` - 16 edges
5. `scripts` - 15 edges
6. `getContent()` - 15 edges
7. `siteConfig` - 11 edges
8. `DocPage()` - 11 edges
9. `Button` - 11 edges
10. `buildJsonLdGraph()` - 11 edges

## Surprising Connections (you probably didn't know these)
- `Pre-Commit Content Checks` --semantically_similar_to--> `Validate Job (lint, type-check, build, vitest)`  [INFERRED] [semantically similar]
  AUTHORING.md → .github/workflows/ci.yml
- `Security Policy` --conceptually_related_to--> `CodeQL Advanced Workflow`  [INFERRED]
  SECURITY.md → .github/workflows/codeql.yml
- `No External Image URLs (CSP img-src self)` --semantically_similar_to--> `Local Fonts via @fontsource-variable (no Google Fonts)`  [INFERRED] [semantically similar]
  AUTHORING.md → README.md
- `js-yaml@<3.15.0 → 3.15.0 (Override)` --conceptually_related_to--> `Nonce-basierte CSP mit strict-dynamic`  [AMBIGUOUS]
  pnpm-workspace.yaml → content/pages/de/datenschutz.md
- `Granted Rights (§ 2)` --conceptually_related_to--> `Bug Report Issue Template`  [INFERRED]
  LICENSE.md → .github/ISSUE_TEMPLATE/bug_report.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Release Pipeline: validate, build, tarball, atomic swap, restart, verify** — _github_workflows_ci_validatejob, _github_workflows_deploy_buildjob, _github_workflows_deploy_deployjob, _github_workflows_deploy_atomicsymlinkswap, _github_workflows_deploy_musiker15service, _github_workflows_deploy_healthcheck [EXTRACTED 1.00]
- **Privacy-strict Frontend Posture (CSP, no external assets, single cookie)** — readme_noncebasedcsp, readme_securityheadersingletruth, readme_dynamicrenderingtradeoff, readme_localfontsprivacy, authoring_noexternalimageurls, security_nextlocalecookie, security_knownhardening [EXTRACTED 1.00]
- **Supply-Chain Security Automation (Dependabot grouping, CodeQL, least-privilege tokens, mirror guard)** — _github_dependabot_updategrouping, _github_workflows_codeql_codeqlworkflow, _github_workflows_ci_leastprivilegepermissions, _github_workflows_mirror_dependabotguard [INFERRED 0.85]
- **LAMP-Stack-Setup auf Debian (Apache, PHP, MariaDB, phpMyAdmin)** — content_docs_de_debian_tutorials_apache2_php_mariadb_phpmyadmin_apache2, content_docs_de_debian_tutorials_apache2_php_mariadb_phpmyadmin_php83, content_docs_de_debian_tutorials_apache2_php_mariadb_phpmyadmin_mariadb_server, content_docs_de_debian_tutorials_apache2_php_mariadb_phpmyadmin_phpmyadmin_manual, content_docs_de_debian_tutorials_apache2_php_mariadb_phpmyadmin_phpmyadmin_conf [EXTRACTED 1.00]
- **Absicherung der pgAdmin-Weboberflaeche (HTTPS, Basic-Auth, Header, fail2ban, loopback-only DB)** — content_docs_de_debian_tutorials_pgadmin_setup_apache_vhost, content_docs_de_debian_tutorials_pgadmin_setup_basic_auth_defense_in_depth, content_docs_de_debian_tutorials_pgadmin_setup_security_header, content_docs_de_debian_tutorials_pgadmin_setup_fail2ban_jail, content_docs_de_debian_tutorials_pgadmin_setup_postgres_loopback [EXTRACTED 1.00]
- **TeamSpeak-Voice-Stack (TS3-Server, TS3-Client, Sinusbot-Musik-Bot)** — content_docs_de_debian_tutorials_teamspeak3_ts3server_startscript, content_docs_de_debian_tutorials_sinusbot_ts3_client_plugin, content_docs_de_debian_tutorials_sinusbot_sinusbot_service, content_docs_de_debian_tutorials_sinusbot_webinterface_port_8087 [INFERRED 0.85]
- **OpenGraph Image Delivery Strategy (dynamic PNG live, SVG as manual backup)** — assets_og_default_og_backup_image, assets_og_default_dynamic_og_image_route, assets_og_default_svg_og_unreliability, assets_og_default_brand_identity [EXTRACTED 0.90]
- **LAMP stack setup flow (Apache, PHP 8.3, MariaDB, phpMyAdmin)** — content_docs_en_debian_tutorials_apache2_php_mariadb_phpmyadmin_apache2, content_docs_en_debian_tutorials_apache2_php_mariadb_phpmyadmin_php83, content_docs_en_debian_tutorials_apache2_php_mariadb_phpmyadmin_mariadb_server, content_docs_en_debian_tutorials_apache2_php_mariadb_phpmyadmin_phpmyadmin, content_docs_en_debian_tutorials_apache2_php_mariadb_phpmyadmin_sury_repo [EXTRACTED 1.00]
- **Secure pgAdmin exposure: subdomain, HTTPS, WSGI, basic auth, fail2ban** — content_docs_en_debian_tutorials_pgadmin_setup_pgadmin4_web, content_docs_en_debian_tutorials_pgadmin_setup_apache_vhost, content_docs_en_debian_tutorials_pgadmin_setup_basic_auth, content_docs_en_debian_tutorials_pgadmin_setup_fail2ban, content_docs_en_debian_tutorials_certbot_letsencrypt [EXTRACTED 1.00]
- **TeamSpeak music bot stack: TS3 server, TS3 client, Sinusbot, yt-dlp** — content_docs_en_debian_tutorials_teamspeak3_ts3server_startscript, content_docs_en_debian_tutorials_sinusbot_ts3_client, content_docs_en_debian_tutorials_sinusbot_sinusbot_service, content_docs_en_debian_tutorials_sinusbot_yt_dlp [INFERRED 0.85]
- **Rechtliche Rollen und Pflichtangaben im Impressum** — content_pages_de_impressum_ddg_paragraf_5, content_pages_de_impressum_mstv_paragraf_18, content_pages_de_impressum_impressumservice, content_pages_de_impressum_haftungsausschluss, content_pages_de_impressum_streitbeilegung [EXTRACTED 1.00]
- **Security-Overrides für transitive Abhängigkeiten** — pnpm_workspace_vite, pnpm_workspace_postcss, pnpm_workspace_esbuild, pnpm_workspace_js_yaml_3, pnpm_workspace_js_yaml_4, pnpm_workspace_sharp, pnpm_workspace_brace_expansion [EXTRACTED 1.00]
- **Technische Maßnahmen gegen Drittserver-Kommunikation** — content_pages_de_datenschutz_csp, content_pages_de_datenschutz_lokale_webfonts, content_pages_de_datenschutz_flexsearch, content_pages_de_datenschutz_next_locale_cookie [EXTRACTED 1.00]

## Communities (82 total, 28 thin omitted)

### Community 0 - "Next.js Documentation Pages"
Cohesion: 0.06
Nodes (57): nextConfig, securityHeaders, withNextIntl, .next, DocsIndexPage(), Props, DocPage(), generateMetadata() (+49 more)

### Community 1 - "MDX Components"
Cohesion: 0.15
Nodes (15): Callout(), CalloutProps, CalloutType, config, CodeBlock(), CodeBlockProps, TreeNode(), Footer() (+7 more)

### Community 2 - "TypeScript Configuration"
Cohesion: 0.05
Nodes (39): ./config/*, config/**/*.ts, ./content/*, dom, dom.iterable, esnext, .next/dev/types/**/*.ts, next-env.d.ts (+31 more)

### Community 3 - "Search and Home Pages"
Cohesion: 0.19
Nodes (10): Props, Props, generateMetadata(), Props, Props, SearchPageClient(), CTASection(), Props (+2 more)

### Community 4 - "Development Dependencies"
Cohesion: 0.06
Nodes (35): eslint, @eslint/js, devDependencies, eslint, @eslint/js, @playwright/test, postcss, prettier (+27 more)

### Community 5 - "Security and Vulnerabilities"
Cohesion: 0.07
Nodes (32): Nonce-basierte CSP mit strict-dynamic, FlexSearch (clientseitige Suche), Lokal gebündelte Webfonts (Inter, JetBrains Mono), Nonce-based CSP with strict-dynamic, FlexSearch (client-side search), Locally bundled webfonts (Inter, JetBrains Mono), allowBuilds (Postinstall-Trust-Liste), brace-expansion@<1.1.16 → 1.1.16 (Override) (+24 more)

### Community 6 - "Package Metadata"
Cohesion: 0.07
Nodes (29): author, description, engines, node, pnpm, license, name, packageManager (+21 more)

### Community 7 - "Footer Configuration"
Cohesion: 0.14
Nodes (14): footerConfig, FooterProps, FooterColumn, FooterColumnSchema, FooterConfig, FooterConfigSchema, FooterLink, FooterLinkSchema (+6 more)

### Community 8 - "Brand and Profile Info"
Cohesion: 0.12
Nodes (18): Montageservice Kohm (Elektrotechnik, seit August 2025), Moritz Kohm, MSK Scripts (Softwareentwicklung), Musiker15 (Online-Profil), PC-Hardware-Seite, Discord-Server discord.gg/5hHSBRHvJE, docu.msk-scripts.de (MSK-Doku), GitHub-Organisation MSK-Scripts (+10 more)

### Community 9 - "Project News and Updates"
Cohesion: 0.14
Nodes (17): Certbot-Korrektur: python3-certbot-apache, Kopieren-Button für Code-Blöcke, Debian 12 & 13, zweistufiger Upgrade-Ablauf, Tutorials jetzt auch auf Englisch (/en/docs), LAMP-Stack-Überarbeitung (Apache/PHP/MariaDB/phpMyAdmin), Ergänzter Schritt mariadb-upgrade, News DE: Englische Tutorials, überarbeitete Guides & Copy-Buttons, Überarbeitete Tutorials-Startseite (+9 more)

### Community 10 - "Search Index Generation"
Cohesion: 0.17
Nodes (15): CONTENT_ROOT, extractHeadings(), LOCALES, main(), OUT_FILE, PUBLIC_DIR, SECTIONS, stripHtmlTags() (+7 more)

### Community 11 - "Privacy and Legal"
Cohesion: 0.15
Nodes (13): DSGVO (Art. 6, 18, 21, 22, 28), Landesbeauftragter für Datenschutz Baden-Württemberg, netcup GmbH (Hosting-Auftragsverarbeiter), Server-Log-Dateien, Löschung nach 14 Tagen, Verantwortliche Stelle: Moritz Kohm c/o Impressumservice, § 5 DDG (Anbieterkennzeichnung), Impressumservice Dein-Impressum (Ladungsanschrift), § 18 Abs. 2 MStV (inhaltlich Verantwortlicher) (+5 more)

### Community 12 - "Licensing and Security Policy"
Cohesion: 0.20
Nodes (12): Bug Report Issue Template, Feature Request Issue Template, Contribution Rights Assignment (§ 4), German Law and Jurisdiction (§ 7, Salvatorische Klausel), MSK Source Available License (deutsche Fassung), Granted Rights (§ 2), MSK Source Available License (MSK-SAL) v1.0 (EN), Prohibited Actions (§ 3) (+4 more)

### Community 13 - "German Database and Sinusbot"
Cohesion: 0.18
Nodes (11): Dedizierte Postgres-Rolle DbAdmin (SUPERUSER, case-sensitive), pg_hba.conf (host 127.0.0.1/32 scram-sha-256), Postgres loopback-only auf 127.0.0.1:5432 (Port 5432 nie in UFW oeffnen), Download-Mirror auf cloud.musiker15.de, Sinusbot v1.0.2 unter /opt/sinusbot (Benutzer sinusbot, screen), Tutorial: Sinusbot (Musik-Bot fuer TeamSpeak), TeamSpeak 3 Client 3.5.3 und libsoundbot_plugin.so, Sinusbot-Webinterface auf Port 8087 (+3 more)

### Community 14 - "English Server Tutorials"
Cohesion: 0.18
Nodes (11): certbot package, certbot.timer automatic renewal, Let's Encrypt certificate authority, Sinusbot 1.0.2 in /opt/sinusbot under user sinusbot, TeamSpeak 3 Client 3.5.3 + libsoundbot_plugin.so, Sinusbot web interface on port 8087, yt-dlp replaces deprecated youtube-dl, Accounting service error from /dev/shm leftover after root start (+3 more)

### Community 15 - "Server Hardening and CSP"
Cohesion: 0.22
Nodes (10): musiker15.service systemd Restart, No External Image URLs (CSP img-src self), Dynamic Rendering Trade-off (no SSG), Local Fonts via @fontsource-variable (no Google Fonts), Nonce-based CSP with strict-dynamic, Security Header Single Source of Truth (next.config.ts), Server Provisioning (Debian, Apache2 reverse proxy :3101, systemd), Own Wildcard Certificate for *.musiker15.de (+2 more)

### Community 16 - "German Apache and pgAdmin"
Cohesion: 0.20
Nodes (10): Apache 2 (Webserver-Paket), certbot (Paket certbot), Let's Encrypt (Zertifikate mit 90 Tagen Laufzeit), python3-certbot-apache (Apache-Plugin, seit Debian 11), Alternative: pgAdmin als gunicorn-Dienst auf 127.0.0.1:5050 hinter Apache-ProxyPass, Apache-vhost pgadmin.your-domain.com.conf (HTTP zu HTTPS Redirect, mod_wsgi, Basic Auth), Vorgelagerte Basic-Auth via htpasswd (Defense-in-Depth), fail2ban-Jail apache-auth fuer pgadmin_error.log (+2 more)

### Community 17 - "Content Authoring Guide"
Cohesion: 0.25
Nodes (9): Content Authoring Guide, File-based Content Routing (pages/docs/news per locale), Section Index Pages (index.md), No Markdown Autolinks in MDX 3, navigation.config.ts / footer.config.ts Editing Workflow, Migration from Docusaurus to Next.js 16, Musiker15 Website (Project README), Tech Stack (Next.js 16, Tailwind v4, MDX, next-intl) (+1 more)

### Community 18 - "German Debian Upgrade Guide"
Cohesion: 0.22
Nodes (9): PHP 8.3 (php8.3 plus Module), PHP-Version verwalten (update-alternatives, a2dismod php7.4 / a2enmod php8.3), Ondrej Sury PHP-Repository (packages.sury.org, /etc/apt/sources.list.d/php.list), hostnamectl (Versionspruefung), php.list in /etc/apt/sources.list.d/ beim Upgrade mit umstellen, /etc/apt/sources.list (Repository-Umstellung buster nach bullseye), Zweistufiges Major-Upgrade (apt upgrade --without-new-pkgs, dann full-upgrade), Tutorial: Update von Debian 10 auf Debian 11 (+1 more)

### Community 19 - "Database Security Best Practices"
Cohesion: 0.25
Nodes (9): blowfish_secret in config.inc.php, Dedicated DB user instead of root login, Manual phpMyAdmin install preferred over apt package, phpMyAdmin, lc-messages-dir fix in 50-server.cnf, Alternatives: gunicorn on 127.0.0.1:5050 behind ProxyPass, or Adminer, Dedicated Postgres SUPERUSER role "DbAdmin", pgadmin4-web package (mod_wsgi variant) (+1 more)

### Community 20 - "Navigation and Header"
Cohesion: 0.17
Nodes (14): navigationConfig, Header(), HeaderProps, ICONS, MobileItem(), MobileMenu(), Props, isActive() (+6 more)

### Community 21 - "Dependency Management Groups"
Cohesion: 0.25
Nodes (8): lint-tools Group, mdx-toolchain Group, next-react Group, npm/pnpm Update Ecosystem (weekly), radix-ui Group, security-patches Group, Grouped Dependency PRs, Callout MDX Component (info, tip, warning, danger, note)

### Community 22 - "English LAMP Stack Guide"
Cohesion: 0.29
Nodes (8): Apache 2, PHP 8, MariaDB and phpMyAdmin (EN tutorial), mariadb-server / mariadb-client, PHP 8.3 packages, update-alternatives and a2dismod php7.4 to php8.3 migration, Ondrej Sury PHP APT repository (packages.sury.org), php.list in sources.list.d must be updated too, /etc/apt/sources.list release rename (buster to bullseye), mariadb_repo_setup script

### Community 23 - "Apache and pgAdmin Config"
Cohesion: 0.25
Nodes (8): apache2 package, phpmyadmin.conf via conf-available + a2enconf, python3-certbot-apache plugin, pgadmin.your-domain.com Apache vhost (80 redirect + 443 WSGI), Upstream HTTP basic auth via .pgadmin_htpasswd (defense in depth), fail2ban apache-auth jail for pgAdmin, Referrer-Policy must not be no-referrer (pgAdmin CSRF check), setup-web.sh login and WSGI configuration

### Community 24 - "Deployment Strategy"
Cohesion: 0.29
Nodes (7): Atomic Symlink Swap Release Strategy, Deploy Job (SCP + SSH atomic swap), Deploy SSH Secrets (DEPLOY_HOST/USER/KEY/PORT), Post-Deploy Health Check and Production Smoke Test, Keep Last 5 Releases Retention, Anchored rsync Excludes (leading slash), Codeberg Config Stored as Secrets, Not Variables

### Community 25 - "CI/CD Build Workflow"
Cohesion: 0.33
Nodes (7): Deploy Build Job (release tarball packaging), Deploy to Production Workflow, Deploy paths-ignore Filter, Release Tarball Contents, assets/ Repo Backup Assets (not deployed), og-default.svg Static OG Backup Image, Security Scope and Out-of-Scope Definition

### Community 26 - "OpenGraph Image Branding"
Cohesion: 0.38
Nodes (7): Dark Blue Gradient OG Visual Theme (#0a1638 to #1a3a8a with #3b82f6 logo glow), Musiker15 Brand Identity (Tutorials & Guides, Linux / Debian / Self-Hosting, www.musiker15.de), Dynamic OG Image Route (src/app/opengraph-image.tsx, served at /opengraph-image), Embedded Musiker15 M-Logo (base64 PNG in SVG), Self-contained asset rule (no external resources) - rationale: the M-Logo is inlined as base64 PNG so the image renders standalone without any external host request, matching the site-wide privacy goal of zero third-party traffic, OpenGraph Default Backup Image (1200x630 SVG), SVG is unreliable for OG embeds (Discord, Facebook, WhatsApp, Twitter) - rationale: social scrapers do not render SVG reliably, so the live OG image is generated as a PNG and neither layout nor site.config.ts links to this SVG; it stays a manual backup only

### Community 27 - "Core UI Dependencies"
Cohesion: 0.29
Nodes (7): clsx, @fontsource-variable/inter, dependencies, clsx, @fontsource-variable/inter, @radix-ui/react-tooltip, @radix-ui/react-tooltip

### Community 28 - "German Server Runbooks"
Cohesion: 0.38
Nodes (7): Tutorial: Apache2, PHP 8, MariaDB und phpMyAdmin (LAMP-Stack), Tutorial: Certbot, Let's Encrypt (kostenlose SSL-Zertifikate), Debian-Tutorials (Sektionsuebersicht), Warnung: Befehle als root koennen das System nachhaltig veraendern, pgadmin4-web (Web-Variante mit mod_wsgi, offizielles APT-Repo), Runbook: pgAdmin 4 hinter Apache mit HTTPS, setup-web.sh (pgAdmin-Login anlegen, Apache konfigurieren)

### Community 29 - "English Server Runbooks"
Cohesion: 0.38
Nodes (7): Certbot: Let's Encrypt free SSL certificates (EN tutorial), Debian Tutorials overview (EN), Root/sudo commands can permanently change the system, back up first, pgAdmin 4 Setup Runbook (EN tutorial), Sinusbot (EN tutorial), Sinusbot unmaintained, guide kept for existing systems and archive, TeamSpeak 3 Server (EN tutorial)

### Community 30 - "English Debian Maintenance"
Cohesion: 0.29
Nodes (7): Upgrade from Debian 10 to Debian 11 (EN tutorial), One major version jump at a time (10 to 11 to 12 to 13), Two-step upgrade: apt upgrade --without-new-pkgs then full-upgrade, MariaDB upgrade on Debian / Ubuntu (EN tutorial), Backup of /etc/mysql and /var/lib/mysql before upgrade, Quote 'mariadb-*' so the shell does not glob-expand it, mariadb-upgrade system table migration

### Community 31 - "Repository Mirroring"
Cohesion: 0.33
Nodes (6): Dependabot Configuration, github-actions Update Ecosystem (monthly), Skip Mirror on Dependabot Pushes, Mirror to Codeberg Workflow, Exact Mirror with --prune, git remote set-head --delete before Mirror Push

### Community 32 - "Code Quality Workflows"
Cohesion: 0.33
Nodes (6): CI Workflow, CI Concurrency Deduplication, Least-Privilege GITHUB_TOKEN Permissions, CodeQL Analyze Job (actions + javascript-typescript matrix), CodeQL build-mode none, CodeQL Advanced Workflow

### Community 33 - "Content Validation"
Cohesion: 0.33
Nodes (6): Vitest --passWithNoTests, validate:content Step (Frontmatter Validation), Validate Job (lint, type-check, build, vitest), draft Flag (dev-only visibility), Frontmatter Field Schema, Pre-Commit Content Checks

### Community 34 - "German phpMyAdmin Setup"
Cohesion: 0.40
Nodes (6): config.inc.php mit blowfish_secret (Cookie-Verschluesselung), Automatische phpMyAdmin-Installation (apt install phpmyadmin), Apache-Konfiguration /etc/apache2/conf-available/phpmyadmin.conf (a2enconf phpmyadmin), Manuelle phpMyAdmin-Installation (/usr/share/phpmyadmin aus ZIP), /etc/mysql/mariadb.conf.d/50-server.cnf (lc-messages-dir Fix fuer error 1231), Alternative: Adminer (schlanker phpMyAdmin-Klon, eine PHP-Datei)

### Community 35 - "German MariaDB Management"
Cohesion: 0.40
Nodes (6): MariaDB-Nutzer anlegen und Rechte vergeben (CREATE USER / GRANT ALL PRIVILEGES), mariadb_repo_setup (r.mariadb.com Repo-Skript), MariaDB Server (mariadb-server, mariadb-client, mysql_secure_installation), mariadb-upgrade (Anpassung der System-Tabellen, frueher mysql_upgrade), Tutorial: MariaDB-Upgrade auf Debian / Ubuntu (10 nach 11), apt remove 'mariadb-*' in Anfuehrungszeichen (Shell-Globbing vermeiden)

### Community 36 - "German TeamSpeak Setup"
Cohesion: 0.40
Nodes (5): certbot.timer (automatische Zertifikatserneuerung via systemd), Query-Port aendern (query_port in ts3server.ini), systemd-Unit ts3server.service fuer dauerhaften Betrieb, Tutorial: TeamSpeak 3 Server auf Debian, ts3server_startscript.sh (start/stop/restart, Benutzer ts3)

### Community 37 - "German Hardware and Profiles"
Cohesion: 0.40
Nodes (5): Social Media und Gaming Accounts (Steam, Uplay, EA, Epic, BattleNET, Social Club), Tutorial-Bereich: Willkommen (Startseite), PC-Hardware (Workstation, Stand Juni 2026), Monitore und Peripherie (3 Monitore, DT 770 Pro, Rode NT-USB, UR22 MKII), Workstation-Komponenten (Ryzen 7 9800X3D, X870E AORUS Master, RTX 4080 Super, 64 GB DDR5)

### Community 38 - "English Hardware and Landing"
Cohesion: 0.50
Nodes (4): Welcome / Tutorials landing page (EN), PC Hardware (EN), Monitors, audio and input peripherals, Workstation build (Ryzen 7 9800X3D, RTX 4080 Super, X870E AORUS Master)

### Community 39 - "Cookie Compliance"
Cohesion: 0.50
Nodes (4): Cookie NEXT_LOCALE (HttpOnly, Secure, SameSite=Lax), § 25 TDDDG (Cookies und lokale Speicher), Cookie NEXT_LOCALE (HttpOnly, Secure, SameSite=Lax), § 25 TDDDG (cookies and local storage)

### Community 40 - "German ACME Tutorial"
Cohesion: 0.11
Nodes (17): Deinstallation, Häufige Fehler, Mehrere Domains auf einem Server, Prüfen, Schritt 1: DNS-API-Key bei IONOS erzeugen, Schritt 2: acme.sh installieren, Schritt 3: ACME-Account registrieren, Schritt 4: Zertifikat ausstellen (+9 more)

### Community 41 - "Brand Assets"
Cohesion: 0.67
Nodes (4): Royal Blue Gradient Palette, Musiker15 Brand Identity Mark, Musiker15 M Logo (public/logo.png), Transparent Square Site Asset

### Community 42 - "OpenGraph Metadata"
Cohesion: 0.40
Nodes (3): alt, contentType, size

### Community 46 - "English ACME Tutorial"
Cohesion: 0.11
Nodes (17): Common errors, Requirements, Several domains on one server, Step 1: create a DNS API key at IONOS, Step 2: install acme.sh, Step 3: register the ACME account, Step 4: issue the certificate, Step 5: check the target directory before installing (+9 more)

### Community 59 - "Common UI Components"
Cohesion: 0.18
Nodes (8): LocaleSwitcher(), NAMES, Button, ButtonProps, ButtonSize, ButtonVariant, sizeClasses, variantClasses

### Community 71 - "Site Metadata and Sitemap"
Cohesion: 0.11
Nodes (21): siteConfig, generateMetadata(), GET(), xmlEscape(), generateMetadata(), metadata, languagesFor(), lastModifiedOf() (+13 more)

### Community 75 - "News and Card Components"
Cohesion: 0.33
Nodes (10): NewsIndexPage(), LatestNews(), Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle (+2 more)

### Community 76 - "Hero and Icon Components"
Cohesion: 0.22
Nodes (8): Hero(), HeroProps, Badge, BadgeProps, Variant, variants, GitHubIcon(), IconProps

### Community 77 - "Search Dialog Components"
Cohesion: 0.38
Nodes (5): Props, ResultGroup, SearchDialog(), SearchTrigger(), SearchIndexEntry

### Community 78 - "German SSL Tutorial"
Cohesion: 0.50
Nodes (3): Die Fallen sind der eigentliche Inhalt, Warum sich der Umbau lohnt, Worum es geht

### Community 79 - "English SSL Tutorial"
Cohesion: 0.50
Nodes (3): The pitfalls are the actual content, What it covers, Why the effort pays off

## Ambiguous Edges - Review These
- `Nonce-basierte CSP mit strict-dynamic` → `js-yaml@<3.15.0 → 3.15.0 (Override)`  [AMBIGUOUS]
  pnpm-workspace.yaml · relation: conceptually_related_to
- `public/ Asset-Konventionen` → `Sitemap/Host zeigt auf komascript.musiker15.de`  [AMBIGUOUS]
  public/robots.txt · relation: conceptually_related_to

## Knowledge Gaps
- **257 isolated node(s):** `withNextIntl`, `securityHeaders`, `nextConfig`, `name`, `version` (+252 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **28 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Nonce-basierte CSP mit strict-dynamic` and `js-yaml@<3.15.0 → 3.15.0 (Override)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `public/ Asset-Konventionen` and `Sitemap/Host zeigt auf komascript.musiker15.de`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `.next` connect `Next.js Documentation Pages` to `TypeScript Configuration`, `Site Metadata and Sitemap`?**
  _High betweenness centrality (0.040) - this node is a cross-community bridge._
- **Why does `exclude` connect `TypeScript Configuration` to `Next.js Documentation Pages`?**
  _High betweenness centrality (0.035) - this node is a cross-community bridge._
- **Why does `Locale` connect `Search and Home Pages` to `Next.js Documentation Pages`, `MDX Components`, `Site Metadata and Sitemap`, `Footer Configuration`, `Search Index Generation`, `News and Card Components`, `Hero and Icon Components`, `Search Dialog Components`, `Navigation and Header`, `Common UI Components`?**
  _High betweenness centrality (0.027) - this node is a cross-community bridge._
- **What connects `withNextIntl`, `securityHeaders`, `nextConfig` to the rest of the system?**
  _257 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Next.js Documentation Pages` be split into smaller, more focused modules?**
  _Cohesion score 0.06493506493506493 - nodes in this community are weakly interconnected._
# Graph Report - musiker15-website  (2026-08-25)

## Corpus Check
- 125 files · ~66,053 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1037 nodes · 1518 edges · 102 communities (82 shown, 20 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 106 edges (avg confidence: 0.88)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `b2f0b512`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Locale
- Frontend Dependencies
- layout.tsx
- TypeScript and Build Paths
- Development Tooling
- phpMyAdmin
- build-search-index.ts
- Project Package Metadata
- SSL and Personal Bio
- cn
- Header.tsx
- config.ts
- Proton Drive Sync Rules
- German SSL Tutorial Steps
- English SSL Tutorial Steps
- de/fivem/txadmin-reverse-proxy.md
- OpenGraph Image Design
- Dependency Overrides and Public Assets
- en/fivem/txadmin-reverse-proxy.md
- CI/CD and Dependabot Config
- Deployment and Release Workflow
- Hardware and Content Updates
- Content Validation and Authoring
- Debian and MariaDB Upgrades
- site.config.ts
- Automated Deployment Scripts
- Software Licensing Terms
- Brand Identity and Logo
- Security and Testing Policies
- TeamSpeak 3 Server manual setup guide
- Server Hardening and Proxy
- Debian-Tutorials Übersichtsseite
- German Hardware and Bio
- Tutorial Index and Updates
- Sinusbot install and update guide
- ACME Certificate Renewal Logic
- MariaDB Repository Migration
- Legal Notice and Imprint
- Robots.txt and SEO Rules
- de/fivem/installation.md
- Data Backup and Sync
- German Bot Service Management
- German Proton Drive Guide
- GitHub Issue Templates
- PHP Version Migration
- Wildcard SSL with acme.sh and IONOS DNS
- IONOS SSL API Integration
- External Links and CSP
- Privacy Policy and Hosting
- Middleware and CSP Headers
- SSL Timer and Automation
- OpenGraph Metadata
- ZeroSSL CA Configuration
- SSL Certificate Validation
- English Bot Service Management
- Build Instructions and Licensing
- German Proton Drive Fork
- German SSL Tutorial Intro
- English Proton Drive Fork
- English SSL Tutorial Intro
- pgAdmin Web Setup
- en/fivem/installation.md
- ACME Client Installation
- ZeroSSL API Details
- MariaDB and phpMyAdmin Fixes
- Search Index Build Process
- PostCSS Configuration
- CodeQL Workflow Debugging
- Apache SNI and Wildcards
- phpMyAdmin Apache Config
- Certbot Apache Plugin
- pgAdmin Access Security
- Sinusbot Video Downloader
- TeamSpeak Client Compatibility
- Dotnet Build Scripts
- Data Protection Authorities
- Locale Cookie Compliance
- Legal Responsibility Information
- Version Upgrade Strategy
- System Safety Warnings
- Shell Command Escaping
- Legacy Software Maintenance
- Social Media Profiles
- Workstation Peripherals
- de/fivem/auto-update.md
- en/fivem/auto-update.md
- sitemap.ts
- Manuelle phpMyAdmin-Installation
- Footer.tsx
- Dedicated Postgres SUPERUSER role "DbAdmin"
- de/fivem-tutorials-2026-08.md
- en/fivem-tutorials-2026-08.md
- de/fivem/index.md
- en/fivem/index.md
- next.config.ts
- certbot.timer (systemd-Renewal)
- Paket python3-certbot-apache

## God Nodes (most connected - your core abstractions)
1. `Locale` - 49 edges
2. `cn()` - 40 edges
3. `t()` - 23 edges
4. `compilerOptions` - 21 edges
5. `scripts` - 16 edges
6. `getContent()` - 15 edges
7. `siteConfig` - 12 edges
8. `renderMDX()` - 12 edges
9. `Debian Tutorials section index` - 12 edges
10. `Button` - 11 edges

## Surprising Connections (you probably didn't know these)
- `Pre-Commit Check Commands` --semantically_similar_to--> `Validate Job`  [INFERRED] [semantically similar]
  AUTHORING.md → .github/workflows/ci.yml
- `One SSL Subdirectory per Domain` --semantically_similar_to--> `Per-Run Tarball Target Directory`  [INFERRED] [semantically similar]
  content/docs/de/debian-tutorials/acme-sh-wildcard-ionos.md → .github/workflows/deploy.yml
- `§ 2 Gewährte Rechte` --semantically_similar_to--> `§ 2 Granted Rights`  [INFERRED] [semantically similar]
  LICENSE_DE.md → LICENSE.md
- `§ 3 Verbotene Handlungen` --semantically_similar_to--> `§ 3 Prohibited Actions`  [INFERRED] [semantically similar]
  LICENSE_DE.md → LICENSE.md
- `MSK Source Available License (deutsche Fassung)` --semantically_similar_to--> `MSK Source Available License (MSK-SAL) v1.0`  [INFERRED] [semantically similar]
  LICENSE_DE.md → LICENSE.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Technische Maßnahmen gegen Drittserver-Kommunikation** — content_pages_de_datenschutz_lokale_webfonts, content_pages_de_datenschutz_next_locale_cookie [EXTRACTED 1.00]
- **Rechtliche Rollen und Pflichtangaben im Impressum** — content_pages_de_impressum_haftungsausschluss, content_pages_de_impressum_streitbeilegung [EXTRACTED 1.00]
- **GHSA-5p4m-2wfm-xmqj deckt beide js-yaml-Zweige unter einer Override-Strategie ab** — pnpm_workspace_js_yaml_3, pnpm_workspace_js_yaml_4, pnpm_workspace_overrides [EXTRACTED 1.00]
- **Kein Kontakt zu Dritt-Servern beim Seitenbesuch** — content_pages_de_datenschutz_suchfunktion, content_pages_de_datenschutz_lokale_webfonts, content_pages_de_datenschutz_strikte_csp, content_pages_de_datenschutz_keine_eigene_datenerhebung [EXTRACTED 1.00]
- **LAMP-Stack-Installationsablauf** — content_docs_de_debian_tutorials_apache2_php_mariadb_phpmyadmin_sury_php_repo, content_docs_de_debian_tutorials_apache2_php_mariadb_phpmyadmin_php_8_3, content_docs_de_debian_tutorials_apache2_php_mariadb_phpmyadmin_mariadb_repo_setup, content_docs_de_debian_tutorials_apache2_php_mariadb_phpmyadmin_mysql_secure_installation, content_docs_de_debian_tutorials_apache2_php_mariadb_phpmyadmin_phpmyadmin_manual_install [EXTRACTED 1.00]
- **LAMP stack setup flow (Apache, PHP 8.3, MariaDB, phpMyAdmin)** — content_docs_en_debian_tutorials_apache2_php_mariadb_phpmyadmin_apache2, content_docs_en_debian_tutorials_apache2_php_mariadb_phpmyadmin_php83, content_docs_en_debian_tutorials_apache2_php_mariadb_phpmyadmin_mariadb_server, content_docs_en_debian_tutorials_apache2_php_mariadb_phpmyadmin_phpmyadmin, content_docs_en_debian_tutorials_apache2_php_mariadb_phpmyadmin_sury_repo [EXTRACTED 1.00]
- **No third-party communication guarantee (no tracking, local fonts, client-side search, strict CSP)** — content_pages_de_datenschutz_keine_eigene_datenerhebung, content_pages_de_datenschutz_lokale_webfonts, content_pages_de_datenschutz_strikte_csp, content_pages_de_datenschutz_next_locale_cookie [EXTRACTED 1.00]
- **Mehrschichtige Absicherung des pgAdmin-Zugangs** — content_docs_de_debian_tutorials_pgadmin_setup_basic_auth_defense_in_depth, content_docs_de_debian_tutorials_pgadmin_setup_fail2ban_jail, content_docs_de_debian_tutorials_pgadmin_setup_loopback_only_postgres, content_docs_de_debian_tutorials_pgadmin_setup_dbadmin_rolle [EXTRACTED 1.00]
- **Absicherung der pgAdmin-Weboberflaeche (HTTPS, Basic-Auth, Header, fail2ban, loopback-only DB)** — content_docs_de_debian_tutorials_pgadmin_setup_basic_auth_defense_in_depth, content_docs_de_debian_tutorials_pgadmin_setup_fail2ban_jail [EXTRACTED 1.00]
- **pnpm supply-chain hardening (build trust list plus pinned advisory overrides)** — pnpm_workspace_allowbuilds [EXTRACTED 1.00]
- **Ignore rule resolution: sources, precedence, non-retroactivity** — content_docs_en_proton_drive_ignore_rules_protonignore, content_docs_en_proton_drive_ignore_rules_per_directory_gitignore, content_docs_en_proton_drive_ignore_rules_precedence, content_docs_en_proton_drive_ignore_rules_non_retroactive [EXTRACTED 1.00]
- **Sinusbot runtime chain: TeamSpeak client, plugin, yt-dlp, screen session** — content_docs_en_debian_tutorials_sinusbot_teamspeak_client_353, content_docs_en_debian_tutorials_sinusbot_libsoundbot_plugin, content_docs_en_debian_tutorials_sinusbot_yt_dlp, content_docs_en_debian_tutorials_sinusbot_screen_session [EXTRACTED 1.00]
- **Wildcard Certificate Lifecycle with acme.sh** — content_docs_de_debian_tutorials_acme_sh_wildcard_ionos_dns01_challenge, content_docs_de_debian_tutorials_acme_sh_wildcard_ionos_dns_ionos_plugin, content_docs_de_debian_tutorials_acme_sh_wildcard_ionos_zerossl, content_docs_de_debian_tutorials_acme_sh_wildcard_ionos_ssl_deploy_script, content_docs_de_debian_tutorials_acme_sh_wildcard_ionos_acme_renew_timer [EXTRACTED 1.00]
- **Automatische Wildcard-Zertifikatserneuerung (acme.sh, Deploy-Hook, Timer)** — content_docs_en_debian_tutorials_acme_sh_wildcard_ionos_acme_sh, content_docs_en_debian_tutorials_acme_sh_wildcard_ionos_dns_ionos_plugin, content_docs_en_debian_tutorials_acme_sh_wildcard_ionos_zerossl, content_docs_en_debian_tutorials_acme_sh_wildcard_ionos_ssl_deploy_script, content_docs_en_debian_tutorials_acme_sh_wildcard_ionos_install_cert_reloadcmd, content_docs_en_debian_tutorials_acme_sh_wildcard_ionos_acme_renew_timer [EXTRACTED 1.00]
- **Zero-Downtime Release Flow** — _github_workflows_deploy_release_tarball, _github_workflows_deploy_per_run_tarball_target, _github_workflows_deploy_atomic_symlink_swap, _github_workflows_deploy_rsync_anchored_excludes, _github_workflows_deploy_musiker15_service, _github_workflows_deploy_health_check, _github_workflows_deploy_release_retention [EXTRACTED 1.00]
- **CI and Deploy Quality Gates** — _github_workflows_ci_validate_content_step, _github_workflows_ci_vitest_step, _github_workflows_ci_playwright_step, _github_workflows_deploy_build_job, authoring_pre_commit_checks [INFERRED 0.85]
- **Bilingual legal page set (imprint and privacy, DE and EN)** — content_pages_de_impressum_page, content_pages_en_imprint_page [INFERRED 0.85]
- **Layered access control for the pgAdmin deployment** — content_docs_en_debian_tutorials_pgadmin_setup_basic_auth_defense_in_depth, content_docs_en_debian_tutorials_pgadmin_setup_fail2ban, content_docs_en_debian_tutorials_pgadmin_setup_loopback_only_postgres, content_docs_en_debian_tutorials_pgadmin_setup_dbadmin_role [INFERRED 0.85]
- **postcss-Strang: postcss zieht nanoid, esbuild und vite haengen an derselben Toolchain** — pnpm_workspace_postcss, pnpm_workspace_nanoid, pnpm_workspace_vite, pnpm_workspace_esbuild [INFERRED 0.85]
- **TeamSpeak music bot stack: TS3 server, TS3 client, Sinusbot, yt-dlp** — content_docs_en_debian_tutorials_teamspeak3_ts3server_startscript, content_docs_en_debian_tutorials_sinusbot_ts3_client, content_docs_en_debian_tutorials_sinusbot_sinusbot_service, content_docs_en_debian_tutorials_sinusbot_yt_dlp [INFERRED 0.85]
- **TeamSpeak-Voice-Stack (TS3-Server, TS3-Client, Sinusbot-Musik-Bot)** — content_docs_de_debian_tutorials_teamspeak3_ts3server_startscript, content_docs_de_debian_tutorials_sinusbot_webinterface_port_8087 [INFERRED 0.85]

## Communities (102 total, 20 thin omitted)

### Community 0 - "Locale"
Cohesion: 0.05
Nodes (84): .next, DocsIndexPage(), generateMetadata(), Props, DocPage(), generateMetadata(), generateStaticParams(), Props (+76 more)

### Community 1 - "Frontend Dependencies"
Cohesion: 0.04
Nodes (47): clsx, @fontsource-variable/inter, @fontsource-variable/jetbrains-mono, geist, get-nonce, gray-matter, lucide-react, next (+39 more)

### Community 2 - "layout.tsx"
Cohesion: 0.22
Nodes (5): LocaleLayout(), viewport, NonceSetup(), ThemeProvider(), OG_IMAGE_SIZE

### Community 3 - "TypeScript and Build Paths"
Cohesion: 0.05
Nodes (39): ./config/*, config/**/*.ts, ./content/*, dom, dom.iterable, esnext, .next/dev/types/**/*.ts, next-env.d.ts (+31 more)

### Community 4 - "Development Tooling"
Cohesion: 0.06
Nodes (35): eslint, @eslint/js, devDependencies, eslint, @eslint/js, @playwright/test, postcss, prettier (+27 more)

### Community 5 - "phpMyAdmin"
Cohesion: 0.16
Nodes (15): apache2 package, phpmyadmin.conf via conf-available + a2enconf, Manual phpMyAdmin install preferred over apt package, phpMyAdmin, lc-messages-dir fix in 50-server.cnf, Alternatives: gunicorn on 127.0.0.1:5050 behind ProxyPass, or Adminer, pgadmin.your-domain.com Apache vhost (80 redirect + 443 WSGI), Upstream HTTP basic auth via .pgadmin_htpasswd (defense in depth) (+7 more)

### Community 6 - "build-search-index.ts"
Cohesion: 0.15
Nodes (15): CONTENT_ROOT, extractHeadings(), LOCALES, main(), OUT_FILE, PUBLIC_DIR, SECTIONS, stripHtmlTags() (+7 more)

### Community 7 - "Project Package Metadata"
Cohesion: 0.06
Nodes (30): author, description, engines, node, pnpm, license, name, packageManager (+22 more)

### Community 8 - "SSL and Personal Bio"
Cohesion: 0.09
Nodes (29): Installing acme.sh from the tarball instead of the install script, News: New tutorial wildcard SSL with acme.sh and IONOS DNS (EN), apachectl -t does not verify that key and certificate belong together, CA/Browser Forum ballot SC-081v3 (certificate lifetime reduction), DNS-01 validation through the IONOS API, grep -r does not follow symlinks, missing sites-enabled vhosts, Automatic renewal via a systemd timer instead of acme.sh's own cron job, ZeroSSL preferred over the IONOS ACME server (+21 more)

### Community 9 - "cn"
Cohesion: 0.06
Nodes (32): Callout(), CalloutProps, CalloutType, config, CodeBlock(), CodeBlockProps, Disclosure(), mdxComponents (+24 more)

### Community 10 - "Header.tsx"
Cohesion: 0.18
Nodes (12): config, navigationConfig, Header(), HeaderProps, ICONS, isActive(), Navbar(), NavbarItem() (+4 more)

### Community 11 - "config.ts"
Cohesion: 0.13
Nodes (15): config, footerConfig, FooterColumn, FooterColumnSchema, FooterConfig, FooterConfigSchema, FooterLink, FooterLinkSchema (+7 more)

### Community 12 - "Proton Drive Sync Rules"
Cohesion: 0.11
Nodes (19): Backup of /etc/mysql and /var/lib/mysql before upgrade, Building it, Proton Drive: keeping files out of sync, Rules apply only to items not yet indexed, gitignore pattern syntax table (anchors, directory-only, negation, globs), Per-directory .gitignore evaluation, Precedence, .protonignore file (+11 more)

### Community 13 - "German SSL Tutorial Steps"
Cohesion: 0.11
Nodes (17): Deinstallation, Häufige Fehler, Mehrere Domains auf einem Server, Prüfen, Schritt 1: DNS-API-Key bei IONOS erzeugen, Schritt 2: acme.sh installieren, Schritt 3: ACME-Account registrieren, Schritt 4: Zertifikat ausstellen (+9 more)

### Community 14 - "English SSL Tutorial Steps"
Cohesion: 0.11
Nodes (17): Common errors, Requirements, Several domains on one server, Step 1: create a DNS API key at IONOS, Step 2: install acme.sh, Step 3: register the ACME account, Step 4: issue the certificate, Step 5: check the target directory before installing (+9 more)

### Community 15 - "de/fivem/txadmin-reverse-proxy.md"
Cohesion: 0.13
Nodes (14): Den WebSocket-Upgrade misst man im Browser, nicht mit curl, Die CSP muss zur eigenen Domain passen, Häufige Fehler, Prüfen, Schritt 2.1: Apache-Module aktivieren, Schritt 2.2: vHost anlegen, Schritt 2.3: Zwei Fallen in typischen Konfigurationen, Schritt 2.4: txAdmin die eigene Adresse mitteilen (+6 more)

### Community 16 - "OpenGraph Image Design"
Cohesion: 0.19
Nodes (17): OpenGraph Default Image (og-default.svg), Role: Static Backup, Not Deployed, Vertical Blue Gradient Background (#0a1638 to #1a3a8a), Musiker15 M-Logo (embedded base64 PNG), Canvas 1200x630 (OG Card Format), Domain Label "www.musiker15.de", Live OG Image Route (src/app/opengraph-image.tsx, 1200x630 PNG), Subtle Glow Circle Behind Logo (#3b82f6, opacity 0.18) (+9 more)

### Community 17 - "Dependency Overrides and Public Assets"
Cohesion: 0.15
Nodes (17): allowBuilds (Postinstall-Script-Trust), Override brace-expansion@<1.1.16: '1.1.16', Override esbuild: '>=0.28.1', Override js-yaml@<3.15.1: '3.15.1', Override js-yaml@>=4.0.0 <4.3.1: '4.3.1', Override nanoid@<3.3.18: '3.3.18', Transitive Dependency-Overrides, Override postcss: '>=8.5.23' (+9 more)

### Community 18 - "en/fivem/txadmin-reverse-proxy.md"
Cohesion: 0.13
Nodes (14): Common problems, Do not set `X-Forwarded-For` by hand, If Apache is older than 2.4.47, Measure the WebSocket upgrade in a browser, not with curl, On to step 3, Requirements, Step 2.1: enable the Apache modules, Step 2.2: create the vHost (+6 more)

### Community 19 - "CI/CD and Dependabot Config"
Cohesion: 0.15
Nodes (14): Dependabot Configuration, GitHub-Actions Monthly Update Job, mdx-toolchain Group, next-react Group, npm/pnpm Weekly Update Job, security-patches Group, Dependabot Update Grouping, CI Workflow (+6 more)

### Community 20 - "Deployment and Release Workflow"
Cohesion: 0.16
Nodes (14): Deploy Build Job, Deploy to Production Workflow, Deploy paths-ignore Filter, Release Tarball Packaging, assets/ Repo-Backup Directory, og-default.svg Backup OG Image, Build-Time Full-Text Search Index, Migration from Docusaurus (+6 more)

### Community 21 - "Hardware and Content Updates"
Cohesion: 0.14
Nodes (14): metaTitle overriding the visible H1 Welcome, Social Media & Gaming account table, Tutorials section welcome page (EN), Audio chain: Rode NT-USB, Steinberg UR22 MKII, DT 770 Pro, Core components: Ryzen 7 9800X3D, X870E AORUS Master, RTX 4080 Super, Triple monitor setup (Xiaomi Mi Curved, MSI Optix G27C4, BenQ GL2450), Storage array (Samsung NVMe and SATA SSDs, WD Black, SanDisk), Workstation build (Ryzen 7 9800X3D, RTX 4080 Super, X870E AORUS Master) (+6 more)

### Community 22 - "Content Validation and Authoring"
Cohesion: 0.17
Nodes (13): Validate Content Step (Frontmatter), Validate Job, Vitest Test Step, Content Authoring Guide, content/ Directory Layout, draft: true Behavior, Frontmatter Field Set, MDX 3 Autolink Pitfall (+5 more)

### Community 23 - "Debian and MariaDB Upgrades"
Cohesion: 0.17
Nodes (13): mariadb-server / mariadb-client, PHP 8.3 packages, update-alternatives and a2dismod php7.4 to php8.3 migration, Ondrej Sury PHP APT repository (packages.sury.org), hostnamectl version check, Debian 11 is oldstable, one version jump at a time, php.list in sources.list.d must be updated too, /etc/apt/sources.list release rename (buster to bullseye) (+5 more)

### Community 24 - "site.config.ts"
Cohesion: 0.17
Nodes (9): config, siteConfig, GET(), xmlEscape(), metadata, CTASection(), Props, SiteConfig (+1 more)

### Community 25 - "Automated Deployment Scripts"
Cohesion: 0.17
Nodes (12): Atomic Symlink Swap, Deploy Job (SSH), DEPLOY_HOST / DEPLOY_USER / DEPLOY_KEY / DEPLOY_PORT Secrets, Per-Run Tarball Target Directory, Release Retention (last 5), Anchored rsync Excludes, CODEBERG_TOKEN / CODEBERG_USER / CODEBERG_REPO Secrets, Token URL Kept Out of the Command Line (+4 more)

### Community 26 - "Software Licensing Terms"
Cohesion: 0.20
Nodes (12): § 4 Contribution Rights Assignment, § 1 Definitionen (Urheber, Projekt, Nutzung), § 2 Gewährte Rechte, MSK Source Available License (deutsche Fassung), § 3 Verbotene Handlungen, § 3.6 Design Imitation Ban, § 7 Governing Law and Severability, § 2 Granted Rights (+4 more)

### Community 27 - "Brand Identity and Logo"
Cohesion: 0.26
Nodes (12): Musiker15 Logo (public/logo.png), Angular Chevron Geometry, Blue Gradient (#213FAE to #3A5ECF), Musiker15 Brand Identity, Site Design System Palette, Faceted Bevel Shading, Logo Hue as Origin of the Palette (H = 266.7 deg), Letter M Monogram (+4 more)

### Community 28 - "Security and Testing Policies"
Cohesion: 0.18
Nodes (11): Playwright E2E Step, CodeQL Analyze Matrix Job, build-mode: none, CodeQL Advanced Workflow, No External Image URLs Rule, Dynamic Rendering Trade-off for Nonce-CSP, Local Fonts and No Third-Party Requests, Nonce-based CSP with strict-dynamic (+3 more)

### Community 29 - "TeamSpeak 3 Server manual setup guide"
Cohesion: 0.22
Nodes (10): Accounting service error from /dev/shm leftover after root start, TeamSpeak 3 Server manual setup guide, .ts3server_license_accepted marker file, Changing the server query port via ts3server.ini, ts3server_startscript.sh, systemd unit ts3server.service for permanent operation, ts3server_startscript.sh under user ts3, apachectl -t erkennt keine Schlüssel-Zertifikat-Diskrepanz (+2 more)

### Community 30 - "Server Hardening and Proxy"
Cohesion: 0.22
Nodes (10): musiker15.service (systemd Unit), Callout Component, Certbot Tutorial Cross-Reference, DNS-01 Challenge, dns_ionos Plugin and IONOS DNS API Key, HTTP-01 Challenge, Wildcard-SSL mit acme.sh und IONOS-DNS, Apache2 Reverse Proxy to :3101 (+2 more)

### Community 31 - "Debian-Tutorials Übersichtsseite"
Cohesion: 0.18
Nodes (14): LAMP-Stack Setup (Apache2, PHP 8.3, MariaDB, phpMyAdmin), Certbot mit Let's Encrypt (DE), Debian-Tutorials Übersichtsseite, Warnung zu root/sudo-Befehlen und Backups, Alternative: Adminer (schlanker phpMyAdmin-Klon), pgAdmin 4 Setup-Runbook, Referrer-Policy darf nicht no-referrer sein, Sinusbot (TeamSpeak-Musik-Bot) (+6 more)

### Community 32 - "German Hardware and Bio"
Cohesion: 0.20
Nodes (10): metaTitle für die Tutorials-Startseite, Social Media & Gaming Accounts (Musiker15), Tutorials-Startseite (Willkommen), Audio-Peripherie (DT 770 Pro, Rode NT-USB, Steinberg UR22 MKII), Monitor-Setup (Xiaomi Mi Curved, MSI Optix, BenQ), Gigabyte GeForce RTX 4080 Super Gaming OC 16 GB, AMD Ryzen 7 9800X3D, Speicher-Setup (NVMe und SATA-SSDs) (+2 more)

### Community 33 - "Tutorial Index and Updates"
Cohesion: 0.24
Nodes (10): apt full-upgrade, Two-step upgrade: apt upgrade --without-new-pkgs then full-upgrade, Certbot: Let's Encrypt guide, Debian Tutorials section index, Apache 2, PHP 8, MariaDB & phpMyAdmin (LAMP stack), Read fully and back up before running root commands, pgAdmin 4: Setup Runbook, Überarbeitete Tutorials-Startseite mit Bereichs-Karten (+2 more)

### Community 34 - "Sinusbot install and update guide"
Cohesion: 0.25
Nodes (9): Sinusbot config.ini YoutubeDLPath, Sinusbot install and update guide, libsoundbot_plugin.so TeamSpeak client plugin, Sinusbot 1.0.2 in /opt/sinusbot under user sinusbot, TeamSpeak Client 3.5.3 (last supported version), TeamSpeak 3 Client 3.5.3 + libsoundbot_plugin.so, Sinusbot is unmaintained, guide is archival, Sinusbot web interface on port 8087 (+1 more)

### Community 35 - "ACME Certificate Renewal Logic"
Cohesion: 0.25
Nodes (9): Loopback Health-Check and Production Smoke-Test, acme-renew systemd Timer, acme.sh Client, CA/Browser Forum Ballot SC-081v3 Lifetime Reduction, --keylength 2048 versus ECDSA _ecc Suffix, One Timer, One --cron, One reloadcmd per Domain, RandomizedDelaySec and Persistent=true, ssl-deploy.sh Reload Hook (+1 more)

### Community 36 - "MariaDB Repository Migration"
Cohesion: 0.22
Nodes (9): mariadb_repo_setup (r.mariadb.com), mysql_secure_installation, hostnamectl als Versionsprüfung, Debian Major-Upgrade 10 auf 11 (Buster nach Bullseye), /etc/apt/sources.list Repository-Umstellung, Zweistufiges Upgrade (--without-new-pkgs, dann full-upgrade), apt remove 'mariadb-*' in Anführungszeichen, MariaDB-Upgrade von 10 auf 11 (+1 more)

### Community 37 - "Legal Notice and Imprint"
Cohesion: 0.28
Nodes (9): Angaben gemäß § 5 DDG (Anbieterkennzeichnung), Haftungsausschluss (Inhalte, Links, Urheberrecht), Impressum (DE), Keine Teilnahme an Streitbeilegungsverfahren, Inhaltlich Verantwortlicher nach § 18 Abs. 2 MStV, Widerspruch gegen Werbe-Mails, Legal Notice (EN imprint), Provider information according to § 5 DDG (EN) (+1 more)

### Community 38 - "Robots.txt and SEO Rules"
Cohesion: 0.25
Nodes (9): Apache serves robots.txt directly via Alias plus ProxyPass exclusion, Disallow /*.json$ to keep the ~86 KB search index out of the index, public/robots.txt (single source for /robots.txt), Google-Extended deliberately not blocked (comment only, no directive), Host: https://www.musiker15.de, Sitemap: https://www.musiker15.de/sitemap.xml, User-agent: CCBot, Disallow: /, User-agent: GPTBot, Disallow: / (+1 more)

### Community 39 - "de/fivem/installation.md"
Cohesion: 0.15
Nodes (12): Alles auf einmal, Häufige Fehler, Schritt 1.1: Benutzer und Verzeichnisse, Schritt 1.2: FXServer-Artefakt installieren, Schritt 1.3: Server-Daten holen, Schritt 1.4: Den Panel-Port schließen, Schritt 1.5: systemd-Unit, Schritt 1.6: Prüfen, dass der Port wirklich zu ist (+4 more)

### Community 40 - "Data Backup and Sync"
Cohesion: 0.29
Nodes (7): Backup von /etc/mysql und /var/lib/mysql, gitignore-Syntax für Ignore-Muster, Regeln wirken nicht rückwirkend, Proton Drive Ignore-Regeln (.protonignore), Rangfolge der Ignore-Dateien (.gitignore vor .protonignore), Upstream-PR #2 im Proton-Repository, Fork Musiker15/windows-drive (GPLv3)

### Community 41 - "German Bot Service Management"
Cohesion: 0.29
Nodes (7): screen-Session für den Bot-Prozess, Eigener sinusbot-Systembenutzer statt root, Accounting-Fehler durch Datei in /dev/shm, Query-Port ändern (ts3server.ini), systemd-Unit ts3server.service für Autostart, Eigener ts3-Systembenutzer statt root, ts3server_startscript.sh

### Community 42 - "German Proton Drive Guide"
Cohesion: 0.29
Nodes (6): Die Rangfolge, Selbst bauen, Upstream, Warum es keinen Download gibt, Was die Regeln nicht tun, Wie die Regeln aussehen

### Community 43 - "GitHub Issue Templates"
Cohesion: 0.33
Nodes (6): Bug Report Issue Template, Desktop and Smartphone Environment Matrix, Reproduction Steps Section, Alternatives Considered Section, Feature Request Issue Template, Confidential Vulnerability Reporting Channels

### Community 44 - "PHP Version Migration"
Cohesion: 0.33
Nodes (6): Upgrade PHP 7.4 auf 8.3 (a2dismod/a2enmod), PHP 8.3 Pakete, Ondrej Sury PHP-Repository (packages.sury.org), update-alternatives --config php, php.list in sources.list.d nicht vergessen, Upgrade from PHP 7.4 to 8.3 (EN)

### Community 45 - "Wildcard SSL with acme.sh and IONOS DNS"
Cohesion: 0.50
Nodes (4): DNS-01 Challenge, HTTP-01 Challenge, Wildcard deckt Apex nicht und nur ein Label ab, Wildcard SSL with acme.sh and IONOS DNS

### Community 46 - "IONOS SSL API Integration"
Cohesion: 0.33
Nodes (6): Wildcard SSL with acme.sh and IONOS DNS, acme.sh per Tarball statt Installationsskript (Home-Verzeichnis-Bug), News (DE): Neues Tutorial Wildcard-SSL mit acme.sh und IONOS-DNS, DNS-01 Validierung über die IONOS-API, grep -r folgt keinen Symlinks in sites-enabled, ZeroSSL statt IONOS-ACME wegen abweichendem Finalize-Schritt

### Community 47 - "External Links and CSP"
Cohesion: 0.40
Nodes (6): Externe Links (GitHub, Discord, MSK Scripts), Lokal eingebundene Webfonts (Inter, JetBrains Mono), Strikte Nonce-basierte Content Security Policy, External links (GitHub, Discord, MSK Scripts), Locally hosted webfonts (Inter, JetBrains Mono), Strict nonce-based Content Security Policy

### Community 48 - "Privacy Policy and Hosting"
Cohesion: 0.47
Nodes (6): Keine eigene Datenerhebung / kein Tracking, netcup GmbH (Hosting-Auftragsverarbeiter), Server-Log-Dateien (14 Tage Speicherdauer), netcup GmbH (hosting processor), No own data collection / no tracking, Server log files (14 day retention)

### Community 49 - "Middleware and CSP Headers"
Cohesion: 0.53
Nodes (5): buildCsp(), config, intlMiddleware, middleware(), patchLocaleCookie()

### Community 50 - "SSL Timer and Automation"
Cohesion: 0.40
Nodes (5): systemd-Timer acme-renew.timer, grep -r folgt keinen Symlinks in sites-enabled, Ein Timer, ein reloadcmd pro Domain, ein Unterverzeichnis pro Domain, RandomizedDelaySec und Persistent=true, CA/Browser-Forum Ballot SC-081v3 (Laufzeitverkürzung)

### Community 51 - "OpenGraph Metadata"
Cohesion: 0.40
Nodes (3): alt, contentType, size

### Community 52 - "ZeroSSL CA Configuration"
Cohesion: 0.50
Nodes (4): IONOS ACME Server Dead End, Sectigo Root R46 Chain Continuity, ZeroSSL as Chosen CA, Exact ZeroSSL Directory URL for EAB Auto-Fetch

### Community 53 - "SSL Certificate Validation"
Cohesion: 0.50
Nodes (4): AH02565: Certificate and private key do not match, --install-cert mit --reloadcmd (persistente Pfade), --keylength 2048 erzwingt RSA statt ECDSA (_ecc-Suffix), ssl-deploy.sh (Key/Cert-Abgleich vor Reload)

### Community 54 - "English Bot Service Management"
Cohesion: 0.50
Nodes (4): GNU screen session for running Sinusbot, Dedicated sinusbot user instead of root, Accounting service error and stale /dev/shm file, Dedicated ts3 user instead of root

### Community 55 - "Build Instructions and Licensing"
Cohesion: 0.50
Nodes (4): build.ps1 build script (.NET 10 SDK), No binary release (proprietary libraries plus signing trust), Kein Download, nur Bauanleitung, No download, build instructions instead

### Community 56 - "German Proton Drive Fork"
Cohesion: 0.50
Nodes (3): Der Anlass, Es gibt keinen Download, Was der Fork kann

### Community 57 - "German SSL Tutorial Intro"
Cohesion: 0.50
Nodes (3): Die Fallen sind der eigentliche Inhalt, Warum sich der Umbau lohnt, Worum es geht

### Community 58 - "English Proton Drive Fork"
Cohesion: 0.50
Nodes (3): There is no download, What the fork does, Why

### Community 59 - "English SSL Tutorial Intro"
Cohesion: 0.50
Nodes (3): The pitfalls are the actual content, What it covers, Why the effort pays off

### Community 60 - "pgAdmin Web Setup"
Cohesion: 0.67
Nodes (3): Alternative: pgAdmin als gunicorn-Dienst hinter ProxyPass, pgadmin4-web (mod_wsgi-Variante), setup-web.sh (pgAdmin-Login + WSGI)

### Community 61 - "en/fivem/installation.md"
Cohesion: 0.15
Nodes (12): All at once, Common problems, On to step 2, Requirements, Step 1.1: user and directories, Step 1.2: install the FXServer artifact, Step 1.3: get the server data, Step 1.4: close the panel port (+4 more)

### Community 62 - "ACME Client Installation"
Cohesion: 0.67
Nodes (3): acme.sh (Shell-ACME-Client), dns_ionos Plugin und IONOS DNS API Key, get.acme.sh Installer bricht bei eigenen Flags

### Community 63 - "ZeroSSL API Details"
Cohesion: 0.67
Nodes (3): IONOS ACME-Server gibt nicht frei aus (Finalize-Fehler), ZeroSSL als CA (Sectigo/USERTrust-Kette), Exakte ZeroSSL-Server-URL /v2/DV90 (EAB-Automatik)

### Community 64 - "MariaDB and phpMyAdmin Fixes"
Cohesion: 0.67
Nodes (3): error #1231 lc_messages fix in 50-server.cnf, phpMyAdmin login after MariaDB upgrade, Alternative: Adminer, lightweight phpMyAdmin clone

### Community 65 - "Search Index Build Process"
Cohesion: 1.00
Nodes (3): Suchfunktion (Build-Zeit-JSON-Index, clientseitig), Search function (build-time JSON index, client-side), public/search-index.json (Build-Output, gitignored)

### Community 88 - "de/fivem/auto-update.md"
Cohesion: 0.17
Nodes (11): Alles auf einmal: der Installer, Die fertigen Dateien, Häufige Fehler, Schritt 3.1: Die Changelog-API verstehen, Schritt 3.2: Update-Script installieren, Schritt 3.3: Cron-Eintrag, Schritt 3.4: Testen, bevor der Cron das erste Mal läuft, Vier Entscheidungen darin, die den Unterschied machen (+3 more)

### Community 89 - "en/fivem/auto-update.md"
Cohesion: 0.17
Nodes (11): All at once: the installer, Common problems, Four decisions that make the difference, How a run goes, Requirements, Step 3.1: understanding the changelog API, Step 3.2: install the update script, Step 3.3: cron entry (+3 more)

### Community 90 - "sitemap.ts"
Cohesion: 0.27
Nodes (9): languagesFor(), lastModifiedOf(), newestOf(), sitemap(), LocaleSwitcher(), hrefFor(), NAMES, alternatePath() (+1 more)

### Community 91 - "Manuelle phpMyAdmin-Installation"
Cohesion: 0.20
Nodes (10): blowfish_secret in config.inc.php, MariaDB-Nutzer mit GRANT ALL PRIVILEGES, Manuelle phpMyAdmin-Installation, Fehler #1231 lc_messages und 50-server.cnf, Dedizierte Postgres-Rolle "DbAdmin" (SUPERUSER), Postgres bleibt loopback-only, Port 5432 nie in UFW öffnen, pg_hba.conf und scram-sha-256 auf 127.0.0.1, blowfish_secret in config.inc.php (+2 more)

### Community 92 - "Footer.tsx"
Cohesion: 0.28
Nodes (6): Footer(), FooterProps, PLATFORM_NAMES, GitHubIcon(), IconProps, isExternal()

### Community 93 - "Dedicated Postgres SUPERUSER role "DbAdmin""
Cohesion: 0.40
Nodes (5): Dedicated DB user instead of root login, Dedicated Postgres SUPERUSER role "DbAdmin", Postgres stays loopback-only, port 5432 never opened, pg_hba.conf loopback scram-sha-256 auth, Postgres stays loopback-only on 127.0.0.1:5432, never open 5432 in UFW

### Community 94 - "de/fivem-tutorials-2026-08.md"
Cohesion: 0.40
Nodes (4): Die Skripte zum Herunterladen, Schritt 1: FiveM-Server installieren, Schritt 2: txAdmin hinter einem Reverse Proxy, Schritt 3: Artefakte automatisch aktualisieren

### Community 95 - "en/fivem-tutorials-2026-08.md"
Cohesion: 0.40
Nodes (4): Step 1: install the FiveM server, Step 2: txAdmin behind a reverse proxy, Step 3: update artifacts automatically, The scripts

### Community 96 - "de/fivem/index.md"
Cohesion: 0.50
Nodes (3): Die Reihe, Was Du vorher brauchst, Wenn Du nur einen Teil brauchst

### Community 97 - "en/fivem/index.md"
Cohesion: 0.50
Nodes (3): If you only need one part, The series, What you need up front

### Community 98 - "next.config.ts"
Cohesion: 0.50
Nodes (3): nextConfig, securityHeaders, withNextIntl

## Ambiguous Edges - Review These
- `Musiker15 M-Logo (embedded base64 PNG)` → `Slate/Blue Palette (#ffffff, #cbd5e1, #94a3b8, #64748b)`  [AMBIGUOUS]
  assets/og-default.svg · relation: conceptually_related_to
- `Angular Chevron Geometry` → `Possible Music or Waveform Reading of the Zigzag`  [AMBIGUOUS]
  public/logo.png · relation: semantically_similar_to
- `Site Design System Palette` → `Mark Without Wordmark`  [AMBIGUOUS]
  public/logo.png · relation: conceptually_related_to

## Knowledge Gaps
- **397 isolated node(s):** `config`, `config`, `config`, `withNextIntl`, `securityHeaders` (+392 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **20 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Musiker15 M-Logo (embedded base64 PNG)` and `Slate/Blue Palette (#ffffff, #cbd5e1, #94a3b8, #64748b)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Angular Chevron Geometry` and `Possible Music or Waveform Reading of the Zigzag`?**
  _Edge tagged AMBIGUOUS (relation: semantically_similar_to) - confidence is low._
- **What is the exact relationship between `Site Design System Palette` and `Mark Without Wordmark`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `.next` connect `Locale` to `next.config.ts`, `TypeScript and Build Paths`, `layout.tsx`, `site.config.ts`, `sitemap.ts`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **Why does `exclude` connect `TypeScript and Build Paths` to `Locale`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **Why does `phpMyAdmin` connect `phpMyAdmin` to `Manuelle phpMyAdmin-Installation`, `Dedicated Postgres SUPERUSER role "DbAdmin"`, `Debian and MariaDB Upgrades`?**
  _High betweenness centrality (0.015) - this node is a cross-community bridge._
- **What connects `config`, `config`, `config` to the rest of the system?**
  _397 weakly-connected nodes found - possible documentation gaps or missing edges._
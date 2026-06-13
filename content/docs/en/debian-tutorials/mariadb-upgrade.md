---
title: "MariaDB upgrade on Debian / Ubuntu"
description: "Major release upgrade from MariaDB 10 to 11 without data loss."
order: 3
tags: ["debian", "mariadb"]
---

During a MariaDB upgrade from, say, version 10 to version 11, all existing
databases are preserved. So there's no data loss — everything works exactly
the same after the upgrade as before.

<Callout type="warning">
I still recommend creating a full backup! I take no responsibility if
something goes wrong.
</Callout>

First, let's check which MariaDB version we currently have installed:

```bash
mysql
status
exit
```

Under `Server Version` we can see which MariaDB version is currently
installed. In this case we assume version 10.X, so it should say something
like `Server Version: 10.5.21-MariaDB-XXXXX`.

To perform the upgrade, we first have to stop the MariaDB server and then,
just to be safe, create backups:

```bash
service mysql stop
cp -R /etc/mysql/ /etc/mysql-backup
cp -R /var/lib/mysql /var/lib/mysql-backup
```

We've now stopped the MariaDB server and created backups of the files. Next,
we need to add the new repository to the `sources.list`:

```bash
curl -LsS https://r.mariadb.com/downloads/mariadb_repo_setup | sudo bash
```

Next we have to remove the old MariaDB server so we can download the new
version:

```bash
apt remove 'mariadb-*'
apt install mariadb-server
```

<Callout type="warning">
The `mariadb-*` must be in quotes, otherwise the shell will try to expand the
`*` against files in the current directory before `apt` ever sees it.
</Callout>

Afterwards we should check whether the MariaDB server has started:

```bash
mysql
```

If we get an error here, we start the MariaDB server manually and check
whether the new version was installed:

```bash
service mysql start
status
exit
```

After a major upgrade, the system tables have to be adapted to the new
version. This is done by `mariadb-upgrade` (on older versions `mysql_upgrade`):

```bash
mariadb-upgrade
```

<Callout type="tip">
`mariadb-upgrade` is mandatory after a version jump — it checks and updates
the system tables. Without this step you may run into unexpected errors after
the upgrade.
</Callout>

In rare cases there are a few minor issues after the installation, e.g. when
trying to log in via phpMyAdmin. Such an error might look like this:

```
error #1231 – Variable 'lc_messages' can't be set to the value of de_DE
```

In this case it could be that an outdated path is still set in the
configuration. To fix it, we simply open
`/etc/mysql/mariadb.conf.d/50-server.cnf` and change the path:

```ini
lc-messages-dir = /usr/share/mariadb/german
lc-messages     = de_DE
```

Now we just restart the MySQL server and everything should work flawlessly
again. Once we've tested that everything really works correctly and all
previously created databases still work, we can delete the backups we created
earlier:

```bash
rm -r /etc/mysql-backup
rm -r /var/lib/mysql-backup
```

**DONE**

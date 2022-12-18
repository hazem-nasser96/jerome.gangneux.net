#!/bin/bash

# This is a VERY BASIC backup script of the database
# You could add it in some cron task:
# `0 0 * * * /home/mastodon/backup-database.sh >> /var/log/mastodon-backup-database.log 2>&1`

SCRIPT_DIR=$(dirname -- "$(readlink -f -- "$BASH_SOURCE")")
cd "${SCRIPT_DIR}" || exit 1

echo "Backuping Mastodon database ..."
[ -d ../backup ] || mkdir ../backup
DATE=$(date +%Y%m%d-%H%M)
docker-compose -f docker-compose.yml exec db pg_dump mastodon_production -U mastodon > ../backup/${DATE}_pg.dump
cp .env.production ../backup/env.production

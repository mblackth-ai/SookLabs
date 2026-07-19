#!/usr/bin/env bash
# Nightly HQ Postgres backup on the Sookly droplet.
# Install:
#   scp scripts/hq-ops-backup.sh root@139.59.117.188:/opt/hq-ops/
#   chmod +x /opt/hq-ops/hq-ops-backup.sh
#   crontab: 15 3 * * * /opt/hq-ops/hq-ops-backup.sh >> /var/log/hq-ops-backup.log 2>&1
#
# Optional Spaces upload: set DO_SPACES_KEY / DO_SPACES_SECRET / DO_SPACES_BUCKET / DO_SPACES_ENDPOINT

set -euo pipefail

BACKUP_DIR="${HQ_BACKUP_DIR:-/opt/hq-ops/backups}"
RETENTION_DAYS="${HQ_BACKUP_RETENTION_DAYS:-14}"
CONTAINER="${HQ_PG_CONTAINER:-hq-postgres}"
DB_USER="${HQ_PG_USER:-hq_ops}"
DB_NAME="${HQ_PG_DB:-hq_ops}"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
OUT="${BACKUP_DIR}/hq_ops_${STAMP}.sql.gz"

mkdir -p "$BACKUP_DIR"

docker exec "$CONTAINER" pg_dump -U "$DB_USER" -d "$DB_NAME" --clean --if-exists \
  | gzip -c > "$OUT"

echo "Wrote $OUT ($(du -h "$OUT" | cut -f1))"

find "$BACKUP_DIR" -name 'hq_ops_*.sql.gz' -mtime +"$RETENTION_DAYS" -delete

if [[ -n "${DO_SPACES_BUCKET:-}" && -n "${DO_SPACES_KEY:-}" && -n "${DO_SPACES_SECRET:-}" ]]; then
  ENDPOINT="${DO_SPACES_ENDPOINT:-https://sgp1.digitaloceanspaces.com}"
  KEY="hq-ops/$(basename "$OUT")"
  if command -v s3cmd >/dev/null 2>&1; then
    s3cmd put "$OUT" "s3://${DO_SPACES_BUCKET}/${KEY}" \
      --access_key="$DO_SPACES_KEY" \
      --secret_key="$DO_SPACES_SECRET" \
      --host="${ENDPOINT#https://}" \
      --host-bucket="%(bucket)s.${ENDPOINT#https://}"
    echo "Uploaded s3://${DO_SPACES_BUCKET}/${KEY}"
  else
    echo "s3cmd not installed — local backup only"
  fi
fi

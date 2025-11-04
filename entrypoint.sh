#!/usr/bin/env bash
set -euo pipefail

log() {
  printf '[entrypoint] %s\n' "$*"
}

log "Starting Django container (IAFASTTRACK)"

if [ "${PRODUCTION:-false}" = "true" ]; then
  log "Mode: production"
else
  log "Mode: development"
fi

# Wait for the MySQL database using /dev/tcp (no nc dependency)
if [ -n "${DB_HOST:-}" ]; then
  db_port="${DB_PORT:-3306}"
  log "Waiting for database at ${DB_HOST}:${db_port}..."
  retries=0
  until bash -c "exec 3<>/dev/tcp/${DB_HOST}/${db_port}" >/dev/null 2>&1; do
    retries=$((retries + 1))
    if [ $retries -gt 60 ]; then
      log "Database did not respond in time"
      exit 1
    fi
    log "Database not ready yet (attempt ${retries})"
    sleep 2
  done
  # Close the descriptor if it was opened
  exec 3>&-
  log "Database connection available"
fi

log "Running migrations"
python manage.py makemigrations --noinput || true
python manage.py migrate --noinput

log "Collecting static files"
mkdir -p /app/staticfiles
rm -rf /app/staticfiles/*
python manage.py collectstatic --noinput

if [ -f /app/staticfiles/model/icons ]; then
  log "Adjusting static files directory conflict at /app/staticfiles/model/icons"
  rm -f /app/staticfiles/model/icons
  mkdir -p /app/staticfiles/model/icons
fi

log "Starting Gunicorn"
exec gunicorn IAFASTTRACKMODEL.wsgi:application \
  --bind 0.0.0.0:8000 \
  --workers "${GUNICORN_WORKERS:-1}" \
  --timeout "${GUNICORN_TIMEOUT:-60}" \
  --access-logfile - \
  --error-logfile - \
  --log-level "${GUNICORN_LOG_LEVEL:-info}"

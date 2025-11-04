#!/usr/bin/env bash
set -euo pipefail

log() {
  printf '[entrypoint] %s\n' "$*"
}

wait_for_db() {
  if [ -z "${DB_HOST:-}" ]; then
    return 0
  fi

  local host="${DB_HOST}"
  local port="${DB_PORT:-3306}"
  local tcp_attempts=0
  local tcp_limit="${DB_CONNECT_ATTEMPTS:-60}"

  log "Waiting for database TCP service at ${host}:${port}"
  until bash -c "exec 3<>/dev/tcp/${host}/${port}" >/dev/null 2>&1; do
    tcp_attempts=$((tcp_attempts + 1))
    if [ "${tcp_attempts}" -ge "${tcp_limit}" ]; then
      log "Database TCP service unavailable after ${tcp_attempts} attempts"
      exit 1
    fi
    log "Database TCP not ready (attempt ${tcp_attempts}); retrying in 2s"
    sleep 2
  done
  exec 3>&-

  if python - <<'PY' >/dev/null 2>&1
import importlib.util
spec = importlib.util.find_spec("pymysql")
raise SystemExit(0 if spec else 1)
PY
  then
    local auth_attempts=0
    local auth_limit="${DB_AUTH_ATTEMPTS:-30}"
    log "Verifying database credentials"
    until python - <<'PY'
import os
import sys
import pymysql

host = os.environ.get("DB_HOST", "")
if not host:
    raise SystemExit(0)

port = int(os.environ.get("DB_PORT") or 3306)
user = os.environ.get("DB_USER") or None
password = os.environ.get("DB_PASSWORD") or None
database = os.environ.get("DB_NAME") or None

try:
    conn = pymysql.connect(host=host, port=port, user=user, password=password, database=database, connect_timeout=3)
except Exception:
    raise SystemExit(1)
else:
    conn.close()
    raise SystemExit(0)
PY
    do
      auth_attempts=$((auth_attempts + 1))
      if [ "${auth_attempts}" -ge "${auth_limit}" ]; then
        log "Database authentication failed after ${auth_attempts} attempts"
        exit 1
      fi
      log "Database authentication not ready (attempt ${auth_attempts}); retrying in 2s"
      sleep 2
    done
  fi

  log "Database connection available"
}

run_migrations() {
  log "Running makemigrations (non-fatal)"
  python manage.py makemigrations --noinput || true

  local attempts=0
  local limit="${DB_MIGRATE_ATTEMPTS:-5}"
  until python manage.py migrate --noinput; do
    attempts=$((attempts + 1))
    if [ "${attempts}" -ge "${limit}" ]; then
      log "Migrate failed after ${attempts} attempts"
      return 1
    fi
    log "Migrate failed (attempt ${attempts}); retrying in 5s"
    sleep 5
  done
}

collect_static() {
  log "Collecting static files"
  mkdir -p /app/staticfiles
  rm -rf /app/staticfiles/*
  python manage.py collectstatic --noinput

  if [ -f /app/staticfiles/model/icons ]; then
    log "Adjusting static files directory conflict at /app/staticfiles/model/icons"
    rm -f /app/staticfiles/model/icons
    mkdir -p /app/staticfiles/model/icons
  fi
}

log "Starting Django container (IAFASTTRACK)"

if [ "${PRODUCTION:-false}" = "true" ]; then
  log "Mode: production"
else
  log "Mode: development"
fi

wait_for_db
run_migrations
collect_static

command=()
if [ "$#" -gt 0 ]; then
  command=("$@")
else
  command=(
    gunicorn
    IAFASTTRACKMODEL.wsgi:application
    --bind "0.0.0.0:8000"
    --workers "${GUNICORN_WORKERS:-1}"
    --timeout "${GUNICORN_TIMEOUT:-60}"
    --access-logfile -
    --error-logfile -
    --log-level "${GUNICORN_LOG_LEVEL:-info}"
  )
fi

log "Launching: ${command[*]}"
exec "${command[@]}"

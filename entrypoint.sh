#!/bin/sh
set -e

if [ "$PRODUCTION" = "true" ]; then
  echo "Running in production mode"
fi

# Wait for DB to be available (optional: simple loop, can be improved)
if [ -n "$DB_HOST" ]; then
  echo "Waiting for database $DB_HOST:$DB_PORT..."
  retries=0
  until nc -z "$DB_HOST" ${DB_PORT:-3306} >/dev/null 2>&1; do
    retries=$((retries+1))
    echo "Waiting for DB... ($retries)"
    if [ $retries -gt 30 ]; then
      echo "Database did not become available in time" >&2
      exit 1
    fi
    sleep 2
  done
fi

echo "Applying database migrations"
python manage.py makemigrations || true
python manage.py migrate --noinput

echo "Collecting static files"
python manage.py collectstatic --noinput

exec "$@"

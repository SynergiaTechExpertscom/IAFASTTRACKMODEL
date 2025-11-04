#!/bin/bash
set -e

echo "=============================================="
echo "🚀 Iniciando contenedor de Django (IAFASTTRACK)"
echo "=============================================="

if [ "$PRODUCTION" = "true" ]; then
  echo "Modo: Producción"
else
  echo "Modo: Desarrollo"
fi

# Esperar a la base de datos MySQL usando /dev/tcp (sin nc)
if [ -n "$DB_HOST" ]; then
  echo "⏳ Esperando a la base de datos ($DB_HOST:${DB_PORT:-3306})..."
  retries=0
  until bash -c "exec 3<>/dev/tcp/$DB_HOST/${DB_PORT:-3306}" >/dev/null 2>&1; do
    retries=$((retries+1))
    echo "   ➜ Intento $retries..."
    if [ $retries -gt 60 ]; then
      echo "❌ La base de datos no respondió a tiempo" >&2
      exit 1
    fi
    sleep 2
  done
  # Cerramos el descriptor si abrió
  exec 3>&-
  echo "✅ Base de datos disponible."
fi

echo "📦 Aplicando migraciones..."
python manage.py makemigrations --noinput || true
python manage.py migrate --noinput

echo "📁 Recopilando archivos estáticos..."
rm -rf /app/staticfiles/*
python manage.py collectstatic --noinput

echo "🔥 Iniciando Gunicorn..."
exec gunicorn IAFASTTRACKMODEL.wsgi:application \
  --bind 0.0.0.0:8000 \
  --workers "${GUNICORN_WORKERS:-1}" \
  --timeout "${GUNICORN_TIMEOUT:-60}" \
  --access-logfile - \
  --error-logfile - \
  --log-level "${GUNICORN_LOG_LEVEL:-info}"

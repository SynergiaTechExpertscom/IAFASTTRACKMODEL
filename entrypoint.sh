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

# Esperar a la base de datos MySQL
if [ -n "$DB_HOST" ]; then
  echo "⏳ Esperando a la base de datos ($DB_HOST:$DB_PORT)..."
  retries=0
  until nc -z "$DB_HOST" "${DB_PORT:-3306}" >/dev/null 2>&1; do
    retries=$((retries+1))
    echo "   ➜ Intento $retries..."
    if [ $retries -gt 30 ]; then
      echo "❌ La base de datos no respondió a tiempo" >&2
      exit 1
    fi
    sleep 2
  done
  echo "✅ Base de datos disponible."
fi

# Migraciones automáticas
echo "📦 Aplicando migraciones..."
python manage.py makemigrations --noinput || true
python manage.py migrate --noinput

# Archivos estáticos
echo "📁 Recopilando archivos estáticos..."
python manage.py collectstatic --noinput

# Lanzar Gunicorn (modo producción)
echo "🔥 Iniciando Gunicorn..."
exec gunicorn IAFASTTRACKMODEL.wsgi:application --bind 0.0.0.0:8000 --workers 3


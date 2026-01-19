#!/bin/bash
set -e

echo "Starting application..."
echo "PORT from env: $PORT"

echo "Caching config..."
php artisan config:cache

echo "Caching routes..."
php artisan route:cache

echo "Running migrations..."
php artisan migrate --force

echo "Creating storage link..."
php artisan storage:link || true

# Use printf to ensure PORT is treated as integer
PORT_NUM=$(printf '%d' "${PORT:-8080}")
echo "Starting server on port $PORT_NUM..."
exec php artisan serve --host=0.0.0.0 --port="$PORT_NUM"

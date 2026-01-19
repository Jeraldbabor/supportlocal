#!/bin/bash
set -e

# Convert PORT to integer (Railway passes it as string)
APP_PORT=$((${PORT:-8080}))

echo "Starting application..."
echo "PORT: $APP_PORT"

echo "Caching config..."
php artisan config:cache

echo "Caching routes..."
php artisan route:cache

echo "Running migrations..."
php artisan migrate --force

echo "Creating storage link..."
php artisan storage:link || true

echo "Starting server on port $APP_PORT..."
exec php artisan serve --host=0.0.0.0 --port=$APP_PORT

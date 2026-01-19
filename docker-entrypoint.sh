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

# Use PHP built-in server directly (avoids Laravel's port type issue)
PORT_NUM=${PORT:-8080}
echo "Starting PHP server on port $PORT_NUM..."
exec php -S 0.0.0.0:$PORT_NUM -t /app/public /app/public/index.php

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

# Optional: run queue worker in same container (set RUN_QUEUE_WORKER=true).
# Recommended in production: run worker as a separate Railway service.
if [ "${RUN_QUEUE_WORKER:-false}" = "true" ]; then
    echo "Starting queue worker in background..."
    php artisan queue:work --sleep=1 --tries=3 --timeout=120 &
fi

# Use PHP built-in server with router to serve static assets
PORT_NUM=${PORT:-8080}
echo "Starting PHP server on port $PORT_NUM..."
exec php -d upload_max_filesize=20M -d post_max_size=25M -d memory_limit=256M -S 0.0.0.0:$PORT_NUM -t /app/public /app/public/router.php

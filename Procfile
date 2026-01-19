web: php artisan optimize && php artisan serve --host=0.0.0.0 --port=${PORT:-8080}
worker: php artisan queue:work --sleep=3 --tries=3 --max-time=3600
release: php artisan migrate --force && php artisan storage:link

<?php

$path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);
$path = $path ?: '/';
$file = __DIR__.$path;

if ($path !== '/' && is_file($file)) {
    // Ensure correct MIME types for PWA files
    $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));
    $mimeTypes = [
        'json' => 'application/json',
        'js' => 'application/javascript',
        'svg' => 'image/svg+xml',
        'png' => 'image/png',
        'ico' => 'image/x-icon',
        'css' => 'text/css',
        'woff2' => 'font/woff2',
        'woff' => 'font/woff',
        'ttf' => 'font/ttf',
        'webp' => 'image/webp',
        'jpg' => 'image/jpeg',
        'jpeg' => 'image/jpeg',
        'gif' => 'image/gif',
    ];

    if (isset($mimeTypes[$ext])) {
        header('Content-Type: '.$mimeTypes[$ext]);

        // Service worker needs special scope header
        if (basename($file) === 'sw.js') {
            header('Service-Worker-Allowed: /');
        }

        readfile($file);

        return true;
    }

    return false;
}

require __DIR__.'/index.php';

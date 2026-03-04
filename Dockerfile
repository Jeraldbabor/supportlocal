FROM php:8.3-cli

# Install system dependencies (including image format libraries for GD)
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libjpeg62-turbo-dev \
    libwebp-dev \
    libfreetype6-dev \
    libonig-dev \
    libxml2-dev \
    libpq-dev \
    libzip-dev \
    zip \
    unzip \
    && docker-php-ext-configure gd --with-jpeg --with-webp --with-freetype \
    && docker-php-ext-install pdo pdo_pgsql pdo_mysql mbstring exif pcntl bcmath gd zip \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Install Node.js
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /app

# Cache bust - change this value to force rebuild
ARG CACHEBUST=2

# Copy composer files and install PHP dependencies
COPY composer.json composer.lock ./
RUN composer install --no-dev --optimize-autoloader --no-scripts --no-interaction

# Copy package files and install Node dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy all files
COPY . .

# Copy custom PHP config for upload limits and memory
COPY docker-php.ini /usr/local/etc/php/conf.d/99-custom.ini

# Build assets
RUN composer dump-autoload --optimize
RUN npm run build
RUN php artisan view:cache

# Copy and setup entrypoint (convert Windows line endings to Unix)
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN sed -i 's/\r$//' /docker-entrypoint.sh && chmod +x /docker-entrypoint.sh

EXPOSE 8080

# Always run our entrypoint, even if Railway overrides CMD
ENTRYPOINT ["/docker-entrypoint.sh"]

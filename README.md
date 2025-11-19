# SupportLocal - Local Business Support Platform

A Laravel-based e-commerce platform designed to support local businesses and sellers with integrated order management, seller applications, and product ratings.

## System Requirements

- **PHP**: ^8.2
- **Node.js**: ^18.0 or higher
- **Composer**: ^2.0
- **Database**: SQLite (default) or MySQL/PostgreSQL
- **Web Server**: Apache/Nginx or Laravel's built-in server

## Quick Start Guide

### 1. Clone the Repository

```bash
git clone https://github.com/Jeraldbabor/supportlocal.git
cd supportlocal
```

### 2. Install Dependencies

#### Install PHP Dependencies
```bash
composer install
```

#### Install Node.js Dependencies
```bash
npm install
```

### 3. Environment Configuration

#### Copy Environment File
```bash
cp .env.example .env
```

#### Configure Environment Variables

Open the `.env` file and configure the following settings:

##### Application Settings
```env
APP_NAME=SupportLocal
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://localhost:8000
```

##### Network Configuration (Important)
Replace `localhost` with your actual IP address if accessing from other devices on your network:

```env
# For local machine only
APP_URL=http://localhost:8000

# For network access (replace with your actual IP)
APP_URL=http://192.168.1.100:8000
# or
APP_URL=http://10.0.0.50:8000
```

##### Database Configuration
**Default (SQLite - Recommended for quick setup):**
```env
DB_CONNECTION=sqlite
```

**For MySQL/PostgreSQL:**
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=supportlocal
DB_USERNAME=root
DB_PASSWORD=your_password
```

##### Mail Configuration (Optional)
```env
MAIL_MAILER=log
MAIL_HOST=127.0.0.1
MAIL_PORT=2525
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_FROM_ADDRESS="hello@supportlocal.com"
MAIL_FROM_NAME="${APP_NAME}"
```

##### Google Maps API (Required for location features)
```env
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

To get a Google Maps API key:
1. Visit [Google Cloud Console](https://console.cloud.google.com/google/maps-apis)
2. Create a new project or select existing one
3. Enable **Maps JavaScript API** and **Geocoding API**
4. Create credentials (API Key)
5. Copy the API key to your `.env` file

### 4. Generate Application Key

```bash
php artisan key:generate
```

### 5. Database Setup

#### For SQLite (Default)
```bash
# Create database file
touch database/database.sqlite

# Run migrations
php artisan migrate
```

#### For MySQL/PostgreSQL
```bash
# Create database first, then run migrations
php artisan migrate
```

#### Seed Database (Optional)
```bash
php artisan db:seed
```

### 6. Create Storage Link

```bash
php artisan storage:link
```

### 7. Build Frontend Assets

#### For Development
```bash
npm run dev
```

#### For Production
```bash
npm run build
```

### 8. Start the Application

#### Option A: Using Composer Script (Recommended)
This will start the server, queue listener, and Vite dev server simultaneously:
```bash
composer dev
```

#### Option B: Manual Start
Open three separate terminal windows:

**Terminal 1 - Laravel Server:**
```bash
php artisan serve
```

**Terminal 2 - Queue Worker:**
```bash
php artisan queue:listen --tries=1
```

**Terminal 3 - Vite Dev Server:**
```bash
npm run dev
```

### 9. Access the Application

- **Local Access**: http://localhost:8000
- **Network Access**: http://YOUR_IP_ADDRESS:8000 (e.g., http://192.168.1.100:8000)

## Network Access Configuration

### Finding Your IP Address

**Windows:**
```bash
ipconfig
```
Look for `IPv4 Address` under your active network adapter.

**Mac/Linux:**
```bash
ifconfig
# or
ip addr show
```

### Allowing Network Access

#### Update .env File
```env
APP_URL=http://YOUR_IP_ADDRESS:8000
```

#### Start Server with Host Binding
```bash
php artisan serve --host=0.0.0.0 --port=8000
```

#### Update Vite Configuration (if needed)
The `vite.config.ts` should already be configured, but verify it includes:
```typescript
server: {
    host: '0.0.0.0',
    port: 5173,
}
```

#### Firewall Configuration
Ensure your firewall allows incoming connections on ports:
- **8000** (Laravel server)
- **5173** (Vite dev server)

**Windows Firewall:**
```bash
# Allow Laravel server
netsh advfirewall firewall add rule name="Laravel Server" dir=in action=allow protocol=TCP localport=8000

# Allow Vite dev server
netsh advfirewall firewall add rule name="Vite Dev Server" dir=in action=allow protocol=TCP localport=5173
```

## Project Structure

```
├── app/
│   ├── Console/Commands/      # Artisan commands
│   ├── Helpers/               # Helper functions
│   ├── Http/
│   │   ├── Controllers/       # Application controllers
│   │   ├── Middleware/        # Custom middleware
│   │   └── Requests/          # Form request validation
│   ├── Models/                # Eloquent models
│   ├── Notifications/         # Email/SMS notifications
│   └── Policies/              # Authorization policies
├── database/
│   ├── factories/             # Model factories for testing
│   ├── migrations/            # Database migrations
│   └── seeders/               # Database seeders
├── resources/
│   ├── css/                   # Stylesheets
│   ├── js/                    # React components & JS
│   └── views/                 # Blade templates (if any)
├── routes/
│   ├── web.php                # Web routes
│   ├── auth.php               # Authentication routes
│   └── settings.php           # Settings routes
└── public/                    # Public assets
```

## Key Features

- **User Management**: User authentication with roles (buyer, seller, admin)
- **Product Management**: Create, read, update, delete products with categories
- **Order System**: Complete order processing with status tracking
- **Seller Applications**: Application system for becoming a seller
- **Rating System**: Product and seller rating functionality
- **Notifications**: Real-time notifications for orders and applications
- **Location Services**: Google Maps integration for location-based features

## Available Commands

### Development
```bash
composer dev              # Start all services (server, queue, vite)
npm run dev              # Start Vite dev server only
php artisan serve        # Start Laravel server only
php artisan queue:listen # Start queue worker only
```

### Testing
```bash
composer test            # Run PHPUnit/Pest tests
php artisan test         # Run tests via artisan
npm run lint             # Run ESLint
npm run format           # Format code with Prettier
```

### Code Quality
```bash
./vendor/bin/pint        # Format PHP code
./vendor/bin/phpstan     # Run static analysis
npm run types            # Check TypeScript types
```

### Production Build
```bash
npm run build            # Build frontend assets for production
composer install --optimize-autoloader --no-dev
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

## Troubleshooting

### Common Issues

#### 1. "Permission denied" errors
```bash
# Linux/Mac
chmod -R 775 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache

# Windows - Run as Administrator
icacls storage /grant Users:F /T
icacls bootstrap/cache /grant Users:F /T
```

#### 2. Database connection errors
- Verify database credentials in `.env`
- For SQLite, ensure `database/database.sqlite` exists
- For MySQL, ensure the database exists and credentials are correct

#### 3. Vite/NPM errors
```bash
# Clear npm cache and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

#### 4. "Mix manifest does not exist"
```bash
npm run build
```

#### 5. Queue jobs not processing
```bash
# Restart queue worker
php artisan queue:restart
php artisan queue:listen
```

#### 6. Can't access from other devices
- Check firewall settings
- Verify `APP_URL` uses IP address, not localhost
- Ensure server is started with `--host=0.0.0.0`
- Verify devices are on the same network

## Security Notes

### Production Deployment

When deploying to production:

1. Set `APP_ENV=production` and `APP_DEBUG=false`
2. Use strong `APP_KEY` (generated automatically)
3. Configure proper database credentials
4. Use HTTPS for `APP_URL`
5. Set up proper mail configuration
6. Configure queue workers as system services
7. Enable caching:
   ```bash
   php artisan optimize
   ```

## Support & Contributing

For issues, questions, or contributions, please contact the development team or submit issues through your project management system.

## License

This project is proprietary software. All rights reserved.

---

**Developed by**: Jerald Babor  
**Repository**: https://github.com/Jeraldbabor/supportlocal  
**Branch**: main

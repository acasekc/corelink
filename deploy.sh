#!/bin/bash
set -e

# CoreLink Production Deployment Script
# Server: <user>@corelink.dev
# Path: /var/www

echo "🚀 Starting deployment to corelink.dev..."

# Configuration
REMOTE_USER="${REMOTE_USER:-ec2-user}"
REMOTE_HOST="${REMOTE_HOST:-corelink.dev}"
REMOTE_PATH="${REMOTE_PATH:-/var/www}"
APP_NAME="${APP_NAME:-corelink.dev}"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Connecting to ${REMOTE_USER}@${REMOTE_HOST}...${NC}"

ssh "${REMOTE_USER}@${REMOTE_HOST}" "REMOTE_PATH='${REMOTE_PATH}' APP_NAME='${APP_NAME}' bash -s" << 'ENDSSH'
set -e

cd "${REMOTE_PATH}/${APP_NAME}"

echo "📥 Pulling latest changes from git..."
git fetch origin
git reset --hard origin/main

echo "📦 Installing Composer dependencies..."
composer install --no-dev --optimize-autoloader --no-interaction

echo "📦 Installing NPM dependencies..."
npm ci

echo "🧽 Preparing build directory..."
sudo rm -rf public/build
mkdir -p public/build
sudo chown -R "${APP_USER}:$(id -gn)" public/build
sudo chmod -R u+rwX public/build

echo "🔨 Building frontend assets..."
npm run build

echo "🛑 Stopping SSR server..."
php artisan inertia:stop-ssr 2>/dev/null || true

echo "🗄️ Running database migrations..."
php artisan migrate --force

echo "🌱 Seeding case studies..."
php artisan db:seed --class=CaseStudySeeder --force

echo "🔗 Creating storage symlink..."
php artisan storage:link --force

echo "🧹 Clearing and caching..."
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache

echo "🔐 Setting permissions..."
# Ensure storage and cache directories are writable by web server
APP_USER="$(whoami)"
if getent group nginx >/dev/null 2>&1; then
	WEB_GROUP="nginx"
elif getent group www-data >/dev/null 2>&1; then
	WEB_GROUP="www-data"
else
	WEB_GROUP="$(id -gn)"
fi

sudo chown -R "${APP_USER}:${WEB_GROUP}" storage bootstrap/cache
sudo chmod -R 775 storage bootstrap/cache

echo "🔄 Restarting services..."
php artisan queue:restart
sudo systemctl reload php-fpm || sudo systemctl reload php8.4-fpm || echo "Could not reload PHP-FPM, please restart manually if needed"
echo "🌐 Starting SSR server..."
sudo supervisorctl restart inertia-ssr 2>/dev/null || echo "Supervisor not configured for SSR yet — start manually with: php artisan inertia:start-ssr &"
echo "✅ Deployment complete!"
ENDSSH

echo -e "${GREEN}🎉 Deployment to corelink.dev completed successfully!${NC}"

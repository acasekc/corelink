#!/bin/bash
set -e

# CoreLink Production Deployment Script
# Server: ec2-user@corelink.dev
# Path: /var/www

echo "🚀 Starting deployment to corelink.dev..."

# Configuration
REMOTE_USER="ec2-user"
REMOTE_HOST="corelink.dev"
REMOTE_PATH="/var/www"
APP_NAME="corelink"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Connecting to ${REMOTE_HOST}...${NC}"

ssh ${REMOTE_USER}@${REMOTE_HOST} << 'ENDSSH'
set -e

cd /var/www/corelink.dev

echo "📥 Pulling latest changes from git..."
git fetch origin
git reset --hard origin/corelink

echo "📦 Installing Composer dependencies..."
composer install --no-dev --optimize-autoloader --no-interaction

echo "📦 Installing NPM dependencies..."
npm ci

echo "🔨 Building frontend assets..."
npm run build

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

echo "🔄 Restarting services..."
php artisan queue:restart
sudo systemctl reload php-fpm || sudo systemctl reload php8.4-fpm || echo "Could not reload PHP-FPM, please restart manually if needed"

echo "✅ Deployment complete!"
ENDSSH

echo -e "${GREEN}🎉 Deployment to corelink.dev completed successfully!${NC}"

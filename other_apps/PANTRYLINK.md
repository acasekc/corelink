# PantryLink

**Link your pantry to your shopping list**

Available at: [mypantrylink.com](https://mypantrylink.com) and [PantryLink.app](https://pantrylink.app)

A comprehensive Laravel-based application for managing household inventory, creating shopping lists, and integrating with Walmart for seamless online ordering. Built with Laravel 12, Vue 3, and Inertia.js.

> **Production Ready** ✅ - Configured for deployment to [Laravel Cloud](https://cloud.laravel.com). See [LARAVEL_CLOUD_DEPLOYMENT.md](./LARAVEL_CLOUD_DEPLOYMENT.md) for deployment instructions.

## Features

### 📦 Inventory Management
- **Hierarchical Organization**: Manage multiple inventory lists (pantry, fridge, garage, etc.)
- **Location-Based Storage**: Organize items by physical locations within your home
- **Item Tracking**: Track quantities, minimum/maximum levels, brands, and categories
- **Partial Quantity Moves**: Transfer specific quantities between locations
- **Low Stock Alerts**: Visual indicators for items running low with location-specific tracking
- **Barcode Scanning**: Quick item lookup and addition via barcode scanner
- **Multi-API Barcode Lookup**: Integrated with Open Food Facts, UPCItemDB, and Edamam
- **Image Recognition**: Upload photos to identify and add multiple items at once
- **Preferred Vendors**: Set vendor preferences per item for easier reordering
- **Category Management**: Auto-fill categories with intelligent suggestions
- **Offline Support**: Full offline functionality with automatic sync when reconnected

### 🛒 Smart Shopping Lists
- **Auto-Generation**: Automatically create shopping lists from low-stock inventory items
- **Manual Creation**: Create custom shopping lists for any occasion
- **Editable Names**: Customize shopping list names inline
- **Manual Item Addition**: Add items directly to shopping lists without inventory tracking
- **Item Management**: Add, remove, check off items as you shop
- **Category Organization**: Items grouped by categories for efficient shopping
- **Shared Items**: Include shared inventory items in collaborative shopping lists
- **Copy & Share**: Generate shareable links for shopping lists

### 🤝 Sharing & Collaboration
- **Crew System**: Organize shared access through crews (families, roommates, teams)
- **Crew Management**: Create crews, invite members, and manage permissions
- **Flexible Permissions**: Share entire access or specific lists only
- **Email Invitations**: Send invitation links via email with unique tokens
- **Ownership Badges**: Clear visual indicators showing shared vs. owned lists
- **Multi-User Support**: Multiple users can collaborate on the same lists
- **Crew Leaderboards**: Track contributions and engagement within crews
- **Activity Tracking**: Monitor crew member participation

### 🎮 Gamification System
- **Points & Rewards**: Earn points for various actions (scanning, creating lists, completing tasks)
- **Achievement Badges**: Unlock 28+ badges across Bronze, Silver, Gold, and Platinum tiers
- **Progress Tracking**: Visual progress indicators for badge completion
- **Leaderboards**: Compete with crew members on contribution rankings
- **Special Achievements**: Early adopter, speed demon, budget master, and more
- **Milestone Celebrations**: Confetti animations and notifications for achievements

### 🏪 Walmart Integration
- **Product Search**: Search Walmart's catalog directly from the app
- **Availability Check**: Real-time stock availability at your local Walmart
- **Cart Management**: Add items directly to your Walmart cart
- **Store Selection**: Choose your preferred Walmart store location
- **Seamless Ordering**: Complete purchases through Walmart's checkout

### 🔍 Product Discovery
- **Barcode Lookup**: Multi-API barcode lookup system (Open Food Facts, UPCItemDB, Edamam)
- **Product Information**: Auto-fill product names, brands, descriptions, and images
- **Image Upload**: Identify products from photos
- **Category Auto-Complete**: Smart category suggestions based on product data

### 👤 User Management & Settings
- **Authentication**: Secure login and registration with email verification
- **Social Login**: OAuth integration (Google) for quick access
- **Profile Management**: Comprehensive settings interface with tabbed organization
- **Address Management**: Store multiple addresses with default selection
- **Phone Numbers**: Manage multiple phone numbers with verification
- **Vendor Credentials**: Securely store API credentials for vendor integrations
- **Appearance Settings**: Light/Dark/System theme preferences
- **Preferred Vendors**: Set vendor preferences for faster item creation
- **Badge Collection**: View earned achievements and track progress

### 🔔 Notifications & Updates
- **Browser Notifications**: Real-time push notifications for important events
- **Email Notifications**: Invitation emails, alerts, and updates
- **PWA Support**: Install as a Progressive Web App on any device
- **Offline Indicators**: Clear visual feedback when offline
- **Auto-Sync**: Automatic background synchronization when reconnected

### 🚀 Performance & Infrastructure
- **Laravel Octane**: Powered by Swoole/FrankenPHP for blazing-fast performance
- **Server-Side Rendering (SSR)**: Improved SEO and initial page load times
- **Progressive Web App (PWA)**: Installable, works offline, feels native
- **Dark Mode**: Full dark mode support across all interfaces
- **Responsive Design**: Optimized for mobile, tablet, and desktop
- **Service Worker**: Background sync and offline caching

## Tech Stack

### Backend
- **Laravel 12** - PHP framework with latest features
- **PHP 8.4** - Modern PHP with performance improvements
- **MySQL/SQLite** - Flexible database support
- **Laravel Sanctum** - API authentication
- **Laravel Octane** - High-performance application server (Swoole/FrankenPHP)
- **Pest** - Modern testing framework
- **Mailjet** - Transactional email service

### Frontend
- **Vue 3** - Composition API and modern reactivity
- **Inertia.js v2** - SSR-enabled SPA without building an API
- **Tailwind CSS v4** - Latest utility-first CSS framework
- **Vite** - Lightning-fast frontend build tool
- **Lucide Icons** - Beautiful, consistent icon system
- **PWA/Workbox** - Progressive Web App capabilities
- **Vue Toastification** - Toast notifications

### Key Packages
- **Laravel Pint** - Code style formatting
- **Ziggy v2** - Laravel route helper for JavaScript
- **Intervention Image** - Image processing for product photos
- **Axios** - HTTP client for API requests
- **Canvas Confetti** - Celebration animations for achievements
- **Maska** - Input masking for phone numbers

## Installation

### Prerequisites
- PHP 8.4 or higher
- Composer
- Node.js & npm
- SQLite

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/acasekc/shopping-list-manager.git
   cd shopping-list-manager
   ```

2. **Install PHP dependencies**
   ```bash
   composer install
   ```

3. **Install Node dependencies**
   ```bash
   npm install
   ```

4. **Environment setup**
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

5. **Database setup**
   ```bash
   touch database/database.sqlite
   php artisan migrate
   php artisan db:seed --class=BadgeSeeder
   ```

6. **Build frontend assets**
   ```bash
   npm run build
   # Or for development with hot reload:
   npm run dev
   ```

7. **Start the development server**
   ```bash
   # Standard Laravel server:
   php artisan serve
   
   # Or with Octane for better performance:
   php artisan octane:start
   ```

8. **Access the application**
   - Open your browser to `http://localhost:8000`
   - Register a new account or login
   - Grant notification permissions for real-time updates
   - Install as PWA for offline support (optional)

## Configuration

### OAuth Social Login
To enable Google OAuth:

1. Create a Google Cloud project and OAuth credentials
2. Add to `.env`:
   ```env
   GOOGLE_CLIENT_ID=your-client-id
   GOOGLE_CLIENT_SECRET=your-client-secret
   GOOGLE_REDIRECT_URI="${APP_URL}/auth/social/google/callback"
   ```

### Walmart Integration
To enable Walmart integration features:

1. Obtain Walmart API credentials
2. Add credentials through the Profile settings page
3. Select your preferred Walmart store location

### Barcode Lookup Services
The app uses multiple barcode lookup services:
- **Open Food Facts**: Free, no API key required
- **UPCItemDB**: Requires API key (add to `.env` as `UPCITEMDB_API_KEY`)
- **Edamam**: Food database API (add credentials to `.env`)

### Email Notifications (Mailjet)
Configure Mailjet for sharing invitations and notifications:
```env
MAIL_MAILER=mailjet
MAILJET_APIKEY=your-api-key
MAILJET_APISECRET=your-api-secret
MAIL_FROM_ADDRESS=noreply@yourapp.com
MAIL_FROM_NAME="PantryLink"
```

### Laravel Octane
For high-performance serving:
```env
OCTANE_SERVER=swoole  # or frankenphp
```

Then run:
```bash
php artisan octane:install
php artisan octane:start
```

### PWA Configuration
The app is configured as a PWA out of the box. Service worker and manifest files are automatically generated during build. Users can install the app on any device for offline access.

## Testing

Run the test suite:
```bash
php artisan test
```

Run specific test files:
```bash
php artisan test --filter=Inventory
```

## Project Structure

```
├── app/
│   ├── Http/Controllers/     # API and web controllers
│   ├── Models/               # Eloquent models
│   ├── Policies/             # Authorization policies
│   ├── Services/             # Business logic services
│   ├── Notifications/        # Email notifications
│   └── Events/               # Application events
├── database/
│   ├── migrations/           # Database migrations
│   ├── factories/            # Model factories for testing
│   └── seeders/              # Database seeders (badges, categories, etc.)
├── resources/
│   ├── js/
│   │   ├── Components/       # Reusable Vue components
│   │   │   ├── Gamification/ # Achievement & badge components
│   │   │   └── Shared/       # Shared UI components
│   │   ├── Pages/            # Inertia page components
│   │   ├── Layouts/          # Layout components
│   │   ├── Composables/      # Vue composition functions
│   │   └── Stores/           # State management
│   ├── css/                  # Stylesheets (Tailwind)
│   └── views/                # Blade templates (SSR support)
├── routes/
│   ├── web.php               # Web routes (Inertia)
│   ├── api.php               # API routes
│   └── console.php           # Artisan commands
├── tests/
│   ├── Feature/              # Feature tests
│   └── Unit/                 # Unit tests
└── public/
    └── build/                # Compiled assets & service worker
```

## API Documentation

Comprehensive API documentation is available in [API_DOCUMENTATION.md](./API_DOCUMENTATION.md).

## Roadmap

### Recently Completed ✅
- [x] Crew system for family/team collaboration
- [x] Gamification with points, badges, and leaderboards
- [x] Location-based inventory management
- [x] Partial quantity transfers between locations
- [x] Progressive Web App (PWA) with offline support
- [x] Laravel Octane integration for performance
- [x] Server-side rendering (SSR) for better SEO
- [x] Dark mode support across entire application
- [x] Browser push notifications
- [x] Email invitation system for sharing
- [x] Manual shopping list item addition
- [x] Editable shopping list names
- [x] Multi-API barcode lookup system

### In Progress 🚧
- [ ] Enhanced analytics dashboard for household insights
- [ ] Export/import functionality for data portability
- [ ] Advanced filtering and search capabilities

### Planned Features 🗓️
- [ ] Recipe management with ingredient tracking
- [ ] Meal planning integration with shopping lists
- [ ] Price comparison across multiple stores (Walmart, Target, Amazon)
- [ ] Expense tracking and budgeting by category
- [ ] Native mobile apps (iOS & Android via React Native)
- [ ] Voice assistant integration (Alexa, Google Home, Siri)
- [ ] Subscription product tracking and auto-reorder
- [ ] Smart alerts for expiring items
- [ ] Nutrition tracking and dietary preferences
- [ ] Barcode scanner app for mobile devices
- [ ] Integration with more retailers (Target, Amazon Fresh, Kroger)
- [ ] Shared grocery expense splitting
- [ ] Scheduled shopping list generation
- [ ] AI-powered product recommendations

### Future Considerations 💡
- [ ] Blockchain-based product authenticity verification
- [ ] Community recipe sharing platform
- [ ] Sustainability tracking (carbon footprint, local sourcing)
- [ ] Smart home integration (IoT sensors for pantry monitoring)
- [ ] Augmented reality for pantry organization
- [ ] Multi-language support
- [ ] Currency conversion for international users

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Guidelines
1. Follow Laravel and Vue.js best practices
2. Write tests for new features (aim for >80% coverage)
3. Use Laravel Pint for code formatting: `vendor/bin/pint`
4. Follow existing code style and conventions
5. Update documentation as needed
6. Ensure all tests pass before submitting PR
7. Add dark mode support for any new UI components

### Running Tests
```bash
# Run all tests
php artisan test

# Run with coverage
php artisan test --coverage

# Run specific test suite
php artisan test --filter=Inventory
```

### Code Quality
```bash
# Format code with Pint
vendor/bin/pint

# Check for issues without fixing
vendor/bin/pint --test
```

## License

This project is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).

## Acknowledgments

Built with:
- [Laravel](https://laravel.com) - The PHP Framework for Web Artisans
- [Vue.js](https://vuejs.org) - The Progressive JavaScript Framework
- [Inertia.js](https://inertiajs.com) - The Modern Monolith
- [Tailwind CSS](https://tailwindcss.com) - A utility-first CSS framework
- [Laravel Octane](https://laravel.com/docs/octane) - Supercharged performance
- [Vite PWA](https://vite-pwa-org.netlify.app/) - Progressive Web App plugin

Special thanks to all contributors and the amazing Laravel & Vue communities!

## Documentation

Additional documentation available:
- [API Documentation](./API_DOCUMENTATION.md) - Comprehensive API reference
- [Laravel Cloud Deployment](./LARAVEL_CLOUD_DEPLOYMENT.md) - Deployment guide
- [PWA Setup Guide](./PWA_QUICK_START.md) - Progressive Web App configuration
- [Offline Mode](./OFFLINE_MODE_GUIDE.md) - Offline functionality details
- [Gamification System](./GAMIFICATION_PHASE_3B_FRONTEND_COMPLETE.md) - Achievement system
- [Crew System](./CREW_SYSTEM_FOUNDATION.md) - Collaboration features

## Support

For issues, questions, or contributions, please open an issue on GitHub.

---

**Made with ❤️ for better household management**

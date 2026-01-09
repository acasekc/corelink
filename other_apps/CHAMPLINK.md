# ChampLink

**Link your competition to your community**

Available at: [champlink.app](https://champlink.app)

A powerful tournament bracket management platform for competition organizers. Create and manage single elimination, double elimination, round robin, and group knockout tournaments with real-time updates and participant engagement. Built with Laravel 12, React 19, and TypeScript.

> **Production Ready** ✅ - Deployed on AWS EC2 with automated GitHub Actions deployment.

## Features

### 🏆 Tournament Bracket Management
- **Multiple Formats**: Single elimination, double elimination, round robin, and group knockout
- **Visual Bracket Editor**: Interactive bracket visualization with @g-loot/react-tournament-brackets
- **Automatic Seeding**: Smart participant seeding based on rankings or random assignment
- **Match Progression**: Automatic advancement of winners through bracket rounds
- **Third Place Matches**: Optional consolation matches for single elimination

### 📊 Competition Organization
- **Template System**: Pre-built templates for common sports and event types
- **Event Categories**: Organize by sports, esports, board games, and more
- **Customizable Settings**: Configure match rules, scoring, and advancement criteria
- **Multi-Stage Tournaments**: Group stages followed by knockout rounds

### 👥 Participant Management
- **Email Invitations**: Invite participants via email with automatic account linking
- **User Linking**: Automatically connect participants to registered users
- **Participant Profiles**: Track individual performance across competitions
- **Team Support**: Manage team-based competitions with roster management

### ⚡ Real-Time Updates
- **WebSocket Integration**: Live bracket updates via Laravel Reverb
- **Score Broadcasting**: Instant score updates visible to all viewers
- **Match Status**: Real-time match state changes (pending, in progress, completed)
- **Spectator Mode**: Public viewing for tournament followers

### 🔐 Authentication & Security
- **Laravel Sanctum**: Secure API token authentication
- **Google OAuth**: Quick sign-in with Google accounts
- **Role-Based Access**: Organizers, participants, and spectators
- **Competition Privacy**: Public or private tournament settings

### 📱 User Experience
- **Responsive Design**: Mobile-first bracket visualization
- **Dark Mode Ready**: Tailwind CSS v4 with theme support
- **Intuitive Navigation**: Clean, modern interface
- **Mobile Menu**: Hamburger navigation for smaller screens

### 📧 Notifications
- **Email Invitations**: Automated participant invitation emails
- **Match Notifications**: Updates when matches are scheduled or completed
- **Result Announcements**: Final standings and winner notifications

## Tech Stack

### Backend
- **Laravel 12** - PHP framework with latest features
- **PHP 8.4** - Modern PHP with performance improvements
- **MariaDB** - Reliable relational database
- **Laravel Sanctum** - API authentication
- **Laravel Reverb** - WebSocket server for real-time features
- **PHPUnit** - Testing framework

### Frontend
- **React 19** - Latest React with concurrent features
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS v4** - Latest utility-first CSS framework
- **Vite** - Lightning-fast frontend build tool
- **@g-loot/react-tournament-brackets** - Tournament bracket visualization
- **React Router** - Client-side routing

### Infrastructure
- **AWS EC2** - Production hosting
- **GitHub Actions** - CI/CD pipeline with auto-deploy
- **Nginx** - Web server
- **Let's Encrypt** - SSL certificates

### Key Packages
- **Laravel Pint** - Code style formatting
- **Laravel Socialite** - OAuth authentication
- **Axios** - HTTP client for API requests

## Installation

### Prerequisites
- PHP 8.4 or higher
- Composer
- Node.js & npm
- MariaDB or MySQL

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/acasekc/champlink.git
   cd champlink
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
   php artisan migrate
   php artisan db:seed
   ```

6. **Build frontend assets**
   ```bash
   npm run build
   # Or for development with hot reload:
   npm run dev
   ```

7. **Start the development server**
   ```bash
   php artisan serve
   ```

8. **Start WebSocket server (optional)**
   ```bash
   php artisan reverb:start
   ```

9. **Access the application**
   - Open your browser to `http://localhost:8000`
   - Register a new account or login with Google
   - Create your first competition

## Configuration

### OAuth Social Login
To enable Google OAuth:

1. Create a Google Cloud project and OAuth credentials
2. Add to `.env`:
   ```env
   GOOGLE_CLIENT_ID=your-client-id
   GOOGLE_CLIENT_SECRET=your-client-secret
   GOOGLE_REDIRECT_URI="${APP_URL}/auth/google/callback"
   ```

### WebSocket Configuration
For real-time bracket updates:
```env
BROADCAST_CONNECTION=reverb
REVERB_APP_ID=your-app-id
REVERB_APP_KEY=your-app-key
REVERB_APP_SECRET=your-app-secret
REVERB_HOST=localhost
REVERB_PORT=8080
```

### Email Configuration
Configure SMTP for participant invitations:
```env
MAIL_MAILER=smtp
MAIL_HOST=server269.web-hosting.com
MAIL_PORT=465
MAIL_USERNAME=no-reply@champlink.app
MAIL_PASSWORD=your-password
MAIL_ENCRYPTION=ssl
MAIL_FROM_ADDRESS=no-reply@champlink.app
MAIL_FROM_NAME="ChampLink"
```

### Queue Configuration
For background job processing (emails, notifications):
```env
QUEUE_CONNECTION=database
```

Then run the queue worker:
```bash
php artisan queue:work
```

## Testing

Run the test suite:
```bash
php artisan test
```

Run specific test files:
```bash
php artisan test --filter=BracketGenerator
```

## Project Structure

```
├── app/
│   ├── Http/Controllers/     # API and web controllers
│   │   └── Api/              # API controllers
│   ├── Models/               # Eloquent models
│   ├── Services/             # Business logic services
│   │   └── BracketGenerator.php  # Bracket generation logic
│   ├── Notifications/        # Email notifications
│   └── Events/               # Broadcasting events
├── database/
│   ├── migrations/           # Database migrations
│   ├── factories/            # Model factories for testing
│   └── seeders/              # Database seeders
├── resources/
│   ├── js/
│   │   ├── components/       # Reusable React components
│   │   ├── pages/            # Page components
│   │   ├── hooks/            # Custom React hooks
│   │   ├── lib/              # Utilities and API client
│   │   └── types.ts          # TypeScript definitions
│   ├── css/                  # Stylesheets (Tailwind)
│   └── views/                # Blade templates
├── routes/
│   ├── web.php               # Web routes
│   ├── api.php               # API routes
│   └── channels.php          # WebSocket channels
├── tests/
│   ├── Feature/              # Feature tests
│   └── Unit/                 # Unit tests
└── public/
    └── build/                # Compiled assets
```

## Database Schema

### Core Models
- **User** - Registered users with authentication
- **Competition** - Tournament/competition container
- **Participant** - Competition participants (linked to users or standalone)
- **Match** - Individual matches within a competition
- **BracketType** - Tournament format definitions
- **EventType** - Sport/activity categories
- **Template** - Pre-configured competition templates

### Key Relationships
- Competition → has many Participants
- Competition → has many Matches
- Competition → belongs to User (organizer)
- Participant → belongs to User (optional)
- Match → belongs to Competition
- Match → has two Participants (player1, player2)

## API Endpoints

### Authentication
- `POST /api/register` - User registration
- `POST /api/login` - User login
- `POST /api/logout` - User logout
- `GET /api/user` - Current user info

### Competitions
- `GET /api/competitions` - List user's competitions
- `POST /api/competitions` - Create competition
- `GET /api/competitions/{id}` - Get competition details
- `PUT /api/competitions/{id}` - Update competition
- `DELETE /api/competitions/{id}` - Delete competition
- `POST /api/competitions/{id}/generate-bracket` - Generate bracket
- `POST /api/competitions/{id}/participants` - Add participant

### Matches
- `PUT /api/matches/{id}` - Update match (scores, status)

### Templates
- `GET /api/bracket-types` - List bracket formats
- `GET /api/event-types` - List event categories
- `GET /api/templates` - List competition templates
- `GET /api/templates/{slug}` - Get template details

## Roadmap

### Completed ✅
- [x] Single elimination brackets
- [x] Double elimination brackets
- [x] Round robin tournaments
- [x] Group knockout (group stage + playoffs)
- [x] Real-time bracket updates via WebSockets
- [x] Google OAuth authentication
- [x] Participant email invitations
- [x] Automatic user linking for invited participants
- [x] Template system for quick setup
- [x] Mobile-responsive design
- [x] Terms of Service and Privacy Policy pages

### In Progress 🚧
- [ ] SMTP email delivery for invitations
- [ ] Enhanced spectator view
- [ ] Tournament sharing and embedding
- [ ] **Partial Seeding for Brackets**: Ability to seed some or all participants in elimination brackets (8-man, 16-man, etc.). Seed top competitors manually, then randomly assign remaining unseeded participants to fill the bracket.

### Planned Features 🗓️
- [ ] Swiss system tournaments
- [ ] Custom scoring systems
- [ ] Team management with rosters
- [ ] Match scheduling with calendar integration
- [ ] Export brackets as images/PDFs
- [ ] Tournament statistics and analytics
- [ ] Multi-admin support for competitions
- [ ] Bracket predictions for spectators
- [ ] Integration with streaming platforms (Twitch, YouTube)

### Future Considerations 💡
- [ ] Native mobile apps (iOS & Android via React Native)
- [ ] League management (seasons, standings)
- [ ] Player rankings and ELO systems
- [ ] Prize pool management
- [ ] Sponsor integration and branding
- [ ] API for third-party integrations
- [ ] White-label solutions for organizations
- [ ] Multi-language support

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Guidelines
1. Follow Laravel and React best practices
2. Write tests for new features
3. Use Laravel Pint for PHP code formatting: `vendor/bin/pint`
4. Follow TypeScript strict mode conventions
5. Update documentation as needed
6. Ensure all tests pass before submitting PR

### Running Tests
```bash
# Run all tests
php artisan test

# Run specific test suite
php artisan test --filter=BracketGenerator
```

### Code Quality
```bash
# Format PHP code with Pint
vendor/bin/pint

# Check for issues without fixing
vendor/bin/pint --test

# Build frontend
npm run build
```

## License

This project is proprietary software owned by CoreLink Development LLC.

## Acknowledgments

Built with:
- [Laravel](https://laravel.com) - The PHP Framework for Web Artisans
- [React](https://react.dev) - The Library for Web and Native User Interfaces
- [Tailwind CSS](https://tailwindcss.com) - A utility-first CSS framework
- [Laravel Reverb](https://laravel.com/docs/reverb) - WebSocket server for Laravel
- [@g-loot/react-tournament-brackets](https://github.com/g-loot/react-tournament-brackets) - Tournament bracket visualization

Special thanks to the amazing Laravel & React communities!

## Support

For issues, questions, or contributions, please contact CoreLink Development LLC.

---

**Made with ❤️ for competitive communities everywhere**

© 2026 CoreLink Development LLC. All rights reserved.

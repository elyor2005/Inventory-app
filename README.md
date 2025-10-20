# Inventory Management System

A modern, full-stack inventory management application built with Next.js 15, Prisma, MongoDB, and TypeScript. This system provides comprehensive inventory tracking with custom fields, collaborative features, and powerful search capabilities.

## Features

### Core Functionality
- **Inventory Management**: Create and manage multiple inventory collections with custom metadata
- **Custom Fields**: Define up to 15 custom fields per inventory (5 types: text, multi-line, number, date, boolean)
- **Custom ID Generation**: Automatically generate unique item IDs with configurable formats (prefix, counter, padding, suffix)
- **Item Tracking**: Full CRUD operations for inventory items with custom field values
- **Tags & Categories**: Organize inventories and items with tags and predefined categories

### Collaboration Features
- **Comments & Discussions**: Nested comment threads with Markdown support
- **Likes System**: Like items and view who liked what
- **Public/Private Inventories**: Control visibility and access to your inventories
- **Real-time Updates**: Live updates for comments and likes

### Search & Discovery
- **Full-Text Search**: Search across inventories and items with advanced filtering
- **Category Filtering**: Filter by equipment, furniture, books, documents, electronics, and more
- **Tag-based Search**: Find items by tags quickly
- **Recent Searches**: Track and revisit previous searches

### User Management
- **Authentication**: Google OAuth integration with Better Auth
- **Admin Panel**: Manage users, roles, and permissions
- **Role-Based Access Control**: User and admin roles with different permissions
- **User Blocking**: Block/unblock users from the admin panel

### UI/UX
- **Dark Mode**: Full dark mode support with system preference detection
- **Internationalization**: Multi-language support (English, Uzbek)
- **Responsive Design**: Mobile-first, fully responsive layout
- **Markdown Support**: Rich text formatting in descriptions and comments
- **Image Upload**: Cloudflare R2 integration for image storage with drag-and-drop

## Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **React 19** - Latest React features
- **next-themes** - Dark mode implementation
- **next-intl** - Internationalization
- **react-markdown** - Markdown rendering

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **Prisma** - Modern ORM for database access
- **MongoDB** - NoSQL database with Atlas
- **Better Auth** - Authentication library
- **Cloudflare R2** - S3-compatible object storage

### Additional Tools
- **ESLint** - Code linting
- **AWS SDK** - S3/R2 client
- **DND Kit** - Drag and drop functionality

## Getting Started

### Prerequisites
- Node.js 18+ or Bun
- MongoDB database (MongoDB Atlas recommended)
- Google OAuth credentials
- Cloudflare R2 bucket (for image uploads)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd inventory-app
```

2. Install dependencies:
```bash
npm install
# or
bun install
```

3. Set up environment variables:
Create a `.env` file in the root directory with the following variables:

```env
# Database
DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/inventory-db"

# Authentication (Better Auth)
BETTER_AUTH_SECRET="your-secret-key-here"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Cloudflare R2 (Image Storage)
R2_ACCOUNT_ID="your-cloudflare-account-id"
R2_ACCESS_KEY_ID="your-r2-access-key"
R2_SECRET_ACCESS_KEY="your-r2-secret-key"
R2_BUCKET_NAME="your-bucket-name"
R2_PUBLIC_URL="https://your-public-url.r2.dev"
```

4. Set up the database:
```bash
npx prisma generate
npx prisma db push
```

5. Run the development server:
```bash
npm run dev
# or
bun dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
inventory-app/
├── app/                      # Next.js app directory
│   ├── api/                  # API routes
│   │   ├── admin/           # Admin endpoints
│   │   ├── auth/            # Authentication
│   │   ├── inventories/     # Inventory CRUD
│   │   ├── search/          # Search functionality
│   │   └── upload/          # Image upload
│   ├── admin/               # Admin panel page
│   ├── explore/             # Public inventories
│   ├── inventories/         # Inventory pages
│   │   ├── [id]/           # Single inventory view
│   │   │   ├── edit/       # Edit inventory
│   │   │   └── items/      # Items management
│   │   └── new/            # Create inventory
│   ├── search/              # Search page
│   └── page.tsx             # Home page
├── components/              # React components
│   ├── auth/               # Authentication components
│   ├── layout/             # Layout components
│   └── providers/          # Context providers
├── lib/                     # Utility functions
│   ├── auth.ts             # Auth configuration
│   ├── prisma.ts           # Prisma client
│   ├── admin.ts            # Admin utilities
│   └── r2-client.ts        # Cloudflare R2 client
├── messages/               # Translation files
│   ├── en.json             # English translations
│   └── uz.json             # Uzbek translations
├── prisma/
│   └── schema.prisma       # Database schema
└── public/                 # Static assets
```

## Database Schema

The application uses MongoDB with the following models:

- **User**: User accounts with authentication
- **Session**: User sessions
- **Account**: OAuth account linking
- **Inventory**: Inventory collections
- **Item**: Individual items within inventories
- **Comment**: Item comments with nested replies
- **Like**: Item likes
- **Verification**: Email verification tokens

## API Routes

### Public Routes
- `POST /api/auth/[...all]` - Authentication endpoints

### Protected Routes
- `GET /api/inventories` - List all accessible inventories
- `POST /api/inventories` - Create new inventory
- `GET /api/inventories/[id]` - Get inventory details
- `PUT /api/inventories/[id]` - Update inventory
- `DELETE /api/inventories/[id]` - Delete inventory
- `GET /api/inventories/[id]/items` - List items
- `POST /api/inventories/[id]/items` - Create item
- `GET /api/inventories/[id]/items/[itemId]` - Get item
- `PUT /api/inventories/[id]/items/[itemId]` - Update item
- `DELETE /api/inventories/[id]/items/[itemId]` - Delete item
- `GET /api/search` - Search inventories and items

### Admin Routes
- `GET /api/admin/users` - List all users
- `DELETE /api/admin/users/[id]` - Delete user
- `POST /api/admin/users/[id]/block` - Block/unblock user
- `POST /api/admin/users/[id]/toggle-admin` - Toggle admin role

## Features in Detail

### Custom Fields System
Define custom fields for each inventory with 5 supported types:
- **String**: Single-line text input
- **Text**: Multi-line textarea
- **Integer**: Numeric values
- **Date**: Date picker
- **Boolean**: Yes/No checkbox

Each field can be marked as required and has a custom label.

### Custom ID Generation
Configure automatic ID generation with:
- Optional prefix text
- Counter with configurable start value
- Padding (e.g., 001, 002, 003)
- Optional suffix text

Example: `INV-001`, `ITEM-2024-0042`, `EQ-00123`

### Search Functionality
- Full-text search across inventory titles, descriptions, and tags
- Item name and tag searching
- Category filtering
- Date range filtering
- Recent search history
- Type filtering (inventories only, items only, or all)

## Development

### Running Tests
```bash
npm run test
# or
bun test
```

### Linting
```bash
npm run lint
# or
bun lint
```

### Build for Production
```bash
npm run build
npm start
# or
bun run build
bun start
```

## Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Other Platforms
The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- Render
- Self-hosted with Docker

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | MongoDB connection string | Yes |
| `BETTER_AUTH_SECRET` | Secret for session encryption | Yes |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | Yes |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | Yes |
| `R2_ACCOUNT_ID` | Cloudflare account ID | Yes |
| `R2_ACCESS_KEY_ID` | R2 access key | Yes |
| `R2_SECRET_ACCESS_KEY` | R2 secret key | Yes |
| `R2_BUCKET_NAME` | R2 bucket name | Yes |
| `R2_PUBLIC_URL` | Public URL for R2 bucket | Yes |

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Support

For issues and questions, please open an issue on GitHub.

## Roadmap

- [ ] Export/Import functionality (CSV, JSON)
- [ ] Bulk operations for items
- [ ] Activity logging and audit trail
- [ ] Email notifications
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)
- [ ] Backup and restore functionality
- [ ] API documentation with Swagger

## Acknowledgments

Built with:
- [Next.js](https://nextjs.org/)
- [Prisma](https://www.prisma.io/)
- [Better Auth](https://www.better-auth.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [MongoDB](https://www.mongodb.com/)
- [Cloudflare R2](https://www.cloudflare.com/products/r2/)

# ShipTrack - Universal Package Tracking System

A modern, full-stack shipping tracking application that provides a unified interface for tracking packages across all major US carriers. Built with Next.js, Prisma, and TypeScript.

## 🚀 Features

- **Real Carrier API Integration**: Live tracking through FedEx API (sandbox)
- **Major Carrier Support**: Track packages from FedEx, USPS, and UPS
- **Smart Carrier Detection**: Automatically detects carrier based on tracking number format
- **Real-time Tracking**: Get up-to-date package status and location information
- **Graceful Fallback**: Automatic fallback to mock data when APIs are unavailable
- **User Authentication**: Secure JWT-based authentication system with tiered access
- **Tracking History**: Save and view tracking history for authenticated users (30 minutes cache)
- **Modern UI**: Beautiful, responsive interface built with Tailwind CSS
- **Type Safety**: Full TypeScript support throughout the application
- **Multi-Platform Deployment**: Support for both Vercel and Docker deployments

## 🔐 Authentication Strategy

ShipTrack implements a **tiered authentication system** that provides the best user experience:

### **Public Access (No Authentication Required)**

- ✅ Basic package tracking functionality
- ✅ Universal carrier support
- ✅ Real-time tracking information
- ✅ Smart carrier detection

### **Enhanced Features (Authentication Required)**

- 🔒 **Tracking History**: Save all your tracking searches
- 🔒 **Personalized Experience**: User-specific data and preferences

This approach ensures that:

- **Anyone can track packages** without creating an account (like real carrier websites)
- **Users are incentivized to sign up** for enhanced features
- **The system scales** from casual users to power users

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: JWT with bcrypt password hashing
- **Validation**: Zod schema validation
- **Testing**: Jest (ready for implementation)
- **Containerization**: Docker
- **Deployment**: Vercel (recommended) or Docker containers

## 📋 Prerequisites

- Node.js 18+
- npm or yarn
- Git
- Docker (for containerized deployment)

## 🚀 Quick Start

### Option 1: Local Development (Recommended for Development)

#### 1. Clone the Repository

```bash
git clone git@github.com:Hamil1/ShipTrack.git
cd ShipTrack
```

#### 2. Install Dependencies

```bash
npm install
```

#### 3. Set Up Environment Variables

Copy the example environment file and configure it for your setup:

```bash
cp .env.example .env
```

**Generate a Secure JWT Secret:**

Before editing the `.env` file, generate a secure JWT secret:

```bash
node -e "console.log('JWT_SECRET=\"' + require('crypto').randomBytes(64).toString('hex') + '\"')"
```

Copy the output and use it as your `JWT_SECRET` value in the `.env` file.

Then edit the `.env` file with your specific values. See `.env.example` for all available environment variables and their descriptions.

**Important Notes**:

- If you're using Docker, the database URL will be automatically configured by the Docker Compose environment variables.
- Carrier API keys are optional. The app will use mock data if APIs are not configured.
- **USPS API**: Has geographic restrictions and may not be available outside the US.
- **JWT_SECRET**: Must be a secure, random string. Never use the default placeholder value in production.

#### 4. Set Up Database

```bash
# Generate Prisma client
npx prisma generate

# For Local Development (without Docker)
# You'll need PostgreSQL installed locally, then:
npx prisma db push

# For Docker Development
./scripts/init-db.sh dev
```

#### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Option 2: Docker Development Environment

#### 1. Clone and Navigate

```bash
git clone git@github.com:Hamil1/ShipTrack.git
cd ShipTrack
```

#### 2. Configure JWT Secret

Use the same JWT secret you generated in the earlier step for your Docker environment. Update the `JWT_SECRET` value in your `docker-compose.yml` file or `.env` file as needed.

#### 3. Initialize Development Database

```bash
# Initialize the development database
./scripts/init-db.sh
```

#### 4. Run with Docker (Recommended)

```bash
# Using the convenience script
./scripts/docker-dev.sh

# Or manually
docker compose up --build
```

Access the app at [http://localhost:3001](http://localhost:3001)
Access the database at localhost:5433

## 🐳 Docker Commands

### Development

```bash
# Initialize development database
./scripts/init-db.sh

# Start development environment
docker compose up --build

# Start development environment (detached)
docker compose up --build -d

# View logs
docker compose logs -f shiptrack-app

# Stop development environment
docker compose down

# Stop development environment and remove orphaned containers
docker compose down --remove-orphans
```

## 📚 API Documentation

### Authentication Endpoints

#### POST /api/auth/register

Register a new user account.

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    "token": "jwt_token_here"
  },
  "message": "User registered successfully"
}
```

#### POST /api/auth/login

Authenticate a user and receive a JWT token.

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    "token": "jwt_token_here"
  },
  "message": "Login successful"
}
```

### Tracking Endpoints

#### POST /api/track

Universal tracking endpoint that works for both authenticated and non-authenticated users.

**Request Body:**

```json
{
  "trackingNumber": "1Z999AA1234567890"
}
```

**Headers (optional):**

```
Authorization: Bearer <jwt_token>
```

**Response (Non-authenticated):**

```json
{
  "success": true,
  "data": {
    "trackingNumber": "1Z999AA1234567890",
    "carrier": "UPS",
    "status": "In Transit",
    "location": "Memphis, TN",
    "timestamp": "2024-01-01T12:00:00.000Z",
    "description": "Package in transit to next facility",
    "events": [...]
  },
  "message": "Tracking information retrieved for UPS (Sign up for enhanced features)"
}
```

**Response (Authenticated):**

```json
{
  "success": true,
  "data": {
    "trackingNumber": "1Z999AA1234567890",
    "carrier": "UPS",
    "status": "In Transit",
    "location": "Memphis, TN",
    "timestamp": "2024-01-01T12:00:00.000Z",
    "description": "Package in transit to next facility",
    "events": [...],
    "userFeatures": {
      "historySaved": true,
      "enhancedUpdates": true
    }
  },
  "message": "Tracking information retrieved for UPS (Enhanced features enabled)"
}
```

#### GET /api/track/[trackingNumber]

Get cached tracking information for a specific tracking number. This endpoint implements intelligent caching:

1. **Personal Cache**: For authenticated users, checks their personal tracking history first
2. **Global Cache**: Falls back to any user's recent tracking data
3. **Freshness Check**: Returns cached data if it's less than 30 minutes old
4. **Carrier API**: Calls carrier API if no fresh cached data exists
5. **Auto-Save**: Saves new tracking data to user's history if authenticated

**Headers (optional):**

```
Authorization: Bearer <jwt_token>
```

**Response (Cached):**

```json
{
  "success": true,
  "data": {
    "trackingNumber": "1Z999AA1234567890",
    "carrier": "UPS",
    "status": "In Transit",
    "location": "Memphis, TN",
    "timestamp": "2024-01-01T12:00:00.000Z",
    "description": "Package in transit to next facility",
    "events": [...]
  },
  "message": "Cached tracking information retrieved for UPS"
}
```

**Response (Fresh):**

```json
{
  "success": true,
  "data": {
    "trackingNumber": "1Z999AA1234567890",
    "carrier": "UPS",
    "status": "In Transit",
    "location": "Memphis, TN",
    "timestamp": "2024-01-01T12:00:00.000Z",
    "description": "Package in transit to next facility",
    "events": [...]
  },
  "message": "Fresh tracking information retrieved for UPS"
}
```

#### GET /api/track/history

Get all tracking history for the authenticated user (requires authentication).

**Headers (required):**

```
Authorization: Bearer <jwt_token>
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "history_id",
      "trackingNumber": "1Z999AA1234567890",
      "carrier": "UPS",
      "status": "In Transit",
      "location": "Memphis, TN",
      "timestamp": "2024-01-01T12:00:00.000Z",
      "description": "Package in transit to next facility",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "message": "Tracking history retrieved successfully"
}
```

#### GET /api/track/history/[trackingNumber]

Get full tracking history for a specific tracking number (requires authentication).

**Headers (required):**

```
Authorization: Bearer <jwt_token>
```

## 🔍 Supported Carriers

| Carrier | Tracking Number Format   | Example                | API Status                 |
| ------- | ------------------------ | ---------------------- | -------------------------- |
| FedEx   | 12-14 digits             | 123456789012           | ✅ Real API                |
| USPS    | 9xxx + 15-18 digits      | 9400100000000000000000 | ⚠️ Geographic Restrictions |
| UPS     | 1Z + 6 chars + 10 digits | 1Z999AA1234567890      | ⚠️ Credentials Required    |

## 🏗️ Project Structure

```
ShipTrack/
├── .github/                          # GitHub Actions workflows
│   └── workflows/
│       └── deploy.yml
├── .husky/                           # Git hooks configuration
├── config/                           # Carrier configuration files
│   └── carriers/
│       ├── fedex.json
│       ├── ups.json
│       └── usps.json
├── docs/                             # Documentation
│   ├── CARRIER_ONBOARDING_README.md
│   ├── DEPLOYMENT.md
│   ├── README.md
│   ├── TRACKING_STATUSES.md
│   └── USPS_API_TROUBLESHOOTING.md
├── prisma/                           # Database schema and migrations
│   └── schema.prisma
├── public/                           # Static assets
│   ├── carriers/                     # Carrier logo SVGs
│   │   ├── fedex.svg
│   │   ├── ups.svg
│   │   └── usps.svg
│   ├── favicon.ico
│   └── ...
├── scripts/                          # Development and deployment scripts
│   ├── cleanup.sh
│   ├── docker-dev-hot-reload.sh
│   ├── docker-dev.sh
│   ├── docker-prod.sh
│   └── init-db.sh
├── src/                              # Application source code
│   ├── app/                          # Next.js App Router
│   │   ├── api/                      # API routes
│   │   │   ├── auth/                 # Authentication endpoints
│   │   │   │   ├── login/
│   │   │   │   ├── register/
│   │   │   │   └── validate/
│   │   │   └── track/                # Tracking endpoints
│   │   │       ├── [trackingNumber]/
│   │   │       └── history/
│   │   │           └── [trackingNumber]/
│   │   ├── favicon.ico
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/                   # React components
│   │   ├── common/                   # Reusable UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── CarrierBadge.tsx
│   │   │   ├── ErrorDisplay.tsx
│   │   │   ├── Input.tsx
│   │   │   └── index.ts
│   │   ├── AuthPrompt.tsx
│   │   ├── Header.tsx
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx
│   │   ├── TrackingForm.tsx
│   │   ├── TrackingHistory.tsx
│   │   ├── TrackingResult.tsx
│   │   └── UserMenu.tsx
│   ├── contexts/                     # React contexts
│   │   └── AuthContext.tsx
│   ├── lib/                          # Library configurations
│   │   └── prisma.ts
│   ├── providers/                    # Carrier API providers
│   │   ├── BaseCarrierProvider.ts
│   │   ├── FedExProvider.ts
│   │   ├── UPSProvider.ts
│   │   └── USPSProvider.ts
│   ├── services/                     # Business logic services
│   │   ├── CarrierRegistry.ts
│   │   └── TrackingService.ts
│   ├── types/                        # TypeScript type definitions
│   │   ├── carrier.ts
│   │   └── index.ts
│   └── utils/                        # Utility functions
│       ├── __tests__/                # Test files
│       │   ├── auth.test.ts
│       │   ├── carrierDetection.test.ts
│       │   └── trackingService.test.ts
│       ├── auth.ts
│       ├── carrierDetection.ts
│       ├── carrierDetection.test.ts
│       ├── carrierLogos.ts
│       └── trackingService.ts
├── .dockerignore
├── .env                              # Environment variables
├── .env.example                      # Environment variables template
├── .gitignore
├── docker-compose.yml                # Docker Compose configuration
├── Dockerfile                        # Production Dockerfile
├── Dockerfile.dev                    # Development Dockerfile
├── eslint.config.mjs                 # ESLint configuration
├── jest.config.js                    # Jest test configuration
├── jest.setup.js                     # Jest setup file
├── next-env.d.ts                     # Next.js TypeScript definitions
├── next.config.ts                    # Next.js configuration
├── package.json                      # Node.js dependencies and scripts
├── postcss.config.mjs                # PostCSS configuration
├── README.md                         # Project documentation
├── tsconfig.json                     # TypeScript configuration
├── tsconfig.tsbuildinfo              # TypeScript build info
└── vercel.json                       # Vercel deployment configuration
```

## 🧪 Testing

The application includes comprehensive test coverage for critical functionality:

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 🔧 Development

### Database Management

```bash
# View database in Prisma Studio
npx prisma studio

# Reset database
npx prisma db push --force-reset

# Generate migration
npx prisma migrate dev --name <migration_name>
```

### Code Quality

```bash
# Run ESLint
npm run lint

# Run TypeScript check
npm run type-check

# Format code
npm run format

# Run tests (automatically runs before git commit)
npm test
```

### Git Hooks

The project uses Husky to ensure code quality:

- **Pre-commit**: Runs tests before each commit

This ensures that broken code cannot be committed to the repository.

## 🐛 Known Issues & Limitations

- **API Integration Status**:
  - ✅ FedEx: Full API integration working (sandbox)
  - ⚠️ USPS: Geographic restrictions may apply (US-based users only)
  - ⚠️ UPS: Requires valid OAuth credentials
- **Caching**: Basic caching implemented. Consider Redis for production caching.
- **Real-time Updates**: Polling-based updates. Consider WebSockets for real-time functionality.

---

**Note**: This is a technical assessment project. For production use, additional security measures, error handling, and carrier API integrations would be required.


# How to test the app:
<img width="1442" height="970" alt="image" src="https://github.com/user-attachments/assets/4325d9f3-fb5c-4710-9403-de913e20cc14" />
<img width="1351" height="969" alt="image" src="https://github.com/user-attachments/assets/f0926a88-1c49-41d4-bb8d-3e39dec402b4" />
<img width="1576" height="1075" alt="image" src="https://github.com/user-attachments/assets/aa5f9e3c-5095-4492-b332-3f059c0ef561" />
<img width="1576" height="982" alt="image" src="https://github.com/user-attachments/assets/b21318c1-b21a-4b05-bd72-051d0c3ebd27" />

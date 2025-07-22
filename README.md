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
- **Database**: PostgreSQL (development and production)
- **Authentication**: JWT with bcrypt password hashing
- **Validation**: Zod schema validation
- **Testing**: Jest (ready for implementation)
- **Containerization**: Docker with multi-stage builds
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
git clone <repository-url>
cd ShipTrack
```

#### 2. Install Dependencies

```bash
npm install
```

#### 3. Set Up Environment Variables

Create a `.env` file in the root directory:

```env
# For Local Development (without Docker)
DATABASE_URL="postgresql://shiptrack:shiptrack_password@localhost:5432/shiptrack_dev"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"

# Carrier API Keys (Optional - for real tracking data)
# Get free API access at: https://developer.fedex.com/, https://www.usps.com/business/web-tools-apis/, and https://www.ups.com/developers
FEDEX_CLIENT_ID="your-fedex-client-id"
FEDEX_CLIENT_SECRET="your-fedex-client-secret"
USPS_WEB_TOOLS_USER_ID="your-usps-web-tools-user-id"
UPS_CLIENT_ID="your-ups-client-id"
UPS_CLIENT_SECRET="your-ups-client-secret"

# Note: USPS API has geographic restrictions and may not be available outside the US
# If you encounter "address not eligible" errors, consider using FedEx or UPS APIs instead
```

**Note**:

- If you're using Docker, the database URL will be automatically configured by the Docker Compose environment variables.
- Carrier API keys are optional. The app will use mock data if APIs are not configured.
- **USPS API**: Has geographic restrictions and may not be available outside the US. See [USPS_API_TROUBLESHOOTING.md](./USPS_API_TROUBLESHOOTING.md) for solutions.

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
git clone <repository-url>
cd ShipTrack
```

#### 2. Initialize Development Database

```bash
# Initialize the development database
./scripts/init-db.sh dev
```

#### 3. Run with Docker (Recommended)

```bash
# Using the convenience script
./scripts/docker-dev.sh

# Or manually
docker compose --profile dev up --build
```

Access the app at [http://localhost:3001](http://localhost:3001)
Access the database at localhost:5433



## 🐳 Docker Commands

### Development

```bash
# Initialize development database
./scripts/init-db.sh dev

# Start development environment
docker compose --profile dev up --build

# Start development environment (detached)
docker compose --profile dev up --build -d

# View logs
docker compose logs -f shiptrack-app-dev

# Stop development environment
docker compose --profile dev down

# Stop development environment and remove orphaned containers
docker compose --profile dev down --remove-orphans
```


## 🚀 Deployment Options

### Vercel Deployment (Recommended for Production)

1. **Push your code to GitHub**
2. **Connect your repository to Vercel**
3. **Set environment variables in Vercel dashboard**
4. **Deploy automatically on push**

**Environment Variables for Vercel:**

```env
DATABASE_URL="postgresql://user:password@host:port/database"
JWT_SECRET="your-production-jwt-secret"
NEXTAUTH_SECRET="your-production-nextauth-secret"
NEXTAUTH_URL="https://your-domain.com"

# Carrier API Keys (Optional - for real tracking data)
FEDEX_CLIENT_ID="your-production-fedex-client-id"
FEDEX_CLIENT_SECRET="your-production-fedex-client-secret"
USPS_WEB_TOOLS_USER_ID="your-production-usps-web-tools-user-id"
UPS_CLIENT_ID="your-production-ups-client-id"
UPS_CLIENT_SECRET="your-production-ups-client-secret"
```

**Note**:

- For Vercel deployment, you'll need to set up a PostgreSQL database (e.g., using Vercel Postgres, Supabase, or any PostgreSQL provider).
- Carrier API keys are optional. The app will use mock data if APIs are not configured.

### Docker Deployment (For Other Platforms)

#### AWS ECS/Fargate

```bash
# Build and push to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin your-account.dkr.ecr.us-east-1.amazonaws.com
docker build -t shiptrack .
docker tag shiptrack:latest your-account.dkr.ecr.us-east-1.amazonaws.com/shiptrack:latest
docker push your-account.dkr.ecr.us-east-1.amazonaws.com/shiptrack:latest
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
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   ├── login/
│   │   │   │   └── register/
│   │   │   └── track/
│   │   │       ├── [trackingNumber]/
│   │   │       └── history/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── TrackingForm.tsx
│   │   └── TrackingResult.tsx
│   ├── lib/
│   │   └── prisma.ts
│   ├── types/
│   │   └── index.ts
│   └── utils/
│       ├── auth.ts
│       ├── carrierDetection.ts
│       └── trackingService.ts
├── prisma/
│   └── schema.prisma
├── public/
├── .env
├── package.json
└── README.md
```

## 🧪 Testing

The application includes comprehensive test coverage for critical functionality:

### Carrier Detection Tests

```bash
npm test -- carrierDetection
```

### API Endpoint Tests

```bash
npm test -- api
```

### Tracking Service Tests

```bash
npm test -- trackingService
```

### Carrier API Integration Tests

Test the real carrier API integrations:


# In another terminal, test carrier APIs
```bash
npm run test:carriers
```

````

This will test all carriers and show which ones are using real APIs vs mock data.

## 🔧 Development

### Database Management

```bash
# View database in Prisma Studio
npx prisma studio

# Reset database
npx prisma db push --force-reset

# Generate migration
npx prisma migrate dev --name <migration_name>
````

### Code Quality

```bash
# Run ESLint
npm run lint

# Run TypeScript check
npm run type-check

# Format code
npm run format
```

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically on push

### Environment Variables for Production

```env
DATABASE_URL="postgresql://user:password@host:port/database"
JWT_SECRET="your-production-jwt-secret"
NEXTAUTH_SECRET="your-production-nextauth-secret"
NEXTAUTH_URL="https://your-domain.com"
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🐛 Known Issues & Limitations

- **API Integration Status**:
  - ✅ FedEx: Full API integration working (sandbox)
  - ⚠️ USPS: Geographic restrictions may apply (US-based users only)
  - ⚠️ UPS: Requires valid OAuth credentials
- **Caching**: Basic caching implemented. Consider Redis for production caching.
- **Real-time Updates**: Polling-based updates. Consider WebSockets for real-time functionality.

---

**Note**: This is a technical assessment project. For production use, additional security measures, error handling, and carrier API integrations would be required.

## Todos:

- [ ] What are the statuses for the tracking number?
- [ ] Do we need the JWT secret in the .env file?
- [ ] Double check that these carriers are not in the app: 'DHL', 'Amazon', 'OnTrac' and remove any references to them in the app.
- [ ] Are we specifying in the README that if we are not using docker we should hit the 3000 port and if we are using it we should hit the 3001 for the frontend?
- [ ] Chec if we are using rate limit somewhere in the app and remove it.
- [ ] Do we need a production database in the Docker Compose file?
- [ ] Are the endpoints documentation in the README up to date?
- [ ] Are we re-using components in the app by using the composition pattern?
- [ ] Are the unit tests up to date?
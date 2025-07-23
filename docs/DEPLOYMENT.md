# Vercel Deployment Guide

ShipTrack can be deployed to Vercel with automatic CI/CD pipeline.

## 🚀 Vercel Deployment

### Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Push your code to GitHub
3. **Database**: Set up a PostgreSQL database (Vercel Postgres recommended)

### Setup Steps

#### 1. Connect to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Configure environment variables

#### 2. Environment Variables

Set these environment variables in Vercel:

```bash
# Database
DATABASE_URL="your-postgresql-connection-string"

# JWT
JWT_SECRET="your-super-secret-jwt-key"

# NextAuth
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="https://your-domain.vercel.app"

# Carrier APIs (Optional)
FEDEX_CLIENT_ID="your-fedex-client-id"
FEDEX_CLIENT_SECRET="your-fedex-client-secret"
USPS_WEB_TOOLS_USER_ID="your-usps-user-id"
UPS_CLIENT_ID="your-ups-client-id"
UPS_CLIENT_SECRET="your-ups-client-secret"
```

#### 3. Database Setup

**Option A: Vercel Postgres (Recommended)**

1. In your Vercel project, go to "Storage"
2. Create a new Postgres database
3. Copy the connection string to `DATABASE_URL`

**Option B: External Database**

- Use any PostgreSQL provider (Supabase, Railway, etc.)
- Add the connection string to `DATABASE_URL`

#### 4. Deploy

1. Push to `main` branch
2. Vercel will automatically deploy
3. Check deployment status in Vercel dashboard

## 🔄 CI/CD Pipeline

The project includes GitHub Actions for automated deployment:

### Required Secrets

Add these secrets to your GitHub repository:

```bash
VERCEL_TOKEN="your-vercel-token"
VERCEL_ORG_ID="your-vercel-org-id"
VERCEL_PROJECT_ID="your-vercel-project-id"
```

### Manual Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```
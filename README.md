# BrandLens Deployment Guide

Comprehensive deployment guide for BrandLens - the AI-powered brand visibility tracking platform.

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Environment Variables](#environment-variables)
4. [Local Development Setup](#local-development-setup)
5. [Production Deployment on Fly.io](#production-deployment-on-flyio)
6. [CI/CD Pipeline](#cicd-pipeline)
7. [Database Migrations](#database-migrations)
8. [Monitoring & Logging](#monitoring--logging)
9. [Troubleshooting](#troubleshooting)

## Overview

BrandLens is a multi-service application consisting of:

- **Frontend**: Next.js application served by Nginx
- **Backend**: Fastify API server (Node.js + TypeScript)
- **Database**: PostgreSQL 15
- **Cache**: Redis 7
- **Reverse Proxy**: Nginx

## Prerequisites

Before deploying, ensure you have:

- **Docker** & **Docker Compose** (v20.10+)
- **Node.js** 20+ and **npm** 10+
- **Fly.io CLI** (`flyctl`) for production deployment
- **Git** for version control
- **API Keys** for third-party services:
 - OpenAI API key
 - Anthropic API key
 - Google AI API key
  - Resend API key (for emails)
 - Sentry DSN (for error tracking)

## Environment Variables

Create a `.env` file in the project root:

```bash
# Application
NODE_ENV=production
PORT=3001

# Database
DATABASE_URL=postgresql://brandlens:your_secure_password@localhost:5432/brandlens?schema=public
POSTGRES_USER=brandlens
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=brandlens

# Redis
REDIS_URL=redis://localhost:6379

# Authentication
JWT_SECRET=your_very_secure_jwt_secret_min_32_chars

# AI Provider API Keys
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_API_KEY=AIza...

# Email Service
RESEND_API_KEY=re_...

# Error Tracking
SENTRY_DSN=https://...@sentry.io/...

# Frontend Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:3000

# Optional Configuration
LOG_LEVEL=info
RATE_LIMIT_MAX=100
```

### Generate Secure Secrets

```bash
# Generate JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Generate PostgreSQL password
openssl rand -base64 32
```

## Local Development Setup

### Quick Start with Docker Compose

1. **Clone the repository**:
 ```bash
 git clone <repository-url> brandlens
 cd brandlens
 ```

2. **Create environment file**:
 ```bash
 cp .env.example .env
 # Edit .env with your API keys and secrets
 ```

3. **Start all services**:
 ```bash
 ./deploy.sh local
 # OR
 docker-compose up -d --wait
 ```

4. **Run database migrations**:
 ```bash
 docker-compose exec brandlens-api npx prisma migrate deploy
 docker-compose exec brandlens-api npx tsx scripts/seed.ts
 ```

5. **Access the application**:
 - Frontend: http://localhost:3000
 - Backend API: http://localhost:3001
 - PostgreSQL: localhost:5432
 - Redis: localhost:6379

### Demo Credentials

After seeding:
- **Admin**: `admin@brandlens.demo` / `admin123`
- **User**: `user@brandlens.demo` / `user123`

### Manual Development Setup

```bash
# Install dependencies
npm install --workspaces --include-workspace-root

# Start backend in development mode
cd backend
npm run dev

# In another terminal, start frontend
cd frontend
npm run dev
```

### Useful Commands

```bash
# View logs
docker-compose logs -f brandlens-api
docker-compose logs -f brandlens-frontend

# Restart a service
docker-compose restart brandlens-api

# Access database
docker-compose exec postgres psql -U brandlens -d brandlens

# Access Redis
docker-compose exec redis redis-cli

# Run migrations
docker-compose exec brandlens-api npx prisma migrate deploy

# Run seed
docker-compose exec brandlens-api npx tsx scripts/seed.ts

# Stop all services
docker-compose down

# Remove all data (WARNING)
docker-compose down -v
```

## Production Deployment on Fly.io

### Initial Setup

1. **Install Fly.io CLI**:
 ```bash
 curl -L https://fly.io/install.sh | sh
 flyctl auth login
 ```

2. **Create Fly.io apps**:
 ```bash
 flyctl apps create brandlens-api
 flyctl apps create brandlens-frontend
 ```

3. **Provision managed services** (optional, recommended):
 ```bash
 # Create managed PostgreSQL
 flyctl postgres create --name brandlens-db --region iad
 flyctl postgres attach brandlens-db --app brandlens-api

 # Create managed Redis (or use Upstash)
 flyctl redis create --name brandlens-redis --region iad
 ```

4. **Set secrets on Fly.io**:
 ```bash
 flyctl secrets set \
 JWT_SECRET="$(openssl rand -hex 64)" \
 OPENAI_API_KEY="sk-..." \
 ANTHROPIC_API_KEY="sk-ant-..." \
 GOOGLE_API_KEY="AIza..." \
 RESEND_API_KEY="re_..." \
 SENTRY_DSN="https://..." \
 --app brandlens-api
 ```

5. **Deploy**:
 ```bash
 ./deploy.sh production
 # OR
 flyctl deploy --config fly.toml -a brandlens-api
 ```

### Deploy with the Script

```bash
# Deploy to staging
./deploy.sh staging

# Deploy to production
./deploy.sh production

# Local deployment (uses Docker Compose)
./deploy.sh local
```

### Custom Domain Setup

```bash
# Add custom domain
flyctl certs create api.yourbrand.com -a brandlens-api
flyctl certs create app.yourbrand.com -a brandlens-frontend

# Configure DNS (add these to your DNS provider)
# CNAME api.yourbrand.com -> brandlens-api.fly.dev
# CNAME app.yourbrand.com -> brandlens-frontend.fly.dev
```

### Scaling

```bash
# Scale to multiple regions
flyctl regions add lax ord cdg -a brandlens-api

# Scale vertically (memory/CPU)
flyctl scale memory 512 -a brandlens-api

# Scale horizontally (multiple instances)
flyctl scale count 2 -a brandlens-api
```

### Zero-Downtime Deployments

The CI/CD pipeline uses canary deployments:

```bash
# Manual canary deployment
flyctl deploy --strategy canary -a brandlens-api

# Manual blue-green deployment
flyctl deploy --strategy bluegreen -a brandlens-api
```

## CI/CD Pipeline

The GitHub Actions workflow (`.github/workflows/ci.yml`) automates:

### Pipeline Stages

1. **Lint & Type Check** - ESLint and TypeScript validation for both projects
2. **Backend Tests** - Unit and integration tests with PostgreSQL and Redis
3. **Frontend Tests** - React component tests with coverage
4. **Build Docker Images** - Multi-platform builds pushed to GHCR
5. **Deploy to Staging** - Automatic on `main` branch merges
6. **Deploy to Production** - Triggered by version tags (e.g., `v1.0.0`)

### Triggering Deployments

```bash
# Deploy to staging
git push origin main

# Deploy to production (creates a release)
git tag v1.0.0
git push origin v1.0.0
```

### Required Secrets

Configure in GitHub repository settings:

- `FLY_API_TOKEN` - Fly.io API token
- `CODECOV_TOKEN` - Codecov upload token (optional)
- `SLACK_WEBHOOK` - Slack notification webhook (optional)

## Database Migrations

### Local Development

```bash
# Create a new migration
cd backend
npx prisma migrate dev --name your_migration_name

# Apply migrations
npx prisma migrate deploy

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Open Prisma Studio
npx prisma studio
```

### Migration Runner Script

```bash
# Deploy pending migrations
npx tsx scripts/migrate.ts deploy

# Reset and re-run all migrations
npx tsx scripts/migrate.ts reset

# Migrate and seed
npx tsx scripts/migrate.ts seed
```

### Production Migrations

Migrations run automatically on deployment via Fly.io SSH:

```bash
# Manual migration in production
flyctl ssh console -C "npx prisma migrate deploy" -a brandlens-api
```

## Monitoring & Logging

### Application Logs

```bash
# View logs in real-time
flyctl logs -a brandlens-api

# Docker Compose logs
docker-compose logs -f brandlens-api

# Filter logs
flyctl logs -a brandlens-api --filter "ERROR"
```

### Sentry Integration

Errors are automatically reported to Sentry via the `SENTRY_DSN` environment variable. Configure alerts and dashboards in your Sentry project.

### Health Checks

- Backend health: `https://brandlens-api.fly.dev/health`
- Frontend health: `https://brandlens-api.fly.dev/health`
- Docker health: `docker-compose ps`

### Performance Monitoring

- Set up Fly.io metrics: `flyctl metrics -a brandlens-api`
- Database performance: Monitor via `flyctl postgres connect -a brandlens-db`
- Redis monitoring: Use `flyctl redis connect -a brandlens-redis`

## Troubleshooting

### Common Issues

#### Database Connection Errors

```bash
# Check database is running
docker-compose ps postgres

# View database logs
docker-compose logs postgres

# Test connection
docker-compose exec postgres psql -U brandlens -d brandlens -c "SELECT 1;"
```

#### Port Already in Use

```bash
# Find process using port
lsof -i :3001

# Kill the process
kill -9 <PID>
```

#### Migration Failures

```bash
# Check migration status
npx prisma migrate status

# Force re-run migrations
npx prisma migrate reset --force
npx prisma migrate deploy
```

#### Out of Memory

```bash
# Check Fly.io memory usage
flyctl status -a brandlens-api

# Scale up memory
flyctl scale memory 512 -a brandlens-api
```

#### Build Failures

```bash
# Clear Docker cache
docker system prune -a

# Rebuild without cache
docker-compose build --no-cache
```

### Getting Help

- Documentation: [https://docs.brandlens.com](https://docs.brandlens.com)
- Issues: [GitHub Issues](https://github.com/brandlens/brandlens/issues)
- Email: support@brandlens.com

## Security

### Best Practices

1. **Never commit `.env` files** - Add to `.gitignore`
2. **Rotate secrets regularly** - Use `flyctl secrets set` to update
3. **Use strong JWT secrets** - Minimum 64 characters
4. **Enable HTTPS only** - Already configured via `force_https`
5. **Keep dependencies updated** - Run `npm audit fix` regularly
6. **Review security alerts** - Sentry alerts and GitHub Dependabot

### Reporting Vulnerabilities

Email security@brandlens.com with details. Do not open public issues.

## License

Proprietary - All rights reserved.

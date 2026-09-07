#!/usr/bin/env bash
#
# BrandLens Deployment Script
# Usage: ./deploy.sh [staging|production]
#
set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT="${1:-staging}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_IMAGE="brandlens/backend:${ENVIRONMENT}-latest"
FRONTEND_IMAGE="brandlens/frontend:${ENVIRONMENT}-latest"
FLY_APP_BACKEND="brandlens-api"
FLY_APP_FRONTEND="brandlens-frontend"

# Logging functions
log_info() {
 echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
 echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
 echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
 echo -e "${RED}[ERROR]${NC} $1"
}

# Validate environment
validate_environment() {
 log_info "Validating environment: ${ENVIRONMENT}"

 if [[ "${ENVIRONMENT}" != "staging" && "${ENVIRONMENT}" != "production" ]]; then
 log_error "Environment must be 'staging' or 'production'"
 exit 1
 fi

 # Check required tools
 command -v docker >/dev/null 2>&1 || { log_error "Docker is required but not installed."; exit 1; }
 command -v flyctl >/dev/null 2>&1 || { log_error "Flyctl is required but not installed."; exit 1; }
 command -v node >/dev/null 2>&1 || { log_error "Node.js is required but not installed."; exit 1; }
 command -v npm >/dev/null 2>&1 || { log_error "npm is required but not installed."; exit 1; }

 # Check required environment variables for production
 if [[ "${ENVIRONMENT}" == "production" ]]; then
 required_vars=(
 "DATABASE_URL"
 "REDIS_URL"
 "OPENAI_API_KEY"
 "ANTHROPIC_API_KEY"
 "JWT_SECRET"
 )
 for var in "${required_vars[@]}"; do
 if [[ -z "${!var:-}" ]]; then
 log_error "Required environment variable ${var} is not set"
 exit 1
 fi
 done
 fi

 log_success "Environment validation passed"
}

# Run tests
run_tests() {
 log_info "Running tests..."

 # Backend tests
 log_info "Running backend tests..."
 cd "${SCRIPT_DIR}/backend"
 npm run lint || { log_error "Backend lint failed"; exit 1; }
 npm run test || { log_error "Backend tests failed"; exit 1; }

 # Frontend tests
 log_info "Running frontend tests..."
 cd "${SCRIPT_DIR}/frontend"
 npm run lint || { log_error "Frontend lint failed"; exit 1; }
 npm run test || { log_error "Frontend tests failed"; exit 1; }

 cd "${SCRIPT_DIR}"
 log_success "All tests passed"
}

# Build Docker images
build_images() {
 log_info "Building Docker images..."

 # Build backend image
 log_info "Building backend image..."
 docker build -t "${BACKEND_IMAGE}" -f Dockerfile.backend .

 # Build frontend image
 log_info "Building frontend image..."
 docker build -t "${FRONTEND_IMAGE}" -f Dockerfile.frontend .

 log_success "Docker images built successfully"
}

# Push Docker images
push_images() {
 log_info "Pushing Docker images..."

 if [[ "${ENVIRONMENT}" == "production" ]]; then
 docker push "${BACKEND_IMAGE}"
 docker push "${FRONTEND_IMAGE}"
 else
 # For staging, just tag and push
 docker tag "${BACKEND_IMAGE}" "${BACKEND_IMAGE}:staging"
 docker push "${BACKEND_IMAGE}:staging"
 docker tag "${FRONTEND_IMAGE}" "${FRONTEND_IMAGE}:staging"
 docker push "${FRONTEND_IMAGE}:staging"
 fi

 log_success "Images pushed successfully"
}

# Run database migrations
run_migrations() {
 log_info "Running database migrations..."

 # For local Docker Compose deployment
 if docker-compose ps postgres >/dev/null 2>&1; then
 log_info "Running migrations locally..."
 docker-compose exec -T postgres psql -U brandlens -d brandlens -c "SELECT 1" >/dev/null 2>&1 || {
 log_warning "PostgreSQL not ready, waiting..."
 sleep 10
 }

 # Run Prisma migrations
 docker-compose exec -T brandlens-api npx prisma migrate deploy || {
 log_info "Running migrations via local Node..."
 cd backend && npx prisma migrate deploy
 }
 else
 # For Fly.io deployment, run migrations via flyctl
 log_info "Running migrations on Fly.io..."
 flyctl ssh console -C "cd /app && npx prisma migrate deploy" -a "${FLY_APP_BACKEND}" || {
 log_warning "Could not run migrations via SSH. Please run manually."
 }
 fi

 log_success "Migrations completed"
}

# Deploy to Fly.io
deploy_flyio() {
 log_info "Deploying to Fly.io (${ENVIRONMENT})..."

 # Deploy backend
 log_info "Deploying backend API..."
 if [[ "${ENVIRONMENT}" == "production" ]]; then
 flyctl deploy --config fly.toml --ha-vms 2 -a "${FLY_APP_BACKEND}" || {
 log_error "Backend deployment failed"
 exit 1
 }
 else
 flyctl deploy --config fly.toml -a "${FLY_APP_BACKEND}" || {
 log_error "Backend staging deployment failed"
 exit 1
 }
 fi

 # Wait for backend to be healthy
 log_info "Waiting for backend to be healthy..."
 sleep 30

 # Check backend health
 for i in {1..10}; do
 if curl -sf "https://${FLY_APP_BACKEND}.fly.dev/health" >/dev/null 2>&1; then
 log_success "Backend is healthy"
 break
 fi
 if [[ $i -eq 10 ]]; then
 log_error "Backend health check failed after 10 attempts"
 exit 1
 fi
 log_warning "Backend not ready yet, waiting... (attempt $i/10)"
 sleep 10
 done

 # Deploy frontend if needed
 if [[ -f "fly.frontend.toml" ]]; then
 log_info "Deploying frontend..."
 flyctl deploy --config fly.frontend.toml -a "${FLY_APP_FRONTEND}" || {
 log_error "Frontend deployment failed"
 exit 1
 }
 fi

 log_success "Deployment completed successfully"
}

# Run smoke tests
run_smoke_tests() {
 log_info "Running smoke tests..."

 API_URL="https://${FLY_APP_BACKEND}.fly.dev"
 if [[ "${ENVIRONMENT}" == "local" ]]; then
 API_URL="http://localhost:3001"
 fi

 # Test health endpoint
 log_info "Testing health endpoint..."
 if ! curl -sf "${API_URL}/health" >/dev/null 2>&1; then
 log_error "Health check failed"
 exit 1
 fi
 log_success "Health check passed"

 # Test API root
 log_info "Testing API root..."
 if ! curl -sf "${API_URL}/" >/dev/null 2>&1; then
 log_warning "API root check failed (may be expected)"
 fi

 # Test CORS headers if applicable
 log_info "Testing CORS headers..."
 curl -sI "${API_URL}/health" | grep -i "access-control-allow-origin" >/dev/null 2>&1 || {
 log_warning "CORS headers not detected (may be expected for non-browser requests)"
 }

 log_success "Smoke tests passed"
}

# Local deployment with Docker Compose
deploy_local() {
 log_info "Deploying locally with Docker Compose..."

 # Build and start services
 docker-compose down -v || true
 docker-compose build --no-cache
 docker-compose up -d --wait

 # Wait for services to be ready
 log_info "Waiting for services to be ready..."
 sleep 15

 # Run migrations
 run_migrations

 # Run smoke tests
 API_URL="http://localhost:3001"
 log_info "Testing local deployment at ${API_URL}..."

 if curl -sf "${API_URL}/health" >/dev/null 2>&1; then
 log_success "Local deployment is healthy"
 log_info "Frontend available at: http://localhost:3000"
 log_info "Backend API available at: http://localhost:3001"
 log_info "PostgreSQL available at: localhost:5432"
 log_info "Redis available at: localhost:6379"
 else
 log_error "Local deployment health check failed"
 log_info "Check logs with: docker-compose logs"
 exit 1
 fi
}

# Main deployment flow
main() {
 log_info "Starting BrandLens deployment for environment: ${ENVIRONMENT}"

 validate_environment

 if [[ "${ENVIRONMENT}" == "local" ]]; then
 deploy_local
 else
 run_tests
 build_images
 push_images
 run_migrations
 deploy_flyio
 run_smoke_tests
 fi

 log_success "=========================================="
 log_success "BrandLens deployed successfully!"
 log_success "Environment: ${ENVIRONMENT}"
 log_success "=========================================="

 if [[ "${ENVIRONMENT}" != "local" ]]; then
 log_info "Backend API: https://${FLY_APP_BACKEND}.fly.dev"
 log_info "Health Check: https://${FLY_APP_BACKEND}.fly.dev/health"
 if [[ -f "fly.frontend.toml" ]]; then
 log_info "Frontend: https://${FLY_APP_FRONTEND}.fly.dev"
 fi
 fi
}

# Handle script interruption
trap 'log_error "Deployment interrupted"; exit 1' INT TERM

# Run main function
main "$@"

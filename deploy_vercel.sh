#!/bin/bash

# ============================================================================
# Fair Support Fair Play - Vercel Deployment Script
# ============================================================================
# Este script automatiza el deployment a Vercel
# Uso: ./deploy_vercel.sh [production|preview]

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Deployment mode (production or preview)
MODE=${1:-production}

echo -e "${BLUE}============================================================================${NC}"
echo -e "${BLUE}  Fair Support Fair Play - Vercel Deployment${NC}"
echo -e "${BLUE}============================================================================${NC}"
echo ""

# ============================================================================
# Step 1: Pre-flight Checks
# ============================================================================
echo -e "${YELLOW}[1/7] Running pre-flight checks...${NC}"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
  echo -e "${RED}Error: package.json not found. Are you in the root directory?${NC}"
  exit 1
fi

# Check if src/client exists
if [ ! -d "src/client" ]; then
  echo -e "${RED}Error: src/client directory not found${NC}"
  exit 1
fi

echo -e "${GREEN}✓ Directory structure verified${NC}"

# Check if git repo is clean
if [[ $(git status --porcelain) ]]; then
  echo -e "${YELLOW}Warning: You have uncommitted changes${NC}"
  git status --short
  echo ""
  read -p "Continue anyway? (y/N) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}Deployment cancelled${NC}"
    exit 1
  fi
fi

echo -e "${GREEN}✓ Git status checked${NC}"

# Check if on main branch (for production)
if [ "$MODE" = "production" ]; then
  CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
  if [ "$CURRENT_BRANCH" != "main" ]; then
    echo -e "${RED}Error: Production deploys must be from 'main' branch${NC}"
    echo -e "${YELLOW}Current branch: $CURRENT_BRANCH${NC}"
    exit 1
  fi
  echo -e "${GREEN}✓ On main branch${NC}"
fi

# ============================================================================
# Step 2: Install Vercel CLI (if needed)
# ============================================================================
echo ""
echo -e "${YELLOW}[2/7] Checking Vercel CLI...${NC}"

if ! command -v vercel &> /dev/null; then
  echo -e "${YELLOW}Vercel CLI not found. Installing...${NC}"
  npm install -g vercel
  echo -e "${GREEN}✓ Vercel CLI installed${NC}"
else
  echo -e "${GREEN}✓ Vercel CLI already installed${NC}"
fi

# ============================================================================
# Step 3: Pull Latest Changes
# ============================================================================
echo ""
echo -e "${YELLOW}[3/7] Pulling latest changes from GitHub...${NC}"

if [ "$MODE" = "production" ]; then
  git pull origin main
  echo -e "${GREEN}✓ Pulled latest changes${NC}"
else
  echo -e "${BLUE}ℹ Preview mode - skipping git pull${NC}"
fi

# ============================================================================
# Step 4: Install Dependencies
# ============================================================================
echo ""
echo -e "${YELLOW}[4/7] Installing dependencies...${NC}"

cd src/client
npm install --legacy-peer-deps
echo -e "${GREEN}✓ Dependencies installed${NC}"

# ============================================================================
# Step 5: Run Build Locally (test)
# ============================================================================
echo ""
echo -e "${YELLOW}[5/7] Testing build locally...${NC}"

npm run build
echo -e "${GREEN}✓ Local build successful${NC}"

# ============================================================================
# Step 6: Deploy to Vercel
# ============================================================================
echo ""
echo -e "${YELLOW}[6/7] Deploying to Vercel...${NC}"

if [ "$MODE" = "production" ]; then
  echo -e "${BLUE}Deploying to PRODUCTION...${NC}"
  vercel --prod --yes
else
  echo -e "${BLUE}Deploying PREVIEW...${NC}"
  vercel --yes
fi

echo -e "${GREEN}✓ Deployment complete${NC}"

# ============================================================================
# Step 7: Summary
# ============================================================================
echo ""
echo -e "${BLUE}============================================================================${NC}"
echo -e "${GREEN}  Deployment Successful! 🎉${NC}"
echo -e "${BLUE}============================================================================${NC}"
echo ""

if [ "$MODE" = "production" ]; then
  echo -e "${GREEN}Production URL:${NC} https://fair-support-fair-play.vercel.app"
else
  echo -e "${GREEN}Preview URL:${NC} Check output above"
fi

echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo -e "  1. Visit the URL to verify deployment"
echo -e "  2. Test /investor page (compliance section)"
echo -e "  3. Test /parent/compliance (API calls)"
echo -e "  4. Test /child/complaints (API calls)"
echo -e "  5. Check DevTools Console for errors"
echo ""
echo -e "${YELLOW}Important:${NC} Make sure NEXT_PUBLIC_API_URL is set in Vercel:"
echo -e "  Dashboard → Settings → Environment Variables"
echo ""

# Return to root directory
cd ../..

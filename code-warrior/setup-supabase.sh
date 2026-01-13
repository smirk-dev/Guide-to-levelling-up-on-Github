#!/bin/bash
# Supabase CLI Setup Script for Linux/Mac/WSL
# Run with: bash setup-supabase.sh

set -e

echo "=================================="
echo "  Code Warrior - Supabase Setup  "
echo "=================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
GRAY='\033[0;37m'
NC='\033[0m' # No Color

# Check if Supabase CLI is installed
echo -e "${YELLOW}[1/5] Checking Supabase CLI installation...${NC}"
if ! command -v supabase &> /dev/null; then
    echo -e "${RED}❌ Supabase CLI not found. Installing...${NC}"
    npm install -g supabase
    echo -e "${GREEN}✅ Supabase CLI installed!${NC}"
else
    echo -e "${GREEN}✅ Supabase CLI already installed${NC}"
fi

echo ""

# Login to Supabase
echo -e "${YELLOW}[2/5] Logging in to Supabase...${NC}"
echo -e "${GRAY}This will open a browser window. Please authorize the CLI.${NC}"
sleep 2
supabase login

echo ""

# Get project ref
echo -e "${YELLOW}[3/5] Linking to your Supabase project...${NC}"
echo ""
echo -e "${CYAN}Please enter your Supabase Project Reference ID:${NC}"
echo -e "${GRAY}(Find it at: Supabase Dashboard → Settings → General → Reference ID)${NC}"
read -p "Project Ref: " projectRef

if [ -z "$projectRef" ]; then
    echo -e "${RED}❌ No project ref provided. Exiting.${NC}"
    exit 1
fi

# Save to .env
echo ""
echo -e "${GRAY}Saving project ref to .env file...${NC}"
echo "PROJECT_REF=$projectRef" > .env

# Link to project
echo ""
echo -e "${GRAY}Linking to project $projectRef...${NC}"
supabase link --project-ref "$projectRef"

echo ""

# Create supabase directory if it doesn't exist
if [ ! -d "supabase" ]; then
    echo -e "${YELLOW}[4/5] Initializing Supabase directory...${NC}"
    supabase init
    echo -e "${GREEN}✅ Supabase directory created!${NC}"
else
    echo -e "${YELLOW}[4/5] Supabase directory already exists${NC}"
fi

echo ""

# Create migration for github_stats
echo -e "${YELLOW}[5/5] Creating migration for github_stats column...${NC}"

# Check if migrations folder exists
mkdir -p supabase/migrations

# Get current timestamp
timestamp=$(date +"%Y%m%d%H%M%S")
migrationFile="supabase/migrations/${timestamp}_add_github_stats.sql"

# Create migration file
cat > "$migrationFile" << 'EOF'
-- Migration: Add github_stats column to users table
-- Date: $(date +"%Y-%m-%d")
-- Purpose: Store GitHub metrics for RPG stat calculations

-- Add github_stats column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'users'
    AND column_name = 'github_stats'
  ) THEN
    ALTER TABLE users ADD COLUMN github_stats JSONB DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- Add comment
COMMENT ON COLUMN users.github_stats IS 'Stores GitHub metrics (stars, repos, commits, prs, issues, reviews) for RPG stat calculation';
EOF

echo -e "${GREEN}✅ Created migration: $migrationFile${NC}"

echo ""
echo "=================================="
echo "        Setup Complete! 🎉        "
echo "=================================="
echo ""

echo -e "${YELLOW}Next steps:${NC}"
echo ""
echo -e "${NC}1. Push migration to your database:${NC}"
echo -e "   ${CYAN}npm run db:push${NC}"
echo ""
echo -e "${NC}2. Generate TypeScript types:${NC}"
echo -e "   ${CYAN}npm run db:types${NC}"
echo ""
echo -e "${NC}3. Start development:${NC}"
echo -e "   ${CYAN}npm run dev${NC}"
echo ""
echo -e "${GRAY}For more info, see QUICKSTART.md or SUPABASE_SETUP.md${NC}"
echo ""

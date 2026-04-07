#!/bin/bash
# RUONALIM.COM — Full deployment setup
# Run this from: ~/Desktop/Sandbox/ruonalim

set -e

echo ""
echo "==================================="
echo "  ruonalim.com — Deploy Setup"
echo "==================================="
echo ""

# ─── Step 1: Install dependencies ───
echo "[1/5] Installing dependencies..."
npm install --silent

# ─── Step 2: Git init & push ───
echo "[2/5] Setting up Git..."
if [ ! -d ".git" ]; then
  git init
  git branch -M main
fi

# Add remote if not already set
if ! git remote get-url origin &>/dev/null; then
  git remote add origin https://github.com/ruonalim/ruonalim.git
fi

git add -A
git commit -m "feat: add AI-powered UX audit tool

- Next.js App Router with static HTML pages preserved
- /audit landing page with pricing (free/£79/£199)
- /audit/run 3-step flow: input → analyse → results
- /audit/result/[id] shareable report page
- Claude AI integration for heuristic analysis
- Figma OAuth flow for design file audits
- Puppeteer URL screenshot capture
- Stripe payment integration
- Upstash Redis for audit storage (90-day TTL)" || echo "Nothing to commit"

git push -u origin main

# ─── Step 3: Check Vercel CLI ───
echo "[3/5] Checking Vercel CLI..."
if ! command -v vercel &>/dev/null; then
  echo "Installing Vercel CLI..."
  npm i -g vercel
fi

# ─── Step 4: Set environment variables ───
echo ""
echo "[4/5] Setting environment variables..."
echo ""
echo "  You need to paste your keys when prompted."
echo "  (Skip any you haven't set up yet — you can add them later in the Vercel dashboard)"
echo ""

read -p "  ANTHROPIC_API_KEY (sk-ant-...): " ANTHROPIC_KEY
read -p "  UPSTASH_REDIS_REST_URL (https://...upstash.io): " UPSTASH_URL
read -p "  UPSTASH_REDIS_REST_TOKEN: " UPSTASH_TOKEN

if [ -n "$ANTHROPIC_KEY" ]; then
  vercel env add ANTHROPIC_API_KEY production <<< "$ANTHROPIC_KEY" 2>/dev/null || echo "  (may already exist)"
fi
if [ -n "$UPSTASH_URL" ]; then
  vercel env add UPSTASH_REDIS_REST_URL production <<< "$UPSTASH_URL" 2>/dev/null || echo "  (may already exist)"
fi
if [ -n "$UPSTASH_TOKEN" ]; then
  vercel env add UPSTASH_REDIS_REST_TOKEN production <<< "$UPSTASH_TOKEN" 2>/dev/null || echo "  (may already exist)"
fi

# Set base URL
vercel env add NEXT_PUBLIC_BASE_URL production <<< "https://ruonalim.com" 2>/dev/null || echo "  (may already exist)"

# ─── Step 5: Deploy ───
echo ""
echo "[5/5] Deploying to production..."
vercel --prod

echo ""
echo "==================================="
echo "  Done! Check https://ruonalim.com"
echo "==================================="
echo ""
echo "  Optional: Set up Stripe and Figma later in"
echo "  Vercel Dashboard → Settings → Environment Variables"
echo ""

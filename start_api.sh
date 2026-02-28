#!/bin/bash

# Fair Support Fair Play - Start API Server
# ==========================================

echo "🚀 Starting Fair Support Fair Play API..."

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
echo "📦 Installing dependencies..."
pip install -q -r requirements.txt

# Check environment variables
if [ -z "$DATABASE_URL" ]; then
    echo "⚠️  Warning: DATABASE_URL not set. Using default localhost."
    export DATABASE_URL="postgresql://user:password@localhost:5432/fairsupport"
fi

if [ -z "$OPENAI_API_KEY" ]; then
    echo "❌ Error: OPENAI_API_KEY not set!"
    echo "   Please set it: export OPENAI_API_KEY='sk-...'"
    exit 1
fi

# Start API server
echo "✅ Starting API server on port 8000..."
cd src/server/api
python3 main.py

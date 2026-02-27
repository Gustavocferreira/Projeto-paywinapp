#!/bin/bash
set -e

echo "🚀 PayWinApp - Post Create Setup"
echo "=================================="

# Install Python dependencies
echo "📦 Installing Python dependencies..."
cd /workspace/services/python-api
pip install --upgrade pip
pip install -r requirements.txt

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
cd /workspace/frontend
npm install

# Install Go dependencies
echo "📦 Installing Go dependencies..."
cd /workspace/services/go-api
go mod download

# Setup Git hooks (optional)
cd /workspace
if [ ! -d ".git/hooks" ]; then
    echo "⚠️  Git repository not initialized"
else
    echo "✅ Git hooks setup (placeholder)"
fi

echo "✅ Post-create setup completed!"
echo "Run 'docker-compose up' to start all services"

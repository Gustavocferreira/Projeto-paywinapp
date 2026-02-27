#!/bin/bash
set -e

echo "🔄 PayWinApp - Post Start Checks"
echo "================================="

# Wait for PostgreSQL
echo "⏳ Waiting for PostgreSQL..."
until pg_isready -h postgres -p 5432 -U paywinuser; do
  sleep 1
done
echo "✅ PostgreSQL is ready"

# Wait for PgBouncer
echo "⏳ Waiting for PgBouncer..."
until pg_isready -h pgbouncer -p 5432 -U paywinuser; do
  sleep 1
done
echo "✅ PgBouncer is ready"

echo "✅ All services are ready!"
echo ""
echo "📋 Quick Commands:"
echo "  - Start all: docker-compose up"
echo "  - Python API: cd services/python-api && uvicorn app.main:app --reload"
echo "  - Go API: cd services/go-api && go run cmd/server/main.go"
echo "  - Frontend: cd frontend && npm run dev"
echo ""

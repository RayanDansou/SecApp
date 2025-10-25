#!/bin/bash

# ========================================
# SecApp - Stop Script
# ========================================
# This script stops all SecApp services

set -e  # Exit on error

echo "🛑 Stopping SecApp services..."
echo ""

docker compose down

echo ""
echo "✅ All services stopped!"
echo ""
echo "Options:"
echo "   Start again:        ./scripts/start.sh"
echo "   Remove volumes:     docker compose down -v"
echo "   Remove everything:  docker compose down -v --rmi all"
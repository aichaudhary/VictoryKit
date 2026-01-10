#!/bin/bash

# Cleanup old/unnecessary files from backend tool directories
# This script removes:
# 1. package-lock.json files
# 2. Dockerfile files (will use docker-compose at project level)
# 3. __pycache__ directories
# 4. *.pyc files
# 5. .env files (keep .env.example)
# 6. dist directories
# 7. node_modules directories

BACKEND_TOOLS="/Users/onelastai/Documents/VictoryKit/backend/tools"

echo "============================================"
echo "     Backend Tools Cleanup Script"
echo "============================================"
echo ""

# Count files before cleanup
echo "Files to remove:"
echo "  - Dockerfiles: $(find "$BACKEND_TOOLS" -name "Dockerfile" 2>/dev/null | wc -l | tr -d ' ')"
echo "  - package-lock.json: $(find "$BACKEND_TOOLS" -name "package-lock.json" 2>/dev/null | wc -l | tr -d ' ')"
echo "  - __pycache__: $(find "$BACKEND_TOOLS" -type d -name "__pycache__" 2>/dev/null | wc -l | tr -d ' ')"
echo "  - .env files: $(find "$BACKEND_TOOLS" -name ".env" ! -name ".env.example" 2>/dev/null | wc -l | tr -d ' ')"
echo ""

# Remove Dockerfiles
echo "Removing Dockerfiles..."
find "$BACKEND_TOOLS" -name "Dockerfile" -type f -delete 2>/dev/null

# Remove package-lock.json files
echo "Removing package-lock.json files..."
find "$BACKEND_TOOLS" -name "package-lock.json" -type f -delete 2>/dev/null

# Remove __pycache__ directories
echo "Removing __pycache__ directories..."
find "$BACKEND_TOOLS" -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null

# Remove .pyc files
echo "Removing .pyc files..."
find "$BACKEND_TOOLS" -name "*.pyc" -type f -delete 2>/dev/null

# Remove node_modules directories
echo "Removing node_modules directories..."
find "$BACKEND_TOOLS" -type d -name "node_modules" -exec rm -rf {} + 2>/dev/null

# Remove dist directories
echo "Removing dist directories..."
find "$BACKEND_TOOLS" -type d -name "dist" -exec rm -rf {} + 2>/dev/null

# Remove .env files (keep .env.example as templates)
echo "Removing .env files (keeping .env.example)..."
find "$BACKEND_TOOLS" -name ".env" ! -name ".env.example" -type f -delete 2>/dev/null

echo ""
echo "============================================"
echo "        Backend Cleanup Complete!"
echo "============================================"

# Show final size
echo ""
echo "Backend tools size: $(du -sh "$BACKEND_TOOLS" | cut -f1)"

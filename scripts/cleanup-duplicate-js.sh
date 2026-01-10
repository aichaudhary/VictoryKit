#!/bin/bash

# Cleanup duplicate JavaScript files that have TypeScript equivalents in backend
# This script removes:
# 1. *.model.js files (replaced by *.ts models)
# 2. *.controller.js files (replaced by *Controller.ts files)
# 3. *.service.js files (replaced by *.ts services)

BACKEND_TOOLS="/Users/onelastai/Documents/VictoryKit/backend/tools"

echo "============================================"
echo "  Backend Duplicate JS Files Cleanup"
echo "============================================"
echo ""

# Count files before cleanup
echo "Files to remove:"
echo "  - *.model.js files: $(find "$BACKEND_TOOLS" -name "*.model.js" 2>/dev/null | wc -l | tr -d ' ')"
echo "  - Old *.controller.js files: $(find "$BACKEND_TOOLS" -name "*.controller.js" 2>/dev/null | wc -l | tr -d ' ')"
echo "  - Old *.service.js files: $(find "$BACKEND_TOOLS" -name "*.service.js" 2>/dev/null | wc -l | tr -d ' ')"
echo ""

# Remove *.model.js files (TypeScript models exist)
echo "Removing *.model.js files..."
find "$BACKEND_TOOLS" -name "*.model.js" -type f -delete 2>/dev/null

# Remove old *.controller.js files (TypeScript controllers exist)
echo "Removing *.controller.js files..."
find "$BACKEND_TOOLS" -name "*.controller.js" -type f -delete 2>/dev/null

# Remove old *.service.js files
echo "Removing *.service.js files..."
find "$BACKEND_TOOLS" -name "*.service.js" -type f -delete 2>/dev/null

echo ""
echo "============================================"
echo "      Duplicate JS Cleanup Complete!"
echo "============================================"

# Show final size
echo ""
echo "Backend tools size: $(du -sh "$BACKEND_TOOLS" | cut -f1)"

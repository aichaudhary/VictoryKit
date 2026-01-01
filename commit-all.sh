#!/bin/bash

echo "🔍 Checking git status and committing all changes..."

cd /workspaces/VictoryKit

# Show status
echo "Git status:"
git status

echo ""
echo "📦 Adding all changes..."
git add -A

echo ""
echo "💾 Committing..."
git commit -m "Add neural-link-interface and update deployment configurations - $(date '+%Y-%m-%d %H:%M:%S')" || echo "No changes to commit"

echo ""
echo "📤 Pushing to main..."
git push origin main

echo ""
echo "✅ Done!"

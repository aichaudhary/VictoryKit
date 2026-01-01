#!/bin/bash

echo "📦 Committing and pushing changes..."

cd /workspaces/VictoryKit

# Add all changes
git add .

# Commit with timestamp
git commit -m "Add neural-link-interface to frontend - $(date '+%Y-%m-%d %H:%M:%S')"

# Push to main
git push origin main

echo "✅ Changes committed and pushed!"

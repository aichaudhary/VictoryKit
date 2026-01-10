#!/bin/bash

cd /Users/onelastai/Documents/VictoryKit/frontend/tools

# Install missing dependencies for all tools
for dir in */; do
  if [ -f "${dir}package.json" ]; then
    echo "=== Installing deps for $dir ==="
    cd "$dir"
    npm install react-router-dom recharts @google/genai date-fns jspdf socket.io-client --save --silent 2>/dev/null
    cd ..
  fi
done

echo "Done installing dependencies!"

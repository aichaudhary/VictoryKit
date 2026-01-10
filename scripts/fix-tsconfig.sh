#!/bin/bash

cd /Users/onelastai/Documents/VictoryKit/frontend/tools

# Fix tsconfig.json to allow unused React imports
for dir in */; do
  if [ -f "${dir}tsconfig.json" ]; then
    # Add noUnusedLocals: false if not already present
    if grep -q '"noUnusedLocals"' "${dir}tsconfig.json"; then
      sed -i '' 's/"noUnusedLocals": true/"noUnusedLocals": false/g' "${dir}tsconfig.json"
    else
      # Add it to compilerOptions
      sed -i '' 's/"compilerOptions": {/"compilerOptions": {\n    "noUnusedLocals": false,/g' "${dir}tsconfig.json"
    fi
    echo "Fixed tsconfig for $dir"
  fi
done

echo "Done!"

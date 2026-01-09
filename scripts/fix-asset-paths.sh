#!/bin/bash
# Fix all index.html files to use relative asset paths

for dir in /var/www/tools/*/; do
    file="${dir}index.html"
    if [ -f "$file" ]; then
        sudo sed -i 's|href="/assets/|href="./assets/|g' "$file"
        sudo sed -i 's|src="/assets/|src="./assets/|g' "$file"
        sudo sed -i 's|href="/favicon|href="./favicon|g' "$file"
        echo "Fixed: $file"
    fi
done

echo "All index.html files updated to use relative paths"

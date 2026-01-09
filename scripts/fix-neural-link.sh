#!/bin/bash
# Fix neural-link index.html paths
sudo sed -i 's|href="/index.css"|href="./index.css"|g' /var/www/neural-link/index.html
sudo sed -i 's|src="/assets/|src="./assets/|g' /var/www/neural-link/index.html
echo "Fixed neural-link paths"
cat /var/www/neural-link/index.html | grep -E "(src=|href=)" | head -5

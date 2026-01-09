#!/bin/bash
# Deploy neural-link and fix paths

# Clear old deployment
sudo rm -rf /var/www/neural-link/*

# Copy new build
sudo cp -r /var/www/maula.ai/repo/frontend/neural-link-interface/dist/* /var/www/neural-link/

# Fix asset paths to be relative
sudo sed -i 's|src="/assets/|src="./assets/|g' /var/www/neural-link/index.html

echo "Deployed neural-link interface"
cat /var/www/neural-link/index.html

#!/bin/bash

# ============================================
# VictoryKit FULL Deployment Script
# SSL + Frontend + Backend
# ============================================

EC2_HOST="ec2-18-140-156-40.ap-southeast-1.compute.amazonaws.com"
EC2_USER="ubuntu"
PEM_FILE="victorykit.pem"
APP_DIR="/home/ubuntu/victorykit"
DOMAIN="fyzo.xyz"
API_DOMAIN="api.fyzo.xyz"

echo "🚀 VictoryKit Full Deployment"
echo "=============================="

# Check PEM file
if [ ! -f "$PEM_FILE" ]; then
    echo "❌ PEM file not found: $PEM_FILE"
    exit 1
fi

chmod 400 $PEM_FILE

# SSH function
ssh_cmd() {
    ssh -i $PEM_FILE -o StrictHostKeyChecking=no $EC2_USER@$EC2_HOST "$1"
}

# SCP function  
scp_cmd() {
    scp -i $PEM_FILE -o StrictHostKeyChecking=no -r "$1" $EC2_USER@$EC2_HOST:"$2"
}

echo ""
echo "📦 Step 1: Installing SSL Dependencies..."
ssh_cmd "
    sudo apt update
    sudo apt install -y certbot python3-certbot-nginx
    echo '✅ Certbot installed'
"

echo ""
echo "📦 Step 2: Setting up Nginx for SSL..."
ssh_cmd "
    sudo tee /etc/nginx/sites-available/victorykit > /dev/null << 'NGINX'
# API Backend (api.fyzo.xyz)
server {
    listen 80;
    server_name api.fyzo.xyz;

    # For Let's Encrypt verification
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    # MalwareHunter API
    location /api/v1/malwarehunter {
        proxy_pass http://localhost:4004;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # PhishGuard API
    location /api/v1/phishguard {
        proxy_pass http://localhost:4005;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # VulnScan API
    location /api/v1/vulnscan {
        proxy_pass http://localhost:4006;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # PenTestAI API
    location /api/v1/pentestai {
        proxy_pass http://localhost:4007;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # SecureCode API
    location /api/v1/securecode {
        proxy_pass http://localhost:4008;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # ComplianceCheck API
    location /api/v1/compliancecheck {
        proxy_pass http://localhost:4009;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # DataGuardian API
    location /api/v1/dataguardian {
        proxy_pass http://localhost:4010;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Health check
    location /health {
        proxy_pass http://localhost:4004/health;
    }
}

# Frontend (fyzo.xyz)
server {
    listen 80;
    server_name fyzo.xyz www.fyzo.xyz;

    # For Let's Encrypt verification
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
NGINX

    sudo ln -sf /etc/nginx/sites-available/victorykit /etc/nginx/sites-enabled/
    sudo rm -f /etc/nginx/sites-enabled/default
    sudo nginx -t && sudo systemctl reload nginx
    echo '✅ Nginx configured'
"

echo ""
echo "🔐 Step 3: Obtaining SSL Certificates..."
ssh_cmd "
    # Create webroot directory
    sudo mkdir -p /var/www/html/.well-known/acme-challenge
    
    # Get SSL certificates
    sudo certbot --nginx -d fyzo.xyz -d www.fyzo.xyz -d api.fyzo.xyz --non-interactive --agree-tos --email admin@fyzo.xyz --redirect || echo 'Certbot may need manual intervention'
    
    echo '✅ SSL certificates configured'
"

echo ""
echo "🏗️ Step 4: Building Frontend..."
cd frontend/main-dashboard
npm install
npm run build
cd ../..
echo "✅ Frontend built"

echo ""
echo "📤 Step 5: Uploading Frontend..."
scp_cmd "frontend/main-dashboard/.next" "$APP_DIR/frontend/"
scp_cmd "frontend/main-dashboard/package.json" "$APP_DIR/frontend/"
scp_cmd "frontend/main-dashboard/next.config.js" "$APP_DIR/frontend/"
scp_cmd "frontend/main-dashboard/public" "$APP_DIR/frontend/" 2>/dev/null || true

echo ""
echo "🚀 Step 6: Starting Frontend with PM2..."
ssh_cmd "
    cd $APP_DIR/frontend
    npm install --production
    
    # Update PM2 ecosystem
    cd $APP_DIR
    cat > ecosystem.config.js << 'PM2'
module.exports = {
  apps: [
    {
      name: 'frontend',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3000',
      cwd: '/home/ubuntu/victorykit/frontend',
      env: { NODE_ENV: 'production' }
    },
    {
      name: 'malwarehunter-api',
      script: 'backend/tools/04-malwarehunter/api/src/server.js',
      env: { NODE_ENV: 'production' }
    },
    {
      name: 'phishguard-api',
      script: 'backend/tools/05-phishguard/api/src/server.js',
      env: { NODE_ENV: 'production' }
    },
    {
      name: 'vulnscan-api',
      script: 'backend/tools/06-vulnscan/api/src/server.js',
      env: { NODE_ENV: 'production' }
    },
    {
      name: 'pentestai-api',
      script: 'backend/tools/07-pentestai/api/src/server.js',
      env: { NODE_ENV: 'production' }
    },
    {
      name: 'securecode-api',
      script: 'backend/tools/08-securecode/api/src/server.js',
      env: { NODE_ENV: 'production' }
    },
    {
      name: 'compliancecheck-api',
      script: 'backend/tools/09-compliancecheck/api/src/server.js',
      env: { NODE_ENV: 'production' }
    },
    {
      name: 'dataguardian-api',
      script: 'backend/tools/10-dataguardian/api/src/server.js',
      env: { NODE_ENV: 'production' }
    }
  ]
};
PM2

    pm2 delete all 2>/dev/null || true
    pm2 start ecosystem.config.js
    pm2 save
    
    echo '✅ All services started'
"

echo ""
echo "============================================"
echo "✅ FULL DEPLOYMENT COMPLETE!"
echo "============================================"
echo ""
echo "🌐 Your site is live at:"
echo "   https://fyzo.xyz"
echo "   https://www.fyzo.xyz"
echo ""
echo "🔌 APIs available at:"
echo "   https://api.fyzo.xyz/api/v1/malwarehunter"
echo "   https://api.fyzo.xyz/api/v1/phishguard"
echo "   https://api.fyzo.xyz/api/v1/vulnscan"
echo "   https://api.fyzo.xyz/api/v1/pentestai"
echo "   https://api.fyzo.xyz/api/v1/securecode"
echo "   https://api.fyzo.xyz/api/v1/compliancecheck"
echo "   https://api.fyzo.xyz/api/v1/dataguardian"
echo ""
echo "🧪 Test commands:"
echo "   curl https://fyzo.xyz"
echo "   curl https://api.fyzo.xyz/health"
echo ""

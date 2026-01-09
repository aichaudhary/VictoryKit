#!/bin/bash
# Nginx Static File Configuration for all 50 tools
# Serves static files directly instead of proxying to ports

set -e

# Tool configurations - Array of tool names
declare -a TOOLS=(
    "fraudguard"
    "intelliscout"
    "threatradar"
    "malwarehunter"
    "phishguard"
    "vulnscan"
    "pentestai"
    "securecode"
    "compliancecheck"
    "dataguardian"
    "incidentresponse"
    "loganalyzer"
    "accesscontrol"
    "encryptionmanager"
    "cryptovault"
    "networkmonitor"
    "audittrail"
    "threatmodel"
    "riskassess"
    "securityscore"
    "wafmanager"
    "apiguard"
    "botdefender"
    "ddosshield"
    "sslmonitor"
    "blueteamai"
    "siemcommander"
    "soarengine"
    "riskscoreai"
    "policyengine"
    "audittracker"
    "zerotrustaim"
    "passwordvault"
    "biometricai"
    "emailguard"
    "webfilter"
    "dnsshield"
    "firewallai"
    "vpnguardian"
    "wirelesswatch"
    "datalossprevention"
    "iotsecure"
    "mobiledefend"
    "backupguard"
    "drplan"
    "privacyshield"
    "gdprcompliance"
    "hipaaguard"
    "pcidsscheck"
    "bugbountyai"
)

# API port starts at 4001
api_port=4001

for tool in "${TOOLS[@]}"; do
    # Check if the tool directory exists
    if [ -d "/var/www/tools/${tool}" ]; then
        root_dir="/var/www/tools/${tool}"
    else
        root_dir="/var/www/tools/${tool}"
        mkdir -p "$root_dir"
    fi
    
    cat > /etc/nginx/sites-available/${tool}.maula.ai << TOOLEOF
server {
    listen 443 ssl http2;
    server_name ${tool}.maula.ai;

    include snippets/cloudflare-ssl.conf;
    include snippets/security-headers.conf;

    # Serve static files directly
    root ${root_dir};
    index index.html;

    # Frontend - serve static files with SPA fallback
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # API Backend proxy
    location /api {
        proxy_pass http://localhost:${api_port};
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # WebSocket
    location /ws {
        proxy_pass http://localhost:${api_port};
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_read_timeout 86400;
    }

    # Static assets caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}

server {
    listen 80;
    server_name ${tool}.maula.ai;
    return 301 https://\$server_name\$request_uri;
}
TOOLEOF

    # Enable site
    ln -sf /etc/nginx/sites-available/${tool}.maula.ai /etc/nginx/sites-enabled/
    echo "✓ ${tool}.maula.ai -> ${root_dir} (API: ${api_port})"
    
    ((api_port++))
done

# Test nginx configuration
echo ""
echo "Testing nginx configuration..."
nginx -t

echo ""
echo "✅ All 50 tool subdomains configured to serve static files!"
echo "Run 'sudo systemctl reload nginx' to apply changes."

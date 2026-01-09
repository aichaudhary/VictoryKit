#!/bin/bash
# Nginx Configuration Generator for all 50 tools + main domains
# Run this on the EC2 server to configure all subdomains

set -e

# Include Cloudflare SSL config
cat > /etc/nginx/snippets/cloudflare-ssl.conf << 'SSLEOF'
ssl_certificate /etc/ssl/cloudflare/origin-cert.pem;
ssl_certificate_key /etc/ssl/cloudflare/origin-key.pem;
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
ssl_prefer_server_ciphers off;
ssl_session_timeout 1d;
ssl_session_cache shared:SSL:50m;
SSLEOF

# Security headers snippet
cat > /etc/nginx/snippets/security-headers.conf << 'SECEOF'
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
SECEOF

# Main domain - maula.ai
cat > /etc/nginx/sites-available/maula.ai << 'EOF'
server {
    listen 443 ssl http2;
    server_name maula.ai www.maula.ai;

    include snippets/cloudflare-ssl.conf;
    include snippets/security-headers.conf;

    root /var/www/maula.ai/live;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {
    listen 80;
    server_name maula.ai www.maula.ai;
    return 301 https://$server_name$request_uri;
}
EOF

# API domain - api.maula.ai
cat > /etc/nginx/sites-available/api.maula.ai << 'EOF'
server {
    listen 443 ssl http2;
    server_name api.maula.ai;

    include snippets/cloudflare-ssl.conf;
    include snippets/security-headers.conf;

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}

server {
    listen 80;
    server_name api.maula.ai;
    return 301 https://$server_name$request_uri;
}
EOF

# Tool configurations - Array of tool names and ports
declare -a TOOLS=(
    "fraudguard:3001:4001"
    "intelliscout:3002:4002"
    "threatradar:3003:4003"
    "malwarehunter:3004:4004"
    "phishguard:3005:4005"
    "vulnscan:3006:4006"
    "pentestai:3007:4007"
    "securecode:3008:4008"
    "compliancecheck:3009:4009"
    "dataguardian:3010:4010"
    "incidentresponse:3011:4011"
    "loganalyzer:3012:4012"
    "accesscontrol:3013:4013"
    "encryptionmanager:3014:4014"
    "cryptovault:3015:4015"
    "networkmonitor:3016:4016"
    "audittrail:3017:4017"
    "threatmodel:3018:4018"
    "riskassess:3019:4019"
    "securityscore:3020:4020"
    "wafmanager:3021:4021"
    "apiguard:3022:4022"
    "botdefender:3023:4023"
    "ddosshield:3024:4024"
    "sslmonitor:3025:4025"
    "blueteamai:3026:4026"
    "siemcommander:3027:4027"
    "soarengine:3028:4028"
    "riskscoreai:3029:4029"
    "policyengine:3030:4030"
    "audittracker:3031:4031"
    "zerotrustaim:3032:4032"
    "passwordvault:3033:4033"
    "biometricai:3034:4034"
    "emailguard:3035:4035"
    "webfilter:3036:4036"
    "dnsshield:3037:4037"
    "firewallai:3038:4038"
    "vpnguardian:3039:4039"
    "wirelesswatch:3040:4040"
    "datalossprevention:3041:4041"
    "iotsecure:3042:4042"
    "mobiledefend:3043:4043"
    "backupguard:3044:4044"
    "drplan:3045:4045"
    "privacyshield:3046:4046"
    "gdprcompliance:3047:4047"
    "hipaaguard:3048:4048"
    "pcidsscheck:3049:4049"
    "bugbountyai:3050:4050"
)

for tool_config in "${TOOLS[@]}"; do
    IFS=':' read -r tool frontend_port api_port <<< "$tool_config"
    
    cat > /etc/nginx/sites-available/${tool}.maula.ai << TOOLEOF
server {
    listen 443 ssl http2;
    server_name ${tool}.maula.ai;

    include snippets/cloudflare-ssl.conf;
    include snippets/security-headers.conf;

    # Frontend
    location / {
        proxy_pass http://localhost:${frontend_port};
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_cache_bypass \$http_upgrade;
    }

    # API Backend
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
}

server {
    listen 80;
    server_name ${tool}.maula.ai;
    return 301 https://\$server_name\$request_uri;
}
TOOLEOF

    # Enable site
    ln -sf /etc/nginx/sites-available/${tool}.maula.ai /etc/nginx/sites-enabled/
    echo "Created config for ${tool}.maula.ai (frontend: ${frontend_port}, api: ${api_port})"
done

# Enable main sites
ln -sf /etc/nginx/sites-available/maula.ai /etc/nginx/sites-enabled/
ln -sf /etc/nginx/sites-available/api.maula.ai /etc/nginx/sites-enabled/

# Remove default site if exists
rm -f /etc/nginx/sites-enabled/default

# Test nginx configuration
echo ""
echo "Testing nginx configuration..."
nginx -t

echo ""
echo "✅ All 50 tool subdomains + main domain configured!"
echo "Run 'sudo systemctl reload nginx' to apply changes."

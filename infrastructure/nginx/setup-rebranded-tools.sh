#!/bin/bash
# Nginx Configuration for Rebranded 50 Tools - 2026 Edition
# Updates subdomains to new trending names

set -e

# New tool subdomain mapping (new_subdomain:port:api_port:old_folder)
declare -a TOOLS=(
    "fraudguard:3001:4001:fraudguard"
    "darkwebmonitor:3002:4002:intelliscout"
    "zerodaydetect:3003:4003:threatradar"
    "ransomshield:3004:4004:malwarehunter"
    "phishnetai:3005:4005:phishguard"
    "vulnscan:3006:4006:vulnscan"
    "pentestai:3007:4007:pentestai"
    "codesentinel:3008:4008:securecode"
    "runtimeguard:3009:4009:compliancecheck"
    "dataguardian:3010:4010:dataguardian"
    "incidentresponse:3011:4011:incidentresponse"
    "xdrplatform:3012:4012:loganalyzer"
    "identityforge:3013:4013:accesscontrol"
    "secretvault:3014:4014:encryptionmanager"
    "privilegeguard:3015:4015:cryptovault"
    "networkforensics:3016:4016:networkmonitor"
    "audittrailpro:3017:4017:audittrail"
    "threatmodel:3018:4018:threatmodel"
    "riskquantify:3019:4019:riskassess"
    "securitydashboard:3020:4020:securityscore"
    "wafmanager:3021:4021:wafmanager"
    "apishield:3022:4022:apiguard"
    "botmitigation:3023:4023:botdefender"
    "ddosdefender:3024:4024:ddosshield"
    "sslmonitor:3025:4025:sslmonitor"
    "blueteamai:3026:4026:blueteamai"
    "siemcommander:3027:4027:siemcommander"
    "soarengine:3028:4028:soarengine"
    "behavioranalytics:3029:4029:riskscoreai"
    "policyengine:3030:4030:policyengine"
    "cloudposture:3031:4031:audittracker"
    "zerotrust:3032:4032:zerotrustai"
    "kubearmor:3033:4033:passwordvault"
    "containerscan:3034:4034:biometricai"
    "emaildefender:3035:4035:emailguard"
    "browserisolation:3036:4036:webfilter"
    "dnsfirewall:3037:4037:dnsshield"
    "firewallai:3038:4038:firewallai"
    "vpnanalyzer:3039:4039:vpnguardian"
    "wirelesshunter:3040:4040:wirelesswatch"
    "dlpadvanced:3041:4041:datalossprevention"
    "iotsentinel:3042:4042:iotsecure"
    "mobileshield:3043:4043:mobiledefend"
    "supplychainai:3044:4044:backupguard"
    "drplan:3045:4045:drplan"
    "privacyshield:3046:4046:privacyshield"
    "gdprcompliance:3047:4047:gdprcompliance"
    "hipaaguard:3048:4048:hipaaguard"
    "soc2automator:3049:4049:pcidsscheck"
    "iso27001:3050:4050:bugbountyai"
)

echo "🔄 Updating Nginx configurations for rebranded tools..."

# Remove old site configs
rm -f /etc/nginx/sites-enabled/*.maula.ai 2>/dev/null || true
rm -f /etc/nginx/sites-available/*.maula.ai 2>/dev/null || true

for tool_config in "${TOOLS[@]}"; do
    IFS=':' read -r subdomain frontend_port api_port old_folder <<< "$tool_config"
    
    # Determine the root directory (check old folder exists)
    if [ -d "/var/www/tools/${old_folder}" ]; then
        root_dir="/var/www/tools/${old_folder}"
    else
        root_dir="/var/www/tools/${subdomain}"
        mkdir -p "$root_dir"
    fi
    
    cat > /etc/nginx/sites-available/${subdomain}.maula.ai << TOOLEOF
server {
    listen 443 ssl http2;
    server_name ${subdomain}.maula.ai;

    include snippets/cloudflare-ssl.conf;
    include snippets/security-headers.conf;

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
    server_name ${subdomain}.maula.ai;
    return 301 https://\$server_name\$request_uri;
}
TOOLEOF

    # Enable site
    ln -sf /etc/nginx/sites-available/${subdomain}.maula.ai /etc/nginx/sites-enabled/
    echo "✓ ${subdomain}.maula.ai"
done

# Test nginx configuration
echo ""
echo "Testing nginx configuration..."
nginx -t

echo ""
echo "✅ All 50 tools rebranded and configured!"
echo ""
echo "Run 'sudo systemctl reload nginx' to apply changes."

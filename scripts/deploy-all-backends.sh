#!/bin/bash
# Deploy and start all backend API services using PM2
# Run this on the EC2 server

set -e

# Tool configurations with their API ports
declare -A TOOLS=(
    ["01-fraudguard"]=4001
    ["02-intelliscout"]=4002
    ["03-threatradar"]=4003
    ["04-malwarehunter"]=4004
    ["05-phishguard"]=4005
    ["06-vulnscan"]=4006
    ["07-pentestai"]=4007
    ["08-securecode"]=4008
    ["09-compliancecheck"]=4009
    ["10-dataguardian"]=4010
    ["11-incidentresponse"]=4011
    ["12-loganalyzer"]=4012
    ["13-accesscontrol"]=4013
    ["14-encryptionmanager"]=4014
    ["15-cryptovault"]=4015
    ["16-networkmonitor"]=4016
    ["17-audittrail"]=4017
    ["18-threatmodel"]=4018
    ["19-riskassess"]=4019
    ["20-securityscore"]=4020
    ["21-wafmanager"]=4021
    ["22-apiguard"]=4022
    ["23-botdefender"]=4023
    ["24-ddosshield"]=4024
    ["25-sslmonitor"]=4025
    ["26-blueteamai"]=4026
    ["27-siemcommander"]=4027
    ["28-soarengine"]=4028
    ["29-riskscoreai"]=4029
    ["30-policyengine"]=4030
    ["31-audittracker"]=4031
    ["32-zerotrustai"]=4032
    ["33-passwordvault"]=4033
    ["34-biometricai"]=4034
    ["35-emailguard"]=4035
    ["36-webfilter"]=4036
    ["37-dnsshield"]=4037
    ["38-firewallai"]=4038
    ["39-vpnguardian"]=4039
    ["40-wirelesswatch"]=4040
    ["41-datalossprevention"]=4041
    ["42-iotsecure"]=4042
    ["43-mobiledefend"]=4043
    ["44-backupguard"]=4044
    ["45-drplan"]=4045
    ["46-privacyshield"]=4046
    ["47-gdprcompliance"]=4047
    ["48-hipaaguard"]=4048
    ["49-pcidsscheck"]=4049
    ["50-bugbountyai"]=4050
)

REPO_DIR="/var/www/maula.ai/repo"
BACKEND_DIR="$REPO_DIR/backend/tools"

echo "Starting backend API deployment..."

# Check if repo exists
if [ ! -d "$BACKEND_DIR" ]; then
    echo "Error: Backend directory not found at $BACKEND_DIR"
    echo "Please ensure the repo is cloned to /var/www/maula.ai/repo"
    exit 1
fi

# Generate PM2 ecosystem file
cat > /var/www/ecosystem.tools.config.js << 'ECOSYSTEMEOF'
module.exports = {
  apps: [
ECOSYSTEMEOF

for tool in "${!TOOLS[@]}"; do
    port=${TOOLS[$tool]}
    tool_name=$(echo $tool | sed 's/^[0-9]*-//')
    api_dir="$BACKEND_DIR/$tool/api"
    
    if [ -d "$api_dir" ]; then
        echo "Setting up $tool (port $port)..."
        
        cd "$api_dir"
        
        # Install dependencies if node_modules doesn't exist
        if [ ! -d "node_modules" ]; then
            echo "  Installing dependencies..."
            npm install --production 2>/dev/null || npm install
        fi
        
        # Build if dist doesn't exist
        if [ ! -d "dist" ] && [ -f "tsconfig.json" ]; then
            echo "  Building TypeScript..."
            npm run build 2>/dev/null || echo "  Build skipped (no build script or error)"
        fi
        
        # Add to ecosystem config
        cat >> /var/www/ecosystem.tools.config.js << APPEOF
    {
      name: '${tool_name}-api',
      script: 'dist/server.js',
      cwd: '${api_dir}',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: ${port}
      },
      error_file: '/var/log/pm2/${tool_name}-api-error.log',
      out_file: '/var/log/pm2/${tool_name}-api-out.log',
      time: true
    },
APPEOF
        echo "  ✓ $tool_name-api configured on port $port"
    else
        echo "  ⚠ $tool API directory not found, skipping..."
    fi
done

# Close ecosystem config
cat >> /var/www/ecosystem.tools.config.js << 'ECOSYSTEMEOF'
  ]
};
ECOSYSTEMEOF

# Create log directory
sudo mkdir -p /var/log/pm2
sudo chown ubuntu:ubuntu /var/log/pm2

echo ""
echo "Starting all APIs with PM2..."
pm2 start /var/www/ecosystem.tools.config.js

echo ""
echo "Saving PM2 configuration..."
pm2 save

echo ""
echo "✅ All backend APIs deployed and started!"
echo ""
echo "Checking running processes:"
pm2 list

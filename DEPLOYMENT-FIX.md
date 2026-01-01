# VictoryKit Security & Deployment Fix

## 🔐 SSH Key Issue Resolution

### Step 1: Verify SSH Key
```bash
# Check if key exists
ls -la /workspaces/VictoryKit/victorykit.pem

# If it doesn't exist, you need to:
# 1. Generate a new key pair or get the correct .pem file
# 2. Set correct permissions
chmod 400 /workspaces/VictoryKit/victorykit.pem

# Test SSH connection
ssh -i /workspaces/VictoryKit/victorykit.pem -o StrictHostKeyChecking=no ubuntu@ec2-18-140-156-40.ap-southeast-1.compute.amazonaws.com "echo 'SSH connection successful'"
```

### Step 2: Alternative - Use Local Build First
Since SSH is failing, let's build locally first:

```bash
# Build fraudguard frontend locally
cd /workspaces/VictoryKit/frontend/tools/01-fraudguard
npm install
npm run build

# Check if build succeeded
ls -la dist/
```

### Step 3: Manual Deployment (if SSH fails)
If SSH continues to fail, you can:

1. **SCP the built files manually** to your EC2 instance
2. **Use AWS Console** to upload files
3. **Use rsync over SSH** with correct key

## 🛡️ Security Vulnerabilities Fix

### Critical Issues (2 found):
- Check for vulnerable dependencies in package.json files
- Update Node.js, npm, and system packages

### High Priority (92 found):
- Update all npm dependencies to latest secure versions
- Run `npm audit fix` in each package directory

### Automated Fix Script:
```bash
#!/bin/bash
# fix-vulnerabilities.sh

echo "🔧 Fixing VictoryKit Security Vulnerabilities..."

# Frontend dependencies
echo "📦 Updating frontend dependencies..."
cd frontend/main-dashboard && npm audit fix && npm update && cd ../..

# Tool frontends
for tool in frontend/tools/*/; do
  if [ -d "$tool" ]; then
    echo "📦 Updating $tool..."
    cd "$tool" && npm audit fix && npm update && cd ../../..
  fi
done

# Backend dependencies
echo "📦 Updating backend dependencies..."
cd backend/shared && npm audit fix && npm update && cd ../..

for service in backend/tools/*/; do
  if [ -d "$service" ]; then
    echo "📦 Updating $service..."
    cd "$service" && npm audit fix && npm update && cd ../../..
  fi
done

echo "✅ Vulnerability fixes completed!"
```

## 🚀 Alternative Deployment Strategy

### Option 1: Local Build + Manual Upload
```bash
# Build all frontends locally
cd /workspaces/VictoryKit
./scripts/build-all-frontends.sh

# Then manually upload dist folders to EC2
# Use scp, rsync, or AWS console
```

### Option 2: Fix SSH and Redeploy
```bash
# 1. Get correct SSH key
# 2. Update deploy-config.sh with correct key path
# 3. Run deployment again
./deploy-production.sh
```

### Option 3: Docker-based Deployment
Consider using Docker for more reliable deployments:

```dockerfile
# Dockerfile for fraudguard
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["npm", "start"]
```

## 🔍 Current Status Check

### Test Local Build:
```bash
cd /workspaces/VictoryKit/frontend/tools/01-fraudguard
npm install
npm run build
echo "Build exit code: $?"
ls -la dist/
```

### Test Backend Services:
```bash
# Test if backend services can start locally
cd /workspaces/VictoryKit/backend/tools/01-fraudguard/ai-assistant
npm install
npm run build
npm start &
# Check if port 6001 is listening
netstat -tlnp | grep 6001
```

Would you like me to help create the vulnerability fix script or focus on getting the SSH connection working?
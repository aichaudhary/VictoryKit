# 🚀 VictoryKit EC2 Deployment

## Quick Deploy Commands

Run these commands in your **local terminal** (not Codespaces):

### 1. Test SSH Connection
```bash
chmod 400 victorykit.pem
ssh -i victorykit.pem ubuntu@ec2-18-140-156-40.ap-southeast-1.compute.amazonaws.com "echo 'Connected!'"
```

### 2. One-Command Deploy
```bash
bash deploy-ec2.sh
```

Or manually:

### 3. Manual Setup (if script fails)

**Step A: Prepare EC2**
```bash
ssh -i victorykit.pem ubuntu@ec2-18-140-156-40.ap-southeast-1.compute.amazonaws.com
```

On EC2:
```bash
# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs nginx

# Install PM2
sudo npm install -g pm2

# Create app directory
mkdir -p ~/victorykit
exit
```

**Step B: Upload Files**
```bash
scp -i victorykit.pem -r backend ubuntu@ec2-18-140-156-40.ap-southeast-1.compute.amazonaws.com:~/victorykit/
scp -i victorykit.pem .env ubuntu@ec2-18-140-156-40.ap-southeast-1.compute.amazonaws.com:~/victorykit/
```

**Step C: Install & Start**
```bash
ssh -i victorykit.pem ubuntu@ec2-18-140-156-40.ap-southeast-1.compute.amazonaws.com
cd ~/victorykit/backend/shared && npm install
cd ~/victorykit/backend/tools/04-ransomshield/api && npm install
cd ~/victorykit/backend/tools/05-phishnetai/api && npm install
cd ~/victorykit/backend/tools/06-vulnscan/api && npm install

# Start with PM2
pm2 start backend/tools/04-ransomshield/api/src/server.js --name ransomshield
pm2 start backend/tools/05-phishnetai/api/src/server.js --name phishnetai
pm2 start backend/tools/06-vulnscan/api/src/server.js --name vulnscan
pm2 save
```

---

## 🌐 Endpoints After Deploy

| Tool | URL |
|------|-----|
| RansomShield | `https://api.maula.ai/api/v1/ransomshield` |
| PhishNetAI | `https://api.maula.ai/api/v1/phishnetai` |
| VulnScan | `https://api.maula.ai/api/v1/vulnscan` |
| Health Check | `https://api.maula.ai/health` |

## 🧪 Test

```bash
curl https://api.maula.ai/health
curl https://api.maula.ai/api/v1/ransomshield/health
```

---

## 📋 DNS Configuration ✅

| Type | Host | Value |
|------|------|-------|
| A | @ | 18.140.156.40 |
| A | * | 18.140.156.40 |
| CNAME | api | maula.ai |

---

## 🔒 SSL (After Deploy)

```bash
# On EC2
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d maula.ai -d api.maula.ai -d www.maula.ai
```

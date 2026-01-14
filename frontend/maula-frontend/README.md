<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Maula Frontend - Main Dashboard

The main dashboard for https://maula.ai built with Vite + React 19 + TypeScript.

## 🚀 Deployment

**IMPORTANT:** Deploy to `/var/www/maula.ai/live/` NOT `/var/www/maula.ai/`

### Quick Deploy

```bash
# From project root
./scripts/deploy-maula-frontend.sh
```

### Manual Deploy

```bash
# 1. Build
cd frontend/maula-frontend
npm run build

# 2. Deploy to CORRECT path
scp -i victorykit.pem -r dist/* ubuntu@ec2-18-140-156-40.ap-southeast-1.compute.amazonaws.com:/var/www/maula.ai/live/
```

### Server Structure

```
/var/www/maula.ai/
├── live/              ← NGINX SERVES FROM HERE!
│   ├── index.html
│   └── assets/
└── repo/              ← Git repository (not served)
```

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies: `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app: `npm run dev`

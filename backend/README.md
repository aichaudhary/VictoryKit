# 🦾 VictoryKit Backend - MAULA.AI Platform

## ⚠️ **CRITICAL WARNING: NO DUPLICATE TOOLS ALLOWED**

> **🚫 STRICT POLICY**: All 50 security tools are finalized in `/backend/tools/`
> **❌ NEVER CREATE NEW TOOLS** - Only update existing tools (01-50)
> **🔍 CHECK MASTER INVENTORY**: `docs/TOOLS-MASTER-INVENTORY.md`
> **📋 TOOL NUMBERS**: 01-fraudguard through 50-bugbountyai
> **💻 VIOLATION**: New tool creation = immediate removal + developer warning

**Recent Cleanup**: Removed duplicates 31-cloudsecure, 32-apishield (Jan 2, 2026)

---

## 📁 Backend Structure

```
backend/
├── shared/              # Shared utilities & services
├── tools/               # 50 Security Tools (01-50)
│   ├── 01-fraudguard/
│   ├── 02-intelliscout/
│   ├── ...
│   ├── 50-bugbountyai/
│   └── WARNING.md        # ⚠️ READ THIS FIRST
├── central-grid/        # API Gateway & Auth Service
└── shared-services/     # Common microservices
```

## 🚀 Development Guidelines

### ✅ **Working with Tools**
1. **Check `tools/WARNING.md`** before starting
2. **Verify tool number** in master inventory
3. **Update existing tools only**
4. **Follow naming convention**: `NN-toolname`

### 🔧 **Tool Structure**
Each tool follows this structure:
```
NN-toolname/
├── api/                 # Express.js API server
├── ml-engine/          # AI/ML processing
└── README.md           # Tool documentation
```

### 📊 **Port Allocation**
- **API Ports**: 4001-4050 (tool 01 = port 4001)
- **ML Ports**: 8001-8050 (tool 01 = port 8001)
- **Frontend Ports**: 3001-3050 (tool 01 = port 3001)

---

## ⚠️ **REMINDER: 50 TOOLS FINAL - NO MORE CREATION ALLOWED**
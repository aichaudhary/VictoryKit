# 🛡️ DataGuardian - Personal Data Protection Hub

<div align="center">

![DataGuardian Logo](https://img.shields.io/badge/DataGuardian-Personal%20Data%20Protection-10b981?style=for-the-badge&logo=shield&logoColor=white)

[![Version](https://img.shields.io/badge/version-10.1.0-10b981.svg)](https://github.com/VM07B/VictoryKit)
[![Port](https://img.shields.io/badge/API-4010-blue.svg)](http://localhost:4010)
[![Frontend](https://img.shields.io/badge/Frontend-3010-green.svg)](http://localhost:3010)

**User-Facing Data Protection Platform - Check Breaches, Privacy Score, Dark Web Exposure**

[Live Demo](https://dataguardian.maula.ai) • [Maula.AI](https://maula.ai)

</div>

---

## 🎯 Overview

**DataGuardian** is a user-facing personal data protection platform that helps users:
- Check if their email was exposed in data breaches
- Test password strength and breach exposure  
- Get a privacy score with actionable recommendations
- Monitor dark web for their data
- See their digital footprint across platforms
- Generate data removal requests (GDPR, CCPA, etc.)

---

## ✨ Features

| Tab | Feature | Description |
|-----|---------|-------------|
| 🔓 | **Breach Check** | Like HaveIBeenPwned - check email breaches |
| 🔑 | **Password Check** | Strength + breach exposure analysis |
| 📊 | **Privacy Score** | 0-100 score with 5 categories |
| 🌑 | **Dark Web** | Dark web monitoring & alerts |
| 👣 | **Digital Footprint** | See where your data exists |
| 🗑️ | **Data Removal** | GDPR/CCPA request generators |

---

## 🏗️ Architecture

```
Port 3010 - Frontend (React/TypeScript)
Port 4010 - Backend API (Node.js/Express)
Database  - MongoDB: dataguardian_db
```

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/breach/check` | Check email for breaches |
| POST | `/api/password/check` | Check password strength |
| GET | `/api/privacy/score` | Get privacy score |
| POST | `/api/darkweb/check` | Dark web monitoring |
| POST | `/api/footprint/analyze` | Digital footprint scan |
| POST | `/api/removal/generate` | Generate removal request |

---

## 💾 Database Collections

- `breach_checks` - Email breach check results
- `privacy_scores` - Privacy score calculations
- `darkweb_alerts` - Dark web monitoring alerts
- `footprint_scans` - Digital footprint results
- `removal_requests` - Data removal request history

---

## 🔌 Third-Party APIs

| API | Purpose | Key Variable |
|-----|---------|--------------|
| HaveIBeenPwned | Breach data | `HIBP_API_KEY` |
| Pwned Passwords | Password checks | Free (k-Anonymity) |
| SpyCloud | Dark web monitoring | `SPYCLOUD_API_KEY` |
| Dehashed | Breach search | `DEHASHED_API_KEY` |

---

## 🚀 Quick Start

```bash
cd backend/tools/10-dataguardian/api
npm install
cp .env.example .env
npm run dev
```

---

## 🎨 Theme

- **Primary**: Emerald/Green `#10b981`
- **Background**: Gray-950 `#030712`

---

**Tool 10** | **https://dataguardian.maula.ai** | Built by AI for Maula.AI

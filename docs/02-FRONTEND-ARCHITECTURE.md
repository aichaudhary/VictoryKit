# 🎨 Frontend Architecture - MAULA.AI

## 🏗️ Frontend Structure

```
FRONTEND ARCHITECTURE
│
├─ 🏠 Main Dashboard (maula.ai)
│   ├─ Landing Page
│   ├─ All 50 Tools Grid
│   ├─ User Profile
│   ├─ API Keys Management
│   └─ Billing Dashboard
│
└─ 🛡️ 50 Independent Tool Frontends
    ├─ Each tool = Standalone Next.js app
    ├─ Own routing, state, components
    └─ No shared components between tools
```

---

## 📂 Frontend Directory Structure

```
frontend/
│
├─ main-dashboard/                    # Central VictoryKit UI
│   ├─ app/
│   │   ├─ (auth)/
│   │   │   ├─ login/
│   │   │   └─ register/
│   │   ├─ dashboard/
│   │   ├─ profile/
│   │   ├─ api-keys/
│   │   ├─ billing/
│   │   └─ tools/                     # Grid of all 50 tools
│   ├─ components/
│   │   ├─ Navbar.tsx
│   │   ├─ ToolCard.tsx
│   │   ├─ Sidebar.tsx
│   │   └─ Footer.tsx
│   ├─ lib/
│   │   ├─ auth.ts
│   │   └─ api.ts
│   ├─ styles/
│   │   └─ globals.css
│   ├─ public/
│   ├─ package.json
│   ├─ next.config.js
│   └─ tailwind.config.js
│
├─ tools/
│   ├─ 01-fraudguard/                 # Tool 1 (Standalone)
│   │   ├─ app/
│   │   │   ├─ page.tsx               # Main tool interface
│   │   │   ├─ dashboard/
│   │   │   ├─ analytics/
│   │   │   └─ settings/
│   │   ├─ components/
│   │   │   ├─ FraudScoreDisplay.tsx
│   │   │   ├─ TransactionLog.tsx
│   │   │   ├─ AIAssistant.tsx        # Conversational AI chat
│   │   │   └─ RiskGraph.tsx
│   │   ├─ lib/
│   │   │   ├─ api.ts                 # FraudGuard API calls
│   │   │   └─ aiChat.ts              # LLM integration
│   │   ├─ hooks/
│   │   │   ├─ useFraudScore.ts
│   │   │   └─ useAIChat.ts
│   │   ├─ styles/
│   │   ├─ package.json
│   │   ├─ next.config.js
│   │   └─ tailwind.config.js
│   │
│   ├─ 02-smartscore/                 # Tool 2 (Standalone)
│   │   ├─ app/
│   │   ├─ components/
│   │   ├─ lib/
│   │   └─ ... (same structure)
│   │
│   ├─ 03-checkoutshield/             # Tool 3
│   ├─ 04-fraudflow/                  # Tool 4
│   ├─ 05-riskengine/                 # Tool 5
│   ├─ 06-deviceprint/                # Tool 6
│   ├─ 07-trustdevice/                # Tool 7
│   ├─ 08-bioscan/                    # Tool 8
│   ├─ 09-multiauth/                  # Tool 9
│   ├─ 10-verifyme/                   # Tool 10
│   ├─ 11-ipintel/                    # Tool 11
│   ├─ 12-proxydetect/                # Tool 12
│   ├─ 13-georisk/                    # Tool 13
│   ├─ 14-ipscore/                    # Tool 14
│   ├─ 15-fraudcheck/                 # Tool 15
│   ├─ 16-paymentshield/              # Tool 16
│   ├─ 17-transactguard/              # Tool 17
│   ├─ 18-revenuedefense/             # Tool 18
│   ├─ 19-smartpayment/               # Tool 19
│   ├─ 20-idverify/                   # Tool 20
│   ├─ 21-globalkyc/                  # Tool 21
│   ├─ 22-identityai/                 # Tool 22
│   ├─ 23-agecheck/                   # Tool 23
│   ├─ 24-botshield/                  # Tool 24
│   ├─ 25-challengedefense/           # Tool 25
│   ├─ 26-antibot/                    # Tool 26
│   ├─ 27-humancheck/                 # Tool 27
│   ├─ 28-iosattest/                  # Tool 28
│   ├─ 29-androidverify/              # Tool 29
│   ├─ 30-captchaplus/                # Tool 30
│   ├─ 31-adaptivemfa/                # Tool 31
│   ├─ 32-accessmanager/              # Tool 32
│   ├─ 33-emailguard/                 # Tool 33
│   ├─ 34-phoneverify/                # Tool 34
│   ├─ 35-contactscore/               # Tool 35
│   ├─ 36-geofence/                   # Tool 36
│   ├─ 37-travelrisk/                 # Tool 37
│   ├─ 38-vpndetect/                  # Tool 38
│   ├─ 39-socialverify/               # Tool 39
│   ├─ 40-digitalfootprint/           # Tool 40
│   ├─ 41-accountage/                 # Tool 41
│   ├─ 42-cryptorisk/                 # Tool 42
│   ├─ 43-walletcheck/                # Tool 43
│   ├─ 44-chainanalytics/             # Tool 44
│   ├─ 45-docscan/                    # Tool 45
│   ├─ 46-facematch/                  # Tool 46
│   ├─ 47-livenesscheck/              # Tool 47
│   ├─ 48-multiaccountdetect/         # Tool 48
│   ├─ 49-velocitycheck/              # Tool 49
│   └─ 50-sessionguard/               # Tool 50
│
└─ shared-types/                      # Only TypeScript types
    └─ index.ts                       # API response types, etc.
```

---

## 🎨 Standard Tool Frontend Structure

Every tool follows this pattern:

```
tool-name/
├─ app/
│   ├─ page.tsx                       # Main tool page
│   ├─ layout.tsx                     # Tool-specific layout
│   ├─ dashboard/page.tsx             # Analytics dashboard
│   ├─ analytics/page.tsx             # Detailed analytics
│   ├─ settings/page.tsx              # Tool configuration
│   └─ api-docs/page.tsx              # API documentation
│
├─ components/
│   ├─ ToolInterface.tsx              # Main tool UI
│   ├─ ResultDisplay.tsx              # Show analysis results
│   ├─ AIAssistant.tsx                # AI chat interface
│   ├─ ChatHistory.tsx                # Previous conversations
│   ├─ LLMSelector.tsx                # Choose AI provider
│   ├─ Analytics.tsx                  # Charts/graphs
│   ├─ APIKeyManager.tsx              # API key for this tool
│   └─ ExportData.tsx                 # Export results
│
├─ lib/
│   ├─ api.ts                         # Backend API calls
│   ├─ aiChat.ts                      # LLM integration
│   ├─ websocket.ts                   # Real-time chat
│   └─ utils.ts                       # Helper functions
│
├─ hooks/
│   ├─ useToolAPI.ts                  # Tool-specific API hook
│   ├─ useAIChat.ts                   # AI chat hook
│   └─ useAnalytics.ts                # Analytics hook
│
├─ types/
│   └─ index.ts                       # Tool-specific types
│
├─ styles/
│   └─ tool.css                       # Tool-specific styles
│
├─ package.json
├─ next.config.js
└─ tailwind.config.js
```

---

## 🧩 Core Components (Per Tool)

### 1. ToolInterface.tsx
```typescript
// Main interface where user interacts with the tool
// Example: IP address input, fraud score display, etc.

interface ToolInterfaceProps {
  onSubmit: (data: any) => void;
  loading: boolean;
  result: any;
}
```

### 2. AIAssistant.tsx
```typescript
// Conversational AI chat interface
// User can ask questions, get help, configure settings

interface AIAssistantProps {
  toolName: string;
  context: any;  // Current tool data/results
  onSendMessage: (message: string) => void;
  messages: Message[];
  llmProvider: 'claude' | 'gpt' | 'grok' | 'mistral' | 'gemini';
}
```

### 3. LLMSelector.tsx
```typescript
// Let user choose AI provider

interface LLMSelectorProps {
  selectedProvider: string;
  onProviderChange: (provider: string) => void;
  availableProviders: LLMProvider[];
}
```

### 4. ResultDisplay.tsx
```typescript
// Display tool analysis results
// Charts, scores, risk indicators, etc.

interface ResultDisplayProps {
  data: any;
  visualizationType: 'chart' | 'table' | 'map' | 'graph';
}
```

---

## 🎨 UI Design System

### Color Palette (Dark + Neon Cyber Theme)
```css
:root {
  /* Dark Base */
  --bg-primary: #0a0e27;
  --bg-secondary: #151934;
  --bg-card: #1a1f3a;
  
  /* Neon Accents */
  --neon-blue: #00d4ff;
  --neon-purple: #b759ff;
  --neon-green: #00ff88;
  --neon-red: #ff0055;
  --neon-yellow: #ffdd00;
  
  /* Text */
  --text-primary: #ffffff;
  --text-secondary: #a0aec0;
  --text-muted: #718096;
}
```

### Typography
```css
/* Headers */
font-family: 'Inter', 'Roboto', sans-serif;

/* Code */
font-family: 'JetBrains Mono', 'Fira Code', monospace;
```

### Component Styles
- **Cards**: Glass-morphism effect with neon borders
- **Buttons**: Gradient hover effects
- **Inputs**: Neon focus glow
- **Charts**: Animated, gradient fills
- **AI Chat**: Cyberpunk message bubbles

---

## 🔄 State Management

### Per-Tool State (React Context + Zustand)
```typescript
// Example: IPIntel Tool State

interface IPIntelState {
  currentIP: string;
  analysis: IPAnalysis | null;
  loading: boolean;
  aiMessages: Message[];
  selectedLLM: LLMProvider;
  chatHistory: ChatSession[];
  apiKey: string;
}

const useIPIntelStore = create<IPIntelState>((set) => ({
  // ... state management
}));
```

---

## 🌐 Routing Strategy

### Main Dashboard
```
maula.ai/                → Landing
maula.ai/login           → Login
maula.ai/register        → Register
maula.ai/dashboard       → User dashboard
maula.ai/tools           → All tools grid
maula.ai/profile         → User profile
maula.ai/api-keys        → API key management
maula.ai/billing         → Billing
```

### Individual Tools (Subdomains)
```
fraudguard.maula.ai/             → Tool home
fraudguard.maula.ai/dashboard    → Analytics
fraudguard.maula.ai/settings     → Configuration
fraudguard.maula.ai/api-docs     → API docs
```

---

## ⚡ Performance Optimization

1. **Code Splitting**: Each tool loads independently
2. **Lazy Loading**: Components load on demand
3. **Image Optimization**: Next.js Image component
4. **Caching**: SWR for API data caching
5. **SSR/SSG**: Server-side rendering for SEO
6. **WebSocket**: Real-time AI chat (no polling)

---

## 📱 Responsive Design

- **Desktop**: Full dashboard with sidebars
- **Tablet**: Collapsible navigation
- **Mobile**: Bottom navigation, stacked layout

---

## 🔐 Frontend Security

1. **JWT Storage**: HttpOnly cookies
2. **CSRF Protection**: Token validation
3. **XSS Prevention**: Sanitize user inputs
4. **API Key Masking**: Show only last 4 digits
5. **Rate Limiting**: Client-side throttling

---

**Next:** Backend Architecture Design

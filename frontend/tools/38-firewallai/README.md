# FirewallAI (Tool 38)

AI-driven firewall management with real-time policy generation, intrusion correlation, and WebSocket AI assistant powered by Gemini 1.5 Pro.

## What's New
- Single source of truth config at `firewallai-config.json` (ports: frontend 3038, backend 4038, AI WS 6038, WAF 8080).
- Frontend services: `services/config.ts` (config access), `services/aiService.ts` (WebSocket AI helper), `services/firewallAPI.ts` updated to use Vite env/config.
- AI Assistant backend: `/backend/tools/38-firewallai/ai-assistant` with Gemini server and function executor for 10 FirewallAI functions.

## AI Functions (WebSocket)
- `analyze_traffic_pattern`: anomaly detection across segments/baselines.
- `generate_firewall_policy`: policy synthesis from assets/risk/controls.
- `simulate_rule_change`: blast radius and impact simulation for proposed rules.
- `detect_intrusion_campaign`: correlates multi-stage intrusion paths.
- `recommend_microsegmentation`: segmentation design from flows and sensitivity tags.
- `optimize_waf_rules`: tunes WAF signatures and latency budgets.
- `generate_incident_runbook`: produces containment/recovery steps.
- `enrich_threat_intel`: enriches indicators with intel sources and blocks.
- `assess_compliance_gap`: maps controls to frameworks and gaps.
- `forecast_capacity`: projects capacity based on growth and attack trends.

## Runbook
- Env: `GEMINI_API_KEY` required for AI assistant.
- Start AI Assistant: `cd backend/tools/38-firewallai/ai-assistant && npm install && npm run dev` (ws://localhost:6038).
- Frontend env overrides: `VITE_API_URL`, `VITE_WS_URL` if non-default; default uses config ports.

## Deployment Notes
- Subdomain: `firewallai.maula.ai`, AI endpoint path `/maula-ai`.
- Datastore: `firewallai_db` collections for events, policies, intel cache, incidents, and playbooks.
- Integrations: SIEM (Splunk/ELK/Chronicle), SOAR (XSOAR/Phantom), threat intel (OTX/MISP/VirusTotal/CrowdStrike).
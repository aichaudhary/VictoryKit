# Tool URL Routing Conventions

Every security tool in VictoryKit serves three consistent touchpoints. Only the subdomain changes per tool; the path structure must remain identical.

1. **Marketing landing** – `https://<tool>.maula.ai`
   - Lightweight overview or funnel content for the tool.
   - No shared assets from other tools.
2. **Dedicated product experience** – `https://<tool>.maula.ai/maula`
   - Full-featured UI for the tool (dashboards, workflows, branding).
   - Include a prominent "AI Assistant" entry point here that links to `/maula/ai`.
3. **Embedded AI assistant** – `https://<tool>.maula.ai/maula/ai`
   - Hosts the shared Neural Link interface from `frontend/neural-link-interface/`.
   - Must inherit the tools logo, colors, and guardrails (prompt, context, assets).

## Implementation Checklist

- Define routes in the tools `src/App.tsx`:
  ```tsx
  <Route path="/maula" element={<ToolExperience />} />
  <Route path="/maula/ai" element={<NeuralLinkInterface />} />
  ```
- Expose an "AI Assistant" button inside the `/maula` page that navigates to `/maula/ai` using React Router or a plain `<a>`.
- Do **not** alter the global homepage (`maula.ai`) or the tools marketing intro page (`<tool>.maula.ai`).
- Keep each tool fully standalone (assets, theming, copy). The only shared surface is the Neural Link component itself.
- When adding new tools, mirror this structure before wiring deployments.

Following this contract keeps navigation predictable across all 50+ tools while letting each product maintain its own brand identity.

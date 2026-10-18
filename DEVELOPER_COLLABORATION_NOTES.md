# Developer & AI Agent Symbiotic Collaboration Notes (`John-wellness-` ↔ `Comandvoice` VoiceLayer)

**Last Updated:** October 2026  
**Repositories Involved:**
1. **Host Application (`John-wellness-`):** CuasarX Longevity By Keel (`React 19 + Vite + TypeScript + Supabase + Express API`)
2. **Voice & Agent Layer (`Comandvoice`):** VoiceLayer Widget v0.6.0-vnext (`public/voicelayer/voicelayer.js` & `voicelayer.min.js`)
3. **Machine-Readable Agent Manifest:** [`public/llms.txt`](public/llms.txt) & `window.__VOICELAYER_SYMBIOSIS__`

---

## 1. Purpose of This Document (For Human Developers & AI Coding Agents)

This file is the **symbiotic communication bridge** between the **Host Web App developer/AI (`John-wellness-` or any future website)** and the **VoiceLayer developer/AI (`Comandvoice`)**.

Whenever an AI coding agent or developer works on either repository, read this file (and [`public/llms.txt`](public/llms.txt)) first so that:
1. **VoiceLayer absorbs 100% of the host website's live data** (personal data, biometrics, primary clinical calendar, second work/training/trips calendar, pending supplements to take, pending refills to buy, catalog inventory, and visible UI cards).
2. **Every link, button, tab, and form on the page is voice-clickable** with verified receipt readback.
3. **Multi-user / multi-athlete switching is isolated** per user ID so VoiceLayer learns each individual user's behavior and preferences without mixing profiles.

---

## 2. Executive Quick Summary & Dual-Calendar Architecture in `John-wellness-`

When a user or athlete wakes VoiceLayer or asks *"Give me my daily briefing"*, *"What is pending today?"*, or *"How is my day?"*, VoiceLayer speaks a warm, human executive summary covering **6 live pillars**:

| Pillar | Source in `John-wellness-` (`src/App.tsx`) | VoiceLayer API / Getter |
| :--- | :--- | :--- |
| **1. Weather (Temp + Raining/Dry)** | `fetchBriefing()` (`/api/briefing`) or Open-Meteo fallback | `VoiceLayer.setWeather(...)` / `VoiceLayer.briefing.weather` |
| **2. Personal Data & Biometrics** | `activeUser` (`readiness`, `metrics.sleep`, `metrics.hrv`, `metrics.rhr`, `biologicalAge`, `organHealth`, `biomarkers`) | `VoiceLayer.setUser(id, profile)` / `VoiceLayer.getProfile()` |
| **3. Calendar 1 (Primary Clinical & Appointments)** | `calEvents` (*Dr. Chen follow-up (labs & ApoB review) 09:00*, *AOSM Organ Reserve & DEXA Check-in 11:30*) | `VoiceLayer.setCalendar(calEvents)` / `VoiceLayer.briefing.calendar` |
| **4. Calendar 2 (Work, Training & Travel / Trips)** | `workCalEvents` (*Weekly review — Keel Performance Board 15:00*, *Zone 2 Active Recovery Ride 18:30*, *NYC Longevity Summit Flight & Circadian Prep Tomorrow 07:30*) | `VoiceLayer.setWorkCalendar(workCalEvents)` / `VoiceLayer.briefing.workCalendar` |
| **5. Pending to Take (Daily Regimen)** | `activeUser.inventory` (`invToTake`) + `/api/briefing` `meds` | `VoiceLayer.setToTake(medsToTake)` / `VoiceLayer.briefing.toTake` |
| **6. Pending to Buy (Refills & Low Stock)** | `activeUser.inventory` (`daysRemaining <= 7`) + `reorderSoon` + `cartItems` | `VoiceLayer.setToBuy(mergedToBuy)` / `VoiceLayer.briefing.toBuy` |

### Voice Commands for Each Pillar:
- **Everything Pending / Full Executive Summary:** *"Give me my daily briefing"*, *"What is pending today?"*, *"Summary of everything pending"*
- **Primary Clinical Calendar:** *"What is on my calendar today?"*, *"What appointments do I have?"*
- **Second Calendar (Work, Training & Trips):** *"What is on my work calendar?"*, *"Check my second calendar"*, *"What meetings or trips do I have?"*, *"Do I have any flights or travel?"*
- **Pending to Take:** *"What is pending to take today?"*, *"What supplements do I need to take?"*
- **Pending to Buy:** *"What is pending to buy?"*, *"What needs a refill?"*
- **Biometrics, Labs & Organ Longevity:** *"What is my readiness score?"*, *"What is my biological age?"*, *"How is my sleep and HRV?"*, *"What are my lab biomarkers?"*, *"What is my workout today?"*

---

## 3. Universal Symbiotic Handshake Contract (For Any Website or Web App)

To place VoiceLayer on **any** website and establish instant symbiosis, the host site only needs to provide `window.__VOICELAYER_SYMBIOSIS__` or call `window.VoiceLayer.symbiosis.handshake({...})`:

```ts
const symbiosisSpec = {
  appName: 'CuasarX Longevity By Keel',
  repo: 'John-wellness-',
  userId: activeUser.id,           // Multi-user storage isolation key
  profile: profilePayload,         // Biometrics, labs, organ health, macros, workout
  calendar: calEvents,             // Primary / clinical appointments calendar
  workCalendar: workCalEvents,     // Second calendar: work meetings, training, trips/flights
  toTake: medsToTake,              // Pending doses/tasks to take today
  toBuy: mergedToBuy,              // Low-supply items & refills pending to buy
  weather: weatherPayload,         // Optional override (otherwise auto-fetched via Open-Meteo)
  inventory: inventoryPayload,     // Full product catalog
  knowledge: knowledgePayload,     // Structured domain Q&A passages
  signals: signalsPayload,         // Companion telemetry metrics
  actions: [                       // Optional custom voice-callable functions
    {
      name: 'switchPersona',
      phrases: ['switch persona', 'change athlete'],
      handler: () => { /* custom host callback */ }
    }
  ]
};

window.__VOICELAYER_SYMBIOSIS__ = symbiosisSpec;
window.VoiceLayer?.symbiosis?.handshake?.(symbiosisSpec);
```

### Multi-User Learning & Isolation (`VoiceLayer.setUser`)
- When a site has multiple users, clients, or athletes (such as `John Wellness`, `Elena Vance`, `Marcus Sterling`), calling `VoiceLayer.setUser(userId, profile)` stores each user's profile and behavioral learning separately under `localStorage["voicelayer.profile.v1:<userId>"]` and tracks known users in `localStorage["voicelayer.users.v1"]`.
- Inspect anytime in console:
  - `window.VoiceLayer.profile.activeUserId`
  - `window.VoiceLayer.users`
  - `window.VoiceLayer.symbiosis.status()`

---

## 4. Global & Chinese Open-Source Research Integrated Into This Architecture

Our symbiotic design synthesizes the strongest patterns from leading global and Chinese open-source GUI/web-agent ecosystems:
1. **ByteDance `UI-TARS` (`bytedance/UI-TARS`) & Alibaba `Page-Agent` / `Mobile-Agent`:**
   - **Closed-loop Action Receipts:** Every voice click, navigation, scroll, or form fill emits a verified receipt (`status: 'succeeded'`, `verification: 'dom_effect' | 'read_back'`) so the user gets immediate, trustworthy human feedback.
2. **Zhipu AI / Tsinghua `Open-AutoGLM` & `CogAgent` (`zai-org/Open-AutoGLM`):**
   - **Two-Tier Intent Routing + Safety Gate:** Fast deterministic local grammar (`parse` + `parseSkills` + `Knowledge.ask`) handles 95% of navigation, calendar, biometric, and catalog commands in `<15ms` with zero network latency, while open-ended reasoning routes to `/api/voice/ask` or `/api/coach` (Groq `llama-3.3-70b-versatile`) with full profile/DOM context. Sensitive actions (checkout, payment, delete) require explicit confirmation.
3. **`Browser-Use` (`browser-use/browser-use`) & W3C `WebMCP` (`navigator.modelContext`):**
   - **Dual-Path Absorption (DOM + Structured Symbiosis):** VoiceLayer scans visible React/Tailwind cards and interactive controls (`Scanner.scan()`) AND auto-discovers `window.__VOICELAYER_SYMBIOSIS__`, `<script type="application/voicelayer+json">`, and `navigator.modelContext.tools`.
4. **Agentic Web Standard (`/llms.txt`):**
   - Both repos ship [`public/llms.txt`](public/llms.txt) and `DEVELOPER_COLLABORATION_NOTES.md` so any AI coding assistant (Cursor, Claude Code, Antigravity, Windsurf, Copilot) or human developer immediately understands how to extend or debug the integration.

---

## 5. How to Sync & Verify Changes Between Both Repos

```powershell
# 1. In Comandvoice: build voicelayer.min.js and run the 61-test verification suite
cd C:\Users\jasme\ZCodeProject\Comandvoice
npm run build
node tests/verify-v060.mjs

# 2. Copy the built widget files into John-wellness-
Copy-Item "C:\Users\jasme\ZCodeProject\Comandvoice\public\voicelayer\voicelayer.js" "C:\Users\jasme\ZCodeProject\John-wellness-\public\voicelayer\voicelayer.js" -Force
Copy-Item "C:\Users\jasme\ZCodeProject\Comandvoice\public\voicelayer\voicelayer.min.js" "C:\Users\jasme\ZCodeProject\John-wellness-\public\voicelayer\voicelayer.min.js" -Force
Copy-Item "C:\Users\jasme\ZCodeProject\Comandvoice\public\voicelayer\voicelayer.css" "C:\Users\jasme\ZCodeProject\John-wellness-\public\voicelayer\voicelayer.css" -Force
Copy-Item "C:\Users\jasme\ZCodeProject\Comandvoice\public\voicelayer\voicelayer.min.css" "C:\Users\jasme\ZCodeProject\John-wellness-\public\voicelayer\voicelayer.min.css" -Force
```

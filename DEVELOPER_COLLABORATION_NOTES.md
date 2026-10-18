# VoiceLayer × CuasarX (`John-wellness-`) — Developer Collaboration & Integration Notes

> **Shared Collaboration Document** across `Comandvoice` (VoiceLayer engine) and `John-wellness-` (CuasarX Longevity By Keel host platform).
> **Purpose:** Document how VoiceLayer absorbs any website + closed user profile data, what options exist for site/profile integration, what was wired for the `demo@quasarkeel.com` test deployment, and open items/questions for co-development.

---

## 1. Architectural Options for Absorbing Any Website & User Profile

VoiceLayer is designed as a **4-Tier Hybrid Site & Profile Absorption Engine** so it works out-of-the-box on any website while supporting deep integration with authenticated ("closed") user state:

### Option A — Automatic DOM, Card & Schema.org Absorption (Zero-Config, Always On)
- **How it works:** `CONFIG.knowledge = true` (now enabled by default in `voicelayer.js`) automatically indexes:
  1. **Headings & React/Tailwind Cards (`Knowledge.extract`):** Scans `h1..h5`, `[role=heading]`, `<dt>`, and walks up flex-wrapped headers to their enclosing `<article>`, `<section>`, or `.rounded-2xl`/`.rounded-3xl` card container to extract full prose passages.
  2. **FAQ / Details Accordions:** Automatically indexes `<details><summary>` pairs and `<dl><dt><dd>` lists.
  3. **JSON-LD (`application/ld+json`) & Meta Tags:** Extracts `Product`, `FAQPage`, `Organization`, and page description metadata.
  4. **Product Cards & Interactive Controls (`Inventory.scan` + `Scanner.scan`):** Automatically indexes product prices, stock badges, buttons, links, tabs, and inputs—keeping them live via `MutationObserver` as the user switches SPA tabs.

### Option B — Live Closed-Data / User Profile Push (`VoiceLayer.setProfile`, `setSignals`, `setKnowledge`, `setInventory`, `setCart`)
- **How it works:** When a host React/Next/Vue app has authenticated state (or SPA tabs that aren't mounted in the DOM yet), the host pushes structured data directly into VoiceLayer's runtime memory:
  - `window.VoiceLayer.setProfile(profileObj)` — Stores user identity, goals, readiness, sleep/HRV/RHR/training load, today's training plan, daily calorie/macro/hydration targets, organ longevity (AOSM biological age & organ reserve), longitudinal blood biomarkers, and active biohacking protocols.
  - `window.VoiceLayer.setSignals(signalsObj)` — Feeds daily briefing signals (`metrics`, `calendar`, `toTake`, `toBuy`, `weather`, `loyalty_points`).
  - `window.VoiceLayer.setKnowledge(factsArray)` — Injects site-wide domain knowledge or unmounted tab summaries (`[{ heading, text }]`) so the user can ask about any feature of the platform regardless of which tab is currently open.
  - `window.VoiceLayer.setInventory(itemsArray)` & `window.VoiceLayer.setCart(cartObj)` — Synchronizes the full product catalog and shopping cart state.

### Option C — Context-Grounded AI Brain Cascade (`CONFIG.aiAnswer` → `/api/voice/ask` → Local BM25/Token Fallback)
- **How it works:** When a user asks an open-ended question by voice or text, VoiceLayer builds a unified live snapshot (`VL.contextSnapshot()`) containing:
  - `page` (URL, title, lang)
  - `spatial` (active hovered/focused product, current section, visible controls)
  - `inventory` & `cart`
  - `profile` (including full `profile.details`)
  - `signals` & `briefing` (weather, calendar, pending supplements to take, pending refills to buy)
  - `pagePassages` (top 20 absorbed DOM + profile + custom knowledge passages)
- **3-Stage Resolution Cascade (`VL.aiAnswerFlow`):**
  1. **Stage 1 (`CONFIG.aiAnswer(question, ctx)`):** Calls the host app's `/api/coach` endpoint with `{ ...window.__CUASARX_COACH_CTX, voiceLayerContext: ctx }`.
  2. **Stage 2 (`Net.ask` → `POST /api/voice/ask`):** If `aiAnswer` returns `null` (e.g., local dev without `/api/coach` serverless runtime, or network error), VoiceLayer automatically falls back to the VoiceLayer AI endpoint (`xAI Grok / DeepSeek / Gemini` + `synthesizeFromContext`).
  3. **Stage 3 (`Knowledge.ask(question)`):** Deterministic client-side passage & profile matcher so the assistant never fails even offline.

### Option D — Crawl / Sitemap / RAG Vector Index (Optional Phase 2 for Multi-Page Docs)
- For sites with hundreds of separate static URLs (e.g. clinical research libraries or PDFs not loaded in the SPA bundle), we can optionally add a build-time or edge-cached `/voicelayer-knowledge.json` index that `VoiceLayer.setKnowledge(...)` preloads on boot.

---

## 2. What Was Integrated Today in Both Repos

### In `Comandvoice` (VoiceLayer Engine & Server)
1. **`public/voicelayer/voicelayer.js`:**
   - Enabled `CONFIG.knowledge = true` by default so VoiceLayer automatically absorbs any website it is deployed on.
   - Upgraded `Knowledge.extract()` to traverse modern React/Tailwind card layouts (`article`, `section`, `.rounded-2xl`, `.rounded-3xl`) when headings are wrapped inside flex header rows.
   - Added `Knowledge.dynamicFacts()` to automatically convert `Profile.get()` (`details.readiness`, `metrics`, `trainingPlan`, `nutrition`, `flags`, `organHealth`, `biologicalAge`, `biomarkers`, `biohackingProtocols`), `Signals.all()`, and `Inventory.items()` into searchable knowledge passages.
   - Exposed `window.VoiceLayer.setKnowledge(facts)` and `window.VoiceLayer.knowledge`.
   - Fixed `Companion.intercept()` during `stage === 'mood'` so if the user asks a real question right after the greeting (instead of saying *"good"* or *"tired"*), it immediately answers their question rather than treating it as a mood check-in.
   - Updated `VL.contextSnapshot()` to include `pagePassages` and updated `VL.aiAnswerFlow()` so when `CONFIG.aiAnswer` returns `null`, it seamlessly falls back to `Net.ask()` (`/api/voice/ask`) and `VL.knowledge()`.
2. **`src/index.tsx` (`POST /api/voice/ask`):**
   - Upgraded `synthesizeFromContext()` and the LLM system prompt to answer directly from `ctx.profile.details`, `ctx.pagePassages`, `ctx.signals`, `ctx.briefing`, and `ctx.inventory`.

### In `John-wellness-` (CuasarX Host Platform)
1. **`src/App.tsx`:**
   - Connected `activeUser` (`UserProfile`), `calculateOrganSystems(activeUser)`, `generateExecutiveReport(activeUser)`, `BIOHACKING_PROTOCOLS`, and `MOCK_PRODUCTS` to:
     - `window.VoiceLayer.setProfile(...)` (full biometrics, readiness, training plan, macros/hydration, biological age, 9 organ systems, blood/DEXA/VO2 biomarkers, biohacking protocols, and active regimen).
     - `window.VoiceLayer.setKnowledge(...)` (core platform sections & clinical capabilities so questions about any tab work immediately).
     - `window.__CUASARX_COACH_CTX` (enriched with `profileDetails` and full product catalog metadata).
   - Added `activeTab` to the sync dependencies so switching tabs triggers `VoiceLayer.rescan()` to absorb newly rendered tab DOM.
2. **`index.html`:**
   - Added `knowledge: { autoNav: false, minScore: 0.45 }` to `window.VoiceLayerConfig`.
   - Updated `aiAnswer(question, ctx)` so interactive voice questions work out-of-the-box for `demo@quasarkeel.com` testers (only blocking `/api/coach` if the user explicitly withdrew `ai_processing` consent in Privacy & Consent), and merged `voiceLayerContext: ctx` into the `/api/coach` payload.
3. **`api/coach.js`:**
   - Allowed guest/demo voice queries to use `/api/coach`, injected `ctx.profileDetails` and `ctx.voiceLayerContext.pagePassages` into the system prompt, and added `synthesizeCoachFallback(message, ctx)` so `/api/coach` returns accurate profile/site answers even if server LLM keys aren't set in a preview environment.

---

## 3. Questions & Coordination Notes for the Other Developer

Hi! Here are the key touchpoints and open questions for us to align on as we test `John-wellness-` + `VoiceLayer`:

1. **Supabase Live Profile vs. Synthetic Persona Switching (`src/App.tsx`):**
   - Right now, `activeUser` defaults to `SYNTHETIC_USERS[0]` (Alex Mercer, 42, Executive Triathlete) and can be switched via the persona selector, while `authProfile` holds Supabase `profiles` rows (`full_name`, `goals`, `loyalty_points`).
   - **Question:** As you move more fields (bloodwork, organ modeling inputs, or daily check-ins) from `SYNTHETIC_USERS` into Supabase tables, should we merge `authProfile` overrides on top of `activeUser` before calling `VoiceLayer.setProfile(...)`, or will `activeUser` itself be hydrated from Supabase?
2. **AI Processing Consent Gate (`index.html` & `src/lib/consent.tsx`):**
   - Previously, `index.html` had `if (!consent.records?.ai_processing?.granted) return null;`, which silently disabled Q&A for every new guest login (`demo@quasarkeel.com`) who hadn't visited the Privacy & Consent tab yet.
   - We updated `index.html` so interactive voice Q&A works by default during testing unless `ai_processing` was explicitly withdrawn (`granted === false && withdrawnAt`), and falls back to VoiceLayer's context engine if `/api/coach` returns `null`.
   - **Question:** For production HIPAA/FTC compliance, do you want `FirstRunConsent` to include a one-click toggle for `ai_processing` on first login, or should interactive voice Q&A be treated as user-initiated (implied consent per query) while background AI coaching remains opt-in?
3. **Custom Voice Actions on Clinical Modals (`TelemedicineVisit`, `IntakeOnboarding`, `OrganSystemModeling`):**
   - VoiceLayer automatically clicks any visible button/tab by its label or `data-vl-label`.
   - **Tip:** If you add new icon-only buttons or custom modals, adding `data-vl-label="Book Clinician Video Visit"` or `aria-label="..."` makes them immediately voice-addressable without touching VoiceLayer code.
4. **Updating the VoiceLayer Bundle in `John-wellness-`:**
   - The compiled drop-in files live in `public/voicelayer/voicelayer.js` and `public/voicelayer/voicelayer.css` (mirrored from `Comandvoice/public/voicelayer/`).
   - Local testing with full xAI Grok / DeepSeek voice intelligence runs with:
     - `Comandvoice`: `node scripts/server.mjs` (port `8790`)
     - `John-wellness-`: `npm run dev` (port `3000`)

---

## 4. Quick Verification Checklist for Testers (`demo@quasarkeel.com`)

1. Log in with **`demo@quasarkeel.com`** / **`DemoMVP-2026!`** (or click **Try Guest Mode**).
2. Verify the **Quasar Keel** glass bar appears at the top and greets you with your daily briefing (weather, calendar, pending supplements to take, low-stock items to buy).
3. Try asking any profile or website question (by voice or via `VoiceLayer.ask("...")` in console):
   - *"What is my readiness score and sleep today?"*
   - *"What is my biological age and organ health?"*
   - *"What are my lab biomarkers and ApoB?"*
   - *"What is my workout and training plan today?"*
   - *"What are my daily calorie and protein targets?"*
   - *"What biohacking protocols do I have?"*
   - *"Tell me about Creatine Monohydrate"*
   - *"Go to Lab Telemetry"* / *"Open my regimen"* / *"Open cart"*

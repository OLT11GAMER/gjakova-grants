# Gjakova Grants

Team Pooks' AI4Society hackathon prototype for the Gjakova Track C concept. It uses synthetic data and is not an official Municipality of Gjakova production service. It demonstrates applicant preparation and municipal review on one synthetic case, including a bounded, evidence-linked document-reading screen. The current reading result is **simulated**; no live organizer-proxy result has been verified.

## Local preview

```bash
npm ci
npm run build
npm run preview -- --host 127.0.0.1 --port 4173
```

Open the local URL printed by Vite. Use the visible role switcher to move between applicant and municipal views. The switcher is demonstrative and is not authentication.

For the presentation's clearly labeled simulated document result, start the built preview with `AI_DEMO_FIXTURE=1 npm run preview -- --host 127.0.0.1 --port 4173`. If 4173 is occupied, Vite prints the next available port. For development, run `npm run dev -- --host 127.0.0.1`. Checks: `npm run typecheck`, `npm run build`, `npm audit --audit-level=high`.

## Presentation reset and demo

Click the reset icon in the top bar, named **Rikthe të dhënat e demonstrimit**. From any route or role it removes only Gjakova Grants v2/v3 localStorage, keeps unrelated browser storage, clears rehearsal history/documents/archive/reading state, and returns to the applicant's **Grantet** list. The exact initial state is one historical closed training call, a populated synthetic Passport, a blank draft, no selected documents, no submission/correction/archive manifest, and no reading result. Readiness is recalculated from the approved fixed requirements when the applicant prepares the draft.

Use [docs/DEMO_RUNBOOK.md](docs/DEMO_RUNBOOK.md) for the timed stage sequence and screenshot fallback. The browser role switch is a demo aid, not authentication.

## Local document reading

Copy `.env.example` to `.env` and fill `AI_API_KEY` and `AI_BASE_URL` with the organizer's OpenAI-compatible credentials. Set `AI_BASE_URL` to the API root, including `/v1` if the proxy uses it; the local server appends `/chat/completions`. `AI_MODEL` defaults to `gpt-5.6-luna`; choose a vision-capable model the proxy actually supports. Never use a `VITE_*` variable for the key. Restart the local dev or preview server after changing `.env`.

```bash
npm run dev -- --host 127.0.0.1 --port 5173
# or, after npm run build:
npm run preview -- --host 127.0.0.1 --port 4173
```

The Vite local server handles `POST /api/document-assist` and calls the configured model. Netlify uses the function adapter described below for the same path. A plain static host without that function cannot perform a new document read. No API key is needed to build or use the manual workflow. With no configuration, the reading action explains its unavailability and the applicant can continue.

`AI_DEMO_FIXTURE=1` returns a hand-authored local result explicitly marked **Rezultat i simuluar lokal · pa thirrje AI**. It is not a live or captured AI result and is the approved pitch mode. No successful live call or captured AI result is bundled. A credential-free manual workflow remains available if the reading endpoint cannot be used.

## Scope

This is a local synthetic demonstration. State persists only in this browser under `gjakova-grants.demo.v3`; an existing valid `gjakova-grants.demo.v2` record is migrated without changing its submitted snapshot. M4 adds an optional compact reading record to the selected offer document version; it does not bump the dataset schema. Reset removes only those two app-owned keys.

The exact presentation path is documented in the runbook. The bundled synthetic offer exposes five structured values, evidence fragments and one unresolved description; the applicant can confirm/edit a value. Deterministic requirements remain authoritative. Staff can inspect the distinction between the original reading and applicant-confirmed values alongside the versioned correction flow.

A “submission,” correction and archive package are explicitly synthetic. Nothing reaches the municipality or SMAED, no official protocol reference is generated, and the role switch is not authentication. Camera capture and real uploads are deliberately absent. The app does not synchronize across devices or make funding, eligibility, authenticity, or identity decisions. The API key stays server-side; the local reading endpoint receives only the bundled synthetic offer scan. A compact schema-validated result may be stored in local demo state after the explicit read action. The scan payload and API response are not cached by the service worker. The verified public demo is https://gjakova-grants.netlify.app. The official team repository is https://github.com/AI4Society-Hachathon/Team-Pooks; the public personal mirror is https://github.com/OLT11GAMER/gjakova-grants. The current Netlify site was deployed by CLI from the verified project tree and is not yet Git-connected to the personal mirror. No fallback recording exists; use the verified screenshots in the runbook. See [project state](docs/PROJECT_STATE.md), [design guide](docs/DESIGN_GUIDE.md), and [pitch pack](docs/PITCH_PACK.md).

## Netlify deployment

`netlify.toml` runs `npm run build`, publishes `dist`, and bundles `netlify/functions/document-assist.mts`. The function adapts Netlify's request to the existing `server/documentAssist.ts` handler. The first rewrite sends `/api/document-assist` to the function; the later SPA fallback serves `index.html` for other unknown paths. The app's API URL, local Vite workflow, and browser-local demo state are unchanged.

The public site is `gjakova-grants` at https://gjakova-grants.netlify.app (Netlify site ID `e4f96861-f0f8-428e-a6b7-913ee16064de`). The current deployment was made with Netlify CLI; Git connection to the public personal mirror is pending GitHub authorization in Netlify. The draft preview tested was https://6ab8a40ddac3132856edcc53--gjakova-grants.netlify.app. `AI_DEMO_FIXTURE=1` is configured in the Netlify function runtime for production and deploy previews. The deployed demo was verified on 27 September 2026. The official team and personal public repositories both contain branch `main` at commit `d6d63d1380fe899a0efc347231e23e4903704a10` as of 27 September 2026. The current production site was deployed from the same project tree by CLI. Git-connected deployment from the personal mirror remains pending Netlify GitHub authorization.

The function reads `AI_DEMO_FIXTURE`, `AI_API_KEY`, `AI_BASE_URL`, and `AI_MODEL` at runtime. The recommended first public demo sets only `AI_DEMO_FIXTURE=1`, so its result remains visibly **simulated** and makes no upstream AI call. A future live test requires an intentionally configured server-side key, base URL and supported vision model, plus `AI_DEMO_FIXTURE` disabled; no organizer-proxy call has been verified. The app uses synthetic data and same-browser localStorage, with demo role switching rather than authentication. The service worker caches the public shell only and does not cache API responses or applicant state.

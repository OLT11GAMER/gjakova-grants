# Gjakova Grants build plan

Version 2. Planning only. No installed stack, branch or implementation status is assumed.

## Scope and sequence

The later WSL build task should inspect the existing checkout, instructions, Git remote, branch, changes, framework, package manager, lockfile, build scripts and tests. Preserve teammates' work. Do not create a second Windows copy or replace an existing app because this plan names preferred tools. The expected checkout is ~/projects/Team-Pooks; its existence remains unverified.

Use one coherent milestone prompt at a time. Each milestone ends with evidence and an updated project state. The planning chat reviews the report before the user requests the next prompt. These effort ranges are targets for a small prototype using reusable components, not promises about an unseen repository.

| Milestone | Main outcome and dependency | Target effort | Acceptance evidence | Exclusions and recovery |
|---|---|---|---|---|
| M1 Interface foundation | Inspect repo/references; applicant shell, calls, detail, Passport preview, staff queue/detail; shared fixtures and types; concise docs. | 60-120 min | Production build; usable navigation/filter; phone and desktop screenshots; designer comparison; resettable fixtures; empty/error/loading examples. | No paid calls, scraping, auth, Supabase, official submission, deploy or push. If references unavailable, record provisional tokens. Stop and hand off. |
| M2 Applicant workflow | M1 accepted; one training call, detail reuse, draft saving, synthetic documents, deterministic checks and demo receipt. | 45-90 min | Reload draft; fix missing requirement; submit once; snapshot stays unchanged after Passport edits; close-date handling; reset succeeds. | No official receipt or real IDs. Use local persistence if server unnecessary; disclose same-browser scope. |
| M3 Municipal review loop | M2 accepted; same case in staff view, correction request, applicant response, version comparison and event history. | 45-90 min | Replay one complete correction loop; action permissions represented; prior document preserved; applicant sees only public message; failed transition gives honest feedback. | No SMAED connector or real authorization claim. Export manifest/package only if loop is complete and time remains. |
| M4 One useful AI capability | M1 data types and M3 workflow stable; protected endpoint, approved public source, schema validation, draft requirements with source passages. | 45-90 min | Real input/output captured; required/optional items checked by human; ambiguity, malformed output and timeout handled; no browser secrets; actual usage logged. | No generic chat or applicant ranking. If failure, use a clearly labeled recorded successful result; if none exists, retain manual checklist and disclose AI unfinished. |
| M5 Demo release and pitch lock | Verified loop and truthful AI status; visual pass, supported hosting, recording, stills, final deck, release and submission readiness. | 45-90 min, pitch work runs in parallel | Core flow on demo link; repeatable reset; phone/desktop evidence; no runtime failures; actual claims reconciled; fallback recording works offline; final deck timed. | No fresh feature work. Hosting/account access may require user action in this future milestone. Do not claim deployment until URL is verified. |
| M6 Persistence/access | Optional after protected demo and pitch, otherwise pilot: database, authentication, private storage, reliable audit and cross-device state. | Pilot-sized; estimate after repo inspection | Applicant A cannot read B; staff scope enforced; durable versions; upload/download permissions; access logging; duplicate prevention. | Never squeeze unfinished security into a public real-data workflow. Keep synthetic-only demo if unavailable. |

Pitch work is a parallel workstream from now, not a reward for finishing M5. Assign one person as pitch owner, one as build integrator, and the designer as visual owner; people may hold more than one role. Confirm actual names later. Give source verification/OCR to a teammate if available. Avoid parallel edits to the same files without ownership.

## Minimum coherent demo

Use one historical Gjakova source and one synthetic applicant. Candidate start-up required items from prior PDF inspection: application, ID copy, proforma/offer, optional training references and sworn declaration. Recheck exact lot wording before use. Optional references must not be counted as a missing mandatory document. Do not merge Lot I and Lot II requirements.

Stage a missing declaration, then a clerk clarification concerning a deliberately unclear synthetic quote. This gives one understandable preparation issue and one visible correction after submission. If timing is too tight, retain only the post-submission clarification and show the already-complete checklist in the starting state. Do not expand into all grant categories or add unrelated personas.

The fixture service is the common data source for both demo views. Local state may persist in one browser, but changing roles does not prove cross-device synchronization. Present the municipal desktop view by resizing/switching within the same browser or a recording until a real shared backend is implemented.

Minimum domain records: Call, CallVersion, Requirement with evidence pointer, ApplicantProfile, Application with submitted snapshot, DocumentVersion, CheckResult, CorrectionRequest and CaseEvent. Add ArchiveHandoff only when the preparation screen is built. A normal set of functions at the data boundary is enough; avoid a framework of repositories/factories.

## Tooling assessment

Current task has working file reads/edits and web research. The browser tool failed initialization; WSL enumeration returned access denied. No Figma, Supabase or Vercel account connection was demonstrated. Vercel-related skills are guidance, not proof of a connected deployment account. Available Canva tools are not necessary for app implementation. Tools must be rechecked in the WSL build task.

| Candidate | Type and task | Availability/setup | Fallback and timing |
|---|---|---|---|
| Existing framework/package manager | App/build foundation | Unknown until repo inspection; reuse first. | For an empty suitable repo, React + TypeScript + [Vite](https://vite.dev/guide/); M1. |
| Tailwind + [shadcn/ui](https://ui.shadcn.com/docs) | App styling and editable components | Candidate only; install selected components if appropriate. | Existing CSS/component library; M1. Do not install two competing systems. |
| Lucide | App icons | Reuse if present; small setup otherwise. | Existing icon library; M1. |
| React Hook Form + Zod | Forms and validation | Inspect existing dependencies; add when form/AI schema needs justify them. | Native form state plus existing validator; M2/M4. |
| Poppler/PDF text extraction | Offline preparation of public material | WSL availability unknown. | Review text-capable PDF with existing parser; source preprocessing M2/M4. |
| Tesseract + OCRmyPDF | Local OCR without LLM tokens | Native packages and language data needed if absent. | Manual transcription of a short reviewed excerpt; M2/M4. |
| Existing browser/Playwright capability | Agent verification | Current browser init failed; WSL availability unknown. | Exact manual phone/desktop checks and screenshots, disclosed as manual; every build milestone. |
| Designer exports / Figma connection | Agent design context | designer/ uninspected; Figma connector not connected here. | Local exported PNG/PDF/SVG plus notes; M1. No plugin prerequisite. |
| Web/docs tools | Agent authoritative references | Available and used here. | Official documentation pages; read narrow relevant sections. |
| Vercel | Later demo hosting and small server endpoint | Skills available; project/account/limits unknown. | Existing compatible host or accepted run instructions; M5. Verify terms, costs and runtime fit then. |
| Supabase or existing backend | Persistence, access and storage | No connection demonstrated. | Resettable local synthetic demo; M6/pilot. |
| [Ponytail](https://github.com/DietrichGebert/ponytail) lite | Optional agent code guidance | Identified; not installed or activated. | Concise project instructions; optional M1 trial only if setup is trivial. |

Ponytail's [skill](https://github.com/DietrichGebert/ponytail/blob/main/skills/ponytail/SKILL.md) offers intensity levels; lite preserves requested work while suggesting simpler alternatives. Its [MCP wrapper](https://github.com/DietrichGebert/ponytail/blob/main/ponytail-mcp/README.md) supplies instructions, not browser/database operations. Do not stack redundant instruction mechanisms or claim predictable token savings. Retain the data boundary, designer control, validation and meaningful checks. The exact project is now known despite the older kickoff saying otherwise.

Efficiency comes from one accepted scope, a shared fixture/data contract, reusable components, targeted source reading and short milestone reports. Do not repeat the complete transcript in every prompt or spend time benchmarking tools during the hackathon.

## Public content and zero-token OCR

Use a curated import before building a crawler. Confirm the source page, attachment, title, deadline, applicant category, required documents and application route. Capture URL, checked date, source hash, page anchors, whether text was OCR-derived and staff approval status. Keep unknown fields unknown. Label historical content and distinguish an official call from its training copy.

Suggested pipeline:

1. Download the selected public call outside the live demo; preserve the original file unchanged. Use the official source link in the app.
2. Try text extraction with a PDF parser or pdftotext. DOCX text can be read from its structured XML without OCR.
3. For scanned pages, OCR locally using [OCRmyPDF](https://ocrmypdf.readthedocs.io/en/latest/) and [Tesseract language data](https://tesseract-ocr.github.io/tessdoc/Data-Files.html). Albanian uses sqi; add English or Serbian only when present. Tesseract needs page images or a PDF wrapper; it does not directly read PDFs.
4. Retain page mapping and compare deadlines, amounts, mandatory/optional wording and signatures against original images. Local OCR has no LLM token fee, but requires compute and can misread text.
5. Staff reviews the extracted text. Only then can a bounded AI call propose a structured checklist; staff approval creates the call version used in applications.
6. Cache by source hash and extraction version. A changed PDF triggers a new draft/version for review, not an automatic replacement of active eligibility rules.

If a small metadata importer is useful later, limit it to reviewed official call pages, cache results and group forms with their parent call. Do not import personal beneficiary/candidate lists, scan the whole government web, or scrape authenticated recruitment records. Source availability must not determine whether the jury demo loads.

Do offline OCR in WSL for the weekend. A Vercel static deployment should not be expected to run native OCR binaries in the browser. Hosting live OCR is a separate operational decision. A preprocessed source is an honest input to a genuine later AI request; a manually authored checklist is not an AI output.

## AI and the USD 10 budget

Selected capability: draft a structured checklist from one approved source excerpt, including required/optional classification, applicable lot, source page, exact evidence span and uncertainty. Show input and output together. Municipal staff approve or correct the draft before applicants rely on it. Deterministic checks then compare submissions to that approved checklist.

The opening deck names organizer OpenAI access, but the actual team's provider, enabled models and remaining balance must still be confirmed through account configuration without exposing a secret. Use no paid calls in M1. Future planning envelope: USD 4 development, USD 2 evaluation, USD 2 rehearsal and USD 2 reserve. This is an allocation, not a verified balance or a promise of calls purchased.

At M4, verify current model pricing; calculate projected cost as input tokens / 1,000,000 x input price + output tokens / 1,000,000 x output price. Include retries and any provider-specific charges. Set small explicit input/output limits, one bounded retry, timeout, and a cached demonstration fallback. Keep actual request count and usage. Stop discretionary tests before eating the rehearsal reserve.

Keys belong in server configuration, not source code, chat, public logs or VITE_ variables. A public demo should expose cached approved examples by default; restrict the paid action to an authorized demonstrator. Enforce rate and cost controls server-side. A memory-only limiter in a serverless function is not a global spending cap; use the provider's enforceable controls where available or a shared durable counter, or disable public paid calls. Do not expose an unrestricted paid endpoint to meet a deadline.

The model receives document content as untrusted data. Output must conform to a schema and reference supplied source evidence; missing or ambiguous evidence becomes review-needed. Never infer fraud, predict award probability or make the funding decision.

Evaluation set: a clear mandatory item, an optional item, lot-specific rules, ambiguous wording, OCR-corrupted date/amount, malicious instruction text in the document and an unreadable input. Hand-review each result. Report sample counts and actual errors; do not market a tiny test as general accuracy.

## Verification gates

M1: existing relevant checks plus build; mobile and desktop inspection; working navigation/filter; compare designer pack. Do not invent test scripts that are absent.

M2-M3: targeted behavior checks for draft retention, missing mandatory versus optional document, submitted snapshot immutability, version replacement, correction transitions, duplicate button clicks and demo reset. Test both UI and stored state for the one full journey. Simulated role restrictions are not security tests.

M4: schema/source checks, error/timeout behavior, output review, key absence from browser bundle, request bounds and actual budget ledger. Capture one genuine success and one unresolved case.

M5: production demo URL, console/runtime errors, direct route reload, browser persistence behavior, offline recording and stills, synthetic-only data, final source labels, exact pitch timing and submission files. Screenshots must come from the app, not generated UI artwork.

M6: verify real authorization on the server, direct object URLs, application ownership, staff scope, private storage, concurrent edits and duplicate constraints. Only then discuss a controlled real-data pilot, after municipal approval.

## Deadline and recovery

At the research clock check it was approximately Saturday 15:10 in Tirana. Do not spend the remaining day delivering the entire product vision. Use the current clock and organizer announcements to adapt this illustrative sequence:

- First available work block: inspect repo and references, produce the coherent interface, and have the pitch owner rehearse the current-state script immediately.
- By the next mentor review: show the shortest working loop available, explain missing parts and freeze the story. The earliest published checkpoint began at 15:00; do not treat it as a future two-hour build allowance.
- Remaining afternoon/evening: complete application/review before spending remaining capacity on AI and release. Timebox each milestone; cut optional screens and extra calls when over budget.
- By 21:00 Saturday at the latest: no new features. Aim to freeze earlier at the core-flow checkpoint. Produce screenshots/recording and reconcile claims.
- Sunday 08:00-09:00: verify link, deck, video and repository package; timed run. Sunday 09:00-11:00 includes the mandatory ten-minute mentor dry-run. Set an internal 10:30 submission target; official deadline is 11:00.

Protect at least three spoken timed rehearsals and a rest period. Do not trade the mandatory mentor session for another feature.

Cut in this order: extra source cards, saved opportunities, call editing beyond seeded example, archive export beyond clear preview, reporting, duplicate indicator, real backend/auth. Preserve the same-case applicant/clerk correction and source evidence. If AI cannot be completed, disclose that and show manual checks; do not imply AI functionality to recover points. If the app is only M1-complete, present a concept with working navigation and name the unfinished loop.

## Handoff contract for every future milestone

Return observed starting state; changed files; working behaviors versus fixtures/mocks; run and preview instructions based on actual scripts; screenshots or explicitly missing visual checks; commands/checks run and outcomes; designer sources followed and provisional choices; blockers; actual API usage; implications for each pitch claim; next recommended milestone or repair. Update PROJECT_STATE.md with the same facts. Do not start the next milestone automatically.

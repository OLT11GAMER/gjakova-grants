# Gjakova Grants — live demo runbook

**Target:** 75–100 seconds on stage. **Verified mode:** local production build, synthetic data, simulated document reading. The stage timing is a rehearsed target, not a timed human delivery; browser automation replayed the interactions in 13.3 seconds and 12.6 seconds. No live AI call was made.

## Before presenting

1. From the repository root, run `npm ci`, `npm run typecheck`, `npm run build`, then `AI_DEMO_FIXTURE=1 npm run preview -- --host 127.0.0.1 --port 4173`.
2. Open the exact Vite URL printed in the terminal. If 4173 is occupied, Vite chooses the next available port; use the printed port. Confirm the page loads and the banner says **DEMO**.
3. Click the reset icon in the top bar (accessible name **Rikthe të dhënat e demonstrimit**). Reset now clears Gjakova Grants v2/v3 local state, preserves unrelated storage, and returns to **Grantet**. Do not reset after the demo if you need to inspect its completed case.
4. Confirm the opening state: historical 2026 training call is discoverable; its deadline is closed; the Passport contains Arta Berisha / Punishtja Drita synthetic details; the draft is blank; no documents, submission, correction, archive manifest or document-reading result is present.
5. Keep the presentation on the local preview. Do not enter real personal information. `AI_DEMO_FIXTURE=1` returns the hand-authored fixture, labeled **Rezultat i simuluar lokal · pa thirrje AI**. It makes no paid model request.

The reset clears only `gjakova-grants.demo.v2` and `gjakova-grants.demo.v3`. It preserves unrelated local storage. The reset button works from either role and any route, then returns to the applicant opportunity list.

## Click-by-click stage sequence (~90 seconds)

| Time | Action | Say / point out |
|---|---|---|
| 0–12s | On **Grantet**, open **Shiko detajet** for the Gjakova 2026 start-up call. | “This is the historical call, with its original closed deadline and source.” |
| 12–22s | Click **Hap aplikimin**. Click **Ripërdor nga Pasaporta**, then **Vazhdo te dokumentet**. | “The applicant reuses synthetic details from the Passport.” |
| 22–34s | Under **Kopja e letërnjoftimit**, choose **Kopje identifikimi nga Pasaporta · DEMO**. Under **Oferta / Profaturë**, choose **Ofertë për vegla pune · DEMO**. Pause on **3/4 të detyrueshme**; point to the missing declaration. | “Readiness follows the call's fixed requirements; the declaration is still missing.” |
| 34–50s | In the offer card, show the synthetic scan and **Lexo dokumentin**. Start the read once. Point to **Rezultat i simuluar lokal · pa thirrje AI**, the amount with its source fragment, and **Përshkrimi — Nuk u gjet**. Change the amount to **2,580.00** and click **Konfirmo të dhënat**. | “This result is simulated. The amount has a visible source; the description stays unresolved. The applicant confirms an edit.” |
| 50–61s | Choose **Deklaratë nën betim · DEMO**. Open **Rishikimi**, tick the demonstration acknowledgement, click **Dorëzo demonstrimin**. Point to `GG-DEMO-2026-001`. | “This creates only a local demo receipt, not an official filing.” |
| 61–73s | Click **Komuna** in the role switcher. Open `GG-DEMO-2026-001`. Click **Nis shqyrtimin**, then **Kërko korrigjimin**. | “The clerk requests one targeted correction; the original remains in the submitted snapshot.” |
| 73–80s | Click **Aplikues**, then the bottom **Aplikimet** tab. Click **Dërgo ofertën e korrigjuar · DEMO**. | “The applicant responds with a bundled synthetic replacement.” |
| 80–90s | Click **Komuna**, reopen the same case, show original and linked v2, click **Shëno korrigjimin të shqyrtuar**, then **Arkivi** and **Përgatit paketën demonstrative**. End with both disclaimers visible. | “The versions and local history remain together. Not registered in SMAED; no official protocol reference is recorded.” |

Do not wait for or imply live AI. If the simulated request fails, continue the existing manual checklist and skip the AI fields; the demo receipt, correction loop and archive boundary can still be shown.

## Fallback order

1. Public deployment only if a user authorizes one and the exact URL passes a separate verification.
2. Verified local production preview described above.
3. Prerecorded demo only if a recording is actually produced and inspected. **No recording exists for this handoff.**
4. Present these verified screenshots in order:
   1. `docs/evidence/final-mobile-call-390x844.png`
   2. `docs/evidence/final-mobile-readiness-390x844.png`
   3. `docs/evidence/final-mobile-document-assist-390x844.png`
   4. `docs/evidence/final-mobile-correction-390x844.png`
   5. `docs/evidence/final-staff-case-1440x900.png`
   6. `docs/evidence/final-staff-version-compare-1440x900.png`
   7. `docs/evidence/final-staff-archive-1440x900.png`

Every mode keeps the simulated provenance label visible. A network outage never changes simulated output into live or captured AI.

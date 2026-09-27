# Gjakova Grants — live demo runbook

**Target:** about 100 seconds on stage. **Verified mode:** local production build, synthetic data, local photo capture/crop and simulated document reading. The stage timing is a target, not a timed human delivery. The presentation scanner uses the camera when available and the bundled synthetic offer image as the reliable file fallback. No live AI call was made.

## Before presenting

1. From the repository root, run `npm ci`, `npm run typecheck`, `npm run build`, then `AI_DEMO_FIXTURE=1 npm run preview -- --host 127.0.0.1 --port 4173`.
2. Open the exact Vite URL printed in the terminal. If 4173 is occupied, Vite chooses the next available port; use the printed port. Check the call deadline and the applicant-to-staff navigation once.
3. Open **Opsionet e prezantimit** in the top bar and choose **Rivendos demonstrimin**. This clears Gjakova Grants v2/v3 local state, preserves unrelated storage, and returns to **Grantet**. Do not reset after the demo if you need to inspect its completed case.
4. Confirm the opening state: the Grantet 2026 call is closed; the profile contains synthetic Arta Berisha / Punishtja Drita details; the application is blank; no documents, submission, correction or archive package is present. Have the printed synthetic offer and a saved photo of it on the presentation device.
5. Keep the presentation on the local preview. Use only the printed synthetic offer for the scan moment; do not photograph real identity or business documents. `AI_DEMO_FIXTURE=1` returns fixed sample fields marked **Rezultat demonstrues · pa lexim AI**. The result does not read the captured photo and makes no paid model request.

The reset clears only `gjakova-grants.demo.v2` and `gjakova-grants.demo.v3`. It preserves unrelated local storage. Reset works from either role and any route, then returns to the applicant opportunity list.

## Click-by-click stage sequence (~90 seconds)

| Time | Action | Say / point out |
|---|---|---|
| 0–9s | On **Grantet**, open the **Grantet 2026 · Start-up** call. Point out that the deadline has passed and open the detail page. | “This call is closed. The source and requirements are still available to review.” |
| 9–18s | Click **Hap aplikimin**. Reuse profile details with **Përdor të dhënat e profilit** and continue to **Dokumentet**. | “The applicant starts with saved example details.” |
| 18–25s | Select **Kopje identifikimi** from the profile. Pause on the missing offer and declaration. | “The checklist shows what is ready and what still needs a document.” |
| 25–43s | On **Oferta / Profaturë**, tap **Skanoni dokumentin**. Photograph the printed synthetic offer, adjust the crop if needed, then tap **Përdor këtë dokument**. If camera access is unavailable, tap **Ngarko fotografi** and choose the saved photo. If there is no photo, select the prepared offer from the document list and continue without the scanner moment. | “The photo is cropped on this device. It is kept with the application only after the applicant uses it.” |
| 43–57s | Tap **Lexo dokumentin** once. Point to **Rezultat demonstrues · pa lexim AI**, the amount/evidence and unresolved description. Change the amount to **2,580.00** and tap **Konfirmo të dhënat**. | “The reading result is a fixed simulated example, not a reading of the photo. The applicant checks its evidence, corrects a value and confirms it.” |
| 57–66s | Choose **Deklaratë nën betim**. Return to **Të dhënat**, complete the form if needed, review **4/4 të plota**, acknowledge the closed-call notice and tap **Përfundo**. | “Readiness follows the required documents. This creates a local receipt, not an official filing.” |
| 66–78s | Open **Opsionet e prezantimit → Staf komunal**. Open the same application, start review and request the correction. | “The clerk requests one targeted correction; the submitted offer remains preserved.” |
| 78–86s | Switch to **Aplikues → Aplikimet**, then tap **Dërgo korrigjimin**. | “The applicant sends the prepared replacement version.” |
| 86–100s | Switch to **Staf komunal**, reopen the same case, show original v1 and updated v2, mark the correction reviewed, then open **Arkivi** and prepare the package. End on the SMAED status and blank protocol reference. | “Both versions and the case history remain together. The package is not registered in SMAED; no official protocol number exists.” |

Do not wait for or imply live AI. If camera permission fails, use **Ngarko fotografi**. If image selection fails, select **Ofertë për vegla pune** from the prepared documents and continue. If the simulated read fails, skip its fields; the checklist, local receipt, correction loop and archive boundary still work.

## Fallback order

1. Public deployment only if a user authorizes one and the exact URL passes a separate verification.
2. Verified local production preview described above.
3. Prerecorded demo only if a recording is actually produced and inspected. **No recording exists for this handoff.**
4. Present these verified screenshots in order:
   1. `docs/evidence/final-mobile-call-390x844.png`
   2. `docs/evidence/final-mobile-readiness-390x844.png`
   3. `docs/evidence/final-mobile-scanner-preview-390x844.png`
   4. `docs/evidence/final-mobile-document-assist-390x844.png`
   5. `docs/evidence/final-mobile-correction-390x844.png`
   6. `docs/evidence/final-staff-case-1440x900.png`
   7. `docs/evidence/final-staff-version-compare-1440x900.png`
   8. `docs/evidence/final-staff-archive-1440x900.png`

Every mode keeps the simulated provenance label visible. A network outage never changes simulated output into live or captured AI.

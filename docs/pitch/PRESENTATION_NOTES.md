# Team Pooks · Gjakova Grants — presentation notes

Five editable main slides. The live product demonstration sits between Slides 2 and 3; it is not a slide. Target stage time is approximately **4:35**, including the 90-second demo and quick transitions. End by 4:35 to leave a 25-second safety margin before a five-minute stop.

**Typeface:** Inter, available in the project bundle (`@fontsource-variable/inter`). The deck references Inter and does not embed a font file. If a presentation computer lacks Inter, substitute Arial or another neutral sans serif; the layout uses standard editable text and images.

## Slide 1 — Gjakova Grants · ~0:20

### Visible copy

**Gjakova Grants**  
Public funding, made understandable.  
From application preparation to traceable municipal review.  
Team Pooks · Gjakova · Track C

### Speaker notes

We are Team Pooks. Gjakova Grants helps people understand a grant application and gives municipal staff a clearer way to review the same case. What you will see is a local demonstration using synthetic information and one historical Gjakova call. It is not an official municipal deployment.

## Slide 2 — One grant. Too many disconnected steps. · ~0:40

### Visible copy

**TODAY**

- Separate call + application documents
- Manual document checking
- Missing evidence creates back-and-forth
- Corrections need a clear record

**GJAKOVA GRANTS**

- Guided preparation
- Reusable applicant information
- Clear requirement checks
- Versioned corrections
- Archive-ready handoff

Evidence: Gjakova Grantet 2026 public call + application pages (historical; deadline closed) · AI4Society Track C brief

**LIVE DEMO →**

### Speaker notes

Today, the public call and its application materials are published separately. The Track C challenge describes manual document checking, incomplete applications and administrative effort. A correction also needs a clear record of what changed. Our team heard about a same-day editing restriction in the municipal SMAED workflow; its exact scope still needs confirmation. We designed this demonstration around preparation, evidence and a traceable correction, while keeping official registration separate.  
Transition: **“Rather than explain another portal, let us show you one application.”**

## === LIVE DEMO HERE ===

No demo slide. Leave PowerPoint and run the sequence in `docs/DEMO_RUNBOOK.md`. The opening reset state contains a synthetic Applicant Passport, historical closed training call, blank draft, no selected documents, no submission or correction, no archive manifest and no reading result. The bundled reading fixture must retain the visible label **SIMULATED DOCUMENT READING** / Albanian UI provenance **Rezultat i simuluar lokal · pa thirrje AI**. Do not call the output live or captured AI.

**Target:** 75–100 seconds; planned at 90 seconds. Keep the pace brisk, point to evidence and status rather than reading the interface aloud. No live organizer-proxy AI call is verified.

### Fallback screenshot sequence

If the live demo fails, keep the same truthful simulation label and show these final screenshots in order:

1. `docs/evidence/final-mobile-readiness-390x844.png`
2. `docs/evidence/final-mobile-document-assist-390x844.png`
3. `docs/evidence/final-staff-case-1440x900.png`
4. `docs/evidence/final-mobile-correction-390x844.png`
5. `docs/evidence/final-staff-version-compare-1440x900.png`
6. `docs/evidence/final-staff-archive-1440x900.png`

## Slide 3 — One workflow. Better for both sides. · ~0:35

### Visible copy

**APPLICANTS**

- Understand what is required
- Reuse information
- See what is missing
- Correct without restarting
- Track what happens next

**MUNICIPAL STAFF**

- Review evidence together
- Request targeted corrections
- Compare document versions
- Keep a readable history
- Prepare the archive handoff

**SIMULATED DOCUMENT READING** · Reads structured information · Shows evidence · Shows uncertainty · Human review remains in control

### Speaker notes

For an applicant, the next requirement is visible and reusable details reduce re-entry. For staff, the submitted snapshot, supporting documents, correction and history stay together in one case. The synthetic document reader displays structured fields, source fragments and uncertainty. The applicant can confirm or edit a value; staff can inspect both. It does not decide whether anyone is eligible or should receive funding.

## Slide 4 — A pilot Gjakova can actually test. · ~0:45

### Visible copy

- **€6,000** · Build toward pilot readiness · One-off
- **€1,000** · Setup + training · One-off
- **€50 / month** · Operation · Planning assumption
- **€2,400 / year** · Support · Planning assumption
- **≈ €10,000** · Illustrative first year
- Planning assumptions — not quotes

**Four-week validation:** Week 1 map one real workflow · Week 2 adapt the pilot · Week 3 supervised testing · Week 4 measure and decide

**Start with:** 1 grant call · 1 grants officer · 1 archive / IT contact

Planning model excludes procurement, complex SMAED integration, broader compliance, larger production storage, taxes and travel. No savings measured.

### Speaker notes

Our planning model is six thousand euros to build toward pilot readiness, one thousand for setup and training, fifty per month to operate, and twenty-four hundred per year for support. That makes ten thousand euros for an illustrative first year: €6,000 + €1,000 + 12 × €50 + €2,400 = €10,000. Ongoing operation and support would be €3,000 a year under those assumptions. These are planning assumptions, not supplier quotes or approved procurement. The €20 monthly AI allowance inside the €50 operation assumption has not been validated by live usage. The figures exclude archive integration, legal and compliance work, procurement, taxes, travel and larger storage. We would begin with one call, one grants officer and one archive or IT contact. Across four weeks we would map the real workflow, adapt a limited pilot, test it under supervision, then measure and decide. Training time and savings have not been measured.

## Slide 5 — Start small. Prove it in Gjakova. · ~0:25

### Visible copy

- Uses the existing grant process
- Does not require replacing SMAED
- Starts with an approved manual archive handoff
- Expands after the workflow is validated

**THE ASK:** One grants officer · One archive / IT contact · One upcoming call · One supervised pilot

**Why feasible:** Browser based · Mobile applicants / desktop staff · Human decisions stay human · Existing archive remains authoritative

Team Pooks · **[TEAM NAMES / CONTACT — CONFIRM BEFORE SUBMISSION]**

### Speaker notes

Gjakova Grants is a preparation and review layer; this prototype does not replace SMAED or register an official filing. A pilot can begin with an approved manual archive handoff, then use evidence from one real workflow to decide what is worth building next. Our ask is simple: one grants officer, one archive or IT contact, one upcoming call and one supervised pilot. Start small, measure the work, and decide with the people who do it. Leave this slide visible during Q&A.

## Timing plan

| Section | Estimate |
|---|---:|
| Slide 1 | 0:20 |
| Slide 2 | 0:40 |
| Live demo + switch | 1:30 |
| Slide 3 | 0:35 |
| Slide 4 | 0:45 |
| Slide 5 | 0:25 |
| **Total** | **4:15 spoken + ~0:20 for slide/demo handoff = ~4:35** |

This is a target, not a measured rehearsal recording. Run the live demo with `docs/DEMO_RUNBOOK.md`; keep the final archive disclaimer visible and stop at approximately 4:35.

## Q&A quick reference

1. **Why build this if SMAED/eKosova already exist?** Gjakova Grants focuses on preparing a complete application and managing corrections/evidence before an approved archive handoff; it complements rather than claims to replace the official record system.
2. **Do you integrate with SMAED?** No verified connector exists in this prototype; the demo prepares a structured handoff and leaves official registration separate.
3. **Is the AI live?** No; this presentation uses a clearly labeled simulation. The endpoint and validation boundary are implemented, but organizer-proxy connectivity was not verified.
4. **What happens if document reading is wrong?** The value remains reviewable, evidence or uncertainty is visible, the applicant confirms or edits it, and staff retain responsibility; deterministic requirements do not come from AI confidence.
5. **Is applicant data secure?** This version uses synthetic browser-local data and has no authentication or production privacy controls; a real pilot needs scoped access, private storage, retention rules and access logging before real records are used.
6. **How much does this cost?** Slide 4 shows a €10,000 illustrative first-year planning model, not supplier or procurement quotes.
7. **Have you proved savings?** No; a pilot should measure review time, incomplete applications and correction cycles against a baseline.
8. **How quickly can staff learn it?** No training time is measured; the workflow is designed around familiar grant-review tasks, and a supervised pilot should measure training time.
9. **Can this work in another municipality?** The workflow may be reusable, but grant forms, language, permissions and archive procedures need configuration and validation.
10. **What works today?** A local synthetic demo covers discovery, Passport reuse, deterministic readiness, immutable submission snapshot, corrections and version history, local archive preparation, and simulated evidence-linked document reading; it does not file officially.

## Truth and fallback

- Local synthetic prototype; browser-local persistence; demo role switch is not authentication; offline is read-only.
- Document reading is **SIMULATED**; no live or captured organizer-proxy result is verified.
- No official submission, authentication, SMAED integration, protocol reference, measured time saving, pilot/adoption or accuracy claim.
- Fallback hierarchy: verified public demo only if later deployed and tested → local production preview → recording only if genuinely produced/checked (none exists in the project record) → screenshot sequence above.
- The archive view explicitly states that the package is not registered in SMAED and the official protocol reference is not recorded in this demo.

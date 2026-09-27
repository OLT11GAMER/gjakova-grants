# Gjakova Grants design guide

Status: Riga Sadiku's approved visual direction is implemented through Milestone 3. The earlier provisional guidance retained below is historical planning context and is superseded wherever it conflicts with this section.

## Current design authority and assets

The implemented authority is `../Team-Pooks-context/designer/RIGA_DESIGN_HANDOFF_2026-09-26.md`, read together with `../Team-Pooks-context/Gjakova_Grants_Brand_PWA_Prompt.md`. The supplied original is `../Team-Pooks-context/designer/assets/gjakova-grants-original.svg`; the repository preserves it as `public/brand/gjakova-grants-logo-original.svg`. A symbol-only implementation derivative, which retains the supplied vector paths and crops the wordmark from the view box, is used only for application icons.

No Figma file, exported applicant frame, or exported municipal frame was supplied. The written handoff provides direction but is not a pixel-comparison target. The handoff's 20-screen review list, six-step illustration, payments, analytics, evaluations, and integrations remain roadmap scope; Milestone 2 implements only the shortest three-step flow required by the verified Lot I checklist.

| Reference | Direction applied | Implementation | Remaining issue |
|---|---|---|---|
| `RIGA_DESIGN_HANDOFF_2026-09-26.md` | Clear, trustworthy, approachable; search-led applicant UI at 390px; denser municipal review at 1440px | Applicant discovery/detail/Passport/application preview and staff queue/detail share tokens but use role-appropriate density | No exported frames for pixel comparison |
| `gjakova-grants-original.svg` | Preserve supplied architectural symbol and Gjakova Grants wordmark | Original SVG is used in navigation; symbol derivative supplies PWA icons | Live Mongolian Baiti/Calibri text can render differently or clip across platforms; an outlined wordmark export is still preferred |
| Historical Gjakova call PDF | Use actual terminology and requirements, not a PDF-shaped interface | Lot I amount, deadline, five requirements, and page-5 evidence are represented as structured content | The call is closed and explicitly labeled historical/training |

## Approved visual system

Tokens are centralized in `src/styles.css`:

- Brand: primary `#7A1F2B`, hover/pressed `#912D3A`, dark `#54151E`, secondary `#681A25`, light surfaces `#F6E9EB` and `#FBF4F5`.
- Structure: app background `#F8F8F7`, surfaces `#FFFFFF`, text `#202124`, headings `#171719`, secondary `#4B4D52`, muted `#73767D`, disabled `#9A9DA3`, borders `#E7E8EB` and `#D6D8DC`.
- Semantics remain independent: success `#147A5A/#E7F5EF`, warning `#A86B00/#FFF4D6`, error `#B42318/#FDECEC`, information `#175CD3/#EFF6FF`.
- Inter Variable is bundled locally for the interface; Lucide supplies outline icons. The logo's lettering is not recreated in Inter.
- The spacing system follows 8px increments where practical. Cards use 12px, inputs/buttons 8px, dialogs 16px, and status pills 999px. Shadows are restrained and cards are used only to group actionable content.

## Implemented interpretation and accessibility decisions

- Applicant navigation contains only the three working destinations: Grantet, Aplikimet, and Pasaporta. The staff sidebar exposes submitted demo snapshots and archive preparation for the current case; call building remains disabled and marked `M4+`.
- The desktop role switcher retains text; mobile uses labeled icon controls. It is explicitly marked `jo autentikim`. Applicant actions are at least 44px and keyboard focus uses a visible blue outline.
- Mobile H1 text is 28px instead of the larger desktop display treatment so Albanian copy wraps cleanly at 320–390px. All search, form and select controls now use 16px text to avoid unexpected iOS input zoom.
- Warning and information treatments use the supplied semantic backgrounds with darker text where needed for readability. Status never relies on color alone: each state has a written label and, where useful, an icon.
- The app distinguishes document presence from human content review. It shows counts such as `4/4` only when computed from fixture requirements; it never presents an eligibility probability, verified identity, or AI approval.
- Reduced-motion preferences disable nonessential animation. A skip link, landmarks, accessible names, tab roles, live status messaging, and explicit empty/error recovery states are included.

## Milestone 2 workflow interpretation

- The selected historical call uses three steps only: applicant details, required/optional documents, and review/demo submission. A longer generic wizard was rejected because it would not add requirements from the verified Lot I source.
- Reuse from the Passport is an explicit button. The application stores copied values rather than a live profile reference, and the submitted snapshot receives a second immutable copy. Later Passport edits therefore cannot change the receipt.
- Real uploads are deliberately absent. Each requirement offers only packaged synthetic templates; applicants can view, replace, or remove them. Replacement creates a new version and retains the prior local version, while the snapshot records only active version IDs.
- Readiness is a written `N/4` mandatory count produced by deterministic presence rules. The optional training/reference item is labeled optional and never blocks readiness. No AI wording or eligibility probability is used.
- The historical deadline remains visible and closed. Submission requires a separate acknowledgement that this is a local training action, and the receipt repeats that it is not municipal confirmation.
- Mobile validation moves focus to the first invalid field. Fields save on change, targets remain at least 44px, and the production browser check reached a 2× visual scale without horizontal layout overflow.
- Offline state disables applicant and Passport fields. The stored application remains readable, but submission, replacement and removal require connectivity. The service worker continues caching only the public shell.

## Milestone 3 workflow interpretation

- The municipal case keeps a three-part desktop review structure: compact requirement evidence at left, the selected document or v1/v2 comparison in the center, and current status plus one permitted action at right. The layout uses existing burgundy tokens and neutral surfaces rather than introducing a dashboard palette.
- Only the existing offer/pro forma requirement receives a correction. Staff see a deliberately separated applicant-visible message and dashed staff-only note. The applicant receipt/status area shows only the public message and the relevant bundled replacement action.
- The original offer card is labeled as the version in the submitted snapshot. The amendment card is labeled as the correction and displays version, timestamp, superseded ID, correction reference and structured synthetic summary. No PDF-pixel diff is implied.
- Applicant status and history are now compact post-submission sections outside the original wizard. Applicant history filters out staff-only content; staff history shows every local case event with date, time, actor and action, while explicitly avoiding secure-audit wording.
- Archive preparation is a case tab, not a separate invented integration. Application status and archive handoff status appear side by side. Warning treatment consistently states that the package is not registered in SMAED and that no official protocol reference exists.
- The archive manifest uses dense definition grids and a short linked-version list. JSON export is a secondary local action labeled as a demo archive package, never an official filing.
- Applicant correction actions retain 44px targets. Keyboard verification reached the primary correction button with a 3px blue focus outline; 390px and 200% visual scale checks retained no horizontal overflow. Staff layouts were checked at 1440px and 1280px without horizontal overflow.

## Milestone 4 document-reading surface

The existing offer picker now expands into a compact document surface after the bundled basic offer is selected. A photographed-style synthetic sheet sits above the reading controls on mobile and beside the five short fields on wider screens. The main action is **Lexo dokumentin**; no separate AI navigation or visual motif is introduced. Existing burgundy, Inter, Lucide and spacing tokens remain in use.

Each field keeps the visible scan fragment beside the extracted value, an icon plus text state (`U gjet`, `Rishiko`, `Nuk u gjet`), and a small editable confirmation input. The reading value remains visible after a correction. A derived count summarizes found, confirmed and unresolved fields. Staff see the same original sheet and a compact reading/applicant comparison in the existing evidence column; simulated values are labeled as a simulated reading. The image is a bundled synthetic static asset; camera capture was omitted to keep the pitch path deterministic and avoid inviting real-document capture in this local-only prototype.

## PWA presentation

The install name, page title, accessible brand label, and manifest name are all **Gjakova Grants**. The manifest keeps the stable id `/gjakova-grants/`, launches the applicant discovery route in standalone mode, and uses the approved burgundy theme with light app background. The symbol derivative supplies 192px, 512px, maskable 512px, Apple touch, and favicon PNGs.

Install controls appear only when the browser exposes an install prompt; iOS gets browser-specific Share → Add to Home Screen instructions. The service worker precaches only the public static shell. Updates require an explicit user action and never force a reload. Offline mode is read-only and says that external sources and online actions are unavailable. There is no offline submission, background sync, push, private-response caching, or document caching.

## Experience to aim for

Applicants should feel that they can understand a call and recover from a mistake. Staff should feel that they can find the next case, see the evidence and make a recorded decision without opening many disconnected files. Use a recognizably shared identity with different density and navigation for each role.

Build the usable workspace as the opening screen. Keep discovery concise and practical: institution, funding range if verified, applicant type, source status and deadline. Do not obscure closed calls with optimistic labels. Public-service trust comes from accurate state, clear language and dependable interactions as much as visual polish.

## Applicant: phone first

Bottom navigation: Opportunities, My applications, Passport. Labels should be Albanian-first, with a teammate reviewing final wording and diacritics. Store copy centrally for later language changes. English presentation narration can accompany Albanian screens; a complete second language is optional, not a requirement to scatter partial translations.

| Screen | Primary content | Main action and recovery |
|---|---|---|
| Opportunities | Compact source-backed cards; open/historical distinction; category filter; saved state if supported. | Open a call; clear filters for an empty result. |
| Call detail | Plain summary, source link, deadline, who can apply, versioned requirements and application route. | Start demo application or resume draft; closed original calls link to source rather than accept an official application. |
| Passport | Reusable contact/business details and relevant document references; origin and last-confirmed date. | Confirm or edit details; choose which information is reused. Never imply official identity verification. |
| Application | Short steps: details, documents, review. Save feedback, requirement-level status and one next action. | Attach synthetic demo document; replace wrong file; reopen previous step without losing progress. |
| Status/correction | Receipt, current status, requested changes, deadline when applicable, timeline and attachment version. | Respond to a specific request; show what is awaiting staff review. |

Use a single primary action per step, positioned within comfortable reach. A sticky action area must respect safe areas, the onscreen keyboard and error summaries. Source evidence can open in a sheet on phones and a panel on larger displays. Do not require precision taps on a scaled-down desktop PDF. Provide readable extracted text alongside the source page where available.

The Passport should be a useful profile with fields and reusable documents. A decorative card or QR code is optional only if it supports a concrete flow. Completeness means a count of requirements satisfied, with unresolved items named. Avoid unexplained percentages such as "92% eligible".

## Municipal staff: desktop first

Left navigation: Calls, Applications, Archive preparation. Reporting is a later view rather than an empty dashboard in the first demo. Start on the work queue, with counts derived from current fixtures rather than invented municipal statistics.

Queue columns: reference, call, applicant, submitted date, case status, pending issue and assigned reviewer where relevant. Default ordering should be understandable, such as submission time, with explicit filters. Completeness may be a filter; it must not silently push incomplete or uncertain cases out of the queue. No AI ranking of deserving applicants.

Case layout: a compact case header; requirement checklist and document viewer beside each other; a clear human action area; and an accessible history tab. Keep status, document authenticity, eligibility review and final funding decision distinct. The clerk should be able to compare versions without losing their place in the queue.

Editing behavior matters:

- Draft-call metadata and requirements are editable with preview and cancel. Publishing records a version and responsible actor.
- Published corrections show what changed and whether existing applications are affected; retrospective rule changes need a defined policy.
- Requests for clarification identify the exact requirement, plain-language reason and permitted response period.
- New document versions preserve older versions and mark the version used for each check.
- Internal reviewer notes are separated from applicant-visible messages.
- Archive preparation shows package state, export errors and any manually recorded official reference. It must not resemble a successful integration until one exists.

On a narrow staff viewport, replace the dense split view with a case list and detail tabs. Officials may use a phone occasionally, but optimize repeated review for 1280-1440px desktop widths.

## Historical provisional visual direction

This paragraph records the planning-stage direction and is not current authority: the initial concept used white and cool light-gray surfaces with a possible green/teal action color. Riga's approved burgundy system above replaced that provisional action color while retaining distinct semantic status colors.

Use one legible sans-serif with Albanian glyph coverage, such as the existing project font if suitable. Fixed type steps: body 16px on applicant forms, compact 14-16px staff tables, section headings 20-24px. Reserve larger type for rare top-level titles. Use normal letter spacing, modest corner radii up to 8px, consistent 4/8px spacing increments, restrained borders and minimal shadows.

The useful visual assets are real source-document previews, synthetic document thumbnails, a properly supplied brand mark and crisp icons. Avoid decorative hero imagery that consumes the application screen. Do not put municipal seals on fabricated documents or imply municipal endorsement. Mark generated fixtures as demo samples.

## Tokens and components

Centralize semantic colors, type styles, spacing, radii, control sizes and density settings in the existing theme mechanism, for example CSS custom properties if the repo has none. Keep brand tokens separate from status meanings so a palette change does not change workflow semantics. Icons should come from the existing library, or Lucide if a library is needed.

Shared components should follow actual reuse: GrantCard, StatusLabel, RequirementRow, DocumentItem, EvidencePanel, CaseTimeline, FormField, EmptyState, ErrorState and the visible DemoRoleSwitcher. Shared behavior should not force identical applicant and staff layouts. Keep document rendering and data access outside purely visual components. A small development-only component gallery is useful if easy to add; installing Storybook is not essential.

The designer should be able to change typography, action color, spacing and density centrally. She should be able to refine card/form treatments without editing eligibility logic or fixture state. Component behavior from shadcn/ui can be retained while replacing default styling; Vite itself does not determine visual quality.

## Reference intake and decision record

At Milestone 1, inventory every file/link under designer/. Record filename or frame, relevant screen, concrete direction, implemented interpretation, and any unresolved conflict. Inspect the actual exported images, not only their names. Mark inaccessible Figma links as inaccessible; exported PNG/PDF/SVG assets and notes are an adequate fallback.

The supplied written handoff and original logo are sufficient for the current token/component pass. Exported applicant/staff frames and an outlined logo remain requested follow-ups; do not claim fidelity to unseen frames.

The public reference sites in the handoff informed general patterns only. No private authenticated screen was accessed or copied, and no external branding was adopted.

## Acceptance and review

- Check applicant screens at 360x800 and 390x844, and staff screens at 1280x800 and 1440x900. Add a narrow 320px check for unintended horizontal overflow.
- Keyboard focus stays visible and follows the logical sequence; dialogs restore focus; controls have labels; error messages identify the field and recovery action.
- Aim for 44px touch targets on applicant actions; normal text contrast at least 4.5:1. Do not rely on color alone.
- Check long Albanian labels, large text/200% zoom, empty queues, loading, unreadable documents, closed calls and failed saves. Preserve entered data on recoverable errors.
- No overlapping sticky buttons, clipped tables, dead primary actions, misleading success messages or jumping layouts.
- Compare actual screenshots to designer references and record deviations with reasons. Teammate language review and real user testing are separate from automated accessibility checks.
- Freeze visual identity after the core demo review, with necessary usability fixes still allowed. Capture final deck screenshots only after that freeze.

## Pitch visual treatment

Use the app's approved identity for the deck unless the event template is mandatory. Eight visual beats: product, real source/problem, demonstrated flow, two users, AI source/result, replication, pilot/cost, team/ask. Use readable screenshots cropped to the exact action under discussion. Keep visible copy near 20 words per slide; use notes for detail. Avoid a deck made from repeated dashboard cards or dense architecture diagrams. All screenshots must be labeled according to whether they show a working build, a concept, or a captured AI result.

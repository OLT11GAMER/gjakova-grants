# Gjakova Grants repository guidance

- Work on the currently authorized milestone only. Read `docs/PROJECT_STATE.md` and the relevant section of `docs/BUILD_PLAN.md` before editing. Preserve teammate changes.
- The confirmed public name is **Gjakova Grants**. `grantpass` may remain as a stable internal package/data identifier. Do not rewrite historical source filenames.
- Product evidence lives in `docs/PROJECT_BRIEF.md`; approved visual direction and implementation decisions live in `docs/DESIGN_GUIDE.md`; verified pitch claims live in `docs/PITCH_PACK.md`. Raw sources and Riga Sadiku's handoff live in `../Team-Pooks-context/`.
- Demonstrate applicant preparation and municipal review on the same synthetic case. Discovery is the applicant entry point. Use synthetic applicant details and documents only.
- Never imply verified identity, a real filing, secure authentication, official integration, or a secure audit trail. Label historical calls, synthetic content, simulated state, and demo role switching.
- Preserve submitted snapshots and document versions when those workflows are authorized. Corrections require an explicit request and policy; do not claim to bypass SMAED restrictions.
- Keep a small data-service boundary between fixtures and UI. Browser-only state does not establish cross-device synchronization, access control, or durable auditability.
- Milestones 1–3 use zero paid application API calls and no backend, auth, scraping, public deployment, or push. Do not begin Milestone 4 without new authorization.
- Follow Riga's centralized tokens, Inter UI typography, Lucide icons, and supplied original logo. Preserve the original logo asset; its live Mongolian Baiti/Calibri text is a known portability limitation.
- PWA caching is limited to the public static shell. Drafts, snapshots, correction history and archive-preparation state live only in the app's versioned localStorage key (`gjakova-grants.demo.v3`, migrated from v2); do not cache applicant records, selected documents or private API responses. Updates must remain user-controlled; there is no offline submission, background sync, or push.
- Run type, production-build, responsive browser, interaction, accessibility-name, and PWA/offline checks appropriate to the change. Record actual results and limitations in `docs/PROJECT_STATE.md`.

# Gjakova Grants project brief

Version 2, 26 September 2026. Proposed plan for acceptance through the next build request.

## Product decision

Gjakova Grants helps Gjakova applicants prepare complete grant applications and gives municipal staff a clear, source-linked review and correction workflow. A reusable Applicant Passport supplies previously entered details; each application takes its own snapshot. Mobile Grant Cards are the entry point. The municipal workspace provides document review, controlled corrections and preparation for an official archival handoff.

The Track C argument is direct: the stated municipal problem is manual document checking, incomplete submissions and administrative delay. The core demonstration must show an applicant and clerk working on the same case, with a missing item resolved and the changed evidence visible. A discovery feed alone does not establish that value.

Working pitch line: "Gjakova Grants helps applicants fix missing requirements and helps municipal staff review the evidence, with a clear history of every correction."

## Evidence and limits

Evidence labels used throughout: **primary source checked**, **team-reported interview**, **prior research**, **proposal**, and **unknown**. Online pages checked on 26 September 2026 can fail on a later visit; retain source URLs and retrieval dates in the implementation.

| ID | Finding | Status and source | Consequence |
|---|---|---|---|
| E1 | Track C concerns manual checking, incomplete submissions and administration for applicants and municipal staff. | Official excerpt supplied by user; supported by Opening PPTX slide 5. | Application and review are the core product. |
| E2 | The 2026 Gjakova grant announcement and start-up application have separate pages; their attachment links resolve to a six-page PDF and a DOCX respectively. | Primary pages checked: [call](https://gjakova.rks-gov.net/thirrje-per-aplikim-grantet-2026/), [application](https://gjakova.rks-gov.net/aplikacioni-per-start-up-grantet-2026/). DOCX link identified; contents not re-extracted in this turn. | A real source-backed example is available. Separate attachments alone do not prove there is no other submission route. |
| E3 | The historical call's window was 11 March to 3 April 2026; previous visual inspection found separate lots and required documents. | Prior inspection in this conversation of [official PDF](https://gjakova.rks-gov.net/wp-content/uploads/2026/03/Thirrje-per-aplikim-e-protokoluar.pdf), pp. 2 and 5-6. Binary reopened this turn; web text extraction returned no text. | Use as a historical training example, recheck exact requirements against the image before encoding. Never display the real call as currently open. |
| E4 | The Aplikacione category contains separate application materials in prior research. | [Category](https://gjakova.rks-gov.net/konkurset-njoftimet/?tax=aplikacione) timed out in this turn. | Use verified individual pages first. A live scraper is not required. |
| E5 | SMAED is named as an electronic document management and archival system in municipal IT responsibilities. | Primary source checked: [Podujeva IT office](https://podujeve.rks-gov.net/zyra-e-teknologjise-informative/). | Confirms system identity and institutional use, not Gjakova's configuration. |
| E6 | A 2026 Ministry of Internal Affairs integrity-plan entry describes SMAED as operational. | Official [plan](https://mpb.rks-gov.net/Uploads/Documents/Pdf/AL/12389/Matrica%20e%20Planit%20t%C3%AB%20Integritetit%20t%C3%AB%20perditesuar_2026.pdf), indexed passage, p. 22. | Supports existence; gives no API or editing-window specification. |
| E7 | Historical regional-development grant guidance instructed applicants to register in SMAED. | Primary [MZHR FAQ](https://mzhr.rks-gov.net/desk/inc/media/CF11458A-ECB1-46B4-8801-E5BCE9EEB7A5.pdf), questions 23 and 27. Content concerns a historical call. | Do not portray SMAED as necessarily only an inert archive or claim Gjakova Grants invents online applications. |
| E8 | A Gjakova official told the team that the municipality uses SMAED and changes are allowed only on the same day. | Team-reported interview, relayed by user on 26 September. Exact field, record stage, role and exception process unknown. | Treat as a workflow constraint to validate, not a rule to bypass. Do not invent the official's name or quote verbatim. |
| E9 | konkursi.rks-gov.net is a public recruitment reference. | [Page](https://konkursi.rks-gov.net/jobs?servant=1) returned a JavaScript shell; browser automation failed to initialize. | Useful candidate reference; no claim that its authenticated application UX or visual layout was inspected. |
| E10 | Five-minute pitch, three-minute Q&A, seven score weights and Sunday 11:00 submission. | Workshop PDF pp. 2-3, 11-12; Opening PPTX slides 9-10, read from originals. | Prepare 4:45 content, 15 seconds buffer and submission package. |
| E11 | No real personal data in hackathon solutions. Team API access and budget provided; no personal billing cards. | Opening PPTX slides 6 and 12, read from original. | Use synthetic applicants/documents. Public source passages must omit personal information where present. |
| E12 | Exact Facebook duplication, integrations, processing savings and applicant volumes are unverified. | Prior conversation and current evidence gaps. | No invented adoption, efficiency or integration claims. |

Do not conflate SMAED with every system named SAED, SMAD, or the separate archival-material platform launched in 2025. Naming, operator and version require confirmation from the municipal IT contact.

## SMAED-aware workflow

Proposed sequence: editable draft -> submitted snapshot -> municipal review -> authorized correction request -> linked amendment -> review outcome -> archival handoff -> recorded official reference.

- Applicants may edit drafts. Submission locks the application snapshot and records its call/requirement version. Editing the reusable Passport later must not silently change an already submitted application.
- Staff can edit draft calls, publish requirements after review, request corrections with a reason and deadline, and change case status through permitted actions. A published rule change creates a version; existing cases are not silently judged against different rules.
- A correction creates a new document/application version linked to the earlier version, with actor, time, reason and affected requirement. If the call's procedure does not allow corrections, show that restriction instead of inventing an appeal or amendment right.
- The clerk sees both versions and a concise change summary. Archive preparation creates a manifest and readable package in a later milestone; it does not itself submit to SMAED.
- A pilot can start with approved manual transfer and entry of an official protocol reference, if the archive office accepts the package. An automated connector requires documented interfaces, access, authority and a test environment.
- Keep application status and archive status separate. "Prepared for archive" is different from "registered in SMAED". A timeout or export failure must never show successful official receipt.
- The same-day restriction, if confirmed, belongs in the official handoff policy. Gjakova Grants must not silently rewrite a locked archive record or postpone legally required registration while someone perfects an application.

Validation needed from the official: which object locks; whose access is restricted; time zone/cutoff; how corrections are recorded today; whether filing is immediate; who may authorize an amendment; available export/import or API; ownership of the official record. These questions affect a pilot, not the ability to build a synthetic demonstration.

## Privacy and duplicate checks

Design three different views: public calls and carefully reviewed aggregate reporting; an applicant's own private cases and documents; and staff access limited to assigned work. Optional applicant-visible access history can show a meaningful access event without exposing unrelated internal personnel data. Document access is not a public social feed.

For the hackathon, the demo role switch and local fixtures illustrate these views. They do not implement security. The opening deck's synthetic-data rule applies even if a real applicant volunteers an ID.

A future duplicate check should normally be scoped to a particular call and an authenticated applicant identifier. A database uniqueness rule can prevent accidental double submission. Applying to different grants can be legitimate; it is not proof of double funding or fraud. Broader financing checks need the relevant program rule and authorized records.

If cross-system matching is later needed, a protected server can use an institution-scoped keyed identifier (for example HMAC), with access and key controls, rather than exposing raw IDs or searchable unsalted hashes. Pseudonymization is not anonymity. Return only a permitted result such as "an application already exists for this call", with authorized review where necessary. No public lookup by ID, name, email or phone. No automatic adverse decision based on a match.

## Chosen demo and priorities

Primary user: a small-business/start-up applicant. Source: one Gjakova call, with one lot selected after exact requirement review. Use a visibly labeled training copy of the expired 2026 call. The original deadline stays unchanged in the source record; the training workflow has a separate demo state. Applicant and documents are synthetic.

Two memorable moments: a requirement beside its source passage; a correction that appears in the clerk's view while preserving the original submission.

| Capability | Decision | Reason |
|---|---|---|
| Grant list/detail, Passport, guided checklist, applicant status | Demo essential | Makes the applicant journey intelligible. |
| One case, correction request/response, clerk comparison and history | Demo essential | Proves the Track C administrative value. |
| One bounded AI extraction of draft requirements with page references | Demo essential if validated before freeze | Helps staff prepare reusable guidance; both sides benefit. |
| One historical source plus up to two reviewed cards | Demo essential/minimal | Real context without a crawler project. |
| Missing-document, dates and arithmetic checks | Demo essential as applicable | Rules provide reliable checks; do not label arithmetic as AI. |
| Archive-ready package, draft-call editing, saved filters | Useful if time allows after the loop | Supports adoption but must not interrupt proof of the main flow. |
| Private duplicate-submission indicator | Pilot later; optional labeled synthetic preview | Needs reliable identity and permissions to be meaningful. |
| Document access audit, secure storage, real auth, cross-device work | Pilot later unless already established in repo | Real security needs tested server-side enforcement. |
| Aggregate bottleneck reporting | Pilot later | Needs reliable denominators and representative data. |
| Ministry-wide scraping, native apps, automated SMAED/eKosova submission | Pilot later | Scope and access exceed the weekend. |
| Chatbot, social likes/comments, applicant AI ranking, blockchain passport | Drop | No evidence these improve the core task. |

## Judging alignment

| Criterion | Weight | Evidence the team should show |
|---|---:|---|
| Municipal relevance | 20% | Actual call/forms, official Track C problem, qualified report of the municipal conversation. |
| Feasibility | 20% | One working loop, source review, bounded cost and a manual-first archive handoff proposal. |
| AI/digital technology | 15% | Actual input/output with provenance, staff correction and a failure/uncertainty path. |
| User logic | 15% | Mobile preparation and efficient desktop review of the same case. |
| Innovation | 10% | Reuse plus evidence-linked corrections that respect the existing record process; novelty remains a product argument. |
| Scalability | 10% | Configurable call rules, forms, language and archive mappings; test a second configuration later. |
| Next steps | 10% | Named responsible roles, four mentoring outputs, cost assumptions and pilot decision gate. |

No source provides measured time savings for Gjakova Grants. Collect a baseline and compare tasks in the pilot. Do not convert a readiness count into an eligibility probability or likelihood of funding.

## Schedule conflicts and authority

Both decks agree on Sunday 27 September 2026 at 11:00 Tirana time for submission. At the live clock check on Saturday 26 September, it was about 15:10 Tirana time, so the deadline was still upcoming. Recheck the clock before giving any countdown.

Workshop Checkpoint 2 is 16:30-17:30; the opening deck says 15:00-17:00. Workshop recommends freezing the core at that checkpoint; the opening deck gives 21:00 as final feature freeze. Sunday pitches are listed at both 11:10 and 11:30. The workshop permits an original deck; the opening deck requests the template. Team should confirm current Discord announcements. Plan for the earliest applicable cutoff, preserve the mandatory Sunday 09:00-11:00 ten-minute mentor dry-run, and do not assume a deadline extension.

The transcript contains erroneous score percentages and example costs. The two printed scorecards agree and take precedence. Workshop examples of other municipalities' volumes, savings or interviews are not Gjakova Grants evidence.

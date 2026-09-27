import { useMemo, useState } from "react";
import {
  Archive,
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  CircleAlert,
  Download,
  FileSearch,
  FileText,
  MessageSquareWarning,
  PlayCircle,
  Search,
  Settings2,
  UserRound,
} from "lucide-react";
import { Brand, RoleSwitcher, TutorialLink } from "../components/RoleSwitcher";
import {
  CaseSummary,
  CaseTimeline,
  DocumentPreview,
  displayReference,
  formatDisplayDateTime,
  EvidencePanel,
  RequirementRow,
  StatusLabel,
  applicationStatusPresentation,
} from "../components/DomainComponents";
import { EmptyState } from "../components/FeedbackStates";
import { demoDocumentTemplates } from "../data/fixtures";
import type {
  ApplicantProfile,
  Application,
  ArchiveHandoff,
  DocumentVersion,
  GrantCall,
  Requirement,
} from "../types/domain";

export interface StaffActions {
  startReview: () => boolean;
  requestCorrection: () => boolean;
  markCorrectionReviewed: () => boolean;
  prepareArchivePackage: () => boolean;
}

interface StaffAppProps {
  route: string[];
  calls: GrantCall[];
  applications: Application[];
  applicants: ApplicantProfile[];
  archiveHandoffs: ArchiveHandoff[];
  online: boolean;
  actions: StaffActions;
  onReset: () => void;
}

type CaseTab = "review" | "history" | "archive";
const displayFileName = (name: string) => name.replace(/_DEMO(?=\.pdf$)/i, "");

const formatDateTime = formatDisplayDateTime;

function StaffSidebar({
  submittedCount,
  active,
  applicationId,
}: {
  submittedCount: number;
  active: "applications" | "archive";
  applicationId?: string;
}) {
  return (
    <aside className="staff-sidebar">
      <Brand />
      <p className="sidebar-label">Shqyrtimi</p>
      <nav aria-label="Navigimi i stafit">
        <a className={active === "applications" ? "is-active" : ""} href="#/staff/applications"><ClipboardList size={19} aria-hidden="true" /> Aplikimet <span>{submittedCount}</span></a>
        {applicationId ? <a className={active === "archive" ? "is-active" : ""} href={`#/staff/applications/${applicationId}/archive`}><Archive size={19} aria-hidden="true" /> Arkivi</a> : null}
      </nav>
    </aside>
  );
}

function Queue({ applications, calls, applicants }: Pick<StaffAppProps, "applications" | "calls" | "applicants">) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const filteredApplications = useMemo(() => applications.filter((application) => {
    const call = calls.find((item) => item.id === application.callId);
    const applicant = application.submittedSnapshot?.applicant ?? applicants.find((item) => item.id === application.applicantId);
    const haystack = `${application.reference} ${call?.title ?? ""} ${applicant?.displayName ?? ""}`.toLocaleLowerCase("sq");
    return (!query || haystack.includes(query.toLocaleLowerCase("sq"))) && (status === "all" || application.status === status);
  }), [applications, calls, applicants, query, status]);

  const clear = () => { setQuery(""); setStatus("all"); };
  return (
    <>
      <div className="workspace-heading"><h1>Aplikimet</h1><span className="workspace-heading__count">{applications.length} raste</span></div>
      <section className="queue-toolbar" aria-label="Filtro aplikimet">
        <label className="search-field"><Search size={18} aria-hidden="true" /><span className="sr-only">Kërko aplikime</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Referenca, aplikuesi ose thirrja…" /></label>
        <label className="select-field"><span className="sr-only">Filtro sipas statusit</span><Settings2 size={17} aria-hidden="true" /><select value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">Të gjitha statuset</option><option value="submitted-demo">Dorëzuar</option><option value="under-review-demo">Në shqyrtim</option><option value="needs-correction-demo">Kërkohet korrigjim</option><option value="correction-submitted-demo">Korrigjimi erdhi</option><option value="correction-reviewed-demo">Korrigjimi u shqyrtua</option></select></label>
      </section>
      {filteredApplications.length ? (
        <section className="queue-table" aria-label="Lista e aplikimeve">
          <div className="queue-table__header"><span>Referenca / aplikuesi</span><span>Thirrja</span><span>Çështja e hapur</span><span>Statusi</span><span aria-hidden="true" /></div>
          {filteredApplications.map((application) => {
            const call = calls.find((item) => item.id === application.callId);
            const applicant = application.submittedSnapshot?.applicant ?? applicants.find((item) => item.id === application.applicantId);
            const presentation = applicationStatusPresentation[application.status];
            return (
              <a className="queue-row" href={`#/staff/applications/${application.id}`} key={application.id}>
                <span><strong>{displayReference(application.reference)}</strong><small>{applicant?.displayName} · {applicant?.organization}</small></span>
                <span><strong>{call?.shortTitle}</strong><small>Lot I</small></span>
                <span><strong>{application.status === "submitted-demo" ? "Pret shqyrtimin" : application.status === "under-review-demo" ? "Kontrollo ofertën" : application.status === "needs-correction-demo" ? "Pret korrigjimin" : application.status === "correction-submitted-demo" ? "Korrigjimi pret shqyrtim" : "Pa korrigjim aktiv"}</strong></span>
                <span><StatusLabel tone={presentation.tone}>{presentation.label}</StatusLabel></span>
                <ChevronRight size={20} aria-hidden="true" />
              </a>
            );
          })}
        </section>
      ) : <EmptyState title="Nuk ka aplikime" message="Aplikimet e përfunduara shfaqen këtu." actionLabel="Pastro filtrat" onAction={clear} />}
    </>
  );
}

function DocumentSummary({
  document,
  role,
}: {
  document?: DocumentVersion;
  role: "original" | "amendment";
}) {
  if (!document) return <EmptyState title="Dokumenti mungon" message="Versioni i lidhur nuk u gjet." />;
  const template = demoDocumentTemplates.find((item) => item.id === document.templateId);
  return (
    <article className={`version-card version-card--${role}`}>
      <div className="version-card__heading">
        <div><p className="step-kicker">{role === "original" ? "Versioni origjinal" : "Versioni i ri"}</p><h3>Oferta / Profaturë · v{document.version}</h3></div>
      </div>
      <dl className="version-facts">
        <div><dt>Dokumenti</dt><dd>{displayFileName(document.fileName)}</dd></div>
        <div><dt>Shtuar</dt><dd>{formatDateTime(document.createdAt)}</dd></div>
      </dl>
      {template ? <details className="document-preview-details"><summary>Shiko versionin v{document.version}</summary><DocumentPreview title="Oferta / Profaturë" fileName={displayFileName(document.fileName)} version={document.version} lines={template.previewLines} scan={template.id === "template-offer-basic"} imageSrc={document.scanImageDataUrl} /></details> : null}
      {document.documentAssist ? <p className="version-card__datum"><strong>Shuma e lexuar</strong><span>{document.documentAssist.confirmations.totalAmount?.value ?? document.documentAssist.extraction.fields.totalAmount.value ?? "—"} {document.documentAssist.confirmations.currency?.value ?? document.documentAssist.extraction.fields.currency.value ?? ""}</span><small>Rezultat demonstrues · pa lexim AI</small></p> : null}
      {template ? <p className="version-card__datum"><strong>Përmbajtja</strong><span>{role === "original" ? "Vegla pune dhe çmime përmbledhëse" : "Pajisje, sasi dhe çmime të ndara"}</span></p> : null}
    </article>
  );
}

function DocumentAssistStaff({ document }: { document: DocumentVersion }) {
  const record = document.documentAssist;
  if (!record) return null;
  const labels = { issuer: "Lëshuesi", documentDate: "Data", totalAmount: "Shuma", currency: "Monedha", description: "Përshkrimi" } as const;
  return <section className="staff-assist" aria-label="Të dhënat e leximit të dokumentit">
    <div className="staff-assist__heading"><strong>Të dhënat e dokumentit</strong><small>{record.provenance === "live" ? "Lexim automatik" : record.provenance === "captured" ? "Rezultat i ruajtur" : "Rezultat demonstrues · pa lexim AI"}</small></div>
    <img src={document.scanImageDataUrl ?? "/demo/offer-scan.svg"} alt="Pamje e ofertës së shqyrtuar" />
    <dl>{(Object.keys(labels) as Array<keyof typeof labels>).map((key) => { const extracted = record.extraction.fields[key]; const confirmed = record.confirmations[key]; return <div key={key}><dt>{labels[key]}</dt><dd><span>Rezultati: {extracted.value ?? "E pazgjidhur"}</span><span>Konfirmuar: {confirmed ? confirmed.value ?? "E pazgjidhur" : "Pa konfirmim"}</span>{confirmed && confirmed.value !== extracted.value ? <small>Ndryshuar nga aplikuesi</small> : null}<small>Burimi: {extracted.evidence ?? "Nuk u gjet"}</small></dd></div>; })}</dl>
  </section>;
}

function VersionComparison({ application }: { application: Application }) {
  const correction = application.correctionRequests[0];
  const original = application.documents.find((document) => document.id === correction?.questionedDocumentVersionId);
  const replacement = application.documents.find((document) => document.id === correction?.responseDocumentVersionId);
  return (
    <section className="version-comparison" aria-labelledby="version-comparison-title">
      <div className="document-pane__header"><h2 id="version-comparison-title">Krahasimi i versioneve</h2><StatusLabel tone={replacement ? "success" : "warning"}>{replacement ? "v1 → v2" : "Pret versionin e ri"}</StatusLabel></div>
      {replacement ? <p className="comparison-change"><strong>Detajet e ofertës</strong><span>Versioni bazë → pajisjet, sasitë dhe çmimet e ndara</span></p> : null}
      <div className="version-comparison__grid"><DocumentSummary document={original} role="original" />{replacement ? <DocumentSummary document={replacement} role="amendment" /> : null}</div>
    </section>
  );
}

function SelectedEvidence({ application, requirement }: { application: Application; requirement: Requirement }) {
  const snapshot = application.submittedSnapshot;
  const selectedDocument = application.documents.find((document) => snapshot?.documentVersionIds.includes(document.id) && document.requirementId === requirement.id);
  const template = demoDocumentTemplates.find((item) => item.id === selectedDocument?.templateId);
  return (
    <div className="document-pane">
      <div className="document-pane__header"><h2>{requirement.title}</h2><StatusLabel tone={selectedDocument ? "success" : "danger"}>{selectedDocument ? `v${selectedDocument.version}` : "Mungon"}</StatusLabel></div>
      {selectedDocument ? <><DocumentPreview title={requirement.title} fileName={displayFileName(selectedDocument.fileName)} version={selectedDocument.version} lines={template?.previewLines ?? [snapshot?.applicant.displayName ?? "", snapshot?.applicant.organization ?? "", snapshot?.applicant.email ?? ""]} scan={template?.id === "template-offer-basic"} imageSrc={selectedDocument.scanImageDataUrl} /><DocumentAssistStaff document={selectedDocument} /></> : <EmptyState title="Pa dokument" message="Kjo kërkesë opsionale nuk ka dokument të zgjedhur." />}
      <EvidencePanel requirement={requirement} />
    </div>
  );
}

function ReviewActionPanel({ application, online, actions }: { application: Application; online: boolean; actions: StaffActions }) {
  const correction = application.correctionRequests[0];
  return (
    <aside className="review-actions" aria-label="Statusi dhe veprimet e shqyrtimit">
      <div><p className="eyebrow">Veprimi i radhës</p><h2>{application.status === "submitted-demo" ? "Fillo shqyrtimin" : application.status === "under-review-demo" ? "Kërko një korrigjim" : application.status === "needs-correction-demo" ? "Pret aplikuesin" : application.status === "correction-submitted-demo" ? "Shqyrto zëvendësimin" : "Korrigjimi u mbyll"}</h2></div>
      {application.status === "submitted-demo" ? <button className="button button--primary" type="button" disabled={!online} onClick={actions.startReview}><PlayCircle size={18} aria-hidden="true" /> Nis shqyrtimin</button> : null}
      {application.status === "under-review-demo" ? <>
        <div className="message-separation"><div><span>Arsyeja</span><p>Oferta duhet të tregojë qartë pajisjen, sasinë dhe çmimin përkatës.</p></div></div>
        <button className="button button--primary" type="button" disabled={!online} onClick={actions.requestCorrection}><MessageSquareWarning size={18} aria-hidden="true" /> Kërko korrigjimin</button>
      </> : null}
      {application.status === "needs-correction-demo" && correction ? <><p>{correction.applicantMessage.replace("versionin demonstrues", "një version")}</p>{correction.internalNote ? <div className="staff-only-note"><span>Shënim i stafit</span><p>{correction.internalNote.replace("Kontroll demonstrues: ", "")}</p></div> : null}<StatusLabel tone="warning">Në pritje të aplikuesit</StatusLabel></> : null}
      {application.status === "correction-submitted-demo" && correction ? <><StatusLabel tone="success">Versioni i ri mbërriti</StatusLabel>{correction.internalNote ? <div className="staff-only-note"><span>Shënim i stafit</span><p>{correction.internalNote.replace("Kontroll demonstrues: ", "")}</p></div> : null}<button className="button button--primary" type="button" disabled={!online} onClick={actions.markCorrectionReviewed}><CheckCircle2 size={18} aria-hidden="true" /> Shëno si të shqyrtuar</button></> : null}
      {application.status === "correction-reviewed-demo" ? <><StatusLabel tone="success">Korrigjimi u shqyrtua</StatusLabel><a className="button button--secondary" href={`#/staff/applications/${application.id}/archive`}><Archive size={18} aria-hidden="true" /> Përgatitja për arkivim</a></> : null}
      {!online ? <div className="honesty-note"><strong>Vetëm lexim offline.</strong> Rilidhu për ta ndryshuar statusin.</div> : null}
    </aside>
  );
}

function ArchivePanel({ application, call, handoff, online, actions }: { application: Application; call: GrantCall; handoff?: ArchiveHandoff; online: boolean; actions: StaffActions }) {
  const manifest = handoff?.manifest;
  const exportManifest = () => {
    if (!manifest) return;
    const blob = new Blob([JSON.stringify(manifest, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `gjakova-grants-archive-${displayReference(application.reference)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };
  return (
    <section className="archive-panel">
      <div className="archive-heading"><div><h2>Përgatitja për arkivim</h2></div><div className="archive-status-pair"><span><small>Statusi</small><StatusLabel tone={handoff?.status === "package-prepared" ? "success" : "warning"}>{handoff?.status === "package-prepared" ? "Paketa u përgatit" : handoff ? "Gati për përgatitje" : "Nuk është gati"}</StatusLabel></span></div></div>
      <div className="smaed-boundary"><CircleAlert size={19} aria-hidden="true" /><div><small>SMAED</small><strong>Nuk është regjistruar në SMAED</strong></div></div>
      {!handoff ? <EmptyState title="Përgatitja nuk është ende e disponueshme" message="Shqyrto korrigjimin para përgatitjes së paketës." /> : handoff.status === "ready-to-prepare" ? <section className="archive-ready"><div><h3>Gati për përgatitje</h3><p>Paketa përfshin dokumentet dhe historinë e rastit. Numri i protokollit mbetet bosh.</p></div><button className="button button--primary" type="button" disabled={!online} onClick={actions.prepareArchivePackage}>Përgatit paketën</button></section> : manifest ? <>
        <section className="archive-manifest">
          <div className="section-heading section-heading--tight"><h2>{displayReference(application.reference)}</h2></div>
          <dl className="manifest-facts"><div><dt>Thirrja</dt><dd>{call.shortTitle}</dd></div><div><dt>Aplikuesi</dt><dd>{manifest.submittedApplicantSnapshot.displayName} · {manifest.submittedApplicantSnapshot.organization}</dd></div><div><dt>Dorëzuar</dt><dd>{formatDateTime(manifest.submittedAt)}</dd></div><div><dt>Përgatitur</dt><dd>{formatDateTime(manifest.archivePreparedAt)}</dd></div><div><dt>Dokumente fillestare</dt><dd>{manifest.originalSubmittedDocumentVersionIds.length}</dd></div><div><dt>Versione të korrigjuara</dt><dd>{manifest.correctedDocumentVersions.length}</dd></div><div><dt>Korrigjime</dt><dd>{manifest.correctionRequestIds.length}</dd></div><div><dt>Veprime në histori</dt><dd>{manifest.historyEventIds.length}</dd></div></dl>
          <div className="protocol-reference"><span>Numri i protokollit</span><strong>—</strong></div>
          <div className="archive-document-list"><strong>Dokumentet</strong>{manifest.mandatoryRequirements.map((requirement) => <span key={requirement.requirementId}><FileText size={16} aria-hidden="true" /> {requirement.title}<small>{requirement.originalDocumentVersionId ? "v1" : "Pa dokument"}</small></span>)}{manifest.correctedDocumentVersions.map((document) => <span key={document.id}><FileText size={16} aria-hidden="true" /> {displayFileName(document.fileName)}<small>v{document.version}</small></span>)}</div>
        </section>
        <button className="button button--secondary archive-export" type="button" onClick={exportManifest}><Download size={18} aria-hidden="true" /> Eksporto paketën</button>
        <p className="archive-export-note">Skedar JSON për përgatitje. Nuk është ngarkuar në SMAED.</p>
      </> : null}
    </section>
  );
}

function CaseDetail({ application, call, applicant, tab, handoff, online, actions }: { application: Application; call: GrantCall; applicant: ApplicantProfile; tab: CaseTab; handoff?: ArchiveHandoff; online: boolean; actions: StaffActions }) {
  const [selectedRequirement, setSelectedRequirement] = useState<Requirement>(call.requirements.find((requirement) => requirement.id === "req-offer") ?? call.requirements[0]);
  const snapshot = application.submittedSnapshot;
  const snapshotApplicant = snapshot?.applicant ?? applicant;
  const hasCorrection = application.correctionRequests.length > 0;
  const mandatoryAtSubmission = call.requirements.filter((requirement) => requirement.kind === "mandatory" && snapshot?.checkResults.some((check) => check.requirementId === requirement.id && check.status === "present")).length;

  return (
    <>
      <a className="back-link" href="#/staff/applications"><ArrowLeft size={18} aria-hidden="true" /> Kthehu te radha</a>
      <CaseSummary application={application} callTitle={call.shortTitle} />
      <div className="case-owner-strip"><span><UserRound size={18} aria-hidden="true" /><span><small>Aplikuesi</small><strong>{snapshotApplicant.displayName} · {snapshotApplicant.organization}</strong></span></span><span><small>Dorëzuar</small><strong>{formatDateTime(application.submittedAt)}</strong></span><span><small>Dokumentet</small><strong>{mandatoryAtSubmission}/4 të plota</strong></span><span><small>Shqyrtues</small><strong>{application.assignedReviewer?.replace(" · demonstrim", "").replace(" · DEMO", "") ?? "—"}</strong></span></div>
      <div className="tab-list" role="tablist" aria-label="Detajet e rastit">
        <a role="tab" aria-selected={tab === "review"} className={tab === "review" ? "is-active" : ""} href={`#/staff/applications/${application.id}`}>Shqyrtimi</a>
        <a role="tab" aria-selected={tab === "history"} className={tab === "history" ? "is-active" : ""} href={`#/staff/applications/${application.id}/history`}>Historia <span>{application.events.length}</span></a>
        <a role="tab" aria-selected={tab === "archive"} className={tab === "archive" ? "is-active" : ""} href={`#/staff/applications/${application.id}/archive`}>Arkivi</a>
      </div>
      {tab === "history" ? <section className="history-section"><div className="section-heading section-heading--tight"><h2>Historia e rastit</h2></div><CaseTimeline events={application.events} /></section> : tab === "archive" ? <ArchivePanel application={application} call={call} handoff={handoff} online={online} actions={actions} /> : <section className="staff-review-layout">
        <div className="surface-card requirement-pane">
          <div className="section-heading section-heading--tight"><h2>Dokumentet</h2><StatusLabel tone="success">{mandatoryAtSubmission}/4 të plota</StatusLabel></div>
          <div className="requirement-list">{call.requirements.map((requirement) => <div className={selectedRequirement.id === requirement.id ? "selectable-row is-selected" : "selectable-row"} key={requirement.id}><RequirementRow requirement={requirement} check={snapshot?.checkResults.find((check) => check.requirementId === requirement.id)} /><button type="button" onClick={() => setSelectedRequirement(requirement)} aria-label={`Shiko dokumentin për ${requirement.title}`}><FileSearch size={18} aria-hidden="true" /></button></div>)}</div>
        </div>
        {hasCorrection && selectedRequirement.id === "req-offer" ? <VersionComparison application={application} /> : <SelectedEvidence application={application} requirement={selectedRequirement} />}
        <ReviewActionPanel application={application} online={online} actions={actions} />
      </section>}
    </>
  );
}

export function StaffApp({ route, calls, applications, applicants, archiveHandoffs, online, actions, onReset }: StaffAppProps) {
  const submittedApplications = applications.filter((item) => item.status !== "draft" && item.submittedSnapshot);
  const applicationId = route[2];
  const application = submittedApplications.find((item) => item.id === applicationId);
  const call = calls.find((item) => item.id === application?.callId);
  const applicant = applicants.find((item) => item.id === application?.applicantId);
  const tab: CaseTab = route[3] === "archive" ? "archive" : route[3] === "history" ? "history" : "review";
  const handoff = archiveHandoffs.find((item) => item.applicationId === application?.id);
  return (
    <div className="staff-shell">
      <StaffSidebar submittedCount={submittedApplications.length} active={tab === "archive" ? "archive" : "applications"} applicationId={application?.id ?? submittedApplications[0]?.id} />
      <div className="staff-workspace">
        <header className="staff-topbar"><span className="staff-topbar__context">Hapësira e stafit</span><TutorialLink /><RoleSwitcher role="staff" onReset={onReset} /></header>
        <main className="staff-main" id="main-content">{application && call && applicant ? <CaseDetail application={application} call={call} applicant={applicant} tab={tab} handoff={handoff} online={online} actions={actions} /> : <Queue applications={submittedApplications} calls={calls} applicants={applicants} />}</main>
      </div>
    </div>
  );
}

import { useMemo, useState } from "react";
import {
  Archive,
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Download,
  FileSearch,
  FileText,
  LayoutList,
  MessageSquareWarning,
  PackageCheck,
  PlayCircle,
  Search,
  Settings2,
  ShieldAlert,
  UserRound,
} from "lucide-react";
import { Brand, RoleSwitcher } from "../components/RoleSwitcher";
import {
  CaseSummary,
  CaseTimeline,
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

const formatDateTime = (value?: string) => value
  ? new Intl.DateTimeFormat("sq-AL", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value))
  : "Nuk është regjistruar";

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
      <p className="sidebar-label">Hapësira komunale</p>
      <nav aria-label="Navigimi i stafit">
        <a className={active === "applications" ? "is-active" : ""} href="#/staff/applications"><ClipboardList size={19} aria-hidden="true" /> Aplikimet <span>{submittedCount}</span></a>
        <button type="button" disabled title="Ndërtimi i thirrjeve nuk është pjesë e Milestone 3"><LayoutList size={19} aria-hidden="true" /> Thirrjet <small>M4+</small></button>
        {applicationId ? <a className={active === "archive" ? "is-active" : ""} href={`#/staff/applications/${applicationId}/archive`}><Archive size={19} aria-hidden="true" /> Përgatitja e arkivit</a> : <button type="button" disabled title="Hap një rast të dorëzuar për përgatitjen e arkivit"><Archive size={19} aria-hidden="true" /> Përgatitja e arkivit</button>}
      </nav>
      <div className="sidebar-note"><strong>Demonstrim lokal</strong><span>Pa autentikim, backend ose lidhje me SMAED.</span></div>
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
      <div className="workspace-heading"><div><p className="eyebrow">Radha e punës</p><h1>Shqyrtimi demonstrues</h1><p>Snapshot-e lokale sintetike. Ndërrimi i rolit nuk është autentikim ose sinkronizim ndërmjet pajisjeve.</p></div><div className="workspace-heading__count"><strong>{applications.length}</strong><span>raste lokale</span></div></div>
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
                <span><strong>{application.reference}</strong><small>{applicant?.displayName} · {applicant?.organization}</small></span>
                <span><strong>{call?.shortTitle}</strong><small>Lot I · demonstrim</small></span>
                <span><strong>{application.pendingIssue}</strong><small>Rast lokal sintetik</small></span>
                <span><StatusLabel tone={presentation.tone}>{presentation.label}</StatusLabel></span>
                <ChevronRight size={20} aria-hidden="true" />
              </a>
            );
          })}
        </section>
      ) : <EmptyState title="Nuk ka dorëzim demonstrues" message="Përfundo rrjedhën e aplikuesit; draftet lokale nuk shfaqen në radhën e stafit." actionLabel="Pastro filtrat" onAction={clear} />}
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
  if (!document) return <EmptyState title="Dokumenti mungon" message="Versioni i lidhur nuk u gjet në gjendjen lokale." />;
  const template = demoDocumentTemplates.find((item) => item.id === document.templateId);
  return (
    <article className={`version-card version-card--${role}`}>
      <div className="version-card__heading">
        <span className="version-card__icon"><FileText size={20} aria-hidden="true" /></span>
        <div><p className="eyebrow">{role === "original" ? "Origjinali në dorëzim" : "Amendamenti"}</p><h3>Oferta / Profaturë · v{document.version}</h3></div>
        <StatusLabel tone={role === "original" ? "neutral" : "info"}>{role === "original" ? "Snapshot origjinal" : "Korrigjim"}</StatusLabel>
      </div>
      <dl className="version-facts">
        <div><dt>Skedari sintetik</dt><dd>{document.fileName}</dd></div>
        <div><dt>Shtuar</dt><dd>{formatDateTime(document.createdAt)}</dd></div>
        <div><dt>Lidhja</dt><dd>{role === "original" ? "Pjesë e snapshot-it fillestar" : `Zëvendëson ${document.supersedesVersionId}`}</dd></div>
        <div><dt>Kërkesa</dt><dd>{document.correctionRequestId ?? "Pa kërkesë korrigjimi"}</dd></div>
      </dl>
      {template ? <div className="version-fields"><strong>Përmbajtja sintetike e dukshme</strong>{template.previewLines.map((line) => <span key={line}><CheckCircle2 size={15} aria-hidden="true" /> {line}</span>)}</div> : null}
      <DocumentAssistStaff document={document} />
    </article>
  );
}

function DocumentAssistStaff({ document }: { document: DocumentVersion }) {
  const record = document.documentAssist;
  if (!record) return null;
  const labels = { issuer: "Lëshuesi", documentDate: "Data", totalAmount: "Shuma", currency: "Monedha", description: "Përshkrimi" } as const;
  return <section className="staff-assist" aria-label="Të dhënat e leximit të dokumentit">
    <div className="staff-assist__heading"><strong>Leximi i dokumentit · v{document.version}</strong><small>{record.provenance === "live" ? "AI i drejtpërdrejtë" : record.provenance === "captured" ? "Rezultat AI i ruajtur" : "Simulim lokal · pa AI"}</small></div>
    <img src="/demo/offer-scan.svg" alt="Imazhi sintetik origjinal i ofertës" />
    <dl>{(Object.keys(labels) as Array<keyof typeof labels>).map((key) => { const extracted = record.extraction.fields[key]; const confirmed = record.confirmations[key]; return <div key={key}><dt>{labels[key]}</dt><dd><span>{record.provenance === "simulated" ? "Leximi i simuluar" : "Leximi AI"}: {extracted.value ?? "E pazgjidhur"}</span><span>Aplikuesi: {confirmed ? confirmed.value ?? "E pazgjidhur" : "Pa konfirmim"}</span>{confirmed && confirmed.value !== extracted.value ? <small>Ndryshuar nga aplikuesi</small> : null}<small>Burimi: {extracted.evidence ?? "Nuk u gjet"}</small></dd></div>; })}</dl>
    <p>Informative; shqyrtimi mbetet përgjegjësi e zyrtarit.</p>
  </section>;
}

function VersionComparison({ application }: { application: Application }) {
  const correction = application.correctionRequests[0];
  const original = application.documents.find((document) => document.id === correction?.questionedDocumentVersionId);
  const replacement = application.documents.find((document) => document.id === correction?.responseDocumentVersionId);
  return (
    <section className="version-comparison" aria-labelledby="version-comparison-title">
      <div className="document-pane__header"><div><p className="eyebrow">Krahasimi i korrigjimit</p><h2 id="version-comparison-title">Origjinali dhe zëvendësimi</h2></div><StatusLabel tone={replacement ? "success" : "warning"}>{replacement ? "2 versione" : "Pret zëvendësim"}</StatusLabel></div>
      <DocumentSummary document={original} role="original" />
      {replacement ? <DocumentSummary document={replacement} role="amendment" /> : null}
    </section>
  );
}

function SelectedEvidence({ application, requirement }: { application: Application; requirement: Requirement }) {
  const snapshot = application.submittedSnapshot;
  const selectedDocument = application.documents.find((document) => snapshot?.documentVersionIds.includes(document.id) && document.requirementId === requirement.id);
  const template = demoDocumentTemplates.find((item) => item.id === selectedDocument?.templateId);
  return (
    <div className="document-pane">
      <div className="document-pane__header"><div><p className="eyebrow">Evidenca në snapshot</p><h2>{requirement.title}</h2></div><StatusLabel tone={selectedDocument ? "success" : "danger"}>{selectedDocument ? `Versioni ${selectedDocument.version}` : "Mungon"}</StatusLabel></div>
      {selectedDocument ? <><div className="synthetic-document synthetic-document--compact"><span className="synthetic-document__badge">DEMO · SINTETIK</span><FileText size={40} aria-hidden="true" /><strong>{selectedDocument.fileName}</strong><small>{selectedDocument.sizeLabel} · snapshot origjinal</small>{template ? <div className="synthetic-summary-lines">{template.previewLines.map((line) => <span key={line}>{line}</span>)}</div> : null}</div><DocumentAssistStaff document={selectedDocument} /></> : <EmptyState title="Pa dokument" message="Kjo kërkesë opsionale nuk ka skedar të bashkëngjitur." />}
      <EvidencePanel requirement={requirement} />
    </div>
  );
}

function ReviewActionPanel({ application, online, actions }: { application: Application; online: boolean; actions: StaffActions }) {
  const correction = application.correctionRequests[0];
  return (
    <aside className="review-actions" aria-label="Statusi dhe veprimet e shqyrtimit">
      <div><p className="eyebrow">Veprimi i radhës</p><h2>{application.status === "submitted-demo" ? "Fillo shqyrtimin" : application.status === "under-review-demo" ? "Kërko një korrigjim" : application.status === "needs-correction-demo" ? "Pret aplikuesin" : application.status === "correction-submitted-demo" ? "Shqyrto zëvendësimin" : "Korrigjimi u mbyll"}</h2></div>
      {application.status === "submitted-demo" ? <><p>Snapshot-i është i plotë dhe i pandryshueshëm. Fillimi i shqyrtimit krijon një ngjarje të vetme.</p><button className="button button--primary" type="button" disabled={!online} onClick={actions.startReview}><PlayCircle size={18} aria-hidden="true" /> Nis shqyrtimin</button></> : null}
      {application.status === "under-review-demo" ? <>
        <div className="message-separation"><div><span>Mesazh për aplikuesin</span><p>Ju lutem zëvendësoni ofertën me versionin demonstrues që tregon qartë pajisjen, sasinë dhe çmimin përkatës.</p></div><div className="internal-note"><span>Shënim vetëm për staf</span><p>Versioni fillestar nuk i paraqet qartë sasinë dhe çmimin për secilën pajisje.</p></div></div>
        <button className="button button--primary" type="button" disabled={!online} onClick={actions.requestCorrection}><MessageSquareWarning size={18} aria-hidden="true" /> Kërko korrigjimin</button>
      </> : null}
      {application.status === "needs-correction-demo" && correction ? <><div className="request-summary"><ShieldAlert size={20} aria-hidden="true" /><span><strong>{correction.id}</strong>{correction.applicantMessage}</span></div>{correction.internalNote ? <div className="staff-only-note"><span>Shënim vetëm për staf</span><p>{correction.internalNote}</p></div> : null}<p>Origjinali v{application.documents.find((item) => item.id === correction.questionedDocumentVersionId)?.version} mbetet në snapshot. Nuk mund të hapet një kërkesë e dytë aktive.</p><StatusLabel tone="warning">Në pritje të aplikuesit</StatusLabel></> : null}
      {application.status === "correction-submitted-demo" && correction ? <><div className="request-summary request-summary--success"><CheckCircle2 size={20} aria-hidden="true" /><span><strong>Korrigjimi mbërriti</strong>Versioni {application.documents.find((item) => item.id === correction.responseDocumentVersionId)?.version} është lidhur me {correction.id}.</span></div>{correction.internalNote ? <div className="staff-only-note"><span>Shënim vetëm për staf</span><p>{correction.internalNote}</p></div> : null}<button className="button button--primary" type="button" disabled={!online} onClick={actions.markCorrectionReviewed}><CheckCircle2 size={18} aria-hidden="true" /> Shëno korrigjimin të shqyrtuar</button></> : null}
      {application.status === "correction-reviewed-demo" ? <><div className="request-summary request-summary--success"><CheckCircle2 size={20} aria-hidden="true" /><span><strong>Pa korrigjim aktiv</strong>Të dy versionet mbeten të qasshme. Ky nuk është miratim ose vendim financimi.</span></div><a className="button button--secondary" href={`#/staff/applications/${application.id}/archive`}><Archive size={18} aria-hidden="true" /> Hap përgatitjen e arkivit</a></> : null}
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
    anchor.download = `gjakova-grants-demo-archive-${application.reference}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };
  return (
    <section className="archive-panel">
      <div className="archive-heading"><div><p className="eyebrow">Përgatitja e arkivit / protokollit</p><h2>Paketë lokale për dorëzim manual</h2><p>Statusi i aplikimit dhe statusi i dorëzimit në arkiv mbeten të ndarë.</p></div><div className="archive-status-pair"><span><small>Statusi i aplikimit</small><StatusLabel tone="success">Korrigjimi u shqyrtua</StatusLabel></span><span><small>Dorëzimi në arkiv</small><StatusLabel tone={handoff?.status === "package-prepared" ? "info" : "warning"}>{handoff?.status === "package-prepared" ? "Paketa u përgatit" : handoff ? "Gati për përgatitje" : "Nuk është gati"}</StatusLabel></span></div></div>
      <div className="smaed-boundary"><ShieldAlert size={22} aria-hidden="true" /><div><strong>Nuk është regjistruar në SMAED</strong><span>Nuk ka lidhje API, ngarkim zyrtar ose konfirmim nga komuna.</span></div></div>
      {!handoff ? <EmptyState title="Përgatitja nuk është ende e disponueshme" message="Shqyrto korrigjimin para krijimit të një pakete demonstrative." /> : handoff.status === "ready-to-prepare" ? <section className="surface-card archive-ready"><PackageCheck size={32} aria-hidden="true" /><div><h3>Rasti është gati për përgatitje.</h3><p>Paketa do të përdorë snapshot-in origjinal, dokumentet e korrigjuara dhe historinë lokale. Nuk do të krijojë numër protokolli.</p></div><button className="button button--primary" type="button" disabled={!online} onClick={actions.prepareArchivePackage}>Përgatit paketën demonstrative</button></section> : manifest ? <>
        <section className="archive-manifest">
          <div className="section-heading section-heading--tight"><div><p className="eyebrow">Manifesti lokal</p><h2>{application.reference}</h2></div><StatusLabel tone="neutral">Trajnim / DEMO</StatusLabel></div>
          <dl className="manifest-facts"><div><dt>Thirrja / versioni</dt><dd>{call.shortTitle} · {manifest.call.callVersionId}</dd></div><div><dt>Aplikuesi në snapshot</dt><dd>{manifest.submittedApplicantSnapshot.displayName} · {manifest.submittedApplicantSnapshot.organization}</dd></div><div><dt>Dorëzuar</dt><dd>{formatDateTime(manifest.submittedAt)}</dd></div><div><dt>Përgatitur</dt><dd>{formatDateTime(manifest.archivePreparedAt)}</dd></div><div><dt>Kërkesa të detyrueshme</dt><dd>{manifest.mandatoryRequirements.length}</dd></div><div><dt>Versione origjinale / korrigjuese</dt><dd>{manifest.originalSubmittedDocumentVersionIds.length} / {manifest.correctedDocumentVersions.length}</dd></div><div><dt>Kërkesa e korrigjimit</dt><dd>{manifest.correctionRequestIds.join(", ")}</dd></div><div><dt>Ngjarje në histori</dt><dd>{manifest.historyEventIds.length}</dd></div></dl>
          <div className="protocol-reference"><span>Referenca zyrtare e protokollit</span><strong>Nuk është regjistruar në këtë demonstrim</strong></div>
          <div className="archive-document-list"><strong>Versionet e lidhura</strong>{manifest.mandatoryRequirements.map((requirement) => <span key={requirement.requirementId}><FileText size={16} aria-hidden="true" /> {requirement.title}<small>{requirement.originalDocumentVersionId ?? "Pa dokument"}</small></span>)}{manifest.correctedDocumentVersions.map((document) => <span key={document.id}><FileText size={16} aria-hidden="true" /> {document.fileName}<small>v{document.version} · {document.correctionRequestId}</small></span>)}</div>
        </section>
        <button className="button button--secondary archive-export" type="button" onClick={exportManifest}><Download size={18} aria-hidden="true" /> Eksporto paketën demonstruese të arkivit</button>
        <p className="archive-export-note">Eksport JSON lokal për demonstrim; nuk është ngarkim në SMAED ose dosje zyrtare.</p>
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
      <div className="case-owner-strip"><span><UserRound size={18} aria-hidden="true" /><span><small>Aplikuesi në snapshot</small><strong>{snapshotApplicant.displayName} · {snapshotApplicant.organization}</strong></span></span><span><small>Dorëzuar</small><strong>{formatDateTime(application.submittedAt)}</strong></span><span><small>Gatishmëria në dorëzim</small><strong>{mandatoryAtSubmission}/4 të detyrueshme</strong></span><span><small>Shqyrtues</small><strong>{application.assignedReviewer}</strong></span></div>
      <div className="tab-list" role="tablist" aria-label="Detajet e rastit">
        <a role="tab" aria-selected={tab === "review"} className={tab === "review" ? "is-active" : ""} href={`#/staff/applications/${application.id}`}>Shqyrtimi</a>
        <a role="tab" aria-selected={tab === "history"} className={tab === "history" ? "is-active" : ""} href={`#/staff/applications/${application.id}/history`}>Historia <span>{application.events.length}</span></a>
        <a role="tab" aria-selected={tab === "archive"} className={tab === "archive" ? "is-active" : ""} href={`#/staff/applications/${application.id}/archive`}>Arkivi</a>
      </div>
      {tab === "history" ? <section className="surface-card"><div className="section-heading section-heading--tight"><div><p className="eyebrow">Histori e rastit demonstrues</p><h2>Veprimet sipas kohës</h2></div><StatusLabel tone="neutral">Jo audit ligjor</StatusLabel></div><CaseTimeline events={application.events} /></section> : tab === "archive" ? <ArchivePanel application={application} call={call} handoff={handoff} online={online} actions={actions} /> : <section className="staff-review-layout">
        <div className="surface-card requirement-pane">
          <div className="section-heading section-heading--tight"><div><p className="eyebrow">Dokumentet / evidenca</p><h2>Kërkesat</h2></div><StatusLabel tone="success">{mandatoryAtSubmission}/4 në dorëzim</StatusLabel></div>
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
        <header className="staff-topbar"><span className="staff-topbar__context">DZHE · mjedis demonstrues</span><RoleSwitcher role="staff" onReset={onReset} /></header>
        <main className="staff-main" id="main-content">{application && call && applicant ? <CaseDetail application={application} call={call} applicant={applicant} tab={tab} handoff={handoff} online={online} actions={actions} /> : <Queue applications={submittedApplications} calls={calls} applicants={applicants} />}</main>
      </div>
    </div>
  );
}

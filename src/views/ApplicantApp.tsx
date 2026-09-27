import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  BriefcaseBusiness,
  CalendarDays,
  Camera,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleUserRound,
  Eye,
  FileCheck2,
  FileText,
  Home,
  MessageSquareWarning,
  RefreshCcw,
  Search,
  Send,
  Trash2,
  X,
} from "lucide-react";
import { Brand, RoleSwitcher, TutorialLink } from "../components/RoleSwitcher";
import {
  EvidencePanel,
  CaseTimeline,
  DocumentPreview,
  GrantCard,
  RequirementRow,
  StatusLabel,
  applicationStatusPresentation,
  displayReference,
  formatDisplayDateTime,
} from "../components/DomainComponents";
import { EmptyState } from "../components/FeedbackStates";
import { ScannerDialog } from "../components/ScannerDialog";
import { demoDocumentTemplates } from "../data/fixtures";
import {
  getReadiness,
  validateApplicantDetails,
  type ApplicantDetailErrors,
} from "../services/applicationRules";
import type {
  ApplicantProfile,
  Application,
  ApplicationApplicantDetails,
  DocumentAssistFieldName,
  DocumentAssistRecord,
  DocumentAssistResult,
  DocumentVersion,
  GrantCall,
  Requirement,
} from "../types/domain";

type ApplicationStep = "details" | "documents" | "review" | "receipt";

export interface ApplicantActions {
  updateDetails: (patch: Partial<ApplicationApplicantDetails>) => void;
  reusePassport: () => void;
  updatePassport: (patch: Partial<ApplicationApplicantDetails>) => void;
  selectDocument: (requirementId: string, templateId: string) => void;
  addScannedOffer: (imageDataUrl: string) => boolean;
  removeDocument: (requirementId: string) => void;
  saveDocumentAssist: (versionId: string, record: DocumentAssistRecord) => boolean;
  confirmDocumentAssist: (versionId: string, values: Record<DocumentAssistFieldName, string>) => boolean;
  setAcknowledged: (acknowledged: boolean) => void;
  submit: () => boolean;
  respondToCorrection: () => boolean;
}

interface ApplicantAppProps {
  route: string[];
  calls: GrantCall[];
  applications: Application[];
  applicant: ApplicantProfile;
  online: boolean;
  actions: ApplicantActions;
  onReset: () => void;
}

const detailFields: Array<{
  key: keyof ApplicationApplicantDetails;
  label: string;
  type: "text" | "email" | "tel";
  autoComplete: string;
}> = [
  { key: "displayName", label: "Emri i aplikuesit", type: "text", autoComplete: "name" },
  { key: "organization", label: "Veprimtaria", type: "text", autoComplete: "organization" },
  { key: "municipality", label: "Komuna", type: "text", autoComplete: "address-level2" },
  { key: "email", label: "Email", type: "email", autoComplete: "email" },
  { key: "phone", label: "Telefoni", type: "tel", autoComplete: "tel" },
  { key: "businessNumber", label: "Numri i biznesit", type: "text", autoComplete: "off" },
];

function ApplicantHeader({ onReset }: { onReset: () => void }) {
  return (
    <header className="applicant-topbar">
      <Brand />
      <TutorialLink />
      <RoleSwitcher role="applicant" onReset={onReset} />
    </header>
  );
}

function BottomNavigation({ current }: { current: string }) {
  const items = [
    { key: "opportunities", label: "Grantet", icon: Home, href: "#/applicant/opportunities" },
    { key: "applications", label: "Aplikimet", icon: FileCheck2, href: "#/applicant/applications" },
    { key: "passport", label: "Profili", icon: CircleUserRound, href: "#/applicant/passport" },
  ];
  return (
    <nav className="bottom-nav" aria-label="Navigimi i aplikuesit">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <a key={item.key} href={item.href} className={current === item.key ? "is-active" : ""} aria-current={current === item.key ? "page" : undefined}>
            <Icon size={20} aria-hidden="true" />
            <span>{item.label}</span>
          </a>
        );
      })}
    </nav>
  );
}

function Opportunities({ calls }: { calls: GrantCall[] }) {
  const [query, setQuery] = useState("");
  const filteredCalls = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("sq");
    return calls.filter((call) => !normalizedQuery || `${call.title} ${call.institution}`.toLocaleLowerCase("sq").includes(normalizedQuery));
  }, [calls, query]);

  const clearFilters = () => {
    setQuery("");
  };

  return (
    <>
      <section className="applicant-hero">
        <h1>Grantet</h1>
      </section>

      <section className="filters-card" aria-label="Filtro mundësitë">
        <label className="search-field">
          <Search size={18} aria-hidden="true" />
          <span className="sr-only">Kërko mundësi</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Kërko grantin ose institucionin…" />
        </label>
      </section>

      <div className="section-heading">
        <div><h2>Thirrjet</h2><small className="muted">{filteredCalls.length} rezultat</small></div>
      </div>

      {filteredCalls.length ? (
        <div className="grant-grid grant-grid--single">
          {filteredCalls.map((call) => <GrantCard key={call.id} call={call} />)}
        </div>
      ) : (
        <EmptyState title="Nuk u gjet thirrja" message="Provo një kërkim tjetër." actionLabel="Pastro kërkimin" onAction={clearFilters} />
      )}
    </>
  );
}

function CallDetail({ call, application }: { call: GrantCall; application: Application }) {
  const [selectedRequirement, setSelectedRequirement] = useState<Requirement | null>(call.requirements[0] ?? null);
  return (
    <>
      <a className="back-link" href="#/applicant/opportunities"><ArrowLeft size={18} aria-hidden="true" /> Kthehu te mundësitë</a>
      <section className="call-detail-hero">
        <p className="eyebrow">{call.institution}</p>
        <h1>{call.title}</h1>
        <p>{call.summary}</p>
        <StatusLabel tone="neutral">Afati ka përfunduar</StatusLabel>
        <div className="call-facts">
          <div><CalendarDays size={20} aria-hidden="true" /><span><small>Afati</small><strong>11 mars – 03 prill 2026</strong></span></div>
          <div><BriefcaseBusiness size={20} aria-hidden="true" /><span><small>Financimi për grant</small><strong>{call.amountLabel}</strong></span></div>
        </div>
      </section>

      <section className="detail-layout">
        <div className="call-requirements">
          <div className="section-heading section-heading--tight">
            <div><h2>Dokumentet e kërkuara</h2></div>
          </div>
          <div className="requirement-list">
            {call.requirements.map((requirement) => <RequirementRow key={requirement.id} requirement={requirement} onShowEvidence={setSelectedRequirement} />)}
          </div>
        </div>
        {selectedRequirement ? <EvidencePanel requirement={selectedRequirement} /> : null}
      </section>

      <section className="sticky-action-card">
        <div>
          <strong>{application.status !== "draft" ? "Aplikimi është përfunduar" : "Përgatit aplikimin"}</strong>
          <span>Afati i thirrjes ka përfunduar.</span>
        </div>
        <a className="button button--primary" href={application.status !== "draft" ? "#/applicant/applications/receipt" : "#/applicant/applications/details"}>
          {application.status !== "draft" ? "Shiko statusin" : "Hap aplikimin"}<ChevronRight size={18} aria-hidden="true" />
        </a>
      </section>
    </>
  );
}

function FormFields({
  values,
  errors = {},
  disabled,
  onChange,
}: {
  values: ApplicationApplicantDetails;
  errors?: ApplicantDetailErrors;
  disabled: boolean;
  onChange: (patch: Partial<ApplicationApplicantDetails>) => void;
}) {
  return (
    <div className="form-grid">
      {detailFields.map((field) => {
        const errorId = errors[field.key] ? `${field.key}-error` : undefined;
        return (
          <label className="form-field" key={field.key}>
            <span>{field.label}<span className="required-mark" aria-hidden="true"> *</span></span>
            <input
              id={`field-${field.key}`}
              type={field.type}
              autoComplete={field.autoComplete}
              value={values[field.key]}
              disabled={disabled}
              required
              aria-required="true"
              aria-invalid={Boolean(errors[field.key])}
              aria-describedby={errorId}
              onChange={(event) => onChange({ [field.key]: event.target.value })}
            />
            {errors[field.key] ? <small className="field-error" id={errorId}>{errors[field.key]}</small> : null}
          </label>
        );
      })}
    </div>
  );
}

function Passport({
  applicant,
  submitted,
  online,
  onUpdate,
}: {
  applicant: ApplicantProfile;
  submitted: boolean;
  online: boolean;
  onUpdate: ApplicantActions["updatePassport"];
}) {
  const values: ApplicationApplicantDetails = {
    displayName: applicant.displayName,
    organization: applicant.organization,
    municipality: applicant.municipality,
    email: applicant.email,
    phone: applicant.phone,
    businessNumber: applicant.businessNumber,
  };
  return (
    <>
      <section className="passport-hero">
        <div><h1>Profili</h1><p>Të dhënat e tua për aplikim.</p></div>
      </section>
      <p className="quiet-disclosure">Përdor vetëm të dhëna shembull. Identiteti nuk verifikohet.</p>
      {submitted ? <div className="inline-notice"><CheckCircle2 size={18} aria-hidden="true" /><span>Ndryshimet në profil nuk ndryshojnë aplikimin e përfunduar.</span></div> : null}
      <section className="profile-section">
        <div className="section-heading section-heading--tight"><h2>Të dhënat bazë</h2><StatusLabel tone={online ? "success" : "neutral"}>{online ? "Ruajtur" : "Vetëm lexim"}</StatusLabel></div>
        <FormFields values={values} disabled={!online} onChange={onUpdate} />
      </section>
      <section className="profile-section">
        <div className="section-heading section-heading--tight"><h2>Dokumente të disponueshme</h2><span className="muted">2 dokumente</span></div>
        <div className="document-list">
          <div><FileText aria-hidden="true" /><span><strong>Dokument identifikimi</strong><small>Mund të zgjidhet në aplikim</small></span></div>
          <div><FileText aria-hidden="true" /><span><strong>Certifikatë trajnimi</strong><small>Opsionale</small></span></div>
        </div>
      </section>
    </>
  );
}

function ApplicationStepper({ step, submitted }: { step: ApplicationStep; submitted: boolean }) {
  const steps: Array<{ key: ApplicationStep; label: string }> = [
    { key: "details", label: "Të dhënat" },
    { key: "documents", label: "Dokumentet" },
    { key: "review", label: "Rishikimi" },
  ];
  return (
    <nav className="application-stepper" aria-label="Hapat e aplikimit">
      {steps.map((item, index) => (
        <a key={item.key} href={`#/applicant/applications/${submitted ? "receipt" : item.key}`} className={step === item.key ? "is-active" : ""} aria-current={step === item.key ? "step" : undefined}>
          <span>{index + 1}</span>{item.label}
        </a>
      ))}
    </nav>
  );
}

function DetailsStep({
  application,
  applicant,
  online,
  actions,
}: {
  application: Application;
  applicant: ApplicantProfile;
  online: boolean;
  actions: ApplicantActions;
}) {
  const [errors, setErrors] = useState<ApplicantDetailErrors>({});
  const continueToDocuments = () => {
    const nextErrors = validateApplicantDetails(application.applicantDetails);
    setErrors(nextErrors);
    const firstError = detailFields.find((field) => nextErrors[field.key]);
    if (firstError) {
      window.requestAnimationFrame(() => document.querySelector<HTMLInputElement>(`#field-${firstError.key}`)?.focus());
      return;
    }
    window.location.hash = "/applicant/applications/documents";
  };
  return (
    <section className="application-step surface-card">
      <div className="application-step__heading">
        <div><p className="step-kicker">Hapi 1 nga 3</p><h2>Të dhënat e aplikuesit</h2></div>
        <button className="button button--secondary" type="button" disabled={!online} onClick={actions.reusePassport}><CircleUserRound size={18} aria-hidden="true" /> Përdor të dhënat e profilit</button>
      </div>
      <p className="save-indicator"><Check size={16} aria-hidden="true" /> Ruajtur</p>
      <FormFields values={application.applicantDetails} errors={errors} disabled={!online} onChange={actions.updateDetails} />
      <div className="step-actions"><span className="muted">Profili: {applicant.displayName}</span><button className="button button--primary" type="button" disabled={!online} onClick={continueToDocuments}>Vazhdo te dokumentet <ChevronRight size={18} aria-hidden="true" /></button></div>
    </section>
  );
}

const displayFileName = (name: string) => name.replace(/_DEMO(?=\.pdf$)/i, "");

function DemoDocumentPreview({ templateId }: { templateId: string }) {
  const template = demoDocumentTemplates.find((item) => item.id === templateId);
  if (!template) return null;
  return (
    <DocumentPreview title={template.label} fileName={displayFileName(template.fileName)} lines={template.previewLines} scan={template.id === "template-offer-basic"} />
  );
}

const assistFields: Array<{ key: DocumentAssistFieldName; label: string }> = [
  { key: "issuer", label: "Lëshuesi" },
  { key: "documentDate", label: "Data" },
  { key: "totalAmount", label: "Shuma" },
  { key: "currency", label: "Monedha" },
  { key: "description", label: "Përshkrimi" },
];

async function scanAsPng(source?: string) {
  const image = new Image();
  image.src = source ?? "/demo/offer-scan.svg";
  await image.decode();
  const factor = Math.min(1, 900 / image.naturalWidth, 1273 / image.naturalHeight);
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(500, Math.round(image.naturalWidth * factor));
  canvas.height = Math.max(500, Math.round(image.naturalHeight * factor));
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Pamja e dokumentit nuk mund të përgatitet.");
  context.drawImage(image, 0, 0, 900, 1120);
  const imageDataUrl = canvas.toDataURL("image/png");
  if (imageDataUrl.length > 1_800_000) throw new Error("Imazhi është shumë i madh për lexim.");
  return imageDataUrl;
}

function OfferDocumentAssist({ document, online, actions }: { document: DocumentVersion; online: boolean; actions: ApplicantActions }) {
  const record = document.documentAssist;
  const [busy, setBusy] = useState(false);
  const inFlight = useRef(false);
  const [message, setMessage] = useState("");
  const [values, setValues] = useState<Record<DocumentAssistFieldName, string>>({ issuer: "", documentDate: "", totalAmount: "", currency: "", description: "" });
  useEffect(() => {
    if (!record) return;
    setValues(Object.fromEntries(assistFields.map(({ key }) => [key, record.confirmations[key]?.value ?? record.extraction.fields[key].value ?? ""])) as Record<DocumentAssistFieldName, string>);
  }, [record]);
  const read = async () => {
    if (inFlight.current || !online) return;
    inFlight.current = true;
    setBusy(true);
    setMessage("");
    try {
      const imageDataUrl = await scanAsPng(document.scanImageDataUrl);
      const response = await fetch("/api/document-assist", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ scanAssetId: "offer-scan-v1", imageDataUrl }), cache: "no-store" });
      const payload = await response.json() as { result?: DocumentAssistResult; provenance?: DocumentAssistRecord["provenance"]; model?: string | null; error?: string };
      if (!response.ok || !payload.result || !payload.provenance) {
        const errors: Record<string, string> = { unconfigured: "Leximi i dokumentit nuk është i disponueshëm. Mund të vazhdosh pa të.", unsupported: "Ky imazh nuk mund të lexohet.", timeout: "Leximi zgjati shumë. Provo sërish.", malformed: "Të dhënat nuk u lexuan qartë. Kontrollo dokumentin ose provo sërish.", upstream: "Leximi i dokumentit nuk është i disponueshëm. Mund të vazhdosh pa të.", network: "Lidhja dështoi. Provo sërish." };
        throw new Error(errors[payload.error ?? ""] ?? "Leximi nuk u përfundua. Dokumenti mbetet i përdorshëm.");
      }
      const saved = actions.saveDocumentAssist(document.id, { scanAssetId: "offer-scan-v1", extraction: payload.result, confirmations: {}, provenance: payload.provenance, model: payload.model ?? null, createdAt: new Date().toISOString() });
      if (!saved) setMessage("Rezultati nuk u ruajt; provo sërish.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Leximi nuk u përfundua. Provo sërish.");
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  };
  const found = record ? assistFields.filter(({ key }) => record.extraction.fields[key].value !== null).length : 0;
  const confirmed = record ? assistFields.filter(({ key }) => Boolean(record.confirmations[key]?.value)).length : 0;
  return <section className="offer-assist" aria-label="Leximi i ofertës">
    <div className="offer-assist__heading"><h3>Të dhënat e dokumentit</h3><FileText size={21} aria-hidden="true" /></div>
    <div className="offer-assist__grid">
      <figure className="offer-assist__scan"><img src={document.scanImageDataUrl ?? "/demo/offer-scan.svg"} alt="Parapamje e ofertës / profaturës së përzgjedhur" /><figcaption>Oferta / Profatura · v{document.version}</figcaption></figure>
      <div className="offer-assist__side">
        {!record ? <><p>Lexo të dhënat e ofertës dhe kontrolloji para konfirmimit.</p><button className="button button--primary" type="button" disabled={!online || busy} onClick={read}><FileText size={17} aria-hidden="true" /> {busy ? "Po lexohet…" : "Lexo dokumentin"}</button>{!online ? <p className="offer-assist__notice">Leximi nuk është i disponueshëm pa lidhje.</p> : null}</> : <>
          <p className="offer-assist__provenance">{record.provenance === "live" ? "Lexim automatik" : record.provenance === "captured" ? "Rezultat i ruajtur" : "Rezultat demonstrues · pa lexim AI"}</p>
          <p className="offer-assist__hint">Kontrollo vlerat me dokumentin. {record.extraction.overallStatus === "readable" ? "" : "Disa fusha kërkojnë vëmendje."}</p>
          <div className="offer-assist__fields">{assistFields.map(({ key, label }) => { const field = record.extraction.fields[key]; const status = field.value === null ? "Nuk u gjet" : field.confidence === "high" ? "U gjet" : "Rishiko"; return <label className="offer-assist__field" key={key}><span><strong>{label}</strong><small className={field.value && field.confidence === "high" ? "is-found" : "is-review"}>{field.value && field.confidence === "high" ? <Check size={13} aria-hidden="true" /> : <AlertCircle size={13} aria-hidden="true" />}{status}</small></span><input value={values[key]} maxLength={120} disabled={!online} onChange={(event) => setValues((current) => ({ ...current, [key]: event.target.value }))} aria-label={`${label} · konfirmim nga aplikuesi`} placeholder="Lëre bosh nëse mbetet e paqartë" /><em>Nxjerrë nga leximi: {field.value ?? "Pa vlerë"}</em><small>Burimi: {field.evidence ? `“${field.evidence}”` : "Nuk u gjet fragment mbështetës"}</small>{record.confirmations[key] ? <small>Konfirmuar nga aplikuesi: {record.confirmations[key]?.value ?? "E pazgjidhur"}</small> : null}</label>; })}</div>
          {record.extraction.notes.length ? <p className="offer-assist__notice">{record.extraction.notes.join(" ")}</p> : null}
          <button className="button button--secondary" type="button" disabled={!online} onClick={() => actions.confirmDocumentAssist(document.id, values)}>Konfirmo të dhënat</button>
          {Object.keys(record.confirmations).length ? <p className="offer-assist__summary">{found} fusha u gjetën · {confirmed} u konfirmuan · {5 - confirmed} kërkojnë rishikim</p> : null}
        </>}
        {busy ? <p role="status" className="offer-assist__notice">Duke lexuar dokumentin…</p> : null}
        {message ? <p role="alert" className="offer-assist__error">{message}</p> : null}
      </div>
    </div>
  </section>;
}

function DocumentsStep({ application, call, online, actions }: { application: Application; call: GrantCall; online: boolean; actions: ApplicantActions }) {
  const [previewTemplateId, setPreviewTemplateId] = useState<string | null>(null);
  const [scannerOpen, setScannerOpen] = useState(false);
  const scannerTriggerRef = useRef<HTMLButtonElement>(null);
  const readiness = getReadiness(application, call);
  return (
    <section className="application-step">
      <div className="application-step__heading">
        <div><p className="step-kicker">Hapi 2 nga 3</p><h2>Dokumentet</h2></div>
        <StatusLabel tone={readiness.ready ? "success" : "warning"}>{readiness.completeCount}/{readiness.mandatoryCount} të plota</StatusLabel>
      </div>
      <div className="document-picker-list">
        {call.requirements.map((requirement) => {
          const check = readiness.checks.find((item) => item.requirementId === requirement.id);
          const activeId = application.activeDocumentVersionIds[requirement.id];
          const active = application.documents.find((document) => document.id === activeId);
          const templates = demoDocumentTemplates.filter((template) => template.requirementId === requirement.id);
          const isForm = requirement.id === "req-application";
          return (
            <article className="document-picker" key={requirement.id}>
              <div className="document-picker__heading">
                <span className={`requirement-row__icon ${check?.status === "present" ? "is-complete" : ""}`} aria-hidden="true">{check?.status === "present" ? <Check size={17} /> : requirement.kind === "optional" ? <FileText size={17} /> : <X size={17} />}</span>
                <div><strong>{requirement.title}{requirement.kind === "mandatory" ? <span className="required-mark" aria-label="e detyrueshme"> *</span> : null}</strong>{requirement.kind === "optional" ? <span>Opsionale</span> : null}</div>
                <StatusLabel tone={check?.status === "present" ? "success" : requirement.kind === "optional" ? "neutral" : "danger"}>{check?.status === "present" ? "Gati" : requirement.kind === "optional" ? "Pa zgjedhur" : "Mungon"}</StatusLabel>
              </div>
              {isForm ? (
                <p className="document-picker__form-note">Formulari përgatitet nga të dhënat e hapit të parë.</p>
              ) : (
                <>
                  <label className="form-field">
                    <span>Zgjidh dokumentin e përgatitur</span>
                    <select value={active?.templateId ?? ""} disabled={!online} onChange={(event) => event.target.value ? actions.selectDocument(requirement.id, event.target.value) : actions.removeDocument(requirement.id)}>
                      <option value="">Asnjë dokument</option>
                      {templates.map((template) => <option key={template.id} value={template.id}>{template.label}</option>)}
                    </select>
                  </label>
                  {requirement.id === "req-offer" ? <div className="scanner-entry"><button ref={scannerTriggerRef} type="button" className="button button--secondary" disabled={!online || application.status !== "draft"} onClick={() => setScannerOpen(true)}><Camera size={17} aria-hidden="true" /> Skanoni dokumentin</button><small>Kamerë ose fotografi nga pajisja</small></div> : null}
                  {active ? (
                    <div className="document-picker__selected">
                      <span><strong>{displayFileName(active.fileName)}</strong><small>Versioni {active.version} · {active.sizeLabel}</small></span>
                      <button className="button button--secondary button--compact" type="button" onClick={() => setPreviewTemplateId(previewTemplateId === active.templateId ? null : active.templateId)}><Eye size={17} aria-hidden="true" /> {previewTemplateId === active.templateId ? "Mbyll" : "Shiko"}</button>
                      <button className="icon-button icon-button--danger" type="button" disabled={!online} onClick={() => actions.removeDocument(requirement.id)} aria-label={`Hiq ${active.fileName}`}><Trash2 size={17} aria-hidden="true" /></button>
                    </div>
                  ) : null}
                  {previewTemplateId === active?.templateId ? active.scanImageDataUrl ? <DocumentPreview title={requirement.title} fileName={active.fileName} version={active.version} lines={[]} imageSrc={active.scanImageDataUrl} /> : <DemoDocumentPreview templateId={active.templateId} /> : null}
                  {requirement.id === "req-offer" && active?.templateId === "template-offer-basic" ? <OfferDocumentAssist document={active} online={online} actions={actions} /> : null}
                </>
              )}
            </article>
          );
        })}
      </div>
      <div className="step-actions"><a className="button button--secondary" href="#/applicant/applications/details"><ArrowLeft size={18} aria-hidden="true" /> Të dhënat</a><a className="button button--primary" href="#/applicant/applications/review">Rishiko aplikimin <ChevronRight size={18} aria-hidden="true" /></a></div>
      {scannerOpen ? <ScannerDialog returnFocusRef={scannerTriggerRef} onClose={() => setScannerOpen(false)} onUse={actions.addScannedOffer} /> : null}
    </section>
  );
}

function ReviewStep({ application, call, online, actions }: { application: Application; call: GrantCall; online: boolean; actions: ApplicantActions }) {
  const readiness = getReadiness(application, call);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const submit = () => {
    setSubmitAttempted(true);
    if (!readiness.ready || !application.demoSubmissionAcknowledged) return;
    if (actions.submit()) window.location.hash = "/applicant/applications/receipt";
  };
  return (
    <section className="application-step">
      <div className="application-step__heading"><div><p className="step-kicker">Hapi 3 nga 3</p><h2>Rishiko aplikimin</h2></div><StatusLabel tone={readiness.ready ? "success" : "warning"}>{readiness.completeCount}/{readiness.mandatoryCount} të plota</StatusLabel></div>
      {!readiness.ready ? (
        <div className="validation-summary" role={submitAttempted ? "alert" : "status"} tabIndex={-1}>
          <AlertCircle size={20} aria-hidden="true" />
          <div><strong>Plotëso kërkesat e detyrueshme.</strong><ul>{readiness.missing.map((requirement) => <li key={requirement.id}>{requirement.title}</li>)}</ul></div>
        </div>
      ) : <div className="success-summary"><Check size={20} aria-hidden="true" /><span><strong>Gati për përfundim.</strong></span></div>}
      <section className="review-grid">
        <div className="review-section"><h3>Të dhënat</h3><strong>{application.applicantDetails.displayName || "Pa emër"}</strong><p>{application.applicantDetails.organization || "Pa veprimtari"}<br />{application.applicantDetails.email || "Pa email"}<br />{application.applicantDetails.businessNumber || "Pa numër biznesi"}</p><a className="inline-link" href="#/applicant/applications/details">Ndrysho të dhënat</a></div>
        <div className="review-section"><h3>Dokumentet</h3><div className="compact-check-list">{call.requirements.map((requirement) => { const check = readiness.checks.find((item) => item.requirementId === requirement.id); return <span key={requirement.id}><span className={check?.status === "present" ? "is-ready" : requirement.kind === "optional" ? "is-optional" : "is-missing"}>{check?.status === "present" ? <Check size={15} /> : <X size={15} />}</span><strong>{requirement.title}</strong><small>{requirement.kind === "optional" ? "Opsionale" : check?.status === "present" ? "Gati" : "Mungon"}</small></span>; })}</div><a className="inline-link" href="#/applicant/applications/documents">Ndrysho dokumentet</a></div>
      </section>
      <label className={`demo-consent ${submitAttempted && !application.demoSubmissionAcknowledged ? "has-error" : ""}`}>
        <input type="checkbox" checked={application.demoSubmissionAcknowledged} disabled={!online || application.status !== "draft"} onChange={(event) => actions.setAcknowledged(event.target.checked)} />
        <span>E kuptoj që kjo është një rrjedhë demonstrimi për thirrje të mbyllur. Aplikimi nuk i dërgohet komunës dhe nuk krijohet numër protokolli.</span>
      </label>
      {submitAttempted && !application.demoSubmissionAcknowledged ? <p className="field-error">Konfirmo deklaratën para vazhdimit.</p> : null}
      <div className="step-actions"><a className="button button--secondary" href="#/applicant/applications/documents"><ArrowLeft size={18} aria-hidden="true" /> Dokumentet</a><button className="button button--primary" type="button" disabled={!online || application.status !== "draft"} onClick={submit}><Send size={18} aria-hidden="true" /> Përfundo</button></div>
    </section>
  );
}

function CorrectionDocument({
  application,
  documentId,
  label,
}: {
  application: Application;
  documentId?: string;
  label: string;
}) {
  const document = application.documents.find((item) => item.id === documentId);
  const template = demoDocumentTemplates.find((item) => item.id === document?.templateId);
  if (!document) return null;
  return (
    <article className="correction-document">
      <div className="correction-document__heading">
        <span><FileText size={18} aria-hidden="true" /> {label}</span>
        <span className="muted">v{document.version}</span>
      </div>
      <strong>{displayFileName(document.fileName)}</strong>
      <small>{document.sizeLabel} · {formatDisplayDateTime(document.createdAt)}</small>
      {template ? <details className="document-preview-details"><summary><Eye size={16} aria-hidden="true" /> Shiko dokumentin</summary><DocumentPreview title={label} fileName={displayFileName(document.fileName)} version={document.version} lines={template.previewLines} scan={template.id === "template-offer-basic"} imageSrc={document.scanImageDataUrl} /></details> : null}
    </article>
  );
}

function Receipt({
  application,
  call,
  online,
  actions,
}: {
  application: Application;
  call: GrantCall;
  online: boolean;
  actions: ApplicantActions;
}) {
  const snapshot = application.submittedSnapshot;
  if (!snapshot) return <EmptyState title="Aplikimi nuk është përfunduar" message="Përfundo tre hapat për të parë statusin." actionLabel="Kthehu te aplikimi" onAction={() => { window.location.hash = "/applicant/applications/details"; }} />;
  const status = applicationStatusPresentation[application.status];
  const correction = application.correctionRequests[0];
  const applicantEvents = application.events.filter((event) => event.visibleToApplicant);
  const actionRequired = correction?.status === "open";
  const correctionSent = correction?.status === "answered" || correction?.status === "reviewed";
  const originalOffer = application.documents.find((document) => snapshot.documentVersionIds.includes(document.id) && document.requirementId === "req-offer");
  const assist = originalOffer?.documentAssist;
  const submitCorrection = () => {
    if (actions.respondToCorrection()) window.location.hash = "/applicant/applications/receipt";
  };
  return (
    <div className="post-submit-layout">
      <section className={`applicant-status-card ${actionRequired ? "needs-action" : ""}`}>
        <div className="applicant-status-card__icon">{actionRequired ? <MessageSquareWarning size={26} aria-hidden="true" /> : <CheckCircle2 size={26} aria-hidden="true" />}</div>
        <div>
          <p className="case-reference">{displayReference(application.reference)}</p>
          <h1>{actionRequired ? "Kërkohet korrigjim" : status.label}</h1>
          <p>{actionRequired ? "Oferta ka nevojë për një version më të qartë. Origjinali mbetet i disponueshëm." : application.status === "under-review-demo" ? "Aplikimi është në shqyrtim." : correctionSent ? "Korrigjimi është ruajtur pa ndryshuar versionin origjinal." : "Aplikimi është përfunduar dhe pret shqyrtim."}</p>
        </div>
      </section>

      {!online ? <div className="honesty-note"><strong>Vetëm lexim offline.</strong> Kërkesa dhe historia mund të lexohen, por përgjigjja kërkon lidhje.</div> : null}

      {assist ? <section className="receipt-assist"><h2>Të dhënat e dokumentit</h2><p className="quiet-disclosure">{assist.provenance === "live" ? "Lexim automatik" : assist.provenance === "captured" ? "Rezultat i ruajtur" : "Rezultat demonstrues · pa lexim AI"}</p><dl>{assistFields.map(({ key, label }) => <div key={key}><dt>{label}</dt><dd>{assist.confirmations[key]?.value ?? "E pazgjidhur"}</dd></div>)}</dl></section> : null}

      {correction ? (
        <section className="surface-card applicant-correction" aria-labelledby="correction-heading">
          <div className="section-heading section-heading--tight">
            <div><h2 id="correction-heading">Oferta / Profaturë</h2></div>
            <StatusLabel tone={actionRequired ? "danger" : correction.status === "reviewed" ? "success" : "warning"}>{actionRequired ? "Veprim i nevojshëm" : correction.status === "reviewed" ? "U shqyrtua" : "U dërgua"}</StatusLabel>
          </div>
          <div className="public-message"><MessageSquareWarning size={20} aria-hidden="true" /><span><strong>Kërkesa për korrigjim</strong>{correction.applicantMessage.replace("versionin demonstrues", "një version")}</span></div>
          <div className={correctionSent ? "correction-version-grid" : "correction-version-grid correction-version-grid--single"}>
            <CorrectionDocument application={application} documentId={correction.questionedDocumentVersionId} label="Versioni origjinal" />
            {correctionSent ? <CorrectionDocument application={application} documentId={correction.responseDocumentVersionId} label="Versioni i ri" /> : null}
          </div>
          {actionRequired ? (
            <div className="correction-action">
              <div><strong>Versioni i ri i ofertës</strong><span>Oferta_pajisje_v2.pdf</span></div>
              <button className="button button--primary" type="button" disabled={!online} onClick={submitCorrection}><RefreshCcw size={18} aria-hidden="true" /> Dërgo korrigjimin</button>
            </div>
          ) : null}
        </section>
      ) : null}

      <section className="surface-card applicant-history">
        <div className="section-heading section-heading--tight"><h2>Historia</h2></div>
        <CaseTimeline events={applicantEvents} />
      </section>

      <section className="receipt-card receipt-card--compact">
        <h2>Përmbledhja e aplikimit</h2>
        <dl className="receipt-facts">
          <div><dt>Referenca</dt><dd>{displayReference(application.reference)}</dd></div>
          <div><dt>Thirrja</dt><dd>{call.shortTitle}</dd></div>
          <div><dt>Aplikuesi</dt><dd>{snapshot.applicant.displayName} · {snapshot.applicant.organization}</dd></div>
          <div><dt>Dokumente</dt><dd>{snapshot.documentVersionIds.length}</dd></div>
        </dl>
        <p className="quiet-disclosure">Kjo përmbledhje ruhet në këtë shfletues dhe nuk është konfirmim nga komuna.</p>
        <div className="receipt-actions"><a className="inline-link" href="#/applicant/passport">Ndrysho profilin</a></div>
      </section>
    </div>
  );
}

function ApplicationFlow({ application, call, applicant, requestedStep, online, actions }: { application: Application; call: GrantCall; applicant: ApplicantProfile; requestedStep?: string; online: boolean; actions: ApplicantActions }) {
  const step: ApplicationStep = application.status !== "draft"
    ? "receipt"
    : requestedStep === "documents" || requestedStep === "review"
      ? requestedStep
      : "details";
  return (
    <>
      <section className="application-preview-heading">
        <div><h1>Aplikimi im</h1><p>{call.shortTitle} · {displayReference(application.reference)}</p></div>
        <StatusLabel tone={application.status === "draft" ? "neutral" : applicationStatusPresentation[application.status].tone}>{applicationStatusPresentation[application.status].label}</StatusLabel>
      </section>
      {!online ? <div className="honesty-note"><strong>Vetëm lexim offline.</strong> Rilidhu për të ndryshuar ose dorëzuar draftin.</div> : null}
      {application.status === "draft" ? <ApplicationStepper step={step} submitted={false} /> : null}
      {step === "details" ? <DetailsStep application={application} applicant={applicant} online={online} actions={actions} /> : step === "documents" ? <DocumentsStep application={application} call={call} online={online} actions={actions} /> : step === "review" ? <ReviewStep application={application} call={call} online={online} actions={actions} /> : <Receipt application={application} call={call} online={online} actions={actions} />}
    </>
  );
}

export function ApplicantApp({ route, calls, applications, applicant, online, actions, onReset }: ApplicantAppProps) {
  const section = route[1] ?? "opportunities";
  const callId = route[2];
  const currentCall = calls.find((call) => call.id === callId);
  const application = applications[0];
  const applicationCall = calls.find((call) => call.id === application?.callId);

  return (
    <div className="applicant-shell">
      <ApplicantHeader onReset={onReset} />
      <main className="applicant-main" id="main-content">
        {section === "calls" && currentCall && application ? <CallDetail call={currentCall} application={application} /> : section === "passport" ? <Passport applicant={applicant} submitted={Boolean(application?.submittedSnapshot)} online={online} onUpdate={actions.updatePassport} /> : section === "applications" && application && applicationCall ? <ApplicationFlow application={application} call={applicationCall} applicant={applicant} requestedStep={route[2]} online={online} actions={actions} /> : <Opportunities calls={calls} />}
      </main>
      <BottomNavigation current={section === "calls" ? "opportunities" : section} />
    </div>
  );
}

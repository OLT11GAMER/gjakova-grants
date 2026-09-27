import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleUserRound,
  Eye,
  FileCheck2,
  FileText,
  Home,
  MessageSquareWarning,
  ScanLine,
  RefreshCcw,
  Save,
  Search,
  Send,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { Brand, RoleSwitcher } from "../components/RoleSwitcher";
import {
  EvidencePanel,
  CaseTimeline,
  GrantCard,
  RequirementRow,
  StatusLabel,
  applicationStatusPresentation,
} from "../components/DomainComponents";
import { EmptyState } from "../components/FeedbackStates";
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

type CategoryFilter = "all" | GrantCall["category"];
type ApplicationStep = "details" | "documents" | "review" | "receipt";

export interface ApplicantActions {
  updateDetails: (patch: Partial<ApplicationApplicantDetails>) => void;
  reusePassport: () => void;
  updatePassport: (patch: Partial<ApplicationApplicantDetails>) => void;
  selectDocument: (requirementId: string, templateId: string) => void;
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
  { key: "email", label: "Email demonstrues", type: "email", autoComplete: "email" },
  { key: "phone", label: "Telefoni demonstrues", type: "tel", autoComplete: "tel" },
  { key: "businessNumber", label: "Numri demonstrues i biznesit", type: "text", autoComplete: "off" },
];

function ApplicantHeader({ onReset }: { onReset: () => void }) {
  return (
    <header className="applicant-topbar">
      <Brand />
      <RoleSwitcher role="applicant" onReset={onReset} />
    </header>
  );
}

function BottomNavigation({ current }: { current: string }) {
  const items = [
    { key: "opportunities", label: "Grantet", icon: Home, href: "#/applicant/opportunities" },
    { key: "applications", label: "Aplikimet", icon: FileCheck2, href: "#/applicant/applications" },
    { key: "passport", label: "Pasaporta", icon: CircleUserRound, href: "#/applicant/passport" },
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
  const [category, setCategory] = useState<CategoryFilter>("all");
  const filteredCalls = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("sq");
    return calls.filter((call) => {
      const matchesCategory = category === "all" || call.category === category;
      const matchesQuery = !normalizedQuery || `${call.title} ${call.institution}`.toLocaleLowerCase("sq").includes(normalizedQuery);
      return matchesCategory && matchesQuery;
    });
  }, [calls, query, category]);

  const clearFilters = () => {
    setQuery("");
    setCategory("all");
  };

  return (
    <>
      <section className="applicant-hero">
        <p className="eyebrow">Mundësi trajnimi</p>
        <h1>Përgatite aplikimin me kërkesa të qarta.</h1>
        <p>Një thirrje reale historike, e përdorur vetëm për demonstrim. Afati origjinal mbetet i mbyllur.</p>
      </section>

      <section className="filters-card" aria-label="Filtro mundësitë">
        <label className="search-field">
          <Search size={18} aria-hidden="true" />
          <span className="sr-only">Kërko mundësi</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Kërko grantin ose institucionin…" />
        </label>
        <div className="chip-row" role="group" aria-label="Filtro sipas kategorisë">
          {([[
            "all", "Të gjitha",
          ], [
            "business", "Biznes",
          ]] as const).map(([value, label]) => (
            <button key={value} type="button" className={category === value ? "chip is-active" : "chip"} aria-pressed={category === value} onClick={() => setCategory(value)}>
              {label}
            </button>
          ))}
        </div>
      </section>

      <div className="section-heading">
        <div><p className="eyebrow">{filteredCalls.length} rezultat</p><h2>Thirrja e zgjedhur</h2></div>
        <span className="source-key"><ShieldCheck size={16} aria-hidden="true" /> Burim primar</span>
      </div>

      {filteredCalls.length ? (
        <div className="grant-grid grant-grid--single">
          {filteredCalls.map((call) => <GrantCard key={call.id} call={call} />)}
        </div>
      ) : (
        <EmptyState title="Nuk u gjet thirrja" message="Pastro filtrat për ta parë përsëri shembullin historik." actionLabel="Pastro filtrat" onAction={clearFilters} />
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
        <div className="call-detail-hero__labels">
          <StatusLabel tone="neutral">{call.demoLabel}</StatusLabel>
          <StatusLabel tone="success">Burim primar i kontrolluar</StatusLabel>
        </div>
        <p className="eyebrow">{call.institution}</p>
        <h1>{call.title}</h1>
        <p>{call.summary}</p>
        <div className="call-facts">
          <div><CalendarDays size={20} aria-hidden="true" /><span><small>Afati origjinal</small><strong>11 mars – 03 prill 2026</strong></span></div>
          <div><BriefcaseBusiness size={20} aria-hidden="true" /><span><small>Financimi për grant</small><strong>{call.amountLabel}</strong></span></div>
        </div>
        <div className="honesty-note"><strong>Kjo thirrje është e mbyllur.</strong> Vetëm rruga e shënuar si trajnim lejon një dorëzim lokal demonstrues. Asgjë nuk dërgohet zyrtarisht.</div>
      </section>

      <section className="detail-layout">
        <div className="surface-card">
          <div className="section-heading section-heading--tight">
            <div><p className="eyebrow">Lot I · versioni 1</p><h2>Dokumentet e kërkuara</h2></div>
            <StatusLabel tone="neutral">5 kërkesa</StatusLabel>
          </div>
          <div className="requirement-list">
            {call.requirements.map((requirement) => <RequirementRow key={requirement.id} requirement={requirement} onShowEvidence={setSelectedRequirement} />)}
          </div>
        </div>
        {selectedRequirement ? <EvidencePanel requirement={selectedRequirement} /> : null}
      </section>

      <section className="sticky-action-card">
        <div>
          <strong>{application.status !== "draft" ? "Dorëzimi demonstrues është regjistruar" : "Nis ose vazhdo aplikimin trajnues"}</strong>
          <span>Ruhet vetëm në këtë shfletues — jo aplikim zyrtar.</span>
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
            <span>{field.label}</span>
            <input
              id={`field-${field.key}`}
              type={field.type}
              autoComplete={field.autoComplete}
              value={values[field.key]}
              disabled={disabled}
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
        <div className="passport-hero__icon"><CircleUserRound size={28} aria-hidden="true" /></div>
        <div><p className="eyebrow">Pasaporta e aplikuesit</p><h1>Të dhëna që mund të ripërdoren.</h1><p>Profil sintetik, i redaktueshëm dhe i ruajtur vetëm në këtë shfletues.</p></div>
      </section>
      <div className="honesty-note honesty-note--blue"><ShieldCheck size={19} aria-hidden="true" /><span><strong>Jo identitet i verifikuar.</strong> Mos shkruaj të dhëna personale reale në këtë demonstrim.</span></div>
      {submitted ? <div className="inline-notice"><CheckCircle2 size={18} aria-hidden="true" /><span>Ndryshimet këtu nuk ndryshojnë snapshot-in e dorëzimit demonstrues.</span></div> : null}
      <section className="surface-card">
        <div className="section-heading section-heading--tight"><div><p className="eyebrow">Ruajtje automatike lokale</p><h2>Profili bazë</h2></div><StatusLabel tone={online ? "info" : "neutral"}>{online ? "Sintetik · i paverifikuar" : "Vetëm lexim"}</StatusLabel></div>
        <FormFields values={values} disabled={!online} onChange={onUpdate} />
      </section>
      <section className="surface-card">
        <div className="section-heading section-heading--tight"><div><p className="eyebrow">Dokumente demonstrimi</p><h2>Referenca të Pasaportës</h2></div><span className="count-pill">2</span></div>
        <div className="document-list">
          <div><FileText aria-hidden="true" /><span><strong>Dokument identifikimi · DEMO</strong><small>Mund të zgjidhet në aplikim</small></span><StatusLabel tone="success">I ripërdorshëm</StatusLabel></div>
          <div><FileText aria-hidden="true" /><span><strong>Certifikatë trajnimi · DEMO</strong><small>Dokument opsional</small></span><StatusLabel tone="info">Opsionale</StatusLabel></div>
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
        <div><p className="eyebrow">Hapi 1 nga 3</p><h2>Të dhënat e aplikuesit</h2><p>Plotësoji vetë ose kopjoji qartë nga Pasaporta sintetike.</p></div>
        <button className="button button--secondary" type="button" disabled={!online} onClick={actions.reusePassport}><CircleUserRound size={18} aria-hidden="true" /> Ripërdor nga Pasaporta</button>
      </div>
      <div className="local-save-note"><Save size={17} aria-hidden="true" /><span><strong>Ruajtje automatike.</strong> Drafti ruhet vetëm në këtë shfletues; nuk është ruajtje e sigurt ose ndërmjet pajisjeve.</span></div>
      <FormFields values={application.applicantDetails} errors={errors} disabled={!online} onChange={actions.updateDetails} />
      <div className="step-actions"><span className="muted">Pasaporta burimore: {applicant.displayName} · sintetik</span><button className="button button--primary" type="button" disabled={!online} onClick={continueToDocuments}>Vazhdo te dokumentet <ChevronRight size={18} aria-hidden="true" /></button></div>
    </section>
  );
}

function DemoDocumentPreview({ templateId }: { templateId: string }) {
  const template = demoDocumentTemplates.find((item) => item.id === templateId);
  if (!template) return null;
  return (
    <div className="demo-document-preview" role="region" aria-label={`Parapamje e ${template.label}`}>
      <span className="synthetic-document__badge">DEMO · PA TË DHËNA REALE</span>
      <FileText size={38} aria-hidden="true" />
      <strong>{template.fileName}</strong>
      {template.previewLines.map((line) => <span key={line}>{line}</span>)}
    </div>
  );
}

const assistFields: Array<{ key: DocumentAssistFieldName; label: string }> = [
  { key: "issuer", label: "Lëshuesi" },
  { key: "documentDate", label: "Data" },
  { key: "totalAmount", label: "Shuma" },
  { key: "currency", label: "Monedha" },
  { key: "description", label: "Përshkrimi" },
];

async function scanAsPng() {
  const image = new Image();
  image.src = "/demo/offer-scan.svg";
  await image.decode();
  const canvas = document.createElement("canvas");
  canvas.width = 900;
  canvas.height = 1120;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Pamja sintetike nuk mund të përgatitet.");
  context.drawImage(image, 0, 0, 900, 1120);
  const imageDataUrl = canvas.toDataURL("image/png");
  if (imageDataUrl.length > 1_800_000) throw new Error("Imazhi është shumë i madh për këtë demonstrim.");
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
      const imageDataUrl = await scanAsPng();
      const response = await fetch("/api/document-assist", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ scanAssetId: "offer-scan-v1", imageDataUrl }), cache: "no-store" });
      const payload = await response.json() as { result?: DocumentAssistResult; provenance?: DocumentAssistRecord["provenance"]; model?: string | null; error?: string };
      if (!response.ok || !payload.result || !payload.provenance) {
        const errors: Record<string, string> = { unconfigured: "Leximi automatik nuk është konfiguruar në këtë demonstrim lokal. Dokumenti mund të vazhdojë normalisht.", unsupported: "Pranohet vetëm imazhi sintetik PNG brenda kufirit të madhësisë.", timeout: "Leximi zgjati shumë. Provo sërish me butonin më poshtë.", malformed: "Përgjigjja nuk ishte e strukturuar. Kontrolloje dokumentin vetë ose provo sërish.", upstream: "Shërbimi i leximit nuk është i disponueshëm. Dokumenti mbetet i përdorshëm.", network: "Lidhja dështoi. Provo sërish kur të jetë e disponueshme." };
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
  return <section className="offer-assist" aria-label="Leximi i ofertës sintetike">
    <div className="offer-assist__heading"><div><p className="eyebrow">Dokumenti sintetik · v{document.version}</p><h3>Leximi i dokumentit</h3></div><ScanLine size={22} aria-hidden="true" /></div>
    <div className="offer-assist__grid">
      <figure className="offer-assist__scan"><img src="/demo/offer-scan.svg" alt="Ofertë sintetike e skanuar: Punishtja Shembull, datë 18.03.2026, total 2,850.00 EUR" /><figcaption>Fletë sintetike e paketuar · pa dokumente reale</figcaption></figure>
      <div className="offer-assist__side">
        {!record ? <><p>Lexo pesë të dhëna nga kjo fletë. Rezultati kërkon konfirmimin tënd; kontrolli i dokumenteve mbetet sipas rregullave të thirrjes.</p><button className="button button--primary" type="button" disabled={!online || busy} onClick={read}><ScanLine size={17} aria-hidden="true" /> {busy ? "Po lexohet…" : "Lexo dokumentin"}</button>{!online ? <p className="offer-assist__notice">Offline · leximi i ri nuk mund të nisë.</p> : null}</> : <>
          <p className="offer-assist__notice">{record.provenance === "live" ? "Lexim AI i drejtpërdrejtë" : record.provenance === "captured" ? "Rezultat AI i ruajtur" : "Rezultat i simuluar lokal · pa thirrje AI"} · {record.extraction.overallStatus === "readable" ? "I lexueshëm" : "Kërkon rishikim"}</p>
          <p className="offer-assist__hint">Vlera në fushë është për konfirmim. “Nxjerrë nga leximi” ruan veçmas tekstin fillestar.</p>
          <div className="offer-assist__fields">{assistFields.map(({ key, label }) => { const field = record.extraction.fields[key]; const status = field.value === null ? "Nuk u gjet" : field.confidence === "high" ? "U gjet" : "Rishiko"; return <label className="offer-assist__field" key={key}><span><strong>{label}</strong><small className={field.value && field.confidence === "high" ? "is-found" : "is-review"}>{field.value && field.confidence === "high" ? <Check size={13} aria-hidden="true" /> : <AlertCircle size={13} aria-hidden="true" />}{status}</small></span><input value={values[key]} maxLength={120} disabled={!online} onChange={(event) => setValues((current) => ({ ...current, [key]: event.target.value }))} aria-label={`${label} · konfirmim nga aplikuesi`} placeholder="Lëre bosh nëse mbetet e paqartë" /><em>Nxjerrë nga leximi: {field.value ?? "Pa vlerë"}</em><small>Burimi: {field.evidence ? `“${field.evidence}”` : "Nuk u gjet fragment mbështetës"}</small>{record.confirmations[key] ? <small>Konfirmuar nga aplikuesi: {record.confirmations[key]?.value ?? "E pazgjidhur"}</small> : null}</label>; })}</div>
          {record.extraction.notes.length ? <p className="offer-assist__notice">{record.extraction.notes.join(" ")}</p> : null}
          <button className="button button--secondary" type="button" disabled={!online} onClick={() => actions.confirmDocumentAssist(document.id, values)}>Konfirmo të dhënat</button>
          {Object.keys(record.confirmations).length ? <p className="offer-assist__summary">Dokumenti u lexua · {found} fusha u gjetën · {confirmed} u konfirmuan · {5 - confirmed} kërkojnë rishikim</p> : null}
        </>}
        {busy ? <p role="status" className="offer-assist__notice">Po përpunohet vetëm kjo fletë sintetike…</p> : null}
        {message ? <p role="alert" className="offer-assist__error">{message}</p> : null}
      </div>
    </div>
  </section>;
}

function DocumentsStep({ application, call, online, actions }: { application: Application; call: GrantCall; online: boolean; actions: ApplicantActions }) {
  const [previewTemplateId, setPreviewTemplateId] = useState<string | null>(null);
  const readiness = getReadiness(application, call);
  return (
    <section className="application-step">
      <div className="application-step__heading">
        <div><p className="eyebrow">Hapi 2 nga 3</p><h2>Dokumentet demonstrues</h2><p>Zgjidh vetëm skedarë sintetikë të përgatitur. Ngarkimi i skedarëve realë nuk ofrohet.</p></div>
        <StatusLabel tone={readiness.ready ? "success" : "warning"}>{readiness.completeCount}/{readiness.mandatoryCount} të detyrueshme</StatusLabel>
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
                <span className={`requirement-row__icon ${check?.status === "present" ? "is-complete" : ""}`} aria-hidden="true">{check?.status === "present" ? <Check size={17} /> : <FileText size={17} />}</span>
                <div><strong>{requirement.title}</strong><span>{requirement.kind === "optional" ? "Opsionale — nuk bllokon dorëzimin" : "E detyrueshme"}</span></div>
                <StatusLabel tone={check?.status === "present" ? "success" : requirement.kind === "optional" ? "info" : "danger"}>{check?.status === "present" ? "Gati" : requirement.kind === "optional" ? "Opsionale" : "Mungon"}</StatusLabel>
              </div>
              {isForm ? (
                <p className="document-picker__form-note">Formulari krijohet nga të dhënat e hapit 1 dhe futet në snapshot gjatë dorëzimit demonstrues.</p>
              ) : (
                <>
                  <label className="form-field">
                    <span>Zgjidh dokumentin e paketuar</span>
                    <select value={active?.templateId ?? ""} disabled={!online} onChange={(event) => event.target.value ? actions.selectDocument(requirement.id, event.target.value) : actions.removeDocument(requirement.id)}>
                      <option value="">Asnjë dokument</option>
                      {templates.map((template) => <option key={template.id} value={template.id}>{template.label}</option>)}
                    </select>
                  </label>
                  {active ? (
                    <div className="document-picker__selected">
                      <span><strong>{active.fileName}</strong><small>Versioni {active.version} · {active.sizeLabel}</small></span>
                      <button className="button button--secondary button--compact" type="button" onClick={() => setPreviewTemplateId(previewTemplateId === active.templateId ? null : active.templateId)}><Eye size={17} aria-hidden="true" /> {previewTemplateId === active.templateId ? "Mbyll" : "Shiko"}</button>
                      <button className="icon-button icon-button--danger" type="button" disabled={!online} onClick={() => actions.removeDocument(requirement.id)} aria-label={`Hiq ${active.fileName}`}><Trash2 size={17} aria-hidden="true" /></button>
                    </div>
                  ) : null}
                  {previewTemplateId === active?.templateId ? <DemoDocumentPreview templateId={active.templateId} /> : null}
                  {requirement.id === "req-offer" && active?.templateId === "template-offer-basic" ? <OfferDocumentAssist document={active} online={online} actions={actions} /> : null}
                </>
              )}
            </article>
          );
        })}
      </div>
      <div className="step-actions"><a className="button button--secondary" href="#/applicant/applications/details"><ArrowLeft size={18} aria-hidden="true" /> Të dhënat</a><a className="button button--primary" href="#/applicant/applications/review">Rishiko aplikimin <ChevronRight size={18} aria-hidden="true" /></a></div>
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
      <div className="application-step__heading"><div><p className="eyebrow">Hapi 3 nga 3</p><h2>Rishiko dhe dorëzo demonstrimin</h2><p>Kontrolli është determinist: vetëm fusha të plota dhe prania e dokumenteve të detyrueshme.</p></div><StatusLabel tone={readiness.ready ? "success" : "warning"}>{readiness.completeCount}/{readiness.mandatoryCount} të detyrueshme</StatusLabel></div>
      {!readiness.ready ? (
        <div className="validation-summary" role={submitAttempted ? "alert" : "status"} tabIndex={-1}>
          <AlertCircle size={20} aria-hidden="true" />
          <div><strong>Plotëso kërkesat e detyrueshme.</strong><ul>{readiness.missing.map((requirement) => <li key={requirement.id}>{requirement.title}</li>)}</ul></div>
        </div>
      ) : <div className="success-summary"><CheckCircle2 size={20} aria-hidden="true" /><span><strong>Gati për dorëzim demonstrues.</strong> Dokumenti opsional nuk ndikon në këtë rezultat.</span></div>}
      <section className="review-grid">
        <div className="surface-card"><p className="eyebrow">Të dhënat e draftit</p><h3>{application.applicantDetails.displayName || "Pa emër"}</h3><p>{application.applicantDetails.organization || "Pa veprimtari"}<br />{application.applicantDetails.email || "Pa email"}<br />{application.applicantDetails.businessNumber || "Pa numër biznesi"}</p><a className="inline-link" href="#/applicant/applications/details">Ndrysho të dhënat</a></div>
        <div className="surface-card"><p className="eyebrow">Lista e kontrollit</p><div className="compact-check-list">{call.requirements.map((requirement) => { const check = readiness.checks.find((item) => item.requirementId === requirement.id); return <span key={requirement.id}><span className={check?.status === "present" ? "is-ready" : requirement.kind === "optional" ? "is-optional" : "is-missing"}>{check?.status === "present" ? <Check size={15} /> : <AlertCircle size={15} />}</span><strong>{requirement.title}</strong><small>{requirement.kind === "optional" ? "Opsionale" : check?.status === "present" ? "Gati" : "Mungon"}</small></span>; })}</div><a className="inline-link" href="#/applicant/applications/documents">Ndrysho dokumentet</a></div>
      </section>
      <label className={`demo-consent ${submitAttempted && !application.demoSubmissionAcknowledged ? "has-error" : ""}`}>
        <input type="checkbox" checked={application.demoSubmissionAcknowledged} disabled={!online || application.status !== "draft"} onChange={(event) => actions.setAcknowledged(event.target.checked)} />
        <span><strong>E kuptoj që ky është dorëzim demonstrues.</strong> Thirrja reale është e mbyllur; nuk krijohet aplikim ose faturë zyrtare dhe asgjë nuk i dërgohet komunës.</span>
      </label>
      {submitAttempted && !application.demoSubmissionAcknowledged ? <p className="field-error">Konfirmo deklaratën e demonstrimit para vazhdimit.</p> : null}
      <div className="step-actions"><a className="button button--secondary" href="#/applicant/applications/documents"><ArrowLeft size={18} aria-hidden="true" /> Dokumentet</a><button className="button button--primary" type="button" disabled={!online || application.status !== "draft"} onClick={submit}><Send size={18} aria-hidden="true" /> Dorëzo demonstrimin</button></div>
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
        <StatusLabel tone={document.correctionRequestId ? "info" : "neutral"}>Versioni {document.version}</StatusLabel>
      </div>
      <strong>{document.fileName}</strong>
      <small>{document.sizeLabel} · {new Intl.DateTimeFormat("sq-AL", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(document.createdAt))}</small>
      {template ? <ul>{template.previewLines.map((line) => <li key={line}>{line}</li>)}</ul> : null}
      <span className="synthetic-inline">DEMO · pa dokument real</span>
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
  if (!snapshot) return <EmptyState title="Nuk ka ende faturë demonstrimi" message="Përfundo tre hapat dhe kryej dorëzimin demonstrues." actionLabel="Kthehu te aplikimi" onAction={() => { window.location.hash = "/applicant/applications/details"; }} />;
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
          <p className="eyebrow">Statusi i aplikimit · {application.reference}</p>
          <h1>{actionRequired ? "Kërkohet një korrigjim." : status.label}</h1>
          <p>{actionRequired ? "Ofertës sintetike i duhet një version më i qartë. Origjinali mbetet i ruajtur." : application.status === "under-review-demo" ? "Rasti po shqyrtohet në këtë demonstrim lokal." : correctionSent ? "Korrigjimi është ruajtur pa ndryshuar dorëzimin origjinal." : "Snapshot-i demonstrues është ruajtur dhe pret shqyrtim."}</p>
        </div>
        <StatusLabel tone={status.tone}>{status.label}</StatusLabel>
      </section>

      {!online ? <div className="honesty-note"><strong>Vetëm lexim offline.</strong> Kërkesa dhe historia mund të lexohen, por përgjigjja kërkon lidhje.</div> : null}

      {assist ? <section className="surface-card receipt-assist"><p className="eyebrow">Oferta origjinale · lexim i ruajtur</p><h2>Të dhënat e dokumentit</h2><p>{assist.provenance === "live" ? "Lexim AI i drejtpërdrejtë" : assist.provenance === "captured" ? "Rezultat AI i ruajtur" : "Rezultat i simuluar lokal · pa thirrje AI"}. Këto vlera janë informative; gatishmëria llogaritet nga dokumentet e kërkuara.</p><dl>{assistFields.map(({ key, label }) => <div key={key}><dt>{label}</dt><dd>{assist.confirmations[key]?.value ?? "E pazgjidhur"}</dd></div>)}</dl></section> : null}

      {correction ? (
        <section className="surface-card applicant-correction" aria-labelledby="correction-heading">
          <div className="section-heading section-heading--tight">
            <div><p className="eyebrow">Korrigjimi {correction.id}</p><h2 id="correction-heading">Oferta / Profaturë</h2></div>
            <StatusLabel tone={actionRequired ? "danger" : correction.status === "reviewed" ? "success" : "warning"}>{actionRequired ? "Veprim i nevojshëm" : correction.status === "reviewed" ? "U shqyrtua" : "U dërgua"}</StatusLabel>
          </div>
          <div className="public-message"><MessageSquareWarning size={20} aria-hidden="true" /><span><strong>Mesazhi i komunës në demonstrim</strong>{correction.applicantMessage}</span></div>
          <div className={correctionSent ? "correction-version-grid" : "correction-version-grid correction-version-grid--single"}>
            <CorrectionDocument application={application} documentId={correction.questionedDocumentVersionId} label="Origjinali në dorëzim" />
            {correctionSent ? <CorrectionDocument application={application} documentId={correction.responseDocumentVersionId} label="Korrigjimi i dërguar" /> : null}
          </div>
          {actionRequired ? (
            <div className="correction-action">
              <div><strong>Dokumenti i gatshëm për demonstrim</strong><span>Oferta_pajisje_v2_DEMO.pdf · e paketuar, pa të dhëna reale</span></div>
              <button className="button button--primary" type="button" disabled={!online} onClick={submitCorrection}><RefreshCcw size={18} aria-hidden="true" /> Dërgo ofertën e korrigjuar · DEMO</button>
            </div>
          ) : null}
        </section>
      ) : null}

      <section className="surface-card applicant-history">
        <div className="section-heading section-heading--tight"><div><p className="eyebrow">Histori e aplikimit</p><h2>Çfarë ka ndodhur</h2></div><StatusLabel tone="neutral">Lokale · jo audit ligjor</StatusLabel></div>
        <CaseTimeline events={applicantEvents} />
      </section>

      <section className="receipt-card receipt-card--compact">
        <p className="eyebrow">Snapshot-i origjinal · i pandryshuar</p>
        <h2>Fatura lokale e demonstrimit</h2>
        <p>Kjo dëshmon vetëm rrjedhën e prototipit. Nuk është konfirmim nga Komuna e Gjakovës.</p>
        <dl className="receipt-facts">
          <div><dt>Referenca stabile</dt><dd>{application.reference}</dd></div>
          <div><dt>Thirrja</dt><dd>{call.shortTitle}</dd></div>
          <div><dt>Aplikuesi në snapshot</dt><dd>{snapshot.applicant.displayName} · {snapshot.applicant.organization}</dd></div>
          <div><dt>Dokumente origjinale</dt><dd>{snapshot.documentVersionIds.length}</dd></div>
        </dl>
        <div className="honesty-note"><strong>Ruajtje lokale.</strong> Snapshot-i dhe korrigjimi jetojnë vetëm në këtë shfletues; nuk janë sinkronizim ndërmjet pajisjeve ose dorëzim zyrtar.</div>
        <div className="receipt-actions"><a className="button button--secondary" href="#/applicant/passport">Ndrysho Pasaportën</a><a className="button button--primary" href={`#/staff/applications/${application.id}`}>Shiko si staf <ChevronRight size={18} aria-hidden="true" /></a></div>
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
        <div><p className="eyebrow">Aplikim trajnues · {application.reference}</p><h1>{call.shortTitle}</h1><p>Thirrja historike mbetet e mbyllur. Ky është vetëm demonstrim lokal.</p></div>
        <StatusLabel tone={application.status === "draft" ? "info" : applicationStatusPresentation[application.status].tone}>{application.status === "draft" ? "Draft lokal" : applicationStatusPresentation[application.status].label}</StatusLabel>
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

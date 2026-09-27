import {
  ArrowUpRight,
  Check,
  CircleAlert,
  FileText,
  X,
  Clock3,
  MapPin,
} from "lucide-react";
import type {
  Application,
  ApplicationStatus,
  CallStatus,
  CaseEvent,
  CheckResult,
  GrantCall,
  Requirement,
} from "../types/domain";

const monthNames = ["janar", "shkurt", "mars", "prill", "maj", "qershor", "korrik", "gusht", "shtator", "tetor", "nëntor", "dhjetor"];
const formatDate = (value: string) => {
  const [year, month, day] = value.split("-").map(Number);
  return `${day} ${monthNames[month - 1]} ${year}`;
};
export const displayReference = (value: string) => value.replace(/^GG-DEMO-/, "GG-");
export const formatDisplayDateTime = (value?: string) => {
  if (!value) return "—";
  const date = new Date(value);
  const two = (number: number) => String(number).padStart(2, "0");
  return `${two(date.getDate())}.${two(date.getMonth() + 1)}.${date.getFullYear()} · ${two(date.getHours())}:${two(date.getMinutes())}`;
};

export function StatusLabel({
  tone,
  children,
}: {
  tone: "neutral" | "success" | "warning" | "danger" | "info";
  children: React.ReactNode;
}) {
  const Icon = tone === "success" ? Check : tone === "danger" ? X : tone === "warning" ? CircleAlert : null;
  return <span className={`status-label status-label--${tone}`}>{Icon ? <Icon size={15} aria-hidden="true" /> : null}{children}</span>;
}

const callStatusLabel: Record<CallStatus, string> = {
  "historical-closed": "Afati ka përfunduar",
  "synthetic-open": "E hapur",
};

export function GrantCard({ call }: { call: GrantCall }) {
  const isHistorical = call.status === "historical-closed";
  return (
    <article className="grant-card">
      <div className="grant-card__topline">
        <StatusLabel tone={isHistorical ? "neutral" : "info"}>
          {callStatusLabel[call.status]}
        </StatusLabel>
        <span className="grant-card__category">{call.category === "business" ? "Biznes" : call.category === "skills" ? "Aftësi" : "Mjedis"}</span>
      </div>
      <div>
        <p className="eyebrow">{call.institution}</p>
        <h3>{call.shortTitle}</h3>
        <p>{call.summary}</p>
      </div>
      <dl className="grant-card__meta">
        <div>
          <dt>Afati</dt>
          <dd>{formatDate(call.closesAt)}</dd>
        </div>
        <div>
          <dt>Financimi</dt>
          <dd>{call.amountLabel}</dd>
        </div>
      </dl>
      <a className="card-link" href={`#/applicant/calls/${call.id}`}>
        Shiko detajet
        <ArrowUpRight size={18} aria-hidden="true" />
      </a>
    </article>
  );
}

export function RequirementRow({
  requirement,
  check,
  onShowEvidence,
}: {
  requirement: Requirement;
  check?: CheckResult;
  onShowEvidence?: (requirement: Requirement) => void;
}) {
  const present = check?.status === "present";
  const review = check?.status === "review-needed";
  return (
    <div className="requirement-row">
      <span className={`requirement-row__icon ${present ? "is-complete" : review ? "is-review" : ""}`} aria-hidden="true">
        {!check || requirement.kind === "optional" && !present ? <FileText size={17} /> : present ? <Check size={17} /> : review ? <CircleAlert size={17} /> : <X size={17} />}
      </span>
      <div className="requirement-row__copy">
        <div className="requirement-row__heading">
          <strong>{requirement.title}{requirement.kind === "mandatory" ? <span className="required-mark" aria-label="e detyrueshme"> *</span> : null}</strong>
          {requirement.kind !== "mandatory" ? <small className="muted">{requirement.kind === "optional" ? "Opsionale" : "Me kusht"}</small> : null}
        </div>
        <p>{requirement.description}</p>
        {check ? <StatusLabel tone={present ? "success" : review ? "warning" : requirement.kind === "optional" ? "neutral" : "danger"}>{present ? "Gati" : review ? "Kërkon vëmendje" : requirement.kind === "optional" ? "Pa zgjedhur" : "Mungon"}</StatusLabel> : null}
        {onShowEvidence ? (
          <button className="text-button" type="button" onClick={() => onShowEvidence(requirement)}>
            Shiko burimin · faqja {requirement.source.page}
          </button>
        ) : null}
      </div>
    </div>
  );
}

export function EvidencePanel({ requirement }: { requirement: Requirement }) {
  return (
    <aside className="evidence-panel" aria-label="Evidenca nga burimi">
      <div>
        <p className="eyebrow">Burimi zyrtar · faqja {requirement.source.page}</p>
        <h3>{requirement.source.title}</h3>
        <blockquote>“{requirement.source.excerpt}”</blockquote>
        <p className="muted">{requirement.source.section}</p>
        <a href={requirement.source.url} target="_blank" rel="noreferrer" className="inline-link">
          Hap burimin zyrtar <ArrowUpRight size={16} aria-hidden="true" />
        </a>
      </div>
    </aside>
  );
}

export function DocumentPreview({ title, fileName, version, lines, scan = false, imageSrc }: {
  title: string;
  fileName: string;
  version?: number;
  lines: string[];
  scan?: boolean;
  imageSrc?: string;
}) {
  return (
    <section className="document-sheet" aria-label={`Parapamje e ${title}`}>
      <div className="document-sheet__toolbar"><strong>{title}</strong><small>{version ? `v${version} · ` : ""}Parapamje</small></div>
      <div className="document-sheet__page">
        {imageSrc ? <img src={imageSrc} alt={`Pamje e dokumentit ${title}`} /> : scan ? <img src="/demo/offer-scan.svg" alt="Oferta / Profatura, faqe sintetike për demonstrim" /> : <>
          <span className="document-sheet__kicker">Gjakova Grants · Dokument</span>
          <h3>{title}</h3>
          <dl>{lines.map((line, index) => <div key={`${index}-${line}`}><dt>{index === 0 ? "Përmbajtja" : `Rreshti ${index + 1}`}</dt><dd>{line}</dd></div>)}</dl>
          <small>Parapamje e të dhënave të dokumentit të përzgjedhur</small>
        </>}
      </div>
      <p className="document-sheet__filename">{fileName} · {imageSrc ? "Pamje e fotografisë së përzgjedhur." : "Parapamje nga të dhënat e përgatitura; pa skedar PDF të bashkëngjitur."}</p>
    </section>
  );
}

const eventPresentation: Record<CaseEvent["type"], { label: string; actor: string }> = {
  created: { label: "Aplikimi u krijua", actor: "Aplikuesi" },
  submitted: { label: "Aplikimi u dorëzua", actor: "Aplikuesi" },
  "review-started": { label: "Shqyrtimi filloi", actor: "Komuna" },
  "correction-requested": { label: "U kërkua korrigjim", actor: "Komuna" },
  "replacement-added": { label: "U shtua versioni i ri i ofertës", actor: "Aplikuesi" },
  "correction-submitted": { label: "Korrigjimi u dërgua", actor: "Aplikuesi" },
  "correction-reviewed": { label: "Korrigjimi u shqyrtua", actor: "Komuna" },
  "archive-package-prepared": { label: "Paketa u përgatit", actor: "Komuna" },
};

export function CaseTimeline({ events }: { events: CaseEvent[] }) {
  return (
    <ol className="timeline">
      {events.map((event) => (
        <li key={event.id}>
          <span className="timeline__dot" aria-hidden="true" />
          <div>
            <div className="timeline__heading">
              <strong>{eventPresentation[event.type].label}</strong>
              <time dateTime={event.occurredAt}>
                <Clock3 size={14} aria-hidden="true" />
                {formatDisplayDateTime(event.occurredAt)}
              </time>
            </div>
            <small>{eventPresentation[event.type].actor}</small>
          </div>
        </li>
      ))}
    </ol>
  );
}

export const applicationStatusPresentation: Record<ApplicationStatus, {
  label: string;
  tone: "neutral" | "success" | "warning" | "danger" | "info";
}> = {
  draft: { label: "Në përgatitje", tone: "neutral" },
  "submitted-demo": { label: "Dorëzuar", tone: "success" },
  "under-review-demo": { label: "Në shqyrtim", tone: "info" },
  "needs-correction-demo": { label: "Kërkohet korrigjim", tone: "warning" },
  "correction-submitted-demo": { label: "Korrigjimi u dërgua", tone: "success" },
  "correction-reviewed-demo": { label: "Korrigjimi u shqyrtua", tone: "success" },
};

export function CaseSummary({ application, callTitle }: { application: Application; callTitle: string }) {
  const status = applicationStatusPresentation[application.status];
  return (
    <div className="case-summary">
      <div>
        <p className="eyebrow">{displayReference(application.reference)}</p>
        <h2>{callTitle}</h2>
      </div>
      <div className="case-summary__facts">
        <span><MapPin size={16} aria-hidden="true" /> Gjakovë</span>
        <StatusLabel tone={status.tone}>{status.label}</StatusLabel>
      </div>
    </div>
  );
}

import {
  ArrowUpRight,
  Check,
  CircleAlert,
  Clock3,
  FileText,
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

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("sq-AL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T12:00:00`));

export function StatusLabel({
  tone,
  children,
}: {
  tone: "neutral" | "success" | "warning" | "danger" | "info";
  children: React.ReactNode;
}) {
  return <span className={`status-label status-label--${tone}`}>{children}</span>;
}

const callStatusLabel: Record<CallStatus, string> = {
  "historical-closed": "E mbyllur · historike",
  "synthetic-open": "E hapur · sintetike",
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
        {present ? <Check size={17} /> : review ? <CircleAlert size={17} /> : <FileText size={17} />}
      </span>
      <div className="requirement-row__copy">
        <div className="requirement-row__heading">
          <strong>{requirement.title}</strong>
          <StatusLabel tone={requirement.kind === "mandatory" ? "neutral" : requirement.kind === "optional" ? "info" : "warning"}>
            {requirement.kind === "mandatory" ? "E detyrueshme" : requirement.kind === "optional" ? "Opsionale" : "Me kusht"}
          </StatusLabel>
        </div>
        <p>{check?.message ?? requirement.description}</p>
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
      <div className="document-preview" aria-hidden="true">
        <span>PDF</span>
        <i />
        <i />
        <i className="is-highlighted" />
        <i />
      </div>
      <div>
        <p className="eyebrow">Burim primar i kontrolluar · faqja {requirement.source.page}</p>
        <h3>{requirement.source.title}</h3>
        <blockquote>“{requirement.source.excerpt}”</blockquote>
        <p className="muted">{requirement.source.section}</p>
        <a href={requirement.source.url} target="_blank" rel="noreferrer" className="inline-link">
          Hap PDF-në zyrtare <ArrowUpRight size={16} aria-hidden="true" />
        </a>
      </div>
    </aside>
  );
}

export function CaseTimeline({ events }: { events: CaseEvent[] }) {
  return (
    <ol className="timeline">
      {events.map((event) => (
        <li key={event.id}>
          <span className="timeline__dot" aria-hidden="true" />
          <div>
            <div className="timeline__heading">
              <strong>{event.label}</strong>
              <time dateTime={event.occurredAt}>
                <Clock3 size={14} aria-hidden="true" />
                {new Intl.DateTimeFormat("sq-AL", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(event.occurredAt))}
              </time>
            </div>
            <p>{event.detail}</p>
            <small>{event.actorLabel}</small>
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
  draft: { label: "Draft · demonstrim", tone: "warning" },
  "submitted-demo": { label: "Dorëzuar · DEMO", tone: "info" },
  "under-review-demo": { label: "Në shqyrtim · DEMO", tone: "info" },
  "needs-correction-demo": { label: "Kërkohet veprim", tone: "danger" },
  "correction-submitted-demo": { label: "Korrigjimi u dërgua", tone: "warning" },
  "correction-reviewed-demo": { label: "Korrigjimi u shqyrtua", tone: "success" },
};

export function CaseSummary({ application, callTitle }: { application: Application; callTitle: string }) {
  const status = applicationStatusPresentation[application.status];
  return (
    <div className="case-summary">
      <div>
        <p className="eyebrow">{application.reference}</p>
        <h2>{callTitle}</h2>
      </div>
      <div className="case-summary__facts">
        <span><MapPin size={16} aria-hidden="true" /> Gjakovë</span>
        <StatusLabel tone={status.tone}>{status.label}</StatusLabel>
      </div>
    </div>
  );
}

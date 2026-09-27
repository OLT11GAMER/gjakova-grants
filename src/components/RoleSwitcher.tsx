import { Building2, RotateCcw, Smartphone } from "lucide-react";
import { PwaInstallAction } from "./PwaControls";

export type DemoRole = "applicant" | "staff";

export function Brand() {
  return (
    <a className="brand" href="#/applicant/opportunities" aria-label="Gjakova Grants — ballina">
      <img src="/brand/gjakova-grants-logo-original.svg" alt="Gjakova Grants" />
      <span className="brand__demo-label">DEMO</span>
    </a>
  );
}

export function RoleSwitcher({
  role,
  onReset,
}: {
  role: DemoRole;
  onReset: () => void;
}) {
  return (
    <div className="demo-controls" aria-label="Kontrolle të demonstrimit">
      <span className="demo-controls__label">Ndërrim roli · jo autentikim</span>
      <div className="segmented" role="group" aria-label="Zgjidh rolin demonstrues">
        <a
          href="#/applicant/opportunities"
          className={role === "applicant" ? "is-active" : ""}
          aria-current={role === "applicant" ? "page" : undefined}
        >
          <Smartphone size={16} aria-hidden="true" />
          Aplikues
        </a>
        <a
          href="#/staff/applications"
          className={role === "staff" ? "is-active" : ""}
          aria-current={role === "staff" ? "page" : undefined}
        >
          <Building2 size={16} aria-hidden="true" />
          Komuna
        </a>
      </div>
      <PwaInstallAction />
      <button className="icon-button" type="button" onClick={onReset} aria-label="Rikthe të dhënat e demonstrimit" title="Rikthe demonstrimin">
        <RotateCcw size={18} aria-hidden="true" />
      </button>
    </div>
  );
}

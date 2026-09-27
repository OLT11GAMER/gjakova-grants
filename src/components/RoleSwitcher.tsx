import { Building2, CirclePlay, Ellipsis, RotateCcw, Smartphone } from "lucide-react";
import { PwaInstallAction } from "./PwaControls";

export type DemoRole = "applicant" | "staff";

export function Brand() {
  return (
    <a className="brand" href="#/applicant/opportunities" aria-label="Gjakova Grants — ballina">
      <img src="/brand/gjakova-grants-logo-original.svg" alt="Gjakova Grants" />
    </a>
  );
}

export function TutorialLink() {
  return (
    <a className="tutorial-nav-link" href="https://youtu.be/75hdDYJGoLs" target="_blank" rel="noopener noreferrer" aria-label="Shiko videon demo në YouTube">
      <CirclePlay size={18} aria-hidden="true" />
      <span>Video demo</span>
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
    <details className="presentation-menu">
      <summary aria-label="Opsionet e prezantimit" title="Opsionet e prezantimit"><Ellipsis size={22} aria-hidden="true" /></summary>
      <div className="presentation-menu__panel">
        <p>Shfaq si</p>
        <a href="#/applicant/opportunities" aria-current={role === "applicant" ? "page" : undefined}><Smartphone size={17} aria-hidden="true" /> Aplikues</a>
        <a href="#/staff/applications" aria-current={role === "staff" ? "page" : undefined}><Building2 size={17} aria-hidden="true" /> Staf komunal</a>
        <div className="presentation-menu__divider" />
        <PwaInstallAction />
        <button type="button" onClick={onReset}><RotateCcw size={17} aria-hidden="true" /> Rivendos demonstrimin</button>
        <small>Ndërrimi i pamjes nuk është hyrje me llogari. Të dhënat mbeten në këtë shfletues.</small>
      </div>
    </details>
  );
}

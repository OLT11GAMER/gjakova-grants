import { useEffect, useRef, useState } from "react";
import { Download, Share2, WifiOff, X } from "lucide-react";
import { useRegisterSW } from "virtual:pwa-register/react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

const isStandalone = () =>
  window.matchMedia("(display-mode: standalone)").matches ||
  ("standalone" in window.navigator && Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone));

const isIos = () => /iphone|ipad|ipod/i.test(window.navigator.userAgent);

export function PwaInstallAction() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIosHelp, setShowIosHelp] = useState(false);
  const [installed, setInstalled] = useState(isStandalone);
  const helpTriggerRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const capturePrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };
    const markInstalled = () => {
      setInstalled(true);
      setInstallPrompt(null);
    };
    window.addEventListener("beforeinstallprompt", capturePrompt);
    window.addEventListener("appinstalled", markInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", capturePrompt);
      window.removeEventListener("appinstalled", markInstalled);
    };
  }, []);

  useEffect(() => {
    if (!showIosHelp) return;
    closeButtonRef.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setShowIosHelp(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      window.removeEventListener("keydown", closeOnEscape);
      helpTriggerRef.current?.focus();
    };
  }, [showIosHelp]);

  if (installed) return null;

  const requestInstall = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === "accepted") setInstallPrompt(null);
  };

  if (!installPrompt && !isIos()) return null;

  return (
    <>
      {installPrompt ? (
        <button className="install-action" type="button" onClick={() => void requestInstall()}>
          <Download size={17} aria-hidden="true" />
          <span>Instalo</span>
        </button>
      ) : (
        <button ref={helpTriggerRef} className="install-action" type="button" onClick={() => setShowIosHelp(true)} aria-label="Si të shtohet aplikacioni në ekranin kryesor">
          <Share2 size={17} aria-hidden="true" />
          <span>Si ta shtosh</span>
        </button>
      )}
      {showIosHelp ? (
        <div className="dialog-backdrop" role="presentation" onMouseDown={() => setShowIosHelp(false)}>
          <section className="install-dialog" role="dialog" aria-modal="true" aria-labelledby="install-help-title" onMouseDown={(event) => event.stopPropagation()}>
            <button ref={closeButtonRef} className="dialog-close" type="button" onClick={() => setShowIosHelp(false)} aria-label="Mbyll udhëzimin"><X size={20} aria-hidden="true" /></button>
            <span className="install-dialog__icon"><Share2 size={24} aria-hidden="true" /></span>
            <h2 id="install-help-title">Shtoje në ekranin kryesor</h2>
            <p>Në iPhone ose iPad, hap menunë <strong>Share</strong> të shfletuesit dhe zgjidh <strong>Add to Home Screen</strong>. Disponueshmëria varet nga shfletuesi dhe versioni i iOS.</p>
            <button className="button button--primary" type="button" onClick={() => setShowIosHelp(false)}>E kuptova</button>
          </section>
        </div>
      ) : null}
    </>
  );
}

export function PwaStatus() {
  const [online, setOnline] = useState(window.navigator.onLine);
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  useEffect(() => {
    const markOnline = () => setOnline(true);
    const markOffline = () => setOnline(false);
    window.addEventListener("online", markOnline);
    window.addEventListener("offline", markOffline);
    return () => {
      window.removeEventListener("online", markOnline);
      window.removeEventListener("offline", markOffline);
    };
  }, []);

  const closePrompt = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  return (
    <>
      {!online ? (
        <div className="offline-banner" role="status">
          <WifiOff size={17} aria-hidden="true" />
          <span><strong>Pa lidhje.</strong> Mund të shihni ndërfaqen e ruajtur, por burimet e jashtme dhe veprimet online nuk janë të disponueshme.</span>
        </div>
      ) : null}
      {offlineReady || needRefresh ? (
        <section className="update-prompt" role="status" aria-live="polite">
          <div>
            <strong>{needRefresh ? "Ka një version të ri" : "Ndërfaqja është gati për shikim offline"}</strong>
            <span>{needRefresh ? "Përditësojeni vetëm kur të jeni gati; faqja nuk ringarkohet automatikisht." : "Offline ruhen vetëm skedat publike dhe skeleti i demonstrimit."}</span>
          </div>
          {needRefresh ? <button className="button button--primary" type="button" onClick={() => void updateServiceWorker(true)}>Përditëso tani</button> : null}
          <button className="button button--secondary" type="button" onClick={closePrompt}>{needRefresh ? "Më vonë" : "Mbyll"}</button>
        </section>
      ) : null}
    </>
  );
}

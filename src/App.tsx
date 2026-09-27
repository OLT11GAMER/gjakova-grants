import { useCallback, useEffect, useRef, useState } from "react";
import { ErrorState, LoadingState } from "./components/FeedbackStates";
import { grantService } from "./services/grantService";
import type { ApplicationApplicantDetails, DemoDataset, DocumentAssistFieldName, DocumentAssistRecord } from "./types/domain";
import { ApplicantApp, type ApplicantActions } from "./views/ApplicantApp";
import { StaffApp } from "./views/StaffApp";
import { PwaStatus } from "./components/PwaControls";

const getRoute = () => {
  const route = window.location.hash.replace(/^#\/?/, "").split("/").filter(Boolean);
  return route.length ? route : ["applicant", "opportunities"];
};

export default function App() {
  const [route, setRoute] = useState(getRoute);
  const [dataset, setDataset] = useState<DemoDataset | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const [online, setOnline] = useState(window.navigator.onLine);
  const announcementTimer = useRef<number | null>(null);

  const announce = useCallback((message: string) => {
    setAnnouncement(message);
    if (announcementTimer.current) window.clearTimeout(announcementTimer.current);
    announcementTimer.current = window.setTimeout(() => setAnnouncement(""), 4200);
  }, []);

  const loadDataset = useCallback(async () => {
    setError(null);
    setDataset(null);
    try {
      setDataset(await grantService.getDataset());
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Ndodhi një gabim i panjohur.");
    }
  }, []);

  useEffect(() => {
    void loadDataset();
  }, [loadDataset]);

  useEffect(() => {
    const onHashChange = () => {
      setRoute(getRoute());
      window.scrollTo({ top: 0, behavior: "instant" });
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  useEffect(() => {
    const verifyOnline = async () => {
      if (!window.navigator.onLine) { setOnline(false); return; }
      try {
        await fetch(`/manifest.webmanifest?connectivity=${Date.now()}`, { method: "HEAD", cache: "no-store", signal: AbortSignal.timeout(5000) });
        setOnline(true);
      } catch {
        setOnline(false);
      }
    };
    const markOnline = () => { void verifyOnline(); };
    const markOffline = () => setOnline(false);
    window.addEventListener("online", markOnline);
    window.addEventListener("offline", markOffline);
    window.addEventListener("focus", markOnline);
    void verifyOnline();
    return () => {
      window.removeEventListener("online", markOnline);
      window.removeEventListener("offline", markOffline);
      window.removeEventListener("focus", markOnline);
      if (announcementTimer.current) window.clearTimeout(announcementTimer.current);
    };
  }, []);

  const mutate = useCallback((operation: () => DemoDataset, successMessage?: string) => {
    try {
      setDataset(operation());
      if (successMessage) announce(successMessage);
      return true;
    } catch (caught) {
      announce(caught instanceof Error ? caught.message : "Ndryshimi nuk u ruajt.");
      return false;
    }
  }, [announce]);

  const resetDemo = () => {
    setDataset(grantService.reset());
    window.location.hash = "/applicant/opportunities";
    announce("Aplikimi u rivendos.");
  };

  const applicantActions: ApplicantActions = {
    updateDetails: (patch: Partial<ApplicationApplicantDetails>) => {
      mutate(() => grantService.updateApplicationDetails(patch));
    },
    reusePassport: () => {
      mutate(() => grantService.reusePassportDetails(), "Të dhënat u kopjuan nga profili.");
    },
    updatePassport: (patch: Partial<ApplicationApplicantDetails>) => {
      mutate(() => grantService.updatePassport(patch));
    },
    selectDocument: (requirementId: string, templateId: string) => {
      mutate(() => grantService.selectDemoDocument(requirementId, templateId), "Dokumenti u ruajt.");
    },
    addScannedOffer: (imageDataUrl: string) => mutate(() => grantService.addScannedOffer(imageDataUrl), "Dokumenti u shtua."),
    removeDocument: (requirementId: string) => {
      mutate(() => grantService.removeDemoDocument(requirementId), "Dokumenti u hoq.");
    },
    saveDocumentAssist: (versionId: string, record: DocumentAssistRecord) => mutate(() => grantService.saveDocumentAssist(versionId, record)),
    confirmDocumentAssist: (versionId: string, values: Record<DocumentAssistFieldName, string>) => mutate(() => grantService.confirmDocumentAssist(versionId, values), "Të dhënat e dokumentit u ruajtën si konfirmim nga aplikuesi."),
    setAcknowledged: (acknowledged: boolean) => {
      mutate(() => grantService.setDemoSubmissionAcknowledged(acknowledged));
    },
    submit: () => mutate(
      () => grantService.submitDemoApplication(),
      "Aplikimi u ruajt. Nuk u dërgua te komuna.",
    ),
    respondToCorrection: () => mutate(
      () => grantService.submitOfferCorrection(),
      "Korrigjimi u ruajt. Versioni origjinal mbetet i disponueshëm.",
    ),
  };

  const staffActions = {
    startReview: () => mutate(
      () => grantService.startReview(),
      "Shqyrtimi filloi.",
    ),
    requestCorrection: () => mutate(
      () => grantService.requestOfferCorrection(),
      "Kërkesa për korrigjim u ruajt.",
    ),
    markCorrectionReviewed: () => mutate(
      () => grantService.markCorrectionReviewed(),
      "Korrigjimi u shënua i shqyrtuar; të dy versionet mbeten të ruajtura.",
    ),
    prepareArchivePackage: () => mutate(
      () => grantService.prepareArchivePackage(),
      "Paketa u përgatit. Nuk u regjistrua në SMAED.",
    ),
  };

  const retry = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete("fixtureError");
    window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
    void loadDataset();
  };

  if (error) {
    return <main className="centered-page"><ErrorState message={error} onRetry={retry} /></main>;
  }

  if (!dataset) {
    return <main className="centered-page"><LoadingState /></main>;
  }

  const applicant = dataset.applicants[0];
  if (!applicant) {
    return <main className="centered-page"><ErrorState message="Profili nuk u gjet." onRetry={resetDemo} /></main>;
  }

  const role = route[0] === "staff" ? "staff" : "applicant";

  return (
    <>
      <a className="skip-link" href="#main-content">Kalo te përmbajtja</a>
      <div className="live-announcement" aria-live="polite" aria-atomic="true">{announcement}</div>
      {role === "staff" ? (
        <StaffApp route={route} calls={dataset.calls} applications={dataset.applications} applicants={dataset.applicants} archiveHandoffs={dataset.archiveHandoffs} online={online} actions={staffActions} onReset={resetDemo} />
      ) : (
        <ApplicantApp route={route} calls={dataset.calls} applications={dataset.applications} applicant={applicant} online={online} actions={applicantActions} onReset={resetDemo} />
      )}
      <PwaStatus online={online} />
    </>
  );
}

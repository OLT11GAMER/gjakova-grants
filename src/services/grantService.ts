import { demoDocumentTemplates, initialDataset } from "../data/fixtures";
import type {
  Application,
  ApplicationApplicantDetails,
  ArchiveManifest,
  CaseEvent,
  CheckResult,
  CorrectionRequest,
  DemoDataset,
  DocumentAssistFieldName,
  DocumentAssistRecord,
  DocumentVersion,
  GrantCall,
  SubmittedSnapshot,
} from "../types/domain";
import { calculateChecks, getReadiness } from "./applicationRules";

export const DEMO_STORAGE_KEY = "gjakova-grants.demo.v3";
export const LEGACY_STORAGE_KEY = "gjakova-grants.demo.v2";

const clone = <T,>(value: T): T => structuredClone(value);
const municipalActor = "Staf komunal";
const applicantActor = "Aplikuesi";

type LegacySnapshot = Omit<SubmittedSnapshot, "checkResults"> & {
  checkResults?: CheckResult[];
};

type LegacyApplication = Omit<Application, "status" | "submittedSnapshot" | "correctionRequests"> & {
  status: Application["status"] | "needs-clarification";
  submittedSnapshot?: LegacySnapshot;
  correctionRequests?: Partial<CorrectionRequest>[];
};

interface LegacyDataset {
  schemaVersion: 2;
  calls: DemoDataset["calls"];
  applicants: DemoDataset["applicants"];
  applications: LegacyApplication[];
}

const isDatasetShape = (value: unknown, schemaVersion: number) => {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  return candidate.schemaVersion === schemaVersion
    && Array.isArray(candidate.calls)
    && Array.isArray(candidate.applicants)
    && Array.isArray(candidate.applications);
};

const migrateV2 = (legacy: LegacyDataset): DemoDataset => ({
  schemaVersion: 3,
  calls: clone(legacy.calls),
  applicants: clone(legacy.applicants),
  applications: legacy.applications.map((legacyApplication) => {
    const application = clone(legacyApplication);
    const submittedSnapshot = application.submittedSnapshot
      ? {
          ...application.submittedSnapshot,
          checkResults: clone(application.submittedSnapshot.checkResults ?? application.checks),
        }
      : undefined;
    return {
      ...application,
      status: application.status === "needs-clarification" ? "submitted-demo" : application.status,
      submittedSnapshot,
      correctionRequests: [],
    } as Application;
  }),
  archiveHandoffs: [],
});

const persist = (dataset: DemoDataset) => {
  window.localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(dataset));
};

const loadStore = (): DemoDataset => {
  try {
    const current = window.localStorage.getItem(DEMO_STORAGE_KEY);
    if (current) {
      const parsed: unknown = JSON.parse(current);
      if (isDatasetShape(parsed, 3)) return clone(parsed as DemoDataset);
    }

    const legacyValue = window.localStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacyValue) {
      const parsed: unknown = JSON.parse(legacyValue);
      if (isDatasetShape(parsed, 2)) {
        const migrated = migrateV2(parsed as LegacyDataset);
        persist(migrated);
        return clone(migrated);
      }
    }
  } catch {
    // A malformed app-owned record falls back to the documented synthetic fixture.
  }
  return clone(initialDataset);
};

let store: DemoDataset = loadStore();

const wait = (milliseconds = 180) =>
  new Promise<void>((resolve) => window.setTimeout(resolve, milliseconds));

const shouldSimulateFailure = () =>
  new URLSearchParams(window.location.search).get("fixtureError") === "1";

const guardFixtureService = () => {
  if (shouldSimulateFailure()) {
    throw new Error("Nuk mund të ngarkohen të dhënat. Provo përsëri.");
  }
};

const guardOnlineMutation = () => {
  if (!window.navigator.onLine) {
    throw new Error("Pa lidhje, faqja është vetëm për lexim. Ndryshimet nuk u ruajtën.");
  }
};

const commit = (mutate: (next: DemoDataset) => void): DemoDataset => {
  guardOnlineMutation();
  const next = clone(store);
  mutate(next);
  persist(next);
  store = next;
  return clone(store);
};

const getApplicationAndCall = (dataset: DemoDataset) => {
  const application = dataset.applications[0];
  const call = dataset.calls.find((item) => item.id === application?.callId);
  if (!application || !call) throw new Error("Aplikimi nuk u gjet.");
  return { application, call };
};

const guardStatus = (application: Application, expected: Application["status"], message: string) => {
  if (application.status !== expected) throw new Error(message);
};

const guardDraft = (application: Application) => {
  guardStatus(
    application,
    "draft",
    "Aplikimi është përfunduar. Përdor rivendosjen për ta nisur përsëri.",
  );
};

const refreshChecks = (application: Application, call: GrantCall, now: string) => {
  application.lastSavedAt = now;
  application.checks = calculateChecks(application, call, now);
};

const addEvent = (application: Application, event: CaseEvent) => {
  if (application.events.some((item) => item.id === event.id)) {
    throw new Error("Ky veprim është regjistruar tashmë.");
  }
  application.events.push(event);
};

const getCorrection = (application: Application) => {
  const correction = application.correctionRequests.find(
    (item) => item.requirementId === "req-offer",
  );
  if (!correction) throw new Error("Kërkesa për korrigjim nuk u gjet.");
  return correction;
};

const buildArchiveManifest = (
  application: Application,
  call: GrantCall,
  preparedAt: string,
): ArchiveManifest => {
  const snapshot = application.submittedSnapshot;
  if (!snapshot || !application.submittedAt) {
    throw new Error("Snapshot-i i dorëzimit mungon; paketa nuk mund të përgatitet.");
  }
  return {
    demoApplicationReference: application.reference,
    call: {
      id: call.id,
      title: call.title,
      callVersionId: snapshot.callVersionId,
    },
    submittedApplicantSnapshot: clone(snapshot.applicant),
    submittedAt: application.submittedAt,
    mandatoryRequirements: call.requirements
      .filter((requirement) => requirement.kind === "mandatory")
      .map((requirement) => ({
        requirementId: requirement.id,
        title: requirement.title,
        originalDocumentVersionId: application.documents.find(
          (document) => snapshot.documentVersionIds.includes(document.id)
            && document.requirementId === requirement.id,
        )?.id,
      })),
    originalSubmittedDocumentVersionIds: clone(snapshot.documentVersionIds),
    correctedDocumentVersions: application.documents
      .filter((document) => Boolean(document.correctionRequestId))
      .map((document) => ({
        id: document.id,
        requirementId: document.requirementId,
        version: document.version,
        fileName: document.fileName,
        createdAt: document.createdAt,
        supersedesVersionId: document.supersedesVersionId,
        correctionRequestId: document.correctionRequestId,
      })),
    correctionRequestIds: application.correctionRequests.map((request) => request.id),
    historyEventIds: application.events.map((event) => event.id),
    archivePreparedAt: preparedAt,
    packageStatus: "training-demo-package-not-registered-in-smaed",
    officialProtocolReference: null,
  };
};

export const grantService = {
  async listCalls(): Promise<GrantCall[]> {
    await wait();
    guardFixtureService();
    return clone(store.calls);
  },

  async getCall(callId: string): Promise<GrantCall | undefined> {
    await wait(100);
    guardFixtureService();
    return clone(store.calls.find((call) => call.id === callId));
  },

  async listApplications(): Promise<Application[]> {
    await wait();
    guardFixtureService();
    return clone(store.applications);
  },

  async getApplication(applicationId: string): Promise<Application | undefined> {
    await wait(100);
    guardFixtureService();
    return clone(store.applications.find((application) => application.id === applicationId));
  },

  async getDataset(): Promise<DemoDataset> {
    const [calls, applications] = await Promise.all([
      this.listCalls(),
      this.listApplications(),
    ]);
    return {
      schemaVersion: 3,
      calls,
      applications,
      applicants: clone(store.applicants),
      archiveHandoffs: clone(store.archiveHandoffs),
    };
  },

  updateApplicationDetails(patch: Partial<ApplicationApplicantDetails>): DemoDataset {
    return commit((next) => {
      const { application, call } = getApplicationAndCall(next);
      guardDraft(application);
      application.applicantDetails = { ...application.applicantDetails, ...patch };
      application.demoSubmissionAcknowledged = false;
      refreshChecks(application, call, new Date().toISOString());
    });
  },

  reusePassportDetails(): DemoDataset {
    return commit((next) => {
      const { application, call } = getApplicationAndCall(next);
      const applicant = next.applicants.find((item) => item.id === application.applicantId);
      if (!applicant) throw new Error("Pasaporta sintetike nuk u gjet.");
      guardDraft(application);
      application.applicantDetails = {
        displayName: applicant.displayName,
        organization: applicant.organization,
        municipality: applicant.municipality,
        email: applicant.email,
        phone: applicant.phone,
        businessNumber: applicant.businessNumber,
      };
      application.demoSubmissionAcknowledged = false;
      refreshChecks(application, call, new Date().toISOString());
    });
  },

  updatePassport(patch: Partial<ApplicationApplicantDetails>): DemoDataset {
    return commit((next) => {
      const applicant = next.applicants[0];
      if (!applicant) throw new Error("Pasaporta sintetike nuk u gjet.");
      Object.assign(applicant, patch);
      applicant.lastConfirmedAt = new Date().toISOString().slice(0, 10);
    });
  },

  selectDemoDocument(requirementId: string, templateId: string): DemoDataset {
    return commit((next) => {
      const { application, call } = getApplicationAndCall(next);
      guardDraft(application);
      const requirement = call.requirements.find((item) => item.id === requirementId);
      const template = demoDocumentTemplates.find(
        (item) => item.id === templateId && item.requirementId === requirementId,
      );
      if (!requirement || !template || requirementId === "req-application") {
        throw new Error("Dokumenti demonstrues nuk përputhet me kërkesën.");
      }
      const activeId = application.activeDocumentVersionIds[requirementId];
      const active = application.documents.find((document) => document.id === activeId);
      if (active?.templateId === template.id) return;
      const version = Math.max(0, ...application.documents
        .filter((document) => document.requirementId === requirementId)
        .map((document) => document.version)) + 1;
      const id = `${requirementId}-v${version}`;
      application.documents.push({
        id,
        documentId: `demo-${requirementId}`,
        requirementId,
        version,
        fileName: template.fileName,
        mimeType: template.mimeType,
        sizeLabel: template.sizeLabel,
        createdAt: new Date().toISOString(),
        createdBy: "synthetic-applicant",
        supersedesVersionId: active?.id,
        demoOnly: true,
        templateId: template.id,
      });
      application.activeDocumentVersionIds[requirementId] = id;
      application.demoSubmissionAcknowledged = false;
      refreshChecks(application, call, new Date().toISOString());
    });
  },

  addScannedOffer(imageDataUrl: string): DemoDataset {
    return commit((next) => {
      const { application, call } = getApplicationAndCall(next);
      guardDraft(application);
      if (!imageDataUrl.startsWith("data:image/jpeg;base64,") || imageDataUrl.length > 520_000) {
        throw new Error("Fotografia nuk mund të ruhet. Provo një prerje më të vogël.");
      }
      const requirementId = "req-offer";
      if (!call.requirements.some((item) => item.id === requirementId)) throw new Error("Kërkesa për ofertë nuk u gjet.");
      const activeId = application.activeDocumentVersionIds[requirementId];
      const active = application.documents.find((document) => document.id === activeId);
      const version = Math.max(0, ...application.documents.filter((document) => document.requirementId === requirementId).map((document) => document.version)) + 1;
      const id = `${requirementId}-v${version}`;
      application.documents.push({
        id,
        documentId: `demo-${requirementId}`,
        requirementId,
        version,
        fileName: `Oferta_e_skanuar_v${version}.jpg`,
        mimeType: "image/jpeg",
        sizeLabel: `${Math.max(1, Math.round(imageDataUrl.length * 0.75 / 1024))} KB`,
        createdAt: new Date().toISOString(),
        createdBy: "synthetic-applicant",
        supersedesVersionId: active?.id,
        demoOnly: true,
        templateId: "template-offer-basic",
        scanImageDataUrl: imageDataUrl,
      });
      application.activeDocumentVersionIds[requirementId] = id;
      application.demoSubmissionAcknowledged = false;
      refreshChecks(application, call, new Date().toISOString());
    });
  },

  removeDemoDocument(requirementId: string): DemoDataset {
    return commit((next) => {
      const { application, call } = getApplicationAndCall(next);
      guardDraft(application);
      delete application.activeDocumentVersionIds[requirementId];
      application.demoSubmissionAcknowledged = false;
      refreshChecks(application, call, new Date().toISOString());
    });
  },

  saveDocumentAssist(versionId: string, record: DocumentAssistRecord): DemoDataset {
    return commit((next) => {
      const { application } = getApplicationAndCall(next);
      guardDraft(application);
      const document = application.documents.find((item) => item.id === versionId && item.requirementId === "req-offer" && item.templateId === "template-offer-basic");
      if (!document || application.activeDocumentVersionIds["req-offer"] !== versionId) throw new Error("Oferta aktive sintetike nuk u gjet.");
      document.documentAssist = clone(record);
    });
  },

  confirmDocumentAssist(versionId: string, values: Record<DocumentAssistFieldName, string>): DemoDataset {
    return commit((next) => {
      const { application } = getApplicationAndCall(next);
      guardDraft(application);
      const document = application.documents.find((item) => item.id === versionId && item.requirementId === "req-offer");
      if (!document?.documentAssist || application.activeDocumentVersionIds["req-offer"] !== versionId) throw new Error("Leximi i dokumentit nuk u gjet.");
      const confirmedAt = new Date().toISOString();
      for (const name of ["issuer", "documentDate", "totalAmount", "currency", "description"] as const) {
        const value = values[name].trim().slice(0, 120);
        document.documentAssist.confirmations[name] = value ? { value, confirmedAt } : { value: null, confirmedAt };
      }
    });
  },

  setDemoSubmissionAcknowledged(acknowledged: boolean): DemoDataset {
    return commit((next) => {
      const { application } = getApplicationAndCall(next);
      guardDraft(application);
      application.demoSubmissionAcknowledged = acknowledged;
      application.lastSavedAt = new Date().toISOString();
    });
  },

  submitDemoApplication(): DemoDataset {
    if (store.applications[0]?.submittedSnapshot) return clone(store);

    return commit((next) => {
      const { application, call } = getApplicationAndCall(next);
      guardDraft(application);
      const readiness = getReadiness(application, call);
      if (!readiness.ready) {
        throw new Error("Plotëso kërkesat e detyrueshme para përfundimit.");
      }
      if (!application.demoSubmissionAcknowledged) {
        throw new Error("Konfirmo deklaratën para përfundimit.");
      }

      const now = new Date().toISOString();
      const generatedApplicationId = "req-application-v1";
      if (!application.documents.some((document) => document.id === generatedApplicationId)) {
        application.documents.push({
          id: generatedApplicationId,
          documentId: "demo-req-application",
          requirementId: "req-application",
          version: 1,
          fileName: "Aplikacioni_GjakovaGrants_DEMO.pdf",
          mimeType: "application/pdf",
          sizeLabel: "Gjeneruar nga formulari",
          createdAt: now,
          createdBy: "synthetic-applicant",
          demoOnly: true,
          templateId: "generated-application-form",
        });
      }
      application.activeDocumentVersionIds["req-application"] = generatedApplicationId;
      refreshChecks(application, call, now);
      application.status = "submitted-demo";
      application.submittedAt = now;
      application.assignedReviewer = "Pa caktuar";
      application.pendingIssue = "Pret shqyrtimin";
      application.submittedSnapshot = {
        createdAt: now,
        callVersionId: call.versions[0]?.id ?? "gjakova-startup-2026-v1",
        applicant: clone(application.applicantDetails),
        documentVersionIds: Object.values(application.activeDocumentVersionIds),
        checkResults: clone(application.checks),
      };
      addEvent(application, {
        id: "event-submitted-demo",
        applicationId: application.id,
        type: "submitted",
        label: "Dorëzimi demonstrues u regjistrua",
        detail: "U krijua një snapshot lokal. Asgjë nuk iu dërgua Komunës së Gjakovës.",
        occurredAt: now,
        actorLabel: applicantActor,
        visibleToApplicant: true,
      });
    });
  },

  startReview(): DemoDataset {
    return commit((next) => {
      const { application } = getApplicationAndCall(next);
      guardStatus(application, "submitted-demo", "Shqyrtimi mund të fillojë vetëm një herë pas dorëzimit demonstrues.");
      const now = new Date().toISOString();
      application.status = "under-review-demo";
      application.assignedReviewer = municipalActor;
      application.pendingIssue = "Kontrollo ofertën / profaturën";
      addEvent(application, {
        id: "event-review-started",
        applicationId: application.id,
        type: "review-started",
        label: "Shqyrtimi demonstrues filloi",
        detail: "Rasti lokal po kontrollohet nga një rol komunal sintetik.",
        occurredAt: now,
        actorLabel: municipalActor,
        visibleToApplicant: true,
      });
    });
  },

  requestOfferCorrection(): DemoDataset {
    return commit((next) => {
      const { application } = getApplicationAndCall(next);
      guardStatus(application, "under-review-demo", "Korrigjimi mund të kërkohet vetëm gjatë shqyrtimit aktiv.");
      if (application.correctionRequests.some((request) => request.requirementId === "req-offer" && request.status !== "reviewed")) {
        throw new Error("Ekziston tashmë një kërkesë aktive për këtë ofertë.");
      }
      const originalId = application.submittedSnapshot?.documentVersionIds.find((id) =>
        application.documents.some((document) => document.id === id && document.requirementId === "req-offer"),
      );
      if (!originalId) throw new Error("Oferta origjinale nga snapshot-i nuk u gjet.");

      const now = new Date().toISOString();
      application.status = "needs-correction-demo";
      application.pendingIssue = "Pret ofertën e korrigjuar";
      application.correctionRequests.push({
        id: "correction-offer-001",
        applicationId: application.id,
        requirementId: "req-offer",
        questionedDocumentVersionId: originalId,
        status: "open",
        applicantMessage: "Ju lutem dërgoni një version të ofertës që tregon qartë pajisjen, sasinë dhe çmimin përkatës.",
        internalNote: "Versioni fillestar nuk i paraqet qartë sasinë dhe çmimin për secilën pajisje.",
        requestedAt: now,
        requestedBy: "synthetic-municipal-clerk",
      });
      application.checks = application.checks.map((check) => check.requirementId === "req-offer"
        ? {
            ...check,
            documentVersionId: originalId,
            status: "review-needed",
            method: "human-review",
            message: "Kërkohet ofertë sintetike më e qartë për shqyrtim.",
            checkedAt: now,
          }
        : check);
      addEvent(application, {
        id: "event-correction-requested",
        applicationId: application.id,
        type: "correction-requested",
        label: "U kërkua korrigjimi i ofertës",
        detail: "Kërkesa publike lidhet me ofertën nga snapshot-i origjinal.",
        occurredAt: now,
        actorLabel: municipalActor,
        visibleToApplicant: true,
      });
    });
  },

  submitOfferCorrection(): DemoDataset {
    return commit((next) => {
      const { application } = getApplicationAndCall(next);
      guardStatus(application, "needs-correction-demo", "Kjo kërkesë nuk është më e hapur për përgjigje.");
      const correction = getCorrection(application);
      if (correction.status !== "open") throw new Error("Kjo kërkesë është përgjigjur tashmë.");
      const template = demoDocumentTemplates.find((item) => item.id === "template-offer-detailed");
      const original = application.documents.find((document) => document.id === correction.questionedDocumentVersionId);
      if (!template || !original) throw new Error("Dokumenti sintetik për korrigjim nuk u gjet.");

      const now = new Date().toISOString();
      const version = Math.max(0, ...application.documents
        .filter((document) => document.requirementId === correction.requirementId)
        .map((document) => document.version)) + 1;
      const replacement: DocumentVersion = {
        id: `${correction.requirementId}-v${version}`,
        documentId: original.documentId,
        requirementId: correction.requirementId,
        version,
        fileName: template.fileName,
        mimeType: template.mimeType,
        sizeLabel: template.sizeLabel,
        createdAt: now,
        createdBy: "synthetic-applicant",
        supersedesVersionId: original.id,
        correctionRequestId: correction.id,
        demoOnly: true,
        templateId: template.id,
      };
      application.documents.push(replacement);
      application.activeDocumentVersionIds[correction.requirementId] = replacement.id;
      correction.status = "answered";
      correction.responseDocumentVersionId = replacement.id;
      correction.respondedAt = now;
      correction.respondedBy = "synthetic-applicant";
      application.status = "correction-submitted-demo";
      application.pendingIssue = "Korrigjimi pret shqyrtim";
      application.checks = application.checks.map((check) => check.requirementId === correction.requirementId
        ? {
            ...check,
            documentVersionId: replacement.id,
            status: "review-needed",
            method: "human-review",
            message: "Versioni korrigjues u dërgua dhe pret shqyrtim.",
            checkedAt: now,
          }
        : check);
      addEvent(application, {
        id: "event-replacement-added",
        applicationId: application.id,
        type: "replacement-added",
        label: "U shtua oferta zëvendësuese",
        detail: `${replacement.fileName} u lidh me ${original.fileName}; origjinali mbetet i ruajtur.`,
        occurredAt: now,
        actorLabel: applicantActor,
        visibleToApplicant: true,
      });
      addEvent(application, {
        id: "event-correction-submitted",
        applicationId: application.id,
        type: "correction-submitted",
        label: "Korrigjimi iu dërgua shqyrtimit",
        detail: "Përgjigjja lokale demonstrative u regjistrua pa ndryshuar snapshot-in origjinal.",
        occurredAt: now,
        actorLabel: applicantActor,
        visibleToApplicant: true,
      });
    });
  },

  markCorrectionReviewed(): DemoDataset {
    return commit((next) => {
      const { application } = getApplicationAndCall(next);
      guardStatus(application, "correction-submitted-demo", "Korrigjimi mund të shënohet i shqyrtuar vetëm pasi aplikuesi të përgjigjet.");
      const correction = getCorrection(application);
      if (correction.status !== "answered" || !correction.responseDocumentVersionId) {
        throw new Error("Nuk ka përgjigje të gatshme për shqyrtim.");
      }
      const now = new Date().toISOString();
      correction.status = "reviewed";
      correction.reviewedAt = now;
      correction.reviewedBy = "synthetic-municipal-clerk";
      application.status = "correction-reviewed-demo";
      application.pendingIssue = "Asnjë korrigjim aktiv · paketa mund të përgatitet";
      application.checks = application.checks.map((check) => check.requirementId === correction.requirementId
        ? {
            ...check,
            documentVersionId: correction.responseDocumentVersionId,
            status: "present",
            method: "human-review",
            message: "Korrigjimi demonstrues u shqyrtua; kjo nuk është miratim ose verifikim zyrtar.",
            checkedAt: now,
          }
        : check);
      addEvent(application, {
        id: "event-correction-reviewed",
        applicationId: application.id,
        type: "correction-reviewed",
        label: "Korrigjimi u shënua i shqyrtuar",
        detail: "Të dy versionet mbeten të qasshme. Nuk është vendim financimi ose miratim zyrtar.",
        occurredAt: now,
        actorLabel: municipalActor,
        visibleToApplicant: true,
      });
      next.archiveHandoffs.push({
        id: "archive-handoff-001",
        applicationId: application.id,
        status: "ready-to-prepare",
        registeredInSmaed: false,
      });
    });
  },

  prepareArchivePackage(): DemoDataset {
    return commit((next) => {
      const { application, call } = getApplicationAndCall(next);
      guardStatus(application, "correction-reviewed-demo", "Paketa mund të përgatitet vetëm pasi korrigjimi të jetë shqyrtuar.");
      const handoff = next.archiveHandoffs.find((item) => item.applicationId === application.id);
      if (!handoff || handoff.status !== "ready-to-prepare") {
        throw new Error("Paketa është përgatitur tashmë ose nuk është ende gati.");
      }
      const now = new Date().toISOString();
      addEvent(application, {
        id: "event-archive-package-prepared",
        applicationId: application.id,
        type: "archive-package-prepared",
        label: "Paketa demonstrative u përgatit",
        detail: "Manifesti lokal u krijua për dorëzim të mundshëm manual; nuk u regjistrua në SMAED.",
        occurredAt: now,
        actorLabel: municipalActor,
        visibleToApplicant: false,
      });
      handoff.status = "package-prepared";
      handoff.preparedAt = now;
      handoff.preparedBy = "synthetic-municipal-clerk";
      handoff.manifest = buildArchiveManifest(application, call, now);
    });
  },

  reset(): DemoDataset {
    window.localStorage.removeItem(DEMO_STORAGE_KEY);
    window.localStorage.removeItem(LEGACY_STORAGE_KEY);
    store = clone(initialDataset);
    return clone(store);
  },
};

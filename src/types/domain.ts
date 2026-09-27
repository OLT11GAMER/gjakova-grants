export type EvidenceStatus =
  | "primary-checked"
  | "team-reported"
  | "synthetic"
  | "unknown";

export interface SourceReference {
  id: string;
  title: string;
  url: string;
  checkedAt: string;
  page?: number;
  section?: string;
  excerpt?: string;
  evidenceStatus: EvidenceStatus;
}

export type RequirementKind = "mandatory" | "optional" | "conditional";

export interface Requirement {
  id: string;
  title: string;
  description: string;
  kind: RequirementKind;
  appliesTo: string;
  source: SourceReference;
}

export interface CallVersion {
  id: string;
  version: number;
  publishedAt: string;
  status: "reviewed" | "draft";
  sourceHash?: string;
  requirementIds: string[];
}

export type CallStatus = "historical-closed" | "synthetic-open";

export interface GrantCall {
  id: string;
  institution: string;
  title: string;
  shortTitle: string;
  summary: string;
  category: "business" | "skills" | "environment";
  applicantType: string;
  amountLabel: string;
  opensAt: string;
  closesAt: string;
  status: CallStatus;
  demoLabel: string;
  source: SourceReference;
  versions: CallVersion[];
  requirements: Requirement[];
}

export interface ApplicantProfile {
  id: string;
  displayName: string;
  organization: string;
  municipality: string;
  email: string;
  phone: string;
  businessNumber: string;
  lastConfirmedAt: string;
  dataStatus: "synthetic-unverified";
  reusableDocumentIds: string[];
}

export type ApplicationApplicantDetails = Pick<
  ApplicantProfile,
  | "displayName"
  | "organization"
  | "municipality"
  | "email"
  | "phone"
  | "businessNumber"
>;

export interface DemoDocumentTemplate {
  id: string;
  requirementId: string;
  label: string;
  fileName: string;
  mimeType: "application/pdf";
  sizeLabel: string;
  previewLines: string[];
  passportReusable?: boolean;
}

export interface DocumentVersion {
  id: string;
  documentId: string;
  requirementId: string;
  version: number;
  fileName: string;
  mimeType: string;
  sizeLabel: string;
  createdAt: string;
  createdBy: "synthetic-applicant" | "demo-staff";
  supersedesVersionId?: string;
  correctionRequestId?: string;
  demoOnly: true;
  templateId: string;
  scanImageDataUrl?: string;
  documentAssist?: DocumentAssistRecord;
}

export type DocumentAssistFieldName = "issuer" | "documentDate" | "totalAmount" | "currency" | "description";
export interface ExtractedField {
  value: string | null;
  evidence: string | null;
  confidence: "high" | "medium" | "low";
}
export interface DocumentAssistResult {
  detectedDocumentType: "offer" | "proforma" | "other" | "uncertain";
  fields: Record<DocumentAssistFieldName, ExtractedField>;
  overallStatus: "readable" | "review-needed" | "unreadable";
  notes: string[];
}
export interface DocumentAssistRecord {
  scanAssetId: "offer-scan-v1";
  extraction: DocumentAssistResult;
  confirmations: Partial<Record<DocumentAssistFieldName, { value: string | null; confirmedAt: string }>>;
  provenance: "live" | "captured" | "simulated";
  model: string | null;
  createdAt: string;
}

export interface CheckResult {
  id: string;
  requirementId: string;
  documentVersionId?: string;
  status: "present" | "missing" | "review-needed" | "not-applicable";
  method: "fixture-rule" | "human-review";
  message: string;
  checkedAt: string;
}

export interface SubmittedSnapshot {
  createdAt: string;
  callVersionId: string;
  applicant: ApplicationApplicantDetails;
  documentVersionIds: string[];
  checkResults: CheckResult[];
}

export interface CorrectionRequest {
  id: string;
  applicationId: string;
  requirementId: string;
  questionedDocumentVersionId: string;
  status: "open" | "answered" | "reviewed";
  applicantMessage: string;
  internalNote?: string;
  requestedAt: string;
  requestedBy: "synthetic-municipal-clerk";
  responseDueAt?: string;
  responseDocumentVersionId?: string;
  respondedAt?: string;
  respondedBy?: "synthetic-applicant";
  reviewedAt?: string;
  reviewedBy?: "synthetic-municipal-clerk";
}

export interface CaseEvent {
  id: string;
  applicationId: string;
  type:
    | "created"
    | "submitted"
    | "review-started"
    | "correction-requested"
    | "replacement-added"
    | "correction-submitted"
    | "correction-reviewed"
    | "archive-package-prepared";
  label: string;
  detail: string;
  occurredAt: string;
  actorLabel: string;
  visibleToApplicant: boolean;
}

export type ApplicationStatus =
  | "draft"
  | "submitted-demo"
  | "under-review-demo"
  | "needs-correction-demo"
  | "correction-submitted-demo"
  | "correction-reviewed-demo";

export interface ArchiveManifestRequirement {
  requirementId: string;
  title: string;
  originalDocumentVersionId?: string;
}

export interface ArchiveManifestDocument {
  id: string;
  requirementId: string;
  version: number;
  fileName: string;
  createdAt: string;
  supersedesVersionId?: string;
  correctionRequestId?: string;
}

export interface ArchiveManifest {
  demoApplicationReference: string;
  call: {
    id: string;
    title: string;
    callVersionId: string;
  };
  submittedApplicantSnapshot: ApplicationApplicantDetails;
  submittedAt: string;
  mandatoryRequirements: ArchiveManifestRequirement[];
  originalSubmittedDocumentVersionIds: string[];
  correctedDocumentVersions: ArchiveManifestDocument[];
  correctionRequestIds: string[];
  historyEventIds: string[];
  archivePreparedAt: string;
  packageStatus: "training-demo-package-not-registered-in-smaed";
  officialProtocolReference: null;
}

export interface ArchiveHandoff {
  id: string;
  applicationId: string;
  status: "ready-to-prepare" | "package-prepared";
  registeredInSmaed: false;
  officialProtocolReference?: never;
  preparedAt?: string;
  preparedBy?: "synthetic-municipal-clerk";
  manifest?: ArchiveManifest;
}

export interface Application {
  id: string;
  reference: string;
  callId: string;
  applicantId: string;
  status: ApplicationStatus;
  applicantDetails: ApplicationApplicantDetails;
  activeDocumentVersionIds: Record<string, string>;
  demoSubmissionAcknowledged: boolean;
  lastSavedAt: string;
  submittedAt?: string;
  assignedReviewer?: string;
  pendingIssue?: string;
  submittedSnapshot?: SubmittedSnapshot;
  documents: DocumentVersion[];
  checks: CheckResult[];
  correctionRequests: CorrectionRequest[];
  events: CaseEvent[];
}

export interface DemoDataset {
  schemaVersion: 3;
  calls: GrantCall[];
  applicants: ApplicantProfile[];
  applications: Application[];
  archiveHandoffs: ArchiveHandoff[];
}

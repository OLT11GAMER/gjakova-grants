import type {
  Application,
  ApplicationApplicantDetails,
  CheckResult,
  GrantCall,
} from "../types/domain";

export type ApplicantDetailErrors = Partial<
  Record<keyof ApplicationApplicantDetails, string>
>;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateApplicantDetails(
  details: ApplicationApplicantDetails,
): ApplicantDetailErrors {
  const errors: ApplicantDetailErrors = {};
  if (!details.displayName.trim()) errors.displayName = "Shkruaj emrin e aplikuesit.";
  if (!details.organization.trim()) errors.organization = "Shkruaj emrin e veprimtarisë.";
  if (!details.municipality.trim()) errors.municipality = "Shkruaj komunën.";
  if (!emailPattern.test(details.email.trim())) errors.email = "Shkruaj një email demonstrues të vlefshëm.";
  if (!details.phone.trim()) errors.phone = "Shkruaj telefonin demonstrues.";
  if (!details.businessNumber.trim()) errors.businessNumber = "Shkruaj numrin demonstrues të biznesit.";
  return errors;
}

export function calculateChecks(
  application: Application,
  call: GrantCall,
  checkedAt = new Date().toISOString(),
): CheckResult[] {
  const detailsComplete = Object.keys(validateApplicantDetails(application.applicantDetails)).length === 0;

  return call.requirements.map((requirement, index) => {
    const activeDocumentVersionId = application.activeDocumentVersionIds[requirement.id];
    const activeDocument = application.documents.find(
      (document) => document.id === activeDocumentVersionId,
    );
    const isApplicationForm = requirement.id === "req-application";
    const present = isApplicationForm ? detailsComplete : Boolean(activeDocument);
    const optionalMissing = requirement.kind === "optional" && !present;

    return {
      id: `check-${index + 1}`,
      requirementId: requirement.id,
      documentVersionId: activeDocument?.id,
      status: optionalMissing ? "not-applicable" : present ? "present" : "missing",
      method: "fixture-rule",
      message: optionalMissing
        ? "Opsionale — nuk pengon gatishmërinë."
        : present
          ? isApplicationForm
            ? "Të gjitha fushat e formularit janë plotësuar."
            : "Dokumenti demonstrues është zgjedhur; përmbajtja nuk është vlerësuar."
          : isApplicationForm
            ? "Plotëso të gjitha fushat e aplikuesit."
            : "Kërkesa e detyrueshme mungon.",
      checkedAt,
    };
  });
}

export function getReadiness(application: Application, call: GrantCall) {
  const checks = calculateChecks(application, call, application.lastSavedAt);
  const mandatory = call.requirements.filter((requirement) => requirement.kind === "mandatory");
  const completeMandatory = mandatory.filter((requirement) =>
    checks.some((check) => check.requirementId === requirement.id && check.status === "present"),
  );
  return {
    checks,
    ready: completeMandatory.length === mandatory.length,
    completeCount: completeMandatory.length,
    mandatoryCount: mandatory.length,
    missing: mandatory.filter(
      (requirement) => !completeMandatory.some((complete) => complete.id === requirement.id),
    ),
  };
}

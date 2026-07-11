/**
 * Certificate Policy Master - V1.1 Production Architecture
 */

export const CERTIFICATE_ISSUE_POLICY_VALUES = Object.freeze({
  ALWAYS_ISSUE: "always_issue",
  ON_REQUEST: "on_request",
  NEVER_ISSUE: "never_issue",
});

export const CERTIFICATE_POLICY_ISSUE_OPTIONS = Object.freeze([
  { value: CERTIFICATE_ISSUE_POLICY_VALUES.ALWAYS_ISSUE, label: "\uD56D\uC0C1 \uBC1C\uD589" },
  { value: CERTIFICATE_ISSUE_POLICY_VALUES.ON_REQUEST, label: "\uC694\uCCAD \uC2DC \uBC1C\uD589" },
  { value: CERTIFICATE_ISSUE_POLICY_VALUES.NEVER_ISSUE, label: "\uBC1C\uD589 \uC548 \uD568" },
]);

export const CERTIFICATE_POLICY_MASTER_STORAGE_KEY = "project-titan-certificate-policies-v1";

const VALID_POLICIES = new Set(Object.values(CERTIFICATE_ISSUE_POLICY_VALUES));
const DEFAULT_POLICY = CERTIFICATE_ISSUE_POLICY_VALUES.ALWAYS_ISSUE;

function normalizeIssuePolicyValue(value) {
  const trimmed = String(value ?? "").trim();
  return VALID_POLICIES.has(trimmed) ? trimmed : DEFAULT_POLICY;
}

export function normalizeCertificatePolicyMasterEntry(entry) {
  if (!entry || typeof entry !== "object") return null;
  const id = String(entry.id ?? "").trim();
  const label = String(entry.label ?? "").trim();
  if (!id || !label) return null;
  const issuePolicy = normalizeIssuePolicyValue(entry.issuePolicy);
  const displayLabel =
    CERTIFICATE_POLICY_ISSUE_OPTIONS.find((opt) => opt.value === issuePolicy)?.label ?? label;
  return {
    id,
    label,
    issuePolicy,
    displayLabel,
    description: String(entry.description ?? "").trim(),
    builtIn: entry.builtIn === true,
  };
}

export const DEFAULT_CERTIFICATE_POLICIES = [
  {
    id: "tpl-cert-always",
    label: "\uD56D\uC0C1 \uBC1C\uD589",
    issuePolicy: CERTIFICATE_ISSUE_POLICY_VALUES.ALWAYS_ISSUE,
    builtIn: true,
  },
  {
    id: "tpl-cert-on-request",
    label: "\uC694\uCCAD \uC2DC \uBC1C\uD589",
    issuePolicy: CERTIFICATE_ISSUE_POLICY_VALUES.ON_REQUEST,
    builtIn: true,
  },
  {
    id: "tpl-cert-never",
    label: "\uBC1C\uD589 \uC548 \uD568",
    issuePolicy: CERTIFICATE_ISSUE_POLICY_VALUES.NEVER_ISSUE,
    builtIn: true,
  },
]
  .map((item) => normalizeCertificatePolicyMasterEntry(item))
  .filter(Boolean);

export const DEFAULT_CERTIFICATE_POLICY_ID = "tpl-cert-always";

export function cloneDefaultCertificatePolicies() {
  return DEFAULT_CERTIFICATE_POLICIES.map((row) => normalizeCertificatePolicyMasterEntry(row)).filter(
    Boolean
  );
}

export function resolveCertificatePolicyIssuePolicy(
  policyId,
  policies = DEFAULT_CERTIFICATE_POLICIES
) {
  const id = String(policyId ?? "").trim();
  if (!id) return DEFAULT_POLICY;
  const found = policies.find((row) => row.id === id);
  return found?.issuePolicy ?? DEFAULT_POLICY;
}

export function createDefaultCertificatePolicy() {
  return {
    issuePolicy: CERTIFICATE_ISSUE_POLICY_VALUES.ALWAYS_ISSUE,
  };
}

export function normalizeCertificatePolicy(certificatePolicy) {
  const input = certificatePolicy && typeof certificatePolicy === "object" ? certificatePolicy : {};
  return {
    issuePolicy: normalizeIssuePolicyValue(input.issuePolicy),
  };
}
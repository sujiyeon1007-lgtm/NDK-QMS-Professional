/**
 * Project TITAN - Certificate issuance policy (PM Review 13/14)
 */

import { findCompanyProduct } from "./productMasterSearch";
import { findProductByCompanyAndPartNo, findProductByPartNo } from "./masterData";
import {
  CERTIFICATE_POLICY_MASTER_STORAGE_KEY,
  cloneDefaultCertificatePolicies,
  createDefaultCertificatePolicy,
  normalizeCertificatePolicy,
  normalizeCertificatePolicyMasterEntry,
  resolveCertificatePolicyIssuePolicy,
  DEFAULT_CERTIFICATE_POLICY_ID,
} from "../config/certificatePolicyMaster";

export { createDefaultCertificatePolicy, normalizeCertificatePolicy };

function resolveMasterProductInline(company, partNo) {
  const trimmedPartNo = partNo?.trim();
  if (!trimmedPartNo) return null;
  return (
    findProductByCompanyAndPartNo(company, trimmedPartNo) ??
    findProductByPartNo(trimmedPartNo)
  );
}

export const CERTIFICATE_ISSUE_POLICY = Object.freeze({
  ALWAYS_ISSUE: "always_issue",
  ON_REQUEST: "on_request",
  NEVER_ISSUE: "never_issue",
});

export const CERTIFICATE_ISSUE_POLICY_OPTIONS = Object.freeze([
  { value: CERTIFICATE_ISSUE_POLICY.ALWAYS_ISSUE, label: "\uD56D\uC0C1 \uBC1C\uD589" },
  { value: CERTIFICATE_ISSUE_POLICY.ON_REQUEST, label: "\uC694\uCCAD \uC2DC \uBC1C\uD589" },
  { value: CERTIFICATE_ISSUE_POLICY.NEVER_ISSUE, label: "\uBC1C\uD589 \uC548 \uD568" },
]);

export const DEFAULT_CERTIFICATE_ISSUE_POLICY = CERTIFICATE_ISSUE_POLICY.ALWAYS_ISSUE;

const VALID_POLICIES = new Set(Object.values(CERTIFICATE_ISSUE_POLICY));

function readCertificatePoliciesInline() {
  try {
    const raw = globalThis.sessionStorage?.getItem(CERTIFICATE_POLICY_MASTER_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed?.policies)) {
        return parsed.policies.map(normalizeCertificatePolicyMasterEntry).filter(Boolean);
      }
    }
  } catch {
    /* noop */
  }
  return cloneDefaultCertificatePolicies();
}

function getCertificatePolicyByIdInline(policyId) {
  const id = String(policyId ?? "").trim();
  if (!id) return null;
  return readCertificatePoliciesInline().find((row) => row.id === id) ?? null;
}

export function normalizeCertificateIssuePolicy(value) {
  const trimmed = String(value ?? "").trim();
  return VALID_POLICIES.has(trimmed) ? trimmed : DEFAULT_CERTIFICATE_ISSUE_POLICY;
}

export function getCertificateIssuePolicyFromProduct(product) {
  if (!product) return DEFAULT_CERTIFICATE_ISSUE_POLICY;
  const policyId = String(product.certificatePolicyId ?? "").trim();
  if (policyId) {
    const policy = getCertificatePolicyByIdInline(policyId);
    if (policy) return normalizeCertificateIssuePolicy(policy.issuePolicy);
  }
  if (product.certificateIssuePolicy) {
    return normalizeCertificateIssuePolicy(product.certificateIssuePolicy);
  }
  const inline = product.specification?.certificatePolicy?.issuePolicy;
  if (inline) return normalizeCertificateIssuePolicy(inline);
  return resolveCertificatePolicyIssuePolicy(DEFAULT_CERTIFICATE_POLICY_ID);
}

export function resolveCertificateIssuePolicy(record, product = null) {
  const resolvedProduct =
    product ??
    (record?.company && record?.partNo
      ? resolveMasterProductInline(record.company, record.partNo) ??
        findCompanyProduct(record.company, record.partName, record.partNo, record.drawingNo)
      : null);

  if (record?.certificateIssuePolicy && record.certificateIssuePolicySource === "inbound_override") {
    return {
      policy: normalizeCertificateIssuePolicy(record.certificateIssuePolicy),
      source: "inbound_override",
    };
  }

  if (resolvedProduct) {
    const certificatePolicyId =
      String(resolvedProduct.certificatePolicyId ?? "").trim() || DEFAULT_CERTIFICATE_POLICY_ID;
    return {
      policy: getCertificateIssuePolicyFromProduct(resolvedProduct),
      source: "product",
      certificatePolicyId,
    };
  }

  if (record?.certificateIssuePolicy) {
    return {
      policy: normalizeCertificateIssuePolicy(record.certificateIssuePolicy),
      source: record.certificateIssuePolicySource === "product" ? "product" : "inbound_override",
    };
  }

  return {
    policy: DEFAULT_CERTIFICATE_ISSUE_POLICY,
    source: "default",
  };
}

export function requiresCertificateIssue(record, product = null) {
  return (
    resolveCertificateIssuePolicy(record, product).policy ===
    CERTIFICATE_ISSUE_POLICY.ALWAYS_ISSUE
  );
}

export function skipsCertificateWaitByDefault(record, product = null) {
  const policy = resolveCertificateIssuePolicy(record, product).policy;
  return (
    policy === CERTIFICATE_ISSUE_POLICY.NEVER_ISSUE ||
    policy === CERTIFICATE_ISSUE_POLICY.ON_REQUEST
  );
}

export function getCertificateIssuePolicyLabel(policy) {
  return (
    CERTIFICATE_ISSUE_POLICY_OPTIONS.find((option) => option.value === policy)?.label ??
    CERTIFICATE_ISSUE_POLICY_OPTIONS.find(
      (option) => option.value === DEFAULT_CERTIFICATE_ISSUE_POLICY
    )?.label ??
    "\uD56D\uC0C1 \uBC1C\uD589"
  );
}

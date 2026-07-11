/**
 * Certificate Policy Master - SessionStorage CRUD (RC1)
 */

import {
  CERTIFICATE_POLICY_MASTER_STORAGE_KEY,
  DEFAULT_CERTIFICATE_POLICY_ID,
  cloneDefaultCertificatePolicies,
  normalizeCertificatePolicyMasterEntry,
  resolveCertificatePolicyIssuePolicy,
} from "../config/certificatePolicyMaster";

function safeReadRaw() {
  try {
    const raw = globalThis.sessionStorage?.getItem(CERTIFICATE_POLICY_MASTER_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed?.policies) ? parsed.policies : null;
  } catch {
    return null;
  }
}

function safeWritePolicies(policies) {
  try {
    globalThis.sessionStorage?.setItem(
      CERTIFICATE_POLICY_MASTER_STORAGE_KEY,
      JSON.stringify({ policies, updatedAt: new Date().toISOString() })
    );
    return true;
  } catch {
    return false;
  }
}

function normalizePolicyList(rows) {
  const seen = new Set();
  return (Array.isArray(rows) ? rows : [])
    .map((row) => normalizeCertificatePolicyMasterEntry(row))
    .filter(Boolean)
    .filter((row) => {
      if (seen.has(row.id)) return false;
      seen.add(row.id);
      return true;
    });
}

export function getCertificatePolicies() {
  const stored = safeReadRaw();
  if (stored?.length) {
    return normalizePolicyList(stored);
  }
  return cloneDefaultCertificatePolicies();
}

export function saveCertificatePolicies(policies) {
  const next = normalizePolicyList(policies);
  safeWritePolicies(next);
  return next;
}

export function resetCertificatePolicies() {
  try {
    globalThis.sessionStorage?.removeItem(CERTIFICATE_POLICY_MASTER_STORAGE_KEY);
  } catch {
    /* noop */
  }
  return cloneDefaultCertificatePolicies();
}

export function getCertificatePolicyById(policyId) {
  const id = String(policyId ?? "").trim();
  if (!id) return null;
  return getCertificatePolicies().find((row) => row.id === id) ?? null;
}

export function createCertificatePolicyId(label = "") {
  const slug = String(label ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\uAC00-\uD7A3]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 24);
  const suffix = Date.now().toString(36).slice(-4);
  return `tpl-cert-${slug || "custom"}-${suffix}`;
}

export function addCertificatePolicy(policy) {
  const normalized = normalizeCertificatePolicyMasterEntry(policy);
  if (!normalized) {
    return { ok: false, message: "policy invalid" };
  }
  const rows = getCertificatePolicies();
  if (rows.some((row) => row.id === normalized.id)) {
    return { ok: false, message: "duplicate id" };
  }
  const next = saveCertificatePolicies([...rows, normalized]);
  return { ok: true, policies: next, policy: normalized };
}

export function updateCertificatePolicy(policyId, patch) {
  const id = String(policyId ?? "").trim();
  const rows = getCertificatePolicies();
  const index = rows.findIndex((row) => row.id === id);
  if (index < 0) {
    return { ok: false, message: "not found" };
  }
  const merged = normalizeCertificatePolicyMasterEntry({ ...rows[index], ...patch, id });
  if (!merged) {
    return { ok: false, message: "invalid" };
  }
  const nextRows = [...rows];
  nextRows[index] = merged;
  const next = saveCertificatePolicies(nextRows);
  return { ok: true, policies: next, policy: merged };
}

export function deleteCertificatePolicy(policyId) {
  const id = String(policyId ?? "").trim();
  const rows = getCertificatePolicies();
  if (!rows.some((row) => row.id === id)) {
    return { ok: false, message: "not found" };
  }
  const next = saveCertificatePolicies(rows.filter((row) => row.id !== id));
  return { ok: true, policies: next };
}

export function resolveProductCertificatePolicyId(product) {
  if (!product) return DEFAULT_CERTIFICATE_POLICY_ID;
  const fromId = String(product.certificatePolicyId ?? "").trim();
  if (fromId && getCertificatePolicyById(fromId)) return fromId;
  const inline = String(
    product.certificateIssuePolicy ?? product.specification?.certificatePolicy?.issuePolicy ?? ""
  ).trim();
  if (inline) {
    const matched = getCertificatePolicies().find((row) => row.issuePolicy === inline);
    if (matched) return matched.id;
  }
  return DEFAULT_CERTIFICATE_POLICY_ID;
}

export function resolveIssuePolicyFromProductMaster(product, policies = getCertificatePolicies()) {
  const policyId = resolveProductCertificatePolicyId(product);
  return resolveCertificatePolicyIssuePolicy(policyId, policies);
}

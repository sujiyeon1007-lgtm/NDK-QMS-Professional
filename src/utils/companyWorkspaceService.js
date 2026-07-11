/**
 * Company Workspace Service — Dashboard · Migration · CRUD (Sprint 11)
 */

import companyStore from "../foundation/data/master/companyStore";
import { DEFAULT_COMPANY_STAMP_URL } from "../config/rc1OperationalPolicy";
import { getEnvironmentSettings } from "./environmentSettingsSession";

function nowIso() {
  return new Date().toISOString();
}

function nextId(prefix) {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}`;
}

function normalizeProfile(raw) {
  const seed = companyStore.get();
  const profile = { ...seed, ...raw };
  profile.companyMaster = { ...seed.companyMaster, ...(raw?.companyMaster ?? {}) };
  profile.branding = { ...seed.branding, ...(raw?.branding ?? {}) };
  profile.documentFooter = { ...seed.documentFooter, ...(raw?.documentFooter ?? {}) };
  profile.organization = { ...seed.organization, ...(raw?.organization ?? {}) };
  profile.meta = { ...seed.meta, ...(raw?.meta ?? {}) };
  profile.businessSites = Array.isArray(raw?.businessSites)
    ? raw.businessSites
    : Array.isArray(raw?.businessLocation) && raw.businessLocation.length
      ? raw.businessLocation
      : seed.businessSites;
  profile.departments = Array.isArray(raw?.departments) ? raw.departments : seed.departments;
  profile.employees = Array.isArray(raw?.employees) ? raw.employees : seed.employees;
  profile.positions = Array.isArray(raw?.positions) ? raw.positions : seed.positions;
  profile.certification = Array.isArray(raw?.certification) ? raw.certification : seed.certification;
  profile.businessLocation = profile.businessSites;
  return profile;
}

function migrateFromEnvironmentIfNeeded(profile) {
  const master = profile.companyMaster ?? {};
  const hasMaster =
    String(master.companyName ?? "").trim() ||
    String(master.businessNumber ?? "").trim() ||
    String(master.representative ?? "").trim();

  if (hasMaster) return profile;

  const envCompany = getEnvironmentSettings()?.company ?? {};
  if (!String(envCompany.name ?? "").trim()) return profile;

  return normalizeProfile({
    ...profile,
    companyMaster: {
      ...master,
      companyName: envCompany.name ?? master.companyName,
      representative: envCompany.ceo ?? master.representative,
      businessNumber: envCompany.bizNo ?? master.businessNumber,
      address: envCompany.address ?? master.address,
      phone: envCompany.phone ?? master.phone,
      fax: envCompany.fax ?? master.fax,
      email: envCompany.email ?? master.email,
      website: envCompany.website ?? master.website,
      updatedAt: nowIso(),
    },
    branding: {
      ...profile.branding,
      logo: envCompany.logoDataUrl ?? profile.branding?.logo ?? "",
    },
    documentFooter: {
      ...profile.documentFooter,
      companyName: envCompany.name ?? profile.documentFooter?.companyName ?? "",
      address: envCompany.address ?? profile.documentFooter?.address ?? "",
      phone: envCompany.phone ?? profile.documentFooter?.phone ?? "",
      email: envCompany.email ?? profile.documentFooter?.email ?? "",
    },
    meta: {
      ...profile.meta,
      lastUpdatedAt: nowIso(),
      lastUpdatedBy: "environment-migration",
    },
  });
}

export function ensureCompanyWorkspaceSeeded() {
  companyStore.seedIfEmpty();
  const current = normalizeProfile(companyStore.get());
  const migrated = migrateFromEnvironmentIfNeeded(current);
  if (JSON.stringify(migrated) !== JSON.stringify(current)) {
    companyStore.replace(migrated);
  }
  return migrated;
}

export function getCompanyProfile() {
  return ensureCompanyWorkspaceSeeded();
}

/** RC1.1 — Company Master print footer lines (성적서 · 리스트 · QR 공통) */
export function buildCompanyPrintFooterLines(profile = getCompanyProfile()) {
  const footer = profile.documentFooter ?? {};
  const master = profile.companyMaster ?? {};
  const companyName = String(footer.companyName || master.companyName || "").trim();
  const address = String(footer.address || master.address || "").trim();
  const phone = String(footer.phone || master.phone || "").trim();
  const email = String(footer.email || master.email || "").trim();
  const copyright = String(footer.copyright || "").trim();

  const lines = [];
  if (companyName) lines.push(companyName);
  if (address) lines.push(address);
  if (phone || email) {
    lines.push([phone && `Tel ${phone}`, email && `Email ${email}`].filter(Boolean).join(" · "));
  }
  if (copyright) lines.push(copyright);
  return lines.filter(Boolean);
}

/** RC1.1 — Header / Login branding logo from Company Master */
export function getCompanyBrandingLogoUrl(profile = getCompanyProfile()) {
  return String(profile?.branding?.logo ?? "").trim();
}

/** RC1 — Company Branding SSOT: 직인 PNG (모든 문서 공통) */
export function getCompanyBrandingStampUrl(profile = getCompanyProfile()) {
  const uploaded = String(profile?.branding?.stamp ?? "").trim();
  return uploaded || DEFAULT_COMPANY_STAMP_URL;
}

/** RC1 — Company Branding SSOT: 대표이사 서명 PNG (모든 문서 공통) */
export function getCompanyBrandingSignatureUrl(profile = getCompanyProfile()) {
  return String(profile?.branding?.signature ?? "").trim();
}

/** RC1 — 문서 출력 엔진 공통 Branding 번들 (Company Branding → 직인 → 자동 출력) */
export function getCompanyBrandingForDocuments(profile = getCompanyProfile()) {
  return {
    logo: getCompanyBrandingLogoUrl(profile),
    stamp: getCompanyBrandingStampUrl(profile),
    signature: getCompanyBrandingSignatureUrl(profile),
    footerLines: buildCompanyPrintFooterLines(profile),
    representative: String(profile?.companyMaster?.representative ?? "").trim(),
  };
}

export function buildCompanyDashboard() {
  const profile = getCompanyProfile();
  const master = profile.companyMaster ?? {};
  const sites = profile.businessSites ?? [];
  const departments = profile.departments ?? [];
  const employees = profile.employees ?? [];
  const positions = profile.positions ?? [];
  const activeEmployees = employees.filter((row) => row.status !== "retired");

  const lastUpdatedAt =
    profile.meta?.lastUpdatedAt ??
    master.updatedAt ??
    profile.documentFooter?.updatedAt ??
    null;

  return {
    companyName: master.companyName || "-",
    representative: master.representative || "-",
    businessNumber: master.businessNumber || "-",
    siteCount: sites.length,
    departmentCount: departments.length,
    employeeCount: activeEmployees.length,
    positionCount: positions.length,
    lastUpdatedAt,
    sections: profile,
  };
}
export function buildCompanySummary() {
  const profile = getCompanyProfile();
  const master = profile.companyMaster ?? {};
  return {
    companyName: master.companyName || "-",
    representative: master.representative || "-",
    businessNumber: master.businessNumber || "-",
    phone: master.phone || "-",
    address: master.address || "-",
    businessType: master.businessType || "-",
    businessItem: master.businessItem || "-",
    logoUrl: profile.branding?.logo || "",
  };
}


export function updateCompanyMaster(patch, updatedBy = "") {
  const profile = getCompanyProfile();
  const next = normalizeProfile({
    ...profile,
    companyMaster: {
      ...profile.companyMaster,
      ...patch,
      updatedAt: nowIso(),
    },
    meta: {
      ...profile.meta,
      lastUpdatedAt: nowIso(),
      lastUpdatedBy: updatedBy || profile.meta?.lastUpdatedBy || "",
    },
  });
  companyStore.replace(next);
  return next.companyMaster;
}

export function updateDocumentFooter(patch, updatedBy = "") {
  const profile = getCompanyProfile();
  const next = normalizeProfile({
    ...profile,
    documentFooter: {
      ...profile.documentFooter,
      ...patch,
      updatedAt: nowIso(),
    },
    meta: {
      ...profile.meta,
      lastUpdatedAt: nowIso(),
      lastUpdatedBy: updatedBy || profile.meta?.lastUpdatedBy || "",
    },
  });
  companyStore.replace(next);
  return next.documentFooter;
}

export function updateCompanyBranding(patch, updatedBy = "") {
  const profile = getCompanyProfile();
  const next = normalizeProfile({
    ...profile,
    branding: {
      ...profile.branding,
      ...patch,
      updatedAt: nowIso(),
    },
    meta: {
      ...profile.meta,
      lastUpdatedAt: nowIso(),
      lastUpdatedBy: updatedBy || profile.meta?.lastUpdatedBy || "",
    },
  });
  companyStore.replace(next);
  return next.branding;
}

export function listBusinessSites() {
  return getCompanyProfile().businessSites ?? [];
}

export function saveBusinessSite(payload) {
  const profile = getCompanyProfile();
  const sites = [...(profile.businessSites ?? [])];
  const id = String(payload.id ?? "").trim() || nextId("SITE");
  const row = {
    id,
    name: String(payload.name ?? "").trim(),
    type: payload.type ?? "other",
    address: String(payload.address ?? "").trim(),
    phone: String(payload.phone ?? "").trim(),
    status: payload.status ?? "active",
  };
  const index = sites.findIndex((item) => item.id === id);
  if (index >= 0) sites[index] = { ...sites[index], ...row };
  else sites.push(row);

  companyStore.replace(
    normalizeProfile({
      ...profile,
      businessSites: sites,
      meta: { ...profile.meta, lastUpdatedAt: nowIso() },
    })
  );
  return row;
}

export function removeBusinessSite(id) {
  const profile = getCompanyProfile();
  const key = String(id ?? "").trim();
  const sites = (profile.businessSites ?? []).filter((row) => row.id !== key);
  companyStore.replace(
    normalizeProfile({
      ...profile,
      businessSites: sites,
      meta: { ...profile.meta, lastUpdatedAt: nowIso() },
    })
  );
}

export function listDepartments() {
  return getCompanyProfile().departments ?? [];
}

export function saveDepartment(payload) {
  const profile = getCompanyProfile();
  const rows = [...(profile.departments ?? [])];
  const id = String(payload.id ?? "").trim() || nextId("DEPT");
  const row = {
    id,
    code: String(payload.code ?? "").trim(),
    name: String(payload.name ?? "").trim(),
    status: payload.status ?? "active",
  };
  const index = rows.findIndex((item) => item.id === id);
  if (index >= 0) rows[index] = { ...rows[index], ...row };
  else rows.push(row);

  companyStore.replace(
    normalizeProfile({
      ...profile,
      departments: rows,
      meta: { ...profile.meta, lastUpdatedAt: nowIso() },
    })
  );
  return row;
}

export function removeDepartment(id) {
  const profile = getCompanyProfile();
  const key = String(id ?? "").trim();
  companyStore.replace(
    normalizeProfile({
      ...profile,
      departments: (profile.departments ?? []).filter((row) => row.id !== key),
      meta: { ...profile.meta, lastUpdatedAt: nowIso() },
    })
  );
}

export function listPositions() {
  return [...(getCompanyProfile().positions ?? [])].sort(
    (a, b) => Number(a.rank ?? 0) - Number(b.rank ?? 0)
  );
}

export function savePosition(payload) {
  const profile = getCompanyProfile();
  const rows = [...(profile.positions ?? [])];
  const id = String(payload.id ?? "").trim() || nextId("POS");
  const row = {
    id,
    code: String(payload.code ?? "").trim(),
    name: String(payload.name ?? "").trim(),
    rank: Number(payload.rank ?? rows.length + 1) || 1,
    status: payload.status ?? "active",
  };
  const index = rows.findIndex((item) => item.id === id);
  if (index >= 0) rows[index] = { ...rows[index], ...row };
  else rows.push(row);

  companyStore.replace(
    normalizeProfile({
      ...profile,
      positions: rows,
      meta: { ...profile.meta, lastUpdatedAt: nowIso() },
    })
  );
  return row;
}

export function removePosition(id) {
  const profile = getCompanyProfile();
  const key = String(id ?? "").trim();
  companyStore.replace(
    normalizeProfile({
      ...profile,
      positions: (profile.positions ?? []).filter((row) => row.id !== key),
      meta: { ...profile.meta, lastUpdatedAt: nowIso() },
    })
  );
}

export function listEmployees() {
  const profile = getCompanyProfile();
  const departments = profile.departments ?? [];
  const positions = profile.positions ?? [];
  return (profile.employees ?? []).map((row) => ({
    ...row,
    departmentName:
      departments.find((dept) => dept.id === row.departmentId)?.name ?? row.departmentName ?? "",
    positionName:
      positions.find((pos) => pos.id === row.positionId)?.name ?? row.positionName ?? "",
  }));
}

export function saveEmployee(payload) {
  const profile = getCompanyProfile();
  const rows = [...(profile.employees ?? [])];
  const id = String(payload.id ?? "").trim() || nextId("EMP");
  const row = {
    id,
    employeeNo: String(payload.employeeNo ?? "").trim(),
    name: String(payload.name ?? "").trim(),
    departmentId: String(payload.departmentId ?? "").trim(),
    positionId: String(payload.positionId ?? "").trim(),
    phone: String(payload.phone ?? "").trim(),
    email: String(payload.email ?? "").trim(),
    status: payload.status ?? "active",
  };
  const index = rows.findIndex((item) => item.id === id);
  if (index >= 0) rows[index] = { ...rows[index], ...row };
  else rows.push(row);

  companyStore.replace(
    normalizeProfile({
      ...profile,
      employees: rows,
      meta: { ...profile.meta, lastUpdatedAt: nowIso() },
    })
  );
  return row;
}

export function removeEmployee(id) {
  const profile = getCompanyProfile();
  const key = String(id ?? "").trim();
  companyStore.replace(
    normalizeProfile({
      ...profile,
      employees: (profile.employees ?? []).filter((row) => row.id !== key),
      meta: { ...profile.meta, lastUpdatedAt: nowIso() },
    })
  );
}

export function formatCompanyUpdatedAt(iso) {
  if (!iso) return "-";
  try {
    return new Date(iso).toLocaleString("ko-KR");
  } catch {
    return iso;
  }
}

export function resolveBusinessSiteTypeLabel(typeId) {
  const map = {
    headquarters: "본사",
    factory: "공장",
    warehouse: "창고",
    office: "사무소",
    other: "기타",
  };
  return map[typeId] ?? typeId ?? "-";
}

export function resolveEmployeeStatusLabel(statusId) {
  const map = { active: "재직", leave: "휴직", retired: "퇴사" };
  return map[statusId] ?? statusId ?? "-";
}

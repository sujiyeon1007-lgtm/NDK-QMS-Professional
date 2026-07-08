/**
 * Project TITAN Sprint 8 — Master Data Dashboard (Master Health · Read Only)
 *
 * 기준정보관리는 단순 CRUD가 아니라 Project TITAN 전체의 Master Data Hub 이다.
 * 본 Dashboard는 "등록 건수"가 아니라 "관리해야 하는 문제(Health)"를 먼저 보여준다.
 *
 * 모든 지표는 입력 금지 — 기준정보 Master(거래처·제품·재질·공정·설비·작업자)와
 * QR Registry / Import Log를 집계하여 자동 계산한다. (SessionStorage Demo)
 *
 * Blueprint: Sprint 8 — Master Data Workspace (Official Blueprint V1.0)
 * 단일 진입: buildMasterDataDashboardSnapshot()
 */

import { getMasterDataByCategory } from "./masterData";
import { getQrCreatableEquipmentRecords } from "./qrManagementSession";
import { getAllMasterImportLogs } from "./masterExcelImportLog";

/** 기준정보 6종 — Summary · Health · 화면 이동 공통 정의 (Blueprint 순서) */
export const MASTER_DASHBOARD_CATEGORIES = Object.freeze([
  { id: "companies", label: "거래처", category: "companies", route: "/settings/companies", icon: "companies", badgeColor: "blue" },
  { id: "products", label: "제품", category: "products", route: "/settings/products", icon: "products", badgeColor: "green" },
  { id: "materials", label: "재질", category: "materials", route: "/settings/materials", icon: "materials", badgeColor: "orange" },
  { id: "processes", label: "공정", category: "heatTreatment", route: "/settings/processes", icon: "processes", badgeColor: "purple" },
  { id: "equipment", label: "설비", category: "equipment", route: "/settings/equipment", icon: "equipment", badgeColor: "green" },
  { id: "workers", label: "작업자", category: "workers", route: "/settings/workers", icon: "workers", badgeColor: "cyan" },
]);

/** Master Excel Import Log masterType → 표시 라벨 */
const MASTER_TYPE_LABEL = {
  companies: "거래처",
  company: "거래처",
  products: "제품",
  product: "제품",
  materials: "재질",
  material: "재질",
  processes: "공정",
  heatTreatment: "공정",
  equipment: "설비",
  workers: "작업자",
  worker: "작업자",
};

function pad2(value) {
  return String(value).padStart(2, "0");
}

function hasText(value) {
  return String(value ?? "").trim().length > 0;
}

function activeRows(category) {
  return getMasterDataByCategory(category).filter((row) => row.active !== false);
}

function companyHasContact(company) {
  const contacts = Array.isArray(company?.contacts) ? company.contacts : [];
  const assignees = Array.isArray(company?.ndkAssignees) ? company.ndkAssignees : [];
  return contacts.some((c) => hasText(c?.name)) || assignees.some((a) => hasText(a?.name));
}

function resolveCurrentUser() {
  try {
    return sessionStorage.getItem("titan-current-user") || "admin";
  } catch {
    return "admin";
  }
}

/**
 * Health row 생성 — count/이슈 기반 상태(ok·warn·error) 자동 판정.
 * @param {{level: "warn"|"error", text: string}[]} issuesRaw
 */
function buildHealthRow(id, label, route, count, issuesRaw) {
  const issues = issuesRaw.filter(Boolean);
  let status = "ok";
  if (count === 0) {
    status = "error";
    issues.unshift({ level: "error", text: "등록된 항목 없음" });
  } else if (issues.some((issue) => issue.level === "error")) {
    status = "error";
  } else if (issues.length) {
    status = "warn";
  }
  return {
    id,
    label,
    route,
    count,
    status,
    message: issues.length ? issues.map((issue) => issue.text).join(" · ") : "정상",
  };
}

/** 최근 등록 — 각 Master 최신 등록분(배열 tail) 집계 (timestamp 미보유 · 등록 순서 기준) */
function buildRecentRegistrations(perCategory = 2, limit = 10) {
  const rows = [];
  MASTER_DASHBOARD_CATEGORIES.forEach((cat) => {
    const catRows = activeRows(cat.category);
    catRows
      .slice(-perCategory)
      .reverse()
      .forEach((row) => {
        rows.push({
          id: `${cat.id}-${row.id}`,
          category: cat.id,
          categoryLabel: cat.label,
          badgeColor: cat.badgeColor,
          route: cat.route,
          name: row.name || row.partNo || row.code || "-",
          code: row.code || row.partNo || "",
        });
      });
  });
  return rows.slice(0, limit);
}

/** 최근 수정 이력 — Master Excel Import Log(실제 timestamp) 집계 */
function buildRecentUpdates(limit = 8) {
  let logs = {};
  try {
    logs = getAllMasterImportLogs() ?? {};
  } catch {
    logs = {};
  }
  return Object.values(logs)
    .filter(Boolean)
    .map((log) => {
      const dt = log.datetime ? new Date(log.datetime) : null;
      const valid = dt && !Number.isNaN(dt.getTime());
      const label = MASTER_TYPE_LABEL[log.masterType] ?? log.masterType ?? "기준정보";
      return {
        id: log.id ?? `${log.masterType}-${log.datetime}`,
        sort: valid ? dt.getTime() : 0,
        time: valid ? `${pad2(dt.getHours())}:${pad2(dt.getMinutes())}` : "--:--",
        label: `${label} Excel Import${log.fileName ? ` · ${log.fileName}` : ""}`,
        user: log.user || "시스템",
      };
    })
    .sort((a, b) => b.sort - a.sort)
    .slice(0, limit);
}

function buildEmptySnapshot() {
  const now = new Date();
  return {
    summary: MASTER_DASHBOARD_CATEGORIES.map((cat) => ({
      id: cat.id,
      label: cat.label,
      icon: cat.icon,
      route: cat.route,
      count: 0,
    })),
    totalCount: 0,
    health: [],
    missing: [],
    missingTotal: 0,
    recentRegistrations: [],
    recentUpdates: [],
    footer: {
      database: "SessionStorage (Demo)",
      version: "Beta v1.0",
      lastSync: `${pad2(now.getHours())}:${pad2(now.getMinutes())}`,
      user: resolveCurrentUser(),
    },
  };
}

/**
 * Master Data Dashboard 단일 Snapshot.
 * @returns {{
 *   summary: Array<{id:string,label:string,icon:string,route:string,count:number}>,
 *   totalCount: number,
 *   health: Array<{id:string,label:string,route:string,count:number,status:string,message:string}>,
 *   missing: Array<{id:string,label:string,count:number,unit:string,route:string,filter:string,tone:string}>,
 *   missingTotal: number,
 *   recentRegistrations: Array<object>,
 *   recentUpdates: Array<object>,
 *   footer: {database:string,version:string,lastSync:string,user:string},
 * }}
 */
export function buildMasterDataDashboardSnapshot() {
  try {
    const companies = activeRows("companies");
    const products = activeRows("products");
    const materials = activeRows("materials");
    const processes = activeRows("heatTreatment");
    const equipment = activeRows("equipment");
    const workers = activeRows("workers");

    const countByCategory = {
      companies: companies.length,
      products: products.length,
      materials: materials.length,
      heatTreatment: processes.length,
      equipment: equipment.length,
      workers: workers.length,
    };

    // ── ① Master Summary ─────────────────────────────────────
    const summary = MASTER_DASHBOARD_CATEGORIES.map((cat) => ({
      id: cat.id,
      label: cat.label,
      icon: cat.icon,
      route: cat.route,
      count: countByCategory[cat.category] ?? 0,
    }));

    // ── ③ Missing Information (핵심) ─────────────────────────
    const missingMaterialProducts = products.filter((p) => !hasText(p.material));
    const missingProcessProducts = products.filter((p) => !hasText(p.process));
    const missingContactCompanies = companies.filter((c) => !companyHasContact(c));
    const missingDeptWorkers = workers.filter((w) => !hasText(w.department));
    let qrlessEquipment = [];
    try {
      qrlessEquipment = getQrCreatableEquipmentRecords() ?? [];
    } catch {
      qrlessEquipment = [];
    }

    const missing = [
      { id: "product-material", label: "재질 없는 제품", count: missingMaterialProducts.length, unit: "건", route: "/settings/products", filter: "missing-material", tone: "warn" },
      { id: "product-process", label: "공정 없는 제품", count: missingProcessProducts.length, unit: "건", route: "/settings/products", filter: "missing-process", tone: "warn" },
      { id: "equipment-qr", label: "QR 없는 설비", count: qrlessEquipment.length, unit: "대", route: "/settings/equipment", filter: "missing-qr", tone: "error" },
      { id: "company-contact", label: "담당자 없는 거래처", count: missingContactCompanies.length, unit: "개", route: "/settings/companies", filter: "missing-contact", tone: "warn" },
      { id: "worker-qualification", label: "자격정보 없는 작업자", count: missingDeptWorkers.length, unit: "명", route: "/settings/workers", filter: "missing-qualification", tone: "warn" },
    ];
    const missingTotal = missing.reduce((sum, item) => sum + item.count, 0);

    // ── ② Master Health ──────────────────────────────────────
    const health = [
      buildHealthRow("companies", "거래처", "/settings/companies", companies.length, [
        missingContactCompanies.length && { level: "warn", text: `담당자 미등록 ${missingContactCompanies.length}개` },
      ]),
      buildHealthRow("products", "제품", "/settings/products", products.length, [
        missingMaterialProducts.length && { level: "warn", text: `재질 누락 ${missingMaterialProducts.length}건` },
        missingProcessProducts.length && { level: "warn", text: `공정 누락 ${missingProcessProducts.length}건` },
      ]),
      buildHealthRow("materials", "재질", "/settings/materials", materials.length, []),
      buildHealthRow("processes", "공정", "/settings/processes", processes.length, []),
      buildHealthRow("equipment", "설비", "/settings/equipment", equipment.length, [
        qrlessEquipment.length && { level: "error", text: `QR 미등록 ${qrlessEquipment.length}대` },
      ]),
      buildHealthRow("workers", "작업자", "/settings/workers", workers.length, [
        missingDeptWorkers.length && { level: "warn", text: `부서 미지정 ${missingDeptWorkers.length}명` },
      ]),
    ];

    // ── ⑥ Footer Status ──────────────────────────────────────
    const now = new Date();
    const footer = {
      database: "SessionStorage (Demo)",
      version: "Beta v1.0",
      lastSync: `${pad2(now.getHours())}:${pad2(now.getMinutes())}`,
      user: resolveCurrentUser(),
    };

    return {
      summary,
      totalCount: summary.reduce((sum, cat) => sum + cat.count, 0),
      health,
      missing,
      missingTotal,
      recentRegistrations: buildRecentRegistrations(),
      recentUpdates: buildRecentUpdates(),
      footer,
    };
  } catch (error) {
    if (import.meta.env?.DEV) console.error("[buildMasterDataDashboardSnapshot]", error);
    return buildEmptySnapshot();
  }
}

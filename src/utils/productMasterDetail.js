/**
 * Project TITAN Sprint 8 — 제품관리 (Product Master · ERP/MES Master Data Hub · Read Only)
 *
 * 제품은 단순 CRUD 대상이 아니라 LOT Lifecycle · QR Workflow · Statistics · TDE(성적서)
 * 연결의 중심이 되는 Master 이다. 본 유틸은 제품 리스트 KPI / 리스트 메타(최근 생산·수정) /
 * 상세 Popup(재질 · 공정 · 생산 · 품질 · 성적서 · LOT · 출고 · 수정)에서 필요한 정보를
 * 기준정보 Master + Workflow/History/검사/성적서 Session 에서 자동 집계한다.
 *
 * 자동 집계/조회 전용: 생산 · 품질 · LOT · 출고 · 성적서 · 최근 수정
 * 입력 가능: 기본정보 · 재질 · 공정 (기존 제품 등록/수정 Modal 유지)
 *
 * 단일 진입:
 *   buildProductMasterSummary()      — Summary KPI 4카드
 *   buildProductListMeta()           — 리스트 최근 생산/수정 컬럼 Map
 *   getProductHealth(product)        — Product Health (🟢🟡🔴)
 *   getProductManagementIssues(p)    — 관리 필요 사유
 *   buildProductMasterDetail(product)— 상세 Popup Snapshot (9탭)
 */

import { getMasterDataByCategory } from "./masterData";
import { getSessionProductionRecords, isIncomingRegistered } from "./productionRecords";
import { resolveRecordCurrentProcess, CURRENT_PROCESS_CHAIN } from "./workflowProcessStatus";
import { getRecordWorkflowState } from "./ndkWorkflow";
import { getShipmentEvents } from "./titanHistorySession";
import { getInspectionLogs } from "./inspectionLogSession";
import { getCertificateFileEntries } from "./certificateSession";
import { getProductInspectionByPartNo } from "./productInspectionSession";
import { getAllMasterImportLogs } from "./masterExcelImportLog";

function hasText(value) {
  return String(value ?? "").trim().length > 0;
}

function pad2(value) {
  return String(value).padStart(2, "0");
}

function normKey(value) {
  return String(value ?? "").trim().toLowerCase();
}

function activeProducts() {
  return getMasterDataByCategory("products").filter((row) => row.active !== false);
}

/** code(SE_YYYYMMDD_nnnn)에서 등록/수정 proxy 일자 추출 */
function dateFromProductCode(code) {
  const match = String(code ?? "").match(/(20\d{6})/);
  if (!match) return "";
  const raw = match[1];
  return `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`;
}

/**
 * 제품 ↔ Workflow/품질/출고/성적서 매칭 인덱스 (partNo 기준 · O(n) 1회 구축).
 * 대량(950건) 제품에서 per-row 재조회를 방지한다.
 */
function buildProductIndex() {
  const productionMap = new Map();
  getSessionProductionRecords().forEach((record) => {
    const key = normKey(record.partNo) || normKey(record.partName);
    if (!key) return;
    if (!productionMap.has(key)) productionMap.set(key, []);
    productionMap.get(key).push(record);
  });

  const qualityMap = new Map();
  getInspectionLogs().forEach((log) => {
    const key = normKey(log.partNo) || normKey(log.partName);
    if (!key) return;
    if (!qualityMap.has(key)) qualityMap.set(key, []);
    qualityMap.get(key).push(log);
  });

  const shipmentMap = new Map();
  getShipmentEvents().forEach((event) => {
    const key = normKey(event.partNo) || normKey(event.partName);
    if (!key) return;
    if (!shipmentMap.has(key)) shipmentMap.set(key, []);
    shipmentMap.get(key).push(event);
  });

  const certMap = new Map();
  getCertificateFileEntries().forEach((entry) => {
    const key = normKey(entry.partNo) || normKey(entry.partName);
    if (!key) return;
    if (!certMap.has(key)) certMap.set(key, []);
    certMap.get(key).push(entry);
  });

  return { productionMap, qualityMap, shipmentMap, certMap };
}

function productKey(product) {
  return normKey(product?.partNo) || normKey(product?.name);
}

function hasInspectionCriteria(product) {
  try {
    return Boolean(getProductInspectionByPartNo(product?.partNo));
  } catch {
    return false;
  }
}

/**
 * 관리 필요 사유 — 재질 · 공정 · 거래처 · 검사기준.
 * (TDE Template 미보유는 향후 확장 · 현재 판정 제외)
 */
export function getProductManagementIssues(product) {
  const issues = [];
  if (!hasText(product?.company)) issues.push("거래처 없음");
  if (!hasText(product?.material)) issues.push("재질 없음");
  if (!hasText(product?.process)) issues.push("공정 없음");
  if (!hasInspectionCriteria(product)) issues.push("검사 기준 없음");
  // TODO(TDE): TDE Template 미연결 여부 — 향후 성적서 Template 연동 시 추가
  return issues;
}

/**
 * Product Health — 🟢 생산 가능 · 🟡 확인 필요 · 🔴 관리 필요.
 * 판정: 거래처·재질·공정 연결 + 품질 기준/최근 생산 여부.
 * @param {object} product
 * @param {{hasProduction?: boolean}} [ctx] 인덱스 기반 최근 생산 여부(옵션)
 */
export function getProductHealth(product, ctx = {}) {
  const missingCore =
    !hasText(product?.company) || !hasText(product?.material) || !hasText(product?.process);
  if (missingCore) {
    return { status: "error", label: "관리 필요", icon: "🔴" };
  }
  const hasCriteria = hasInspectionCriteria(product);
  const hasProduction =
    ctx.hasProduction ?? Boolean(product?.partNo && false);
  if (!hasCriteria && !hasProduction) {
    return { status: "warn", label: "확인 필요", icon: "🟡" };
  }
  return { status: "ok", label: "생산 가능", icon: "🟢" };
}

/**
 * Summary KPI — 전체 · 활성 · 생산 가능 · 관리 필요.
 * @returns {Array<{id,label,value,unit,tone?}>}
 */
export function buildProductMasterSummary() {
  try {
    const all = getMasterDataByCategory("products");
    const active = all.filter((row) => row.active !== false);
    const { productionMap } = buildProductIndex();

    let producible = 0;
    let needsCare = 0;
    active.forEach((product) => {
      const hasProduction = productionMap.has(productKey(product));
      const health = getProductHealth(product, { hasProduction });
      if (health.status === "ok") producible += 1;
      if (health.status === "error") needsCare += 1;
    });

    return [
      { id: "total", label: "전체 제품", value: all.length, unit: "개" },
      { id: "active", label: "활성 제품", value: active.length, unit: "개" },
      { id: "producible", label: "생산 가능 제품", value: producible, unit: "개" },
      {
        id: "needs-care",
        label: "관리 필요 제품",
        value: needsCare,
        unit: "개",
        tone: needsCare > 0 ? "danger" : undefined,
      },
    ];
  } catch (error) {
    if (import.meta.env?.DEV) console.error("[buildProductMasterSummary]", error);
    return [
      { id: "total", label: "전체 제품", value: 0, unit: "개" },
      { id: "active", label: "활성 제품", value: 0, unit: "개" },
      { id: "producible", label: "생산 가능 제품", value: 0, unit: "개" },
      { id: "needs-care", label: "관리 필요 제품", value: 0, unit: "개" },
    ];
  }
}

/** 리스트 컬럼용 메타 — partNo 기준 { recentProduction, recentUpdate, health } Map */
export function buildProductListMeta() {
  const meta = new Map();
  try {
    const { productionMap } = buildProductIndex();
    activeProducts().forEach((product) => {
      const key = productKey(product);
      const records = productionMap.get(key) ?? [];
      const recentProduction = records
        .map((r) => r.workDate || r.incomingDate)
        .filter(Boolean)
        .sort()
        .at(-1);
      const health = getProductHealth(product, { hasProduction: records.length > 0 });
      meta.set(product.id, {
        recentProduction: recentProduction || "—",
        recentUpdate: dateFromProductCode(product.code) || "—",
        healthStatus: health.status,
        healthLabel: health.label,
        healthIcon: health.icon,
      });
    });
  } catch (error) {
    if (import.meta.env?.DEV) console.error("[buildProductListMeta]", error);
  }
  return meta;
}

function progressOf(record) {
  const label = resolveRecordCurrentProcess(record)?.label ?? "";
  const idx = CURRENT_PROCESS_CHAIN.indexOf(label);
  if (idx < 0) return 0;
  return Math.round((idx / (CURRENT_PROCESS_CHAIN.length - 1)) * 100);
}

function qtyLabel(qty, unit) {
  return `${Number(qty ?? 0).toLocaleString("ko-KR")} ${unit || "EA"}`;
}

/** 재질 Master 매칭 (spec 등 부가정보) */
function findMaterialMaster(name) {
  const q = normKey(name);
  if (!q) return null;
  return getMasterDataByCategory("materials").find((row) => normKey(row.name) === q) ?? null;
}

/** 최근 수정 Timeline — 등록(code) + Import Log(products) */
function buildRecentUpdates(product, limit = 12) {
  const rows = [];
  const regDate = dateFromProductCode(product?.code);
  if (regDate) {
    rows.push({
      id: `reg-${product.id}`,
      sort: new Date(`${regDate}T00:00:00`).getTime() || 0,
      date: regDate,
      time: "--:--",
      type: "등록",
      label: `${product.name || product.partNo || "제품"} 등록`,
      user: "시스템",
    });
  }

  let logs = {};
  try {
    logs = getAllMasterImportLogs() ?? {};
  } catch {
    logs = {};
  }
  Object.values(logs)
    .filter((log) => log && (log.masterType === "products" || log.masterType === "product"))
    .forEach((log) => {
      const dt = log.datetime ? new Date(log.datetime) : null;
      const valid = dt && !Number.isNaN(dt.getTime());
      rows.push({
        id: log.id ?? `products-${log.datetime}`,
        sort: valid ? dt.getTime() : 0,
        date: valid
          ? `${dt.getFullYear()}-${pad2(dt.getMonth() + 1)}-${pad2(dt.getDate())}`
          : "—",
        time: valid ? `${pad2(dt.getHours())}:${pad2(dt.getMinutes())}` : "--:--",
        type: "Import",
        label: `제품 Excel Import${log.fileName ? ` · ${log.fileName}` : ""}`,
        user: log.user || "시스템",
      });
    });

  return rows.sort((a, b) => b.sort - a.sort).slice(0, limit);
}

/**
 * 제품 상세 Popup Snapshot (9탭).
 * @param {object|null} product
 */
export function buildProductMasterDetail(product) {
  const empty = {
    material: { primary: "—", secondary: "—", heatCondition: "—", note: "—" },
    process: { flow: "—", name: "—", equipment: "—", standardTime: "—", department: "—" },
    production: { summary: { lotCount: 0, recent: "—", running: 0, done: 0 }, rows: [] },
    quality: { summary: { count: 0, pass: 0, fail: 0, recent: "—" }, rows: [] },
    certificate: { summary: { recent: "—", count: 0, template: "—", pdf: "—" }, rows: [] },
    lots: [],
    shipments: [],
    recentUpdates: [],
    health: { status: "error", label: "관리 필요", icon: "🔴" },
    counts: { production: 0, quality: 0, certificate: 0, lots: 0, shipments: 0 },
  };
  if (!product) return empty;

  try {
    const { productionMap, qualityMap, shipmentMap, certMap } = buildProductIndex();
    const key = productKey(product);
    const records = productionMap.get(key) ?? [];
    const inspections = qualityMap.get(key) ?? [];
    const shipEvents = shipmentMap.get(key) ?? [];
    const certs = certMap.get(key) ?? [];

    // ── ② 재질 ──────────────────────────────────────────────
    const materialMaster = findMaterialMaster(product.material);
    const heatCondition =
      records.map((r) => r.heatTreatmentConditions).find(hasText) ||
      product.heatTreatmentConditions ||
      "—";
    const material = {
      primary: hasText(product.material) ? product.material : "—",
      secondary: materialMaster?.spec ? materialMaster.spec : "—",
      heatCondition,
      note: hasText(product.note) ? product.note : "—",
    };

    // ── ③ 공정 ──────────────────────────────────────────────
    const equipmentList = [
      ...new Set(records.map((r) => r.equipment).filter(hasText)),
    ];
    const heatType = records.map((r) => r.heatTreatment).find(hasText) || "";
    const process = {
      flow: [product.process, heatType].filter(hasText).join(" → ") || "—",
      name: hasText(product.process) ? product.process : "—",
      equipment: equipmentList.length ? equipmentList.join(", ") : "—",
      standardTime: "—", // 향후 공정 Master 표준시간 연동
      department: "—", // 향후 담당부서 연동
    };

    // ── ④ 생산 ──────────────────────────────────────────────
    const lotRecords = records.filter((r) => hasText(r.lotNo));
    const runningCount = records.filter((r) => {
      const state = getRecordWorkflowState(r);
      return state && state !== "출고완료";
    }).length;
    const doneCount = records.filter(
      (r) => getRecordWorkflowState(r) === "출고완료" || r.shipmentStatus === "출고완료"
    ).length;
    const recentProductionDate = records
      .map((r) => r.workDate || r.incomingDate)
      .filter(Boolean)
      .sort()
      .at(-1);
    const productionRows = records
      .map((r) => ({
        id: r.id,
        managementId: r.id || "—",
        lotNo: r.lotNo || "—",
        process: resolveRecordCurrentProcess(r)?.label ?? "—",
        workDate: r.workDate || r.incomingDate || "—",
        qty: qtyLabel(r.qty, r.unit),
      }))
      .sort((a, b) => String(b.workDate).localeCompare(String(a.workDate)));

    // ── ⑤ 품질 ──────────────────────────────────────────────
    const passCount = inspections.filter((l) => l.judgment === "합격").length;
    const failCount = inspections.filter((l) => l.judgment === "불합격").length;
    const recentInspection = inspections
      .map((l) => l.inspectionDate)
      .filter(Boolean)
      .sort()
      .at(-1);
    const qualityRows = inspections
      .map((l) => ({
        id: l.id,
        inspectionDate: l.inspectionDate || "—",
        lotNo: l.lotNo || l.managementId || "—",
        managementId: l.managementId || "—",
        judgment: l.judgment || "보류",
      }))
      .sort((a, b) => String(b.inspectionDate).localeCompare(String(a.inspectionDate)));

    // ── ⑥ 성적서(TDE) ───────────────────────────────────────
    const certRows = certs
      .map((c) => ({
        id: c.id,
        registeredDate: c.registeredDate || "—",
        managementId: c.managementId || "—",
        lotNo: c.lotNo || "—",
        fileName: c.fileName || c.originalName || "—",
      }))
      .sort((a, b) => String(b.registeredDate).localeCompare(String(a.registeredDate)));
    const certificate = {
      summary: {
        recent: certRows[0]?.registeredDate ?? "—",
        count: certRows.length,
        template: certRows.length ? "표준 성적서" : "—",
        pdf: certRows.length ? `${certRows.length}건` : "—",
      },
      rows: certRows,
    };

    // ── ⑦ LOT ───────────────────────────────────────────────
    const lots = lotRecords
      .map((r) => ({
        id: r.id,
        lotNo: r.lotNo || "—",
        managementId: r.id || "—",
        process: resolveRecordCurrentProcess(r)?.label ?? "—",
        progress: `${progressOf(r)}%`,
        status: getRecordWorkflowState(r) || r.shipmentStatus || "—",
      }))
      .sort((a, b) => String(b.lotNo).localeCompare(String(a.lotNo)));

    // ── ⑧ 출고 ──────────────────────────────────────────────
    const shipments = shipEvents
      .slice()
      .sort((a, b) => String(b.shippedAt).localeCompare(String(a.shippedAt)))
      .map((e) => ({
        id: e.id,
        shippedAt: e.shippedAt || "—",
        shipQty: qtyLabel(e.shipQty, e.unit),
        shippedBy: e.shippedBy || "—",
        company: e.company || "—",
      }));

    return {
      material,
      process,
      production: {
        summary: {
          lotCount: lotRecords.length,
          recent: recentProductionDate || "—",
          running: runningCount,
          done: doneCount,
        },
        rows: productionRows,
      },
      quality: {
        summary: {
          count: inspections.length,
          pass: passCount,
          fail: failCount,
          recent: recentInspection || "—",
        },
        rows: qualityRows,
      },
      certificate,
      lots,
      shipments,
      recentUpdates: buildRecentUpdates(product),
      health: getProductHealth(product, { hasProduction: records.length > 0 }),
      counts: {
        production: records.length,
        quality: inspections.length,
        certificate: certRows.length,
        lots: lots.length,
        shipments: shipments.length,
      },
    };
  } catch (error) {
    if (import.meta.env?.DEV) console.error("[buildProductMasterDetail]", error);
    return empty;
  }
}

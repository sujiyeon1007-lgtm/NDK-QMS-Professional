/**
 * Project TITAN Sprint 8 — 재질관리 (Material Master · Domain Master Workspace · Read Only 집계)
 *
 * Material 은 Domain Master Workspace(2-Panel) 공통 UI의 첫 화면이다. 본 유틸은
 * Material 리스트 KPI / 리스트 메타(연결 제품 수 · Health) / 우측 Detail Workspace(요약 카드 ·
 * 열처리 조건 · 적용 제품 · 관련 공정 · 관련 LOT · 성적서 기준 · 최근 수정)에서 필요한
 * 정보를 기준정보 Master + Workflow/검사/성적서 Session 에서 자동 집계한다.
 *
 * 자동 집계/조회 전용: 제품 · LOT · 공정 · 성적서 · 최근 수정
 * 입력 가능: 기본정보 · 열처리 조건 (재질 등록/수정 Modal 유지)
 *
 * 단일 진입:
 *   buildMaterialMasterSummary()      — Summary KPI 4카드
 *   buildMaterialListMeta()           — 리스트 연결 제품 수 / Health Map
 *   getMaterialHealth(material, ctx)  — Material Health (🟢🟡🔴)
 *   getMaterialManagementIssues(...)  — 관리 필요 사유
 *   buildMaterialMasterDetail(m)      — 우측 Detail Workspace Snapshot
 */

import { getMasterDataByCategory } from "./masterData";
import { getSessionProductionRecords } from "./productionRecords";
import { resolveRecordCurrentProcess } from "./workflowProcessStatus";
import { getRecordWorkflowState } from "./ndkWorkflow";
import { getInspectionLogs } from "./inspectionLogSession";
import { getCertificateFileEntries } from "./certificateSession";
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

function activeMaterials() {
  return getMasterDataByCategory("materials").filter((row) => row.active !== false);
}

/** code(SCM440 / m1 등)에는 날짜가 없어 import log 위주로만 timeline 구성 */
function dateFromCode(code) {
  const match = String(code ?? "").match(/(20\d{6})/);
  if (!match) return "";
  const raw = match[1];
  return `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`;
}

/**
 * Material ↔ Product / Workflow / 성적서 매칭 인덱스 (1회 구축).
 * - productsByMaterial: 재질명(lower) → product[]
 * - productionByPartNo · certByPartNo: partNo(lower) → record[]
 */
function buildMaterialIndex() {
  const productsByMaterial = new Map();
  getMasterDataByCategory("products").forEach((product) => {
    const key = normKey(product.material);
    if (!key) return;
    if (!productsByMaterial.has(key)) productsByMaterial.set(key, []);
    productsByMaterial.get(key).push(product);
  });

  const productionByPartNo = new Map();
  getSessionProductionRecords().forEach((record) => {
    const key = normKey(record.partNo) || normKey(record.partName);
    if (!key) return;
    if (!productionByPartNo.has(key)) productionByPartNo.set(key, []);
    productionByPartNo.get(key).push(record);
  });

  const certByPartNo = new Map();
  getCertificateFileEntries().forEach((entry) => {
    const key = normKey(entry.partNo) || normKey(entry.partName);
    if (!key) return;
    if (!certByPartNo.has(key)) certByPartNo.set(key, []);
    certByPartNo.get(key).push(entry);
  });

  return { productsByMaterial, productionByPartNo, certByPartNo };
}

function materialKey(material) {
  return normKey(material?.name) || normKey(material?.code);
}

function connectedProducts(material, index) {
  return index.productsByMaterial.get(materialKey(material)) ?? [];
}

/** 연결 제품 중 성적서가 1건이라도 있으면 성적서 기준 존재로 간주 */
function hasCertificateBasis(products, index) {
  return products.some((p) => (index.certByPartNo.get(normKey(p.partNo)) ?? []).length > 0);
}

/** 연결 제품/생산 기록에서 대표 열처리 조건 문자열 도출 */
function deriveHeatCondition(products, index) {
  for (const product of products) {
    const records = index.productionByPartNo.get(normKey(product.partNo)) ?? [];
    const cond = records.map((r) => r.heatTreatmentConditions).find(hasText);
    if (cond) return cond;
  }
  return "";
}

/** 연결 제품에서 대표 공정(최빈값) 도출 */
function deriveRepresentativeProcess(products, index) {
  const counter = new Map();
  products.forEach((product) => {
    let name = product.process;
    if (!hasText(name)) {
      const records = index.productionByPartNo.get(normKey(product.partNo)) ?? [];
      name = records.map((r) => r.heatTreatment).find(hasText) || "";
    }
    if (!hasText(name)) return;
    counter.set(name, (counter.get(name) ?? 0) + 1);
  });
  let best = "";
  let bestCount = 0;
  counter.forEach((count, name) => {
    if (count > bestCount) {
      best = name;
      bestCount = count;
    }
  });
  return best;
}

/**
 * 관리 필요 사유 — 규격 · 열처리 조건 · 연결 제품 · 성적서 기준.
 */
export function getMaterialManagementIssues(material, ctx = {}) {
  const issues = [];
  if (!hasText(material?.spec)) issues.push("규격 없음");
  if (!ctx.hasHeatCondition) issues.push("열처리 조건 없음");
  if (!ctx.productCount) issues.push("연결 제품 없음");
  if (!ctx.hasCertBasis) issues.push("성적서 기준 없음");
  return issues;
}

/**
 * Material Health — 🟢 정상 · 🟡 확인 필요 · 🔴 관리 필요.
 * 판정: 규격 · 열처리 조건 · 제품 연결 · 성적서 기준.
 */
export function getMaterialHealth(material, ctx = {}) {
  const specOk = hasText(material?.spec);
  if (!specOk || !ctx.productCount) {
    return { status: "error", label: "관리 필요", icon: "🔴" };
  }
  if (!ctx.hasHeatCondition || !ctx.hasCertBasis) {
    return { status: "warn", label: "확인 필요", icon: "🟡" };
  }
  return { status: "ok", label: "정상", icon: "🟢" };
}

function materialContext(material, index) {
  const products = connectedProducts(material, index);
  return {
    productCount: products.length,
    hasHeatCondition: hasText(deriveHeatCondition(products, index)),
    hasCertBasis: hasCertificateBasis(products, index),
  };
}

/**
 * Summary KPI — 전체 · 사용 중 · 제품 연결 완료 · 관리 필요.
 */
export function buildMaterialMasterSummary() {
  try {
    const all = getMasterDataByCategory("materials");
    const active = all.filter((row) => row.active !== false);
    const index = buildMaterialIndex();

    let linked = 0;
    let needsCare = 0;
    active.forEach((material) => {
      const ctx = materialContext(material, index);
      if (ctx.productCount > 0) linked += 1;
      if (getMaterialHealth(material, ctx).status === "error") needsCare += 1;
    });

    return [
      { id: "total", label: "전체 재질", value: all.length, unit: "종" },
      { id: "active", label: "사용 중 재질", value: active.length, unit: "종" },
      { id: "linked", label: "제품 연결 완료", value: linked, unit: "종" },
      {
        id: "needs-care",
        label: "관리 필요",
        value: needsCare,
        unit: "종",
        tone: needsCare > 0 ? "danger" : undefined,
      },
    ];
  } catch (error) {
    if (import.meta.env?.DEV) console.error("[buildMaterialMasterSummary]", error);
    return [
      { id: "total", label: "전체 재질", value: 0, unit: "종" },
      { id: "active", label: "사용 중 재질", value: 0, unit: "종" },
      { id: "linked", label: "제품 연결 완료", value: 0, unit: "종" },
      { id: "needs-care", label: "관리 필요", value: 0, unit: "종" },
    ];
  }
}

/** 리스트 컬럼용 메타 — id → { productCount, health* } */
export function buildMaterialListMeta() {
  const meta = new Map();
  try {
    const index = buildMaterialIndex();
    activeMaterials().forEach((material) => {
      const ctx = materialContext(material, index);
      const health = getMaterialHealth(material, ctx);
      meta.set(material.id, {
        productCount: ctx.productCount,
        healthStatus: health.status,
        healthLabel: health.label,
        healthIcon: health.icon,
      });
    });
  } catch (error) {
    if (import.meta.env?.DEV) console.error("[buildMaterialListMeta]", error);
  }
  return meta;
}

/** 최근 수정 Timeline — Import Log(materials) 중심 */
function buildRecentUpdates(material, limit = 12) {
  const rows = [];
  const regDate = dateFromCode(material?.code);
  if (regDate) {
    rows.push({
      id: `reg-${material.id}`,
      sort: new Date(`${regDate}T00:00:00`).getTime() || 0,
      date: regDate,
      time: "--:--",
      type: "등록",
      label: `${material.name || material.code || "재질"} 등록`,
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
    .filter((log) => log && (log.masterType === "materials" || log.masterType === "material"))
    .forEach((log) => {
      const dt = log.datetime ? new Date(log.datetime) : null;
      const valid = dt && !Number.isNaN(dt.getTime());
      rows.push({
        id: log.id ?? `materials-${log.datetime}`,
        sort: valid ? dt.getTime() : 0,
        date: valid
          ? `${dt.getFullYear()}-${pad2(dt.getMonth() + 1)}-${pad2(dt.getDate())}`
          : "—",
        time: valid ? `${pad2(dt.getHours())}:${pad2(dt.getMinutes())}` : "--:--",
        type: "Import",
        label: `재질 Excel Import${log.fileName ? ` · ${log.fileName}` : ""}`,
        user: log.user || "시스템",
      });
    });

  return rows.sort((a, b) => b.sort - a.sort).slice(0, limit);
}

/**
 * 우측 Detail Workspace Snapshot.
 * @param {object|null} material
 */
export function buildMaterialMasterDetail(material) {
  const empty = {
    summaryCard: { name: "—", spec: "—", productCount: 0, recentLot: "—", representativeHeat: "—" },
    heatTreatment: {
      hardness: "—",
      effectiveDepth: "—",
      representativeProcess: "—",
      temperature: "—",
      note: "—",
    },
    products: [],
    processes: [],
    lots: [],
    certificate: { template: "—", testStandard: "—", judgmentStandard: "—", count: 0 },
    recentUpdates: [],
    health: { status: "error", label: "관리 필요", icon: "🔴" },
    counts: { products: 0, processes: 0, lots: 0, certificate: 0 },
  };
  if (!material) return empty;

  try {
    const index = buildMaterialIndex();
    const products = connectedProducts(material, index);

    // 연결 제품 partNo 기준 생산/성적서 집계
    const lotRows = [];
    let certCount = 0;
    let recentLot = "";
    products.forEach((product) => {
      const records = index.productionByPartNo.get(normKey(product.partNo)) ?? [];
      records.forEach((r) => {
        if (hasText(r.lotNo)) {
          lotRows.push({
            id: r.id,
            lotNo: r.lotNo,
            partNo: product.partNo || "—",
            process: resolveRecordCurrentProcess(r)?.label ?? "—",
            status: getRecordWorkflowState(r) || r.shipmentStatus || "—",
            _date: r.workDate || r.incomingDate || "",
          });
        }
      });
      certCount += (index.certByPartNo.get(normKey(product.partNo)) ?? []).length;
    });
    lotRows.sort((a, b) => String(b._date).localeCompare(String(a._date)));
    recentLot = lotRows[0]?.lotNo ?? "";

    const heatCondition = deriveHeatCondition(products, index);
    const representativeProcess = deriveRepresentativeProcess(products, index);

    // 관련 공정 — 연결 제품 기준 공정 집계
    const processCounter = new Map();
    products.forEach((product) => {
      let name = product.process;
      if (!hasText(name)) {
        const records = index.productionByPartNo.get(normKey(product.partNo)) ?? [];
        name = records.map((r) => r.heatTreatment).find(hasText) || "";
      }
      if (!hasText(name)) return;
      processCounter.set(name, (processCounter.get(name) ?? 0) + 1);
    });
    const processMaster = getMasterDataByCategory("heatTreatment");
    const processes = [...processCounter.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([name, count], idx) => {
        const master = processMaster.find((p) => normKey(p.name) === normKey(name));
        return {
          id: master?.id ?? `proc-${idx}`,
          name,
          code: master?.code ?? "—",
          productCount: `${count}건`,
        };
      });

    const productRows = products
      .map((p) => ({
        id: p.id,
        partNo: p.partNo || "—",
        name: p.name || "—",
        company: p.company || "—",
        spec: p.spec || "—",
        status: p.active === false ? "미사용" : "사용",
      }))
      .sort((a, b) => String(a.name).localeCompare(String(b.name)));

    const ctx = {
      productCount: products.length,
      hasHeatCondition: hasText(heatCondition),
      hasCertBasis: certCount > 0,
    };

    return {
      summaryCard: {
        name: material.name || material.code || "—",
        spec: hasText(material.spec) ? material.spec : "—",
        productCount: products.length,
        recentLot: recentLot || "—",
        representativeHeat: representativeProcess || "—",
      },
      heatTreatment: {
        hardness: hasText(material.hardness) ? material.hardness : "—",
        effectiveDepth: hasText(material.effectiveDepth) ? material.effectiveDepth : "—",
        representativeProcess: representativeProcess || "—",
        temperature: heatCondition || "—",
        note: hasText(material.note) ? material.note : "—",
      },
      products: productRows,
      processes,
      lots: lotRows.map(({ _date, ...rest }) => rest),
      certificate: {
        // TDE(Document Engine) 연결 준비 — 현재는 조회 전용 요약
        template: certCount > 0 ? "표준 성적서" : "—",
        testStandard: hasText(material.spec) ? material.spec : "—",
        judgmentStandard: representativeProcess ? `${representativeProcess} 기준` : "—",
        count: certCount,
      },
      recentUpdates: buildRecentUpdates(material),
      health: getMaterialHealth(material, ctx),
      counts: {
        products: productRows.length,
        processes: processes.length,
        lots: lotRows.length,
        certificate: certCount,
      },
    };
  } catch (error) {
    if (import.meta.env?.DEV) console.error("[buildMaterialMasterDetail]", error);
    return empty;
  }
}

/**
 * Project TITAN Sprint 8 — 공정관리 (Process Master · Domain Master Workspace · Read Only 집계)
 *
 * Material Master Domain Workspace 패턴을 공정(heatTreatment) Master 에 적용.
 * 단일 진입:
 *   buildProcessMasterSummary()
 *   buildProcessListMeta()
 *   getProcessHealth(process, ctx)
 *   buildProcessMasterDetail(process)
 */

import { getMasterDataByCategory, getActiveEquipmentByHeatTreatment } from "./masterData";
import { getSessionProductionRecords } from "./productionRecords";
import { resolveRecordCurrentProcess } from "./workflowProcessStatus";
import { getRecordWorkflowState } from "./ndkWorkflow";
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

function activeProcesses() {
  return getMasterDataByCategory("heatTreatment").filter((row) => row.active !== false);
}

function processKey(process) {
  return normKey(process?.name) || normKey(process?.code);
}

function matchesProcessName(value, process) {
  const v = normKey(value);
  const name = normKey(process?.name);
  const code = normKey(process?.code);
  if (!v) return false;
  return v === name || v === code || (name && v.includes(name)) || (name && name.includes(v));
}

/** Process ↔ Product / Production / Equipment 인덱스 (1회 구축) */
function buildProcessIndex() {
  const allProducts = getMasterDataByCategory("products");
  const productByPartNo = new Map();
  allProducts.forEach((p) => {
    const k = normKey(p.partNo);
    if (k) productByPartNo.set(k, p);
  });

  const productsByProcess = new Map();
  const productionByProcess = new Map();

  const addProduct = (processKeyVal, product) => {
    if (!processKeyVal || !product) return;
    if (!productsByProcess.has(processKeyVal)) productsByProcess.set(processKeyVal, new Map());
    productsByProcess.get(processKeyVal).set(product.id, product);
  };

  allProducts.forEach((product) => {
    if (!hasText(product.process)) return;
    activeProcesses().forEach((proc) => {
      if (matchesProcessName(product.process, proc)) {
        addProduct(processKey(proc), product);
      }
    });
  });

  getSessionProductionRecords().forEach((record) => {
    const ht = record.heatTreatment;
    if (!hasText(ht)) return;
    activeProcesses().forEach((proc) => {
      if (!matchesProcessName(ht, proc)) return;
      const pk = processKey(proc);
      if (!productionByProcess.has(pk)) productionByProcess.set(pk, []);
      productionByProcess.get(pk).push(record);
      const product = productByPartNo.get(normKey(record.partNo));
      if (product) addProduct(pk, product);
    });
  });

  const productsByProcessArrays = new Map();
  productsByProcess.forEach((map, key) => {
    productsByProcessArrays.set(key, [...map.values()]);
  });

  return { productsByProcess: productsByProcessArrays, productionByProcess };
}

function connectedProducts(process, index) {
  return index.productsByProcess.get(processKey(process)) ?? [];
}

function connectedProduction(process, index) {
  return index.productionByProcess.get(processKey(process)) ?? [];
}

function connectedEquipment(process) {
  return getActiveEquipmentByHeatTreatment(process?.name ?? "");
}

function deriveRepresentativeCondition(records) {
  const counter = new Map();
  records.forEach((r) => {
    const c = r.heatTreatmentConditions?.trim();
    if (!c) return;
    counter.set(c, (counter.get(c) ?? 0) + 1);
  });
  let best = "";
  let bestCount = 0;
  counter.forEach((count, cond) => {
    if (count > bestCount) {
      best = cond;
      bestCount = count;
    }
  });
  return best;
}

function deriveRepresentativeEquipment(records, equipmentRows) {
  const counter = new Map();
  records.forEach((r) => {
    const eq = r.equipment?.trim();
    if (!eq) return;
    counter.set(eq, (counter.get(eq) ?? 0) + 1);
  });
  let best = "";
  let bestCount = 0;
  counter.forEach((count, eq) => {
    if (count > bestCount) {
      best = eq;
      bestCount = count;
    }
  });
  if (best) return best;
  return equipmentRows[0]?.name ?? equipmentRows[0]?.code ?? "";
}

function processContext(process, index) {
  const products = connectedProducts(process, index);
  const production = connectedProduction(process, index);
  const equipment = connectedEquipment(process);
  const standardTime = hasText(process?.standardTime);
  const representativeCondition = hasText(deriveRepresentativeCondition(production));
  return {
    productCount: products.length,
    equipmentCount: equipment.length,
    hasStandardTime: standardTime,
    hasRepresentativeCondition: representativeCondition,
    productionCount: production.length,
  };
}

export function getProcessManagementIssues(process, ctx = {}) {
  const issues = [];
  if (!ctx.equipmentCount) issues.push("설비 미연결");
  if (!ctx.hasStandardTime) issues.push("표준시간 없음");
  if (!ctx.productCount) issues.push("연결 제품 없음");
  // TODO: 작업자 미연결 — 향후 Worker Master 연동 시 추가
  return issues;
}

export function getProcessHealth(process, ctx = {}) {
  if (!ctx.equipmentCount || !ctx.productCount) {
    return { status: "error", label: "관리 필요", icon: "🔴" };
  }
  if (!ctx.hasStandardTime || !ctx.hasRepresentativeCondition) {
    return { status: "warn", label: "확인 필요", icon: "🟡" };
  }
  return { status: "ok", label: "정상", icon: "🟢" };
}

export function buildProcessMasterSummary() {
  try {
    const all = getMasterDataByCategory("heatTreatment");
    const active = all.filter((row) => row.active !== false);
    const index = buildProcessIndex();

    let equipmentLinked = 0;
    let needsCare = 0;
    active.forEach((process) => {
      const ctx = processContext(process, index);
      if (ctx.equipmentCount > 0) equipmentLinked += 1;
      if (getProcessHealth(process, ctx).status === "error") needsCare += 1;
    });

    return [
      { id: "total", label: "전체 공정", value: all.length, unit: "종" },
      { id: "active", label: "사용 중 공정", value: active.length, unit: "종" },
      { id: "equipment-linked", label: "설비 연결 완료", value: equipmentLinked, unit: "종" },
      {
        id: "needs-care",
        label: "관리 필요",
        value: needsCare,
        unit: "종",
        tone: needsCare > 0 ? "danger" : undefined,
      },
    ];
  } catch (error) {
    if (import.meta.env?.DEV) console.error("[buildProcessMasterSummary]", error);
    return [
      { id: "total", label: "전체 공정", value: 0, unit: "종" },
      { id: "active", label: "사용 중 공정", value: 0, unit: "종" },
      { id: "equipment-linked", label: "설비 연결 완료", value: 0, unit: "종" },
      { id: "needs-care", label: "관리 필요", value: 0, unit: "종" },
    ];
  }
}

export function buildProcessListMeta() {
  const meta = new Map();
  try {
    const index = buildProcessIndex();
    activeProcesses().forEach((process) => {
      const ctx = processContext(process, index);
      const health = getProcessHealth(process, ctx);
      meta.set(process.id, {
        productCount: ctx.productCount,
        healthStatus: health.status,
        healthLabel: health.label,
        healthIcon: health.icon,
      });
    });
  } catch (error) {
    if (import.meta.env?.DEV) console.error("[buildProcessListMeta]", error);
  }
  return meta;
}

function buildRecentUpdates(process, limit = 12) {
  const rows = [];
  let logs = {};
  try {
    logs = getAllMasterImportLogs() ?? {};
  } catch {
    logs = {};
  }
  Object.values(logs)
    .filter(
      (log) =>
        log &&
        (log.masterType === "heatTreatment" ||
          log.masterType === "processes" ||
          log.masterType === "process")
    )
    .forEach((log) => {
      const dt = log.datetime ? new Date(log.datetime) : null;
      const valid = dt && !Number.isNaN(dt.getTime());
      rows.push({
        id: log.id ?? `process-${log.datetime}`,
        sort: valid ? dt.getTime() : 0,
        date: valid
          ? `${dt.getFullYear()}-${pad2(dt.getMonth() + 1)}-${pad2(dt.getDate())}`
          : "—",
        time: valid ? `${pad2(dt.getHours())}:${pad2(dt.getMinutes())}` : "--:--",
        type: "Import",
        label: `공정 Excel Import${log.fileName ? ` · ${log.fileName}` : ""}`,
        user: log.user || "시스템",
      });
    });

  rows.push({
    id: `reg-${process.id}`,
    sort: 0,
    date: "—",
    time: "--:--",
    type: "등록",
    label: `${process.name || process.code || "공정"} Master 등록`,
    user: "시스템",
  });

  return rows.sort((a, b) => b.sort - a.sort).slice(0, limit);
}

export function buildProcessMasterDetail(process) {
  const empty = {
    summaryCard: {
      name: "—",
      code: "—",
      productCount: 0,
      recentLotCount: 0,
      representativeEquipment: "—",
    },
    standard: {
      standardTime: "—",
      representativeCondition: "—",
      department: "—",
    },
    equipment: [],
    products: [],
    materials: [],
    lots: [],
    recentUpdates: [],
    health: { status: "error", label: "관리 필요", icon: "🔴" },
    counts: { equipment: 0, products: 0, materials: 0, lots: 0 },
  };
  if (!process) return empty;

  try {
    const index = buildProcessIndex();
    const products = connectedProducts(process, index);
    const production = connectedProduction(process, index);
    const equipmentRows = connectedEquipment(process);

    const lotRows = production
      .filter((r) => hasText(r.lotNo))
      .map((r) => ({
        id: r.id,
        lotNo: r.lotNo,
        partNo: r.partNo || "—",
        process: resolveRecordCurrentProcess(r)?.label ?? "—",
        status: getRecordWorkflowState(r) || r.shipmentStatus || "—",
        _date: r.workDate || r.incomingDate || "",
      }))
      .sort((a, b) => String(b._date).localeCompare(String(a._date)));

    const uniqueLots = new Set(lotRows.map((r) => r.lotNo));

    const materialSet = new Map();
    products.forEach((p) => {
      const m = p.material?.trim();
      if (!m) return;
      if (!materialSet.has(normKey(m))) {
        materialSet.set(normKey(m), { id: normKey(m), name: m, spec: "—", productCount: 0 });
      }
      materialSet.get(normKey(m)).productCount += 1;
    });
    const materials = [...materialSet.values()]
      .map((m) => ({ ...m, productCount: `${m.productCount}건` }))
      .sort((a, b) => a.name.localeCompare(b.name));

    const productRows = products
      .map((p) => ({
        id: p.id,
        partNo: p.partNo || "—",
        name: p.name || "—",
        company: p.company || "—",
        material: p.material || "—",
        status: p.active === false ? "미사용" : "사용",
      }))
      .sort((a, b) => String(a.name).localeCompare(String(b.name)));

    const equipmentList = equipmentRows.map((eq) => ({
      id: eq.id,
      code: eq.code || "—",
      name: eq.name || "—",
      equipType: eq.equipType || "—",
      location: eq.location || "—",
    }));

    const repCondition = deriveRepresentativeCondition(production);
    const repEquipment = deriveRepresentativeEquipment(production, equipmentRows);
    const ctx = processContext(process, index);

    return {
      summaryCard: {
        name: process.name || "—",
        code: process.code || "—",
        productCount: products.length,
        recentLotCount: uniqueLots.size,
        representativeEquipment: repEquipment || "—",
      },
      standard: {
        standardTime: hasText(process.standardTime) ? process.standardTime : "—",
        representativeCondition: repCondition || "—",
        department: hasText(process.department) ? process.department : "—",
      },
      equipment: equipmentList,
      products: productRows,
      materials,
      lots: lotRows.map(({ _date, ...rest }) => rest),
      recentUpdates: buildRecentUpdates(process),
      health: getProcessHealth(process, ctx),
      counts: {
        equipment: equipmentList.length,
        products: productRows.length,
        materials: materials.length,
        lots: lotRows.length,
      },
    };
  } catch (error) {
    if (import.meta.env?.DEV) console.error("[buildProcessMasterDetail]", error);
    return empty;
  }
}

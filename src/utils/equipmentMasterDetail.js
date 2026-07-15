/**
 * Project TITAN Sprint 8 — 설비관리 (Equipment Master · Domain Master Workspace · Read Only 집계)
 *
 * Material → Process Master 패턴을 설비(equipment) Master 에 적용.
 * 단일 진입:
 *   buildEquipmentMasterSummary()
 *   buildEquipmentListMeta()
 *   getEquipmentHealth(equipment, ctx)
 *   buildEquipmentMasterDetail(equipment)
 *
 * QR 정보 탭은 조회 전용이며 Sprint 9 QR Workflow 연결을 위한 구조만 준비한다.
 */

import { getMasterDataByCategory } from "./masterData";
import { getSessionProductionRecords } from "./productionRecords";
import { resolveRecordCurrentProcess } from "./workflowProcessStatus";
import { getRecordWorkflowState } from "./ndkWorkflow";
import { getQrEquipmentListRows } from "./qrManagementSession";
import { getAllMasterImportLogs } from "./masterExcelImportLog";
import { getEquipmentById, getEquipmentRunStatusLabel } from "./equipmentWorkflowService";

function hasText(value) {
  return String(value ?? "").trim().length > 0;
}

function pad2(value) {
  return String(value).padStart(2, "0");
}

function normKey(value) {
  return String(value ?? "").trim().toLowerCase();
}

function activeEquipment() {
  return getMasterDataByCategory("equipment").filter((row) => row.active !== false);
}

/** 설비 ↔ 생산기록 · 제품 · QR 인덱스 (1회 구축) */
function buildEquipmentIndex() {
  const productByPartNo = new Map();
  getMasterDataByCategory("products").forEach((p) => {
    const k = normKey(p.partNo);
    if (k) productByPartNo.set(k, p);
  });

  const productionByEquipment = new Map();
  getSessionProductionRecords().forEach((record) => {
    const key = normKey(record.equipment);
    if (!key) return;
    if (!productionByEquipment.has(key)) productionByEquipment.set(key, []);
    productionByEquipment.get(key).push(record);
  });

  const qrByEquipment = new Map();
  try {
    getQrEquipmentListRows().forEach((row) => {
      qrByEquipment.set(normKey(row.entityKey), row);
    });
  } catch {
    // QR registry 미초기화 — 조회 전용이므로 무시
  }

  return { productByPartNo, productionByEquipment, qrByEquipment };
}

function equipmentKey(equipment) {
  return normKey(equipment?.code) || normKey(equipment?.name);
}

function connectedProduction(equipment, index) {
  return index.productionByEquipment.get(equipmentKey(equipment)) ?? [];
}

function qrRowFor(equipment, index) {
  return index.qrByEquipment.get(equipmentKey(equipment)) ?? null;
}

function recentWorkDate(records) {
  return records
    .map((r) => r.workDate || r.incomingDate)
    .filter(Boolean)
    .sort()
    .at(-1);
}

/** 가동 상태 — equipmentWorkflowService SSOT */
function deriveRunStatus(equipment) {
  const key = equipment?.code || equipment?.name || equipment?.id;
  const live = getEquipmentById(key);
  return getEquipmentRunStatusLabel(live?.status);
}

function equipmentContext(equipment, index) {
  const records = connectedProduction(equipment, index);
  const qrRow = qrRowFor(equipment, index);
  return {
    hasProcess: hasText(equipment?.equipType),
    hasQr: Boolean(qrRow?.hasQr),
    hasRecentWork: Boolean(recentWorkDate(records)),
    lotCount: new Set(records.filter((r) => hasText(r.lotNo)).map((r) => r.lotNo)).size,
    active: equipment?.active !== false,
  };
}

/** 관리 필요 사유 — 공정 미연결 · QR 미등록 · 최근 작업 없음 */
export function getEquipmentManagementIssues(equipment, ctx = {}) {
  const issues = [];
  if (!ctx.hasProcess) issues.push("공정 미연결");
  if (!ctx.hasQr) issues.push("QR 미등록");
  if (!ctx.hasRecentWork) issues.push("최근 작업 없음");
  // TODO: 작업자 미연결 — 향후 Worker Master 연동 시 추가
  return issues;
}

/** Equipment Health — 🟢 정상 · 🟡 확인 필요 · 🔴 관리 필요 */
export function getEquipmentHealth(equipment, ctx = {}) {
  if (!ctx.active || !ctx.hasProcess) {
    return { status: "error", label: "관리 필요", icon: "🔴" };
  }
  if (!ctx.hasQr || !ctx.hasRecentWork) {
    return { status: "warn", label: "확인 필요", icon: "🟡" };
  }
  return { status: "ok", label: "정상", icon: "🟢" };
}

export function buildEquipmentMasterSummary() {
  try {
    const all = getMasterDataByCategory("equipment");
    const active = all.filter((row) => row.active !== false);
    const index = buildEquipmentIndex();

    let processLinked = 0;
    let needsCare = 0;
    active.forEach((equipment) => {
      const ctx = equipmentContext(equipment, index);
      if (ctx.hasProcess) processLinked += 1;
      if (getEquipmentHealth(equipment, ctx).status === "error") needsCare += 1;
    });

    return [
      { id: "total", label: "전체 설비", value: all.length, unit: "대" },
      { id: "active", label: "가동 설비", value: active.length, unit: "대" },
      { id: "process-linked", label: "공정 연결 완료", value: processLinked, unit: "대" },
      {
        id: "needs-care",
        label: "관리 필요",
        value: needsCare,
        unit: "대",
        tone: needsCare > 0 ? "danger" : undefined,
      },
    ];
  } catch (error) {
    if (import.meta.env?.DEV) console.error("[buildEquipmentMasterSummary]", error);
    return [
      { id: "total", label: "전체 설비", value: 0, unit: "대" },
      { id: "active", label: "가동 설비", value: 0, unit: "대" },
      { id: "process-linked", label: "공정 연결 완료", value: 0, unit: "대" },
      { id: "needs-care", label: "관리 필요", value: 0, unit: "대" },
    ];
  }
}

export function buildEquipmentListMeta() {
  const meta = new Map();
  try {
    const index = buildEquipmentIndex();
    activeEquipment().forEach((equipment) => {
      const ctx = equipmentContext(equipment, index);
      const health = getEquipmentHealth(equipment, ctx);
      meta.set(equipment.id, {
        process: hasText(equipment.equipType) ? equipment.equipType : "—",
        healthStatus: health.status,
        healthLabel: health.label,
        healthIcon: health.icon,
      });
    });
  } catch (error) {
    if (import.meta.env?.DEV) console.error("[buildEquipmentListMeta]", error);
  }
  return meta;
}

function buildRecentUpdates(equipment, limit = 12) {
  const rows = [];
  let logs = {};
  try {
    logs = getAllMasterImportLogs() ?? {};
  } catch {
    logs = {};
  }
  Object.values(logs)
    .filter((log) => log && (log.masterType === "equipment" || log.masterType === "equipments"))
    .forEach((log) => {
      const dt = log.datetime ? new Date(log.datetime) : null;
      const valid = dt && !Number.isNaN(dt.getTime());
      rows.push({
        id: log.id ?? `equipment-${log.datetime}`,
        sort: valid ? dt.getTime() : 0,
        date: valid
          ? `${dt.getFullYear()}-${pad2(dt.getMonth() + 1)}-${pad2(dt.getDate())}`
          : "—",
        time: valid ? `${pad2(dt.getHours())}:${pad2(dt.getMinutes())}` : "--:--",
        type: "Import",
        label: `설비 Excel Import${log.fileName ? ` · ${log.fileName}` : ""}`,
        user: log.user || "시스템",
      });
    });

  rows.push({
    id: `reg-${equipment.id}`,
    sort: 0,
    date: "—",
    time: "--:--",
    type: "등록",
    label: `${equipment.name || equipment.code || "설비"} Master 등록`,
    user: "시스템",
  });

  return rows.sort((a, b) => b.sort - a.sort).slice(0, limit);
}

export function buildEquipmentMasterDetail(equipment) {
  const empty = {
    summaryCard: { name: "—", code: "—", process: "—", recentLotCount: 0, runStatus: "—" },
    qr: { registered: "미등록", qrNo: "—", createdAt: "—", statusLabel: "—" },
    info: { capacity: "—", maxLoad: "—", operatingHours: "—", note: "—" },
    processes: [],
    materials: [],
    lots: [],
    recentUpdates: [],
    health: { status: "error", label: "관리 필요", icon: "🔴" },
    counts: { processes: 0, materials: 0, lots: 0 },
  };
  if (!equipment) return empty;

  try {
    const index = buildEquipmentIndex();
    const records = connectedProduction(equipment, index);
    const qrRow = qrRowFor(equipment, index);

    // 담당 공정 — equipType 과 이름이 일치하는 공정 Master
    const processMaster = getMasterDataByCategory("heatTreatment");
    const processes = processMaster
      .filter((p) => normKey(p.name) === normKey(equipment.equipType) && p.active !== false)
      .map((p) => ({
        id: p.id,
        name: p.name || "—",
        code: p.code || "—",
        description: p.description || "—",
      }));

    // 처리 재질 — 생산기록의 제품 → 재질 집계
    const materialSet = new Map();
    records.forEach((r) => {
      const product = index.productByPartNo.get(normKey(r.partNo));
      const material = product?.material?.trim();
      if (!material) return;
      if (!materialSet.has(normKey(material))) {
        materialSet.set(normKey(material), { id: normKey(material), name: material, lotCount: 0 });
      }
    });
    // 재질별 LOT 수
    records.forEach((r) => {
      const product = index.productByPartNo.get(normKey(r.partNo));
      const material = product?.material?.trim();
      if (!material || !hasText(r.lotNo)) return;
      const entry = materialSet.get(normKey(material));
      if (entry) entry.lotCount += 1;
    });
    const materials = [...materialSet.values()]
      .map((m) => ({ id: m.id, name: m.name, lotCount: `${m.lotCount}건` }))
      .sort((a, b) => a.name.localeCompare(b.name));

    // 최근 작업 LOT
    const lots = records
      .filter((r) => hasText(r.lotNo))
      .map((r) => ({
        id: r.id,
        lotNo: r.lotNo,
        partNo: r.partNo || "—",
        process: resolveRecordCurrentProcess(r)?.label ?? "—",
        workDate: r.workDate || r.incomingDate || "—",
        status: getRecordWorkflowState(r) || r.shipmentStatus || "—",
        _date: r.workDate || r.incomingDate || "",
      }))
      .sort((a, b) => String(b._date).localeCompare(String(a._date)));

    const uniqueLots = new Set(lots.map((r) => r.lotNo));
    const ctx = equipmentContext(equipment, index);

    return {
      summaryCard: {
        name: equipment.name || "—",
        code: equipment.code || "—",
        process: hasText(equipment.equipType) ? equipment.equipType : "—",
        recentLotCount: uniqueLots.size,
        runStatus: deriveRunStatus(equipment),
      },
      qr: {
        // 조회 전용 — Sprint 9 QR Workflow 연결 준비
        registered: qrRow?.hasQr ? "등록" : "미등록",
        qrNo: qrRow?.hasQr ? qrRow.entityKey || equipment.code : "—",
        createdAt: qrRow?.hasQr ? qrRow.createdAtLabel || "—" : "—",
        statusLabel: qrRow?.qrStatusLabel || (qrRow?.hasQr ? "발급 완료" : "미등록"),
      },
      info: {
        capacity: hasText(equipment.capacity) ? equipment.capacity : "—",
        maxLoad: hasText(equipment.maxLoad) ? equipment.maxLoad : "—",
        operatingHours: hasText(equipment.operatingHours) ? equipment.operatingHours : "—",
        note: hasText(equipment.note) ? equipment.note : "—",
      },
      processes,
      materials,
      lots: lots.map(({ _date, ...rest }) => rest),
      recentUpdates: buildRecentUpdates(equipment),
      health: getEquipmentHealth(equipment, ctx),
      counts: {
        processes: processes.length,
        materials: materials.length,
        lots: lots.length,
      },
    };
  } catch (error) {
    if (import.meta.env?.DEV) console.error("[buildEquipmentMasterDetail]", error);
    return empty;
  }
}

/**
 * Project TITAN V2.0 — Control Room Workspace Data (Engine SSOT)
 *
 * Blueprint ② 설비현황 (Control Room)
 * - LOT 중심 실시간 관제 화면 (읽기 전용)
 * - 상단 KPI 7 + View Tab(설비 / LOT / 제품)
 * - 모든 값은 TitanDataEngine 런타임 계산 (Hard Coding · Mock 금지)
 *
 * Sprint 3A — Control Room Foundation
 *   ControlRoomWorkspaceData · KPI 7 Runtime · View Tab 구성
 */

import { getTitanDataEngine } from "../foundation/data";
import {
  isRc1LotChargeReadyStatus,
  isRc1LotPreStartStatus,
  normalizeRc1LotOperationalStatus,
} from "../config/equipmentConfig";
import {
  getEquipmentDetailSnapshot,
  getEquipmentListGroupedByProcess,
  getEquipmentSummary,
  getLotProducts,
  formatLotProductSummaryLabel,
} from "./equipmentWorkflowService";
import { collectDistinctLotNumbers, getLotBundle } from "./lotBundleService";
import { resolveChargeQty } from "./equipmentChargingQty";
import { getSessionProductionRecords } from "./productionRecords";
import { registerWorkflowScreenCacheInvalidator } from "./titanWorkflowRefresh";

/** Equipment card display helpers (UI · Blueprint ② 설비 View) */

/**
 * P0-023 multi-charge — "SCM440 외 2건" product label
 * @param {object} card getEquipmentMonitorCard row
 */
export function formatEquipmentCardProductLabel(card) {
  const fallback =
    String(card?.currentProductName ?? card?.currentMaterial ?? "").trim() || null;
  const equipmentId = String(card?.equipmentId ?? "").trim();
  if (!equipmentId || card?.status !== "running") return fallback;

  try {
    const equipment = getTitanDataEngine().equipment.getById(equipmentId);
    const runningLotNo = String(card?.currentLotNo ?? equipment?.runningSession?.lotNo ?? "").trim();
    if (!runningLotNo) return fallback;

    const products = getLotProducts(runningLotNo, equipment);
    return formatLotProductSummaryLabel(products) || fallback;
  } catch {
    return fallback;
  }
}

/**
 * Total charge qty label for card — sums multi-target chargeQty when present
 * @param {object} card
 */
export function formatEquipmentCardChargeQtyLabel(card) {
  const equipmentId = String(card?.equipmentId ?? "").trim();
  if (!equipmentId || card?.status !== "running") {
    return card?.chargeQtyLabel ?? null;
  }

  try {
    const equipment = getTitanDataEngine().equipment.getById(equipmentId);
    const session = equipment?.status === "running" ? equipment?.runningSession : null;
    const targets = Array.isArray(session?.chargeTargets) ? session.chargeTargets : [];

    if (targets.length > 1) {
      const total = targets.reduce(
        (sum, target) => sum + (Number(target?.chargeQty) || 0),
        0
      );
      if (total > 0) {
        return `${total.toLocaleString("ko-KR")} EA`;
      }
    }

    const sessionQty = Number(session?.chargeQty) || 0;
    if (sessionQty > 0) {
      return `${sessionQty.toLocaleString("ko-KR")} EA`;
    }
  } catch {
    // fall through
  }

  return card?.chargeQtyLabel ?? null;
}

/** Card row + display fields for Control Room equipment grid */
export function enrichEquipmentCardDisplay(card) {
  if (!card) return card;
  return {
    ...card,
    currentProductName: formatEquipmentCardProductLabel(card),
    chargeQtyLabel: formatEquipmentCardChargeQtyLabel(card),
  };
}

/** View Tab 구성 (Blueprint ② — 설비 / LOT / 제품) */
export const CONTROL_ROOM_VIEWS = Object.freeze([
  { id: "equipment", label: "설비 View", description: "공정별 설비 실시간 관제" },
  { id: "lot", label: "LOT View", description: "LOT 중심 진행 Monitor" },
  { id: "product", label: "제품 View", description: "제품 기준 공정 추적" },
]);

/** Sprint 3A 기본 View — 설비 View (LOT/제품 View는 3C/3D에서 구현) */
export const CONTROL_ROOM_DEFAULT_VIEW = "equipment";

/**
 * KPI 7 카드 구성 (Blueprint ② Control Room 상단 KPI)
 * value 는 buildControlRoomKpis() 런타임 계산 결과를 매핑
 */
export const CONTROL_ROOM_KPI_CARDS = Object.freeze([
  { id: "runningEquipment", label: "현재 가동 설비", countUnit: "대", tone: "production", icon: "precisionManufacturing" },
  { id: "utilizationRate", label: "가동률", countUnit: "%", tone: "incoming", icon: "today" },
  { id: "productionLots", label: "생산중 LOT", countUnit: "건", tone: "production", icon: "inventory" },
  { id: "waitingLots", label: "대기 LOT", countUnit: "건", tone: "prod-wait", icon: "hourglass" },
  { id: "alarms", label: "알람", countUnit: "건", tone: "hold", icon: "warning" },
  { id: "productionDone", label: "금일 생산완료", countUnit: "건", tone: "complete", icon: "taskAlt" },
  { id: "inspectionWait", label: "금일 검사대기", countUnit: "건", tone: "inspect", icon: "factCheck" },
]);

/** DashboardStore 캐시 갱신 — Workflow 이벤트 · 수동 새로고침 */
let controlRoomRecordsCache = null;
let controlRoomRecordsSnapshot = null;

export function invalidateControlRoomWorkspaceCache() {
  controlRoomRecordsCache = null;
  controlRoomRecordsSnapshot = null;
}

export function refreshControlRoomCache() {
  invalidateControlRoomWorkspaceCache();
  try {
    return getTitanDataEngine().dashboard.refreshCache();
  } catch {
    return null;
  }
}

/** productionStore row → record (payload 평탄화) */
function mapProductionStoreRowToRecord(row) {
  const payload = row?.payload && typeof row.payload === "object" ? row.payload : {};
  const id = String(payload.id ?? payload.mesManagementNo ?? row.productionId ?? "").trim();
  if (!id) return null;
  return { ...payload, id };
}

/** Session overlay — LOT · Workflow runtime fields (SSOT for Control Room) */
function mergeSessionOverlayOntoRecords(productionRecords, sessionRecords) {
  const sessionById = new Map();
  sessionRecords.forEach((row) => {
    const id = String(row?.id ?? row?.mesManagementNo ?? "").trim();
    if (id) sessionById.set(id, row);
  });

  const merged = productionRecords.map((row) => {
    const id = String(row?.id ?? row?.mesManagementNo ?? "").trim();
    const session = sessionById.get(id);
    if (!session) return row;
    return {
      ...row,
      ...session,
      id: row.id ?? session.id,
    };
  });

  const prodIds = new Set(
    merged.map((row) => String(row?.id ?? row?.mesManagementNo ?? "").trim()).filter(Boolean)
  );
  sessionRecords.forEach((session) => {
    const id = String(session?.id ?? session?.mesManagementNo ?? "").trim();
    if (id && !prodIds.has(id)) merged.push(session);
  });

  return merged;
}

/**
 * Control Room — TitanDataEngine productionStore 기반 records
 * (Workflow KPI · 제품 View용)
 * @returns {object[]}
 */
export function getControlRoomRecords() {
  const sessionSnapshot = getSessionProductionRecords();
  if (controlRoomRecordsSnapshot === sessionSnapshot && controlRoomRecordsCache) {
    return controlRoomRecordsCache;
  }

  try {
    getTitanDataEngine().dashboard.refreshCache();
    const rows = getTitanDataEngine().production.list();
    const records = rows.map(mapProductionStoreRowToRecord).filter(Boolean);
    if (records.length > 0) {
      const merged = mergeSessionOverlayOntoRecords(records, sessionSnapshot);
      controlRoomRecordsCache = merged;
      controlRoomRecordsSnapshot = sessionSnapshot;
      return merged;
    }
  } catch {
    // legacy fallback below
  }

  controlRoomRecordsCache = sessionSnapshot;
  controlRoomRecordsSnapshot = sessionSnapshot;
  return sessionSnapshot;
}

/**
 * Control Room — TitanDataEngine lotStore 기반 LOT 목록
 * (LOT KPI · LOT View용)
 * @returns {object[]}
 */
export function getControlRoomLots() {
  try {
    return getTitanDataEngine().lot.list();
  } catch {
    return [];
  }
}

function normalizeControlRoomStatus(row) {
  return String(row?.status ?? "").replace(/\s+/g, "");
}

export function matchesControlRoomLotKpi(row, lotFilter) {
  const status = normalizeControlRoomStatus(row);
  const terminalOrNextStep =
    status.includes("완료") ||
    status.includes("검사") ||
    status.includes("성적서") ||
    status.includes("출고");

  switch (lotFilter) {
    case "production":
      return (
        !terminalOrNextStep &&
        (status.includes("생산중") || status.includes("진행") || status.includes("운전") || status.includes("열처리"))
      );
    case "waiting":
      return (
        !terminalOrNextStep &&
        (isRc1LotChargeReadyStatus(status) ||
          status.includes("장입") ||
          status === "대기" ||
          status.includes("대기LOT"))
      );
    case "done":
      return status.includes("생산완료");
    case "inspectionWait":
      return status.includes("검사대기") && !status.includes("검사완료");
    default:
      return true;
  }
}

/**
 * KPI 7 런타임 계산 (Engine 기반 · Hard Coding 금지)
 * @param {object[]} [records] getControlRoomRecords() 기본값
 * @returns {{runningEquipment:number, utilizationRate:number, productionLots:number, waitingLots:number, alarms:number, productionDone:number, inspectionWait:number}}
 */
export function buildControlRoomKpis(records = getControlRoomRecords()) {
  const equipment = getEquipmentSummary();
  const lots = getControlRoomLots();
  const lotRows = buildControlRoomLotMonitorRows(lots, records);

  const runningEquipment = Number(equipment?.running ?? 0);
  const totalEquipment = Number(equipment?.total ?? 0);
  const utilizationRate =
    totalEquipment > 0 ? Math.round((runningEquipment / totalEquipment) * 100) : 0;
  const alarms = Number(equipment?.maintenance ?? 0);

  const productionLots = lotRows.filter((row) => matchesControlRoomLotKpi(row, "production")).length;
  const waitingLots = lotRows.filter((row) => matchesControlRoomLotKpi(row, "waiting")).length;
  const productionDone = lotRows.filter((row) => matchesControlRoomLotKpi(row, "done")).length;
  const inspectionWait = lotRows.filter((row) => matchesControlRoomLotKpi(row, "inspectionWait")).length;

  return {
    runningEquipment,
    utilizationRate,
    productionLots,
    waitingLots,
    alarms,
    productionDone,
    inspectionWait,
  };
}

/** KPI 7 카드 + 런타임 value 결합 (UI 바인딩용) */
export function buildControlRoomKpiCards(records = getControlRoomRecords()) {
  const values = buildControlRoomKpis(records);
  return CONTROL_ROOM_KPI_CARDS.map((card) => ({
    ...card,
    value: values[card.id] ?? 0,
    filterable: true,
  }));
}

/** Control Room Engine 연동 스냅샷 — QA · 디버그 */
export function getControlRoomSnapshot() {
  try {
    const engine = getTitanDataEngine();
    refreshControlRoomCache();
    return {
      source: "engine",
      kpi: buildControlRoomKpis(),
      recordCount: getControlRoomRecords().length,
      lotCount: getControlRoomLots().length,
      equipment: getEquipmentSummary(),
      pipeline: engine.getPipelineStatus(),
    };
  } catch (error) {
    return {
      source: "legacy",
      recordCount: getSessionProductionRecords().length,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Blueprint ② LOT View — Monitor Grid (SSOT)
 * LOT · 거래처 · 제품 · 설비 · 공정 · 상태 · 작업자 · 시작시간 · 예상 종료 · 진행률
 * 관리번호 · 품번은 검색/상세 전용으로 row에 유지하고 Grid 컬럼에는 표시하지 않는다.
 */
export const CONTROL_ROOM_LOT_COLUMNS = Object.freeze([
  { id: "lotNo", label: "LOT" },
  { id: "company", label: "거래처" },
  { id: "productName", label: "제품" },
  { id: "equipmentName", label: "설비" },
  { id: "process", label: "공정" },
  { id: "status", label: "상태" },
  { id: "operator", label: "작업자" },
  { id: "startTime", label: "시작시간" },
  { id: "expectedEndTime", label: "예상 종료" },
  { id: "progress", label: "진행률" },
]);

/** Equipment View — Engine → WorkspaceData (Sprint 3C Architecture) */
export function getControlRoomEquipmentGroups() {
  return getEquipmentListGroupedByProcess();
}

export function getControlRoomEquipmentSummary() {
  return getEquipmentSummary();
}

export function getControlRoomEquipmentDetail(equipmentId) {
  return getEquipmentDetailSnapshot(equipmentId);
}

function readEquipmentStoreIndex() {
  try {
    const list = getTitanDataEngine().equipment.list();
    /** @type {Map<string, object>} */
    const byId = new Map();
    /** @type {Map<string, object>} */
    const sessionByLot = new Map();

    list.forEach((row) => {
      byId.set(row.equipmentId, row);
      if (row.runningSession?.lotNo) {
        sessionByLot.set(row.runningSession.lotNo, {
          ...row.runningSession,
          equipmentId: row.equipmentId,
          equipmentName: row.equipmentName,
        });
      }
      (row.chargeableLots ?? []).forEach((chargeRow) => {
        if (chargeRow.lotNo && !sessionByLot.has(chargeRow.lotNo)) {
          sessionByLot.set(chargeRow.lotNo, {
            lotNo: chargeRow.lotNo,
            equipmentId: row.equipmentId,
            equipmentName: row.equipmentName,
            operator: null,
            startTime: null,
            expectedEndTime: null,
            progress: 0,
          });
        }
      });
    });

    return { byId, sessionByLot };
  } catch {
    return { byId: new Map(), sessionByLot: new Map() };
  }
}

function resolveRecordCompany(record, fallback = "") {
  const candidates = [
    record?.company,
    record?.companyName,
    record?.customerName,
    record?.customerCompany,
    record?.거래처,
  ];
  for (const value of candidates) {
    const text = String(value ?? "").trim();
    if (text) return text;
  }
  return fallback;
}

function buildRecordIndexByLot(records = getControlRoomRecords()) {
  /** @type {Map<string, { company?: string, managementId?: string, partNo?: string, productName?: string, chargeStartAt?: string, chargeEndAt?: string, lotItems: object[] }>} */
  const index = new Map();
  records.forEach((record) => {
    const lotNo = String(record.lotNo ?? "").trim();
    if (!lotNo) return;
    const existing = index.get(lotNo) ?? { lotItems: [] };
    const workLog = record.productionWorkLog ?? {};
    const lotItem = {
      sourceRecordId: record.id ?? record.mesManagementNo,
      managementId: record.id ?? record.mesManagementNo,
      partNo: record.partNo ?? record.productNo,
      productName: record.partName ?? record.productName,
      material: record.material,
      company: resolveRecordCompany(record, existing.company),
      chargeQty: resolveChargeQty(record, { lotNo: record.lotNo }),
    };
    const lotItems = [...(existing.lotItems ?? [])];
    if (!lotItems.some((row) => String(row.sourceRecordId) === String(lotItem.sourceRecordId))) {
      lotItems.push(lotItem);
    }
    index.set(lotNo, {
      company: resolveRecordCompany(record, existing.company),
      managementId: existing.managementId ?? record.id ?? record.mesManagementNo,
      partNo: existing.partNo ?? record.partNo ?? record.productNo,
      productName:
        formatLotProductSummaryLabel(lotItems) ||
        existing.productName ||
        record.partName ||
        record.productName,
      chargeStartAt:
        String(workLog.startAt ?? record.chargeStartAt ?? existing.chargeStartAt ?? "").trim() ||
        undefined,
      chargeEndAt:
        String(workLog.endAt ?? record.chargeEndAt ?? existing.chargeEndAt ?? "").trim() ||
        undefined,
      lotItems,
      productCount: lotItems.length,
      totalQty: lotItems.reduce((sum, row) => sum + (Number(row.chargeQty) || 0), 0),
    });
  });
  return index;
}

function resolveRunningSessionForLot(equipment, lotNo) {
  const lotKey = String(lotNo ?? "").trim();
  if (!equipment || !lotKey) return null;
  if (equipment.status !== "running") return null;
  const session = equipment.runningSession ?? null;
  if (!session) return null;
  return String(session.lotNo ?? "").trim() === lotKey ? session : null;
}

function resolveControlRoomLotMonitorTimes({ lot, lotNo, session, equipment, recordMeta }) {
  const status = normalizeControlRoomStatus(lot);
  const isWaiting = isRc1LotPreStartStatus(status);
  const isRunning =
    status.includes("열처리") ||
    status.includes("운전") ||
    status.includes("진행") ||
    status.includes("생산중");
  const isDone = status.includes("완료");

  if (isWaiting) {
    return { startTime: "—", expectedEndTime: "—" };
  }

  const runningSession = resolveRunningSessionForLot(equipment, lotNo);
  const startFromRecord = String(recordMeta?.chargeStartAt ?? "").trim();
  const endFromRecord = String(recordMeta?.chargeEndAt ?? "").trim();

  if (isRunning) {
    const startTime =
      runningSession?.startTime ??
      session?.startTime ??
      startFromRecord ??
      "—";
    const expectedEndTime =
      runningSession?.expectedEndTime ?? session?.expectedEndTime ?? "—";
    return {
      startTime: startTime || "—",
      expectedEndTime: expectedEndTime || "—",
    };
  }

  if (isDone) {
    return {
      startTime: startFromRecord || runningSession?.startTime || session?.startTime || "—",
      expectedEndTime: endFromRecord || runningSession?.expectedEndTime || session?.expectedEndTime || "—",
    };
  }

  return { startTime: "—", expectedEndTime: "—" };
}

/**
 * LOT Monitor Grid rows (Blueprint 11 Column · Engine Binding)
 * @param {object[]} [lots]
 * @param {object[]} [records]
 */
export function buildControlRoomLotMonitorRows(
  lots = getControlRoomLots(),
  records = getControlRoomRecords()
) {
  const { byId: equipmentById, sessionByLot } = readEquipmentStoreIndex();
  const recordByLot = buildRecordIndexByLot(records);
  const lotStoreByNo = new Map(
    lots.map((lot) => [String(lot.lotNo ?? "").trim(), lot]).filter(([key]) => key)
  );

  return collectDistinctLotNumbers(records).map((lotNo) => {
    const lot = lotStoreByNo.get(lotNo) ?? { lotNo };
    const bundle = getLotBundle(lotNo, { records });
    const session = sessionByLot.get(lotNo);
    const equipmentId = bundle?.equipmentId || lot.equipmentId || session?.equipmentId || null;
    const equipment = equipmentId ? equipmentById.get(equipmentId) : null;
    const recordMeta = recordByLot.get(lotNo) ?? { lotItems: [] };
    const lotItems = bundle?.lotItems?.length
      ? bundle.lotItems
      : recordMeta.lotItems?.length > 0
        ? recordMeta.lotItems
        : getLotProducts(lotNo, equipment);
    const progress = Number(bundle?.progress ?? lot.progress ?? session?.progress ?? 0);
    const runningSession = resolveRunningSessionForLot(equipment, lotNo);
    const { startTime, expectedEndTime } = resolveControlRoomLotMonitorTimes({
      lot,
      lotNo,
      session,
      equipment,
      recordMeta,
    });

    return {
      lotNo,
      managementId: bundle?.managementId || lot.managementId || recordMeta.managementId || "—",
      productName:
        bundle?.productLabel ||
        formatLotProductSummaryLabel(lotItems) ||
        lot.productName ||
        recordMeta.productName ||
        "—",
      partNo: bundle?.partNo || recordMeta.partNo || lot.partNo || "—",
      company: bundle?.company || resolveRecordCompany({ ...recordMeta, ...lot }, "—"),
      equipmentName: bundle?.equipmentName || equipment?.equipmentName || equipmentId || "—",
      equipmentId: equipmentId ?? "",
      process: bundle?.process || lot.process || equipment?.process || "—",
      operator: bundle?.operator || runningSession?.operator || session?.operator || "—",
      progress,
      progressLabel: progress > 0 ? `${progress}%` : "—",
      status: normalizeRc1LotOperationalStatus(bundle?.status ?? lot.status, { lotNo }),
      startTime,
      expectedEndTime,
      lotItems,
      productCount: lotItems.length,
      lotItemCount: lotItems.length,
      totalQty:
        bundle?.totalQty ||
        recordMeta.totalQty ||
        lotItems.reduce((sum, row) => sum + (Number(row.chargeQty) || 0), 0),
    };
  });
}

/**
 * LOT Timeline Summary (Blueprint ② · Read Only)
 * @param {string} lotNo
 * @param {number} [limit]
 */
export function getControlRoomLotTimelineSummary(lotNo, limit = 5) {
  const key = String(lotNo ?? "").trim();
  if (!key) return [];
  try {
    return getTitanDataEngine()
      .timeline.listByLotNo(key)
      .slice(0, limit)
      .map((row) => ({
        id: row.id,
        time: row.time ?? "—",
        title: row.title ?? "—",
        detail: row.detail ?? row.target ?? "",
        user: row.user ?? "—",
      }));
  } catch {
    return [];
  }
}

/**
 * LOT Popup detail (Blueprint ② · Read Only)
 * @param {string} lotNo
 */
export function getControlRoomLotDetail(lotNo) {
  const key = String(lotNo ?? "").trim();
  if (!key) return null;

  const bundle = getLotBundle(key);
  const row = buildControlRoomLotMonitorRows().find((item) => item.lotNo === key);
  if (!row && !bundle) return null;

  const lotItems = bundle?.lotItems ?? row?.lotItems ?? getLotProducts(key);

  return {
    ...(row ?? {}),
    ...(bundle ?? {}),
    lotNo: key,
    lotItems,
    productName: formatLotProductSummaryLabel(lotItems) || bundle?.productLabel || row?.productName,
    timelineSummary: getControlRoomLotTimelineSummary(key, 7),
  };
}

/**
 * Blueprint ② Product View — 제품 중심 Monitor Grid (SSOT)
 * 제품명 · 품번 · 고객사 · 현재 LOT · 현재 설비 · 진행 상태 · 작업자 · 진행률 · LOT 수
 * LOT View 복사 ❌ — 제품(품번+고객사) 기준으로 LOT 집계
 */
export const CONTROL_ROOM_PRODUCT_COLUMNS = Object.freeze([
  { id: "productName", label: "제품명" },
  { id: "partNo", label: "품번" },
  { id: "company", label: "고객사" },
  { id: "currentLotNo", label: "현재 LOT" },
  { id: "equipmentName", label: "현재 설비" },
  { id: "status", label: "진행 상태" },
  { id: "operator", label: "작업자" },
  { id: "progress", label: "진행률" },
  { id: "lotCount", label: "LOT 수" },
]);

/** 진행 중(운전/열처리/진행) LOT 우선순위 판정 */
function scoreProductLotActivity(lotRow) {
  const status = String(lotRow?.status ?? "");
  if (status.includes("운전") || status.includes("진행") || status.includes("열처리")) {
    return 100 + Number(lotRow?.progress ?? 0);
  }
  if (status.includes("장입") || status.includes("대기")) {
    return 10;
  }
  return Number(lotRow?.progress ?? 0);
}

function buildProductKey(record) {
  const partNo = String(record.partNo ?? record.productNo ?? "").trim();
  const productName = String(record.partName ?? record.productName ?? "").trim();
  const company = String(record.company ?? "").trim();
  return `${company}::${partNo}::${productName}`;
}

function resolveLotNoForProductKey(productKey, records = getControlRoomRecords()) {
  const matchingRecords = records.filter((record) => buildProductKey(record) === productKey);
  for (const record of matchingRecords) {
    const lotNo = String(record.lotNo ?? "").trim();
    if (lotNo) return lotNo;
  }

  const sourceIds = new Set(
    matchingRecords.map((record) => String(record.id ?? record.mesManagementNo ?? "").trim()).filter(Boolean)
  );
  if (sourceIds.size === 0) return "";

  try {
    for (const equipment of getTitanDataEngine().equipment.list()) {
      const session = equipment?.runningSession;
      const sessionLot = String(session?.lotNo ?? "").trim();
      if (!sessionLot) continue;
      const sessionSource = String(session?.sourceRecordId ?? "").trim();
      if (sourceIds.has(sessionSource)) return sessionLot;
      const lotItems = Array.isArray(session?.lotItems) ? session.lotItems : [];
      if (lotItems.some((row) => sourceIds.has(String(row?.sourceRecordId ?? "").trim()))) {
        return sessionLot;
      }
    }
  } catch {
    // partial engine in tests
  }

  for (const record of matchingRecords) {
    for (const entry of record.chargeHistory ?? []) {
      if (entry?.status === "in-progress" && entry?.lotNo) {
        return String(entry.lotNo).trim();
      }
    }
  }

  return "";
}

/**
 * Product Monitor Grid rows (Blueprint ② · Engine Binding · Read Only)
 * @param {object[]} [records]
 * @param {object[]} [lots]
 */
export function buildControlRoomProductMonitorRows(
  records = getControlRoomRecords(),
  lots = getControlRoomLots()
) {
  const lotRowByNo = new Map(
    buildControlRoomLotMonitorRows(lots, records).map((row) => [row.lotNo, row])
  );

  /** @type {Map<string, object>} */
  const productMap = new Map();

  records.forEach((record) => {
    const key = buildProductKey(record);
    const partNo = String(record.partNo ?? record.productNo ?? "").trim();
    const productName = String(record.partName ?? record.productName ?? "").trim();
    const company = String(record.company ?? "").trim();
    if (!partNo && !productName) return;

    const lotNo = String(record.lotNo ?? "").trim();

    if (!productMap.has(key)) {
      productMap.set(key, {
        productKey: key,
        productName: productName || "—",
        partNo: partNo || "—",
        company: company || "—",
        lotNos: new Set(),
      });
    }
    if (lotNo) {
      productMap.get(key).lotNos.add(lotNo);
    }
    (record.chargeHistory ?? []).forEach((entry) => {
      const historyLot = String(entry?.lotNo ?? "").trim();
      if (
        historyLot &&
        (entry?.status === "in-progress" || entry?.status === "completed")
      ) {
        productMap.get(key).lotNos.add(historyLot);
      }
    });
  });

  try {
    getTitanDataEngine()
      .equipment.list()
      .forEach((equipment) => {
        const sessionLot = String(equipment?.runningSession?.lotNo ?? "").trim();
        if (!sessionLot) return;
        const lotItems = Array.isArray(equipment?.runningSession?.lotItems)
          ? equipment.runningSession.lotItems
          : [];
        lotItems.forEach((item) => {
          const sourceId = String(item?.sourceRecordId ?? "").trim();
          if (!sourceId) return;
          const record = records.find(
            (row) =>
              String(row.id ?? "").trim() === sourceId ||
              String(row.mesManagementNo ?? "").trim() === sourceId
          );
          if (!record) return;
          const key = buildProductKey(record);
          if (!productMap.has(key)) {
            productMap.set(key, {
              productKey: key,
              productName: String(record.partName ?? record.productName ?? "").trim() || "—",
              partNo: String(record.partNo ?? record.productNo ?? "").trim() || "—",
              company: String(record.company ?? "").trim() || "—",
              lotNos: new Set(),
            });
          }
          productMap.get(key).lotNos.add(sessionLot);
        });
      });
  } catch {
    // partial engine in tests
  }

  return [...productMap.values()].map((product) => {
    const lotRows = [...product.lotNos]
      .map((lotNo) => lotRowByNo.get(lotNo))
      .filter(Boolean);

    const currentLot = lotRows
      .slice()
      .sort((a, b) => scoreProductLotActivity(b) - scoreProductLotActivity(a))[0];

    const progress = Number(currentLot?.progress ?? 0);

    return {
      productKey: product.productKey,
      productName: product.productName,
      partNo: product.partNo,
      company: product.company,
      currentLotNo: currentLot?.lotNo ?? "—",
      equipmentName: currentLot?.equipmentName ?? "—",
      status: currentLot?.status ?? "대기",
      operator: currentLot?.operator ?? "—",
      progress,
      progressLabel: progress > 0 ? `${progress}%` : "—",
      lotCount: product.lotNos.size,
    };
  });
}

/**
 * Product Popup detail (Blueprint ② · Read Only)
 * LOT bundle SSOT — getLotBundle(lotNo) → lotItems[] (all co-charged items)
 * @param {string} productKey
 */
export function getControlRoomProductDetail(productKey) {
  const key = String(productKey ?? "").trim();
  if (!key) return null;

  const rows = buildControlRoomProductMonitorRows();
  const product = rows.find((item) => item.productKey === key);
  if (!product) return null;

  const records = getControlRoomRecords();
  const matchingRecords = records.filter((record) => buildProductKey(record) === key);
  const lotRowByNo = new Map(
    buildControlRoomLotMonitorRows().map((row) => [row.lotNo, row])
  );

  const resolvedLotNo =
    (product.currentLotNo && product.currentLotNo !== "—"
      ? String(product.currentLotNo).trim()
      : "") || resolveLotNoForProductKey(key, records);

  const lotNos = new Set();
  matchingRecords.forEach((record) => {
    const lotNo = String(record.lotNo ?? "").trim();
    if (lotNo) lotNos.add(lotNo);
    (record.chargeHistory ?? []).forEach((entry) => {
      const historyLot = String(entry?.lotNo ?? "").trim();
      if (
        historyLot &&
        (entry?.status === "in-progress" || entry?.status === "completed")
      ) {
        lotNos.add(historyLot);
      }
    });
  });
  if (resolvedLotNo) lotNos.add(resolvedLotNo);

  const lotSummary = [...lotNos]
    .map((lotNo) => {
      const lotRow = lotRowByNo.get(lotNo);
      const bundle = getLotBundle(lotNo, { records });
      return {
        lotNo,
        equipmentName: lotRow?.equipmentName ?? bundle?.equipmentName ?? "—",
        process: lotRow?.process ?? bundle?.process ?? "—",
        operator: lotRow?.operator ?? bundle?.operator ?? "—",
        status: lotRow?.status ?? bundle?.status ?? "—",
        progress: Number(lotRow?.progress ?? bundle?.progress ?? 0),
        progressLabel: lotRow?.progressLabel ?? "—",
        lotItemCount: bundle?.itemCount ?? lotRow?.lotItemCount ?? 0,
        productLabel: bundle?.productLabel ?? lotRow?.productName ?? "—",
      };
    })
    .sort((a, b) => scoreProductLotActivity(b) - scoreProductLotActivity(a));

  const currentLotNo =
    resolvedLotNo || String(lotSummary[0]?.lotNo ?? "").trim();
  const currentLotBundle = currentLotNo ? getLotBundle(currentLotNo, { records }) : null;

  return {
    ...product,
    currentLotNo: currentLotNo || product.currentLotNo,
    lotSummary,
    lotItems: currentLotBundle?.lotItems ?? [],
    currentLotBundle,
    coLotItemCount: currentLotBundle?.itemCount ?? 0,
  };
}

registerWorkflowScreenCacheInvalidator(invalidateControlRoomWorkspaceCache);

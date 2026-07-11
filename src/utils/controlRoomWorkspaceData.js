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
  getEquipmentDetailSnapshot,
  getEquipmentListGroupedByProcess,
  getEquipmentSummary,
} from "./equipmentWorkflowService";
import { getSessionProductionRecords } from "./productionRecords";
import { registerWorkflowScreenCacheInvalidator } from "./titanWorkflowRefresh";

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
      controlRoomRecordsCache = records;
      controlRoomRecordsSnapshot = sessionSnapshot;
      return records;
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
      return !terminalOrNextStep && (status.includes("장입") || status === "대기" || status.includes("대기LOT"));
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
 * LOT · 고객사 · 제품 · 설비 · 공정 · 상태 · 작업자 · 시작시간 · 예상 종료 · 진행률
 * 관리번호 · 품번은 검색/상세 전용으로 row에 유지하고 Grid 컬럼에는 표시하지 않는다.
 */
export const CONTROL_ROOM_LOT_COLUMNS = Object.freeze([
  { id: "lotNo", label: "LOT" },
  { id: "company", label: "고객사" },
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

function buildRecordIndexByLot(records = getControlRoomRecords()) {
  /** @type {Map<string, { company?: string, managementId?: string, partNo?: string, productName?: string }>} */
  const index = new Map();
  records.forEach((record) => {
    const lotNo = String(record.lotNo ?? "").trim();
    if (!lotNo) return;
    const existing = index.get(lotNo) ?? {};
    index.set(lotNo, {
      company: record.company ?? existing.company,
      managementId: record.id ?? record.mesManagementNo ?? existing.managementId,
      partNo: record.partNo ?? record.productNo ?? existing.partNo,
      productName: record.partName ?? record.productName ?? existing.productName,
    });
  });
  return index;
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

  return lots.map((lot) => {
    const lotNo = String(lot.lotNo ?? "").trim();
    const session = sessionByLot.get(lotNo);
    const equipmentId = lot.equipmentId ?? session?.equipmentId ?? null;
    const equipment = equipmentId ? equipmentById.get(equipmentId) : null;
    const recordMeta = recordByLot.get(lotNo) ?? {};
    const progress = Number(lot.progress ?? session?.progress ?? 0);

    return {
      lotNo,
      managementId: lot.managementId || recordMeta.managementId || "—",
      productName: lot.productName || recordMeta.productName || "—",
      partNo: recordMeta.partNo || lot.partNo || "—",
      company: recordMeta.company || "—",
      equipmentName: equipment?.equipmentName ?? equipmentId ?? "—",
      equipmentId: equipmentId ?? "",
      process: lot.process || equipment?.process || "—",
      operator: session?.operator ?? equipment?.runningSession?.operator ?? "—",
      progress,
      progressLabel: progress > 0 ? `${progress}%` : "—",
      status: lot.status ?? "—",
      startTime: session?.startTime ?? equipment?.runningSession?.startTime ?? "—",
      expectedEndTime: session?.expectedEndTime ?? equipment?.runningSession?.expectedEndTime ?? "—",
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

  const row = buildControlRoomLotMonitorRows().find((item) => item.lotNo === key);
  if (!row) return null;

  return {
    ...row,
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
    const partNo = String(record.partNo ?? record.productNo ?? "").trim();
    const productName = String(record.partName ?? record.productName ?? "").trim();
    const company = String(record.company ?? "").trim();
    if (!partNo && !productName) return;

    const key = `${company}::${partNo}::${productName}`;
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
  });

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
 * 제품 중심 상세 + 해당 제품의 LOT 목록 요약 (전체 Traceability ❌ — LOT Lifecycle 담당)
 * @param {string} productKey
 */
export function getControlRoomProductDetail(productKey) {
  const key = String(productKey ?? "").trim();
  if (!key) return null;

  const rows = buildControlRoomProductMonitorRows();
  const product = rows.find((item) => item.productKey === key);
  if (!product) return null;

  const records = getControlRoomRecords();
  const lotRowByNo = new Map(
    buildControlRoomLotMonitorRows().map((row) => [row.lotNo, row])
  );

  const lotNos = new Set(
    records
      .filter((record) => {
        const partNo = String(record.partNo ?? record.productNo ?? "").trim();
        const company = String(record.company ?? "").trim();
        return `${company}::${partNo}::${String(record.partName ?? record.productName ?? "").trim()}` === key;
      })
      .map((record) => String(record.lotNo ?? "").trim())
      .filter(Boolean)
  );

  const lotSummary = [...lotNos]
    .map((lotNo) => {
      const lotRow = lotRowByNo.get(lotNo);
      return {
        lotNo,
        equipmentName: lotRow?.equipmentName ?? "—",
        process: lotRow?.process ?? "—",
        operator: lotRow?.operator ?? "—",
        status: lotRow?.status ?? "—",
        progress: Number(lotRow?.progress ?? 0),
        progressLabel: lotRow?.progressLabel ?? "—",
      };
    })
    .sort((a, b) => scoreProductLotActivity(b) - scoreProductLotActivity(a));

  return {
    ...product,
    lotSummary,
  };
}

registerWorkflowScreenCacheInvalidator(invalidateControlRoomWorkspaceCache);

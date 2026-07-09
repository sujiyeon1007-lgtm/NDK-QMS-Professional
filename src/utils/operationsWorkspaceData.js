/**
 * Project TITAN V2.0 — Operations Workspace Data (Engine Stage SSOT)
 *
 * Blueprint ③ 운영관리 (Operations Workspace)
 * Sprint 4A — 입고등록 Task Workspace
 *
 * 데이터 흐름:
 *   TitanDataEngine(운영 SSOT · productionRecords)
 *     → TitanWorkflowEngine Stage 판정 (titanWorkflowStatus / inboundManagementStatus)
 *       → Operations Workspace (Stage 필터)
 *         → UI (InboundManagement)
 *
 * Task Workspace 원칙:
 *   - 각 화면 = 자신의 Workflow Stage 데이터만 표시
 *   - 입고등록 = RECEIVED · 생산 미투입 (생산계획 투입 시 자동 제거)
 *   - 동일 관리번호 중복 표시 없음
 *
 * ※ P0 운영 SSOT: getSessionProductionRecords() = 단일 Write Path (sessionStorage 영속).
 *   productionStore(TitanDataEngine)는 관제·대시보드용 — 운영 CRUD와 분리 유지.
 */

import { getSessionProductionRecords, isIncomingRegistered } from "./productionRecords";
import { isOutboundShipComplete } from "./outboundManagementStatus";
import { CURRENT_PROCESS_KEYS, resolveRecordCurrentProcess } from "./workflowProcessStatus";
import { getStockQty } from "./inventory";
import { isShotWorkType } from "../config/workTypeWorkflow";

/** 입고등록 Task Workspace Stage — RECEIVED · 생산 미투입 */
export const INCOMING_TASK_STAGE = "RECEIVED";

/** 출고등록 Task Workspace Stage — SHIP_WAIT · 출고 대기 */
export const OUTGOING_TASK_STAGE = "SHIP_WAIT";

/**
 * Operations Workspace 운영 records (SSOT)
 * @returns {object[]}
 */
export function getOperationsRecords() {
  return getSessionProductionRecords();
}

/**
 * RECEIVED · 생산 미투입 Stage 판정
 * - 입고 완료 · 생산계획 미투입 (HTL/작업지시/LOT/생산 진행 전)
 * - 생산계획 투입(작업지시·LOT·생산 진행) 시 자동으로 false → Workspace에서 제거
 * @param {object} record
 * @returns {boolean}
 */
export function isIncomingTaskStageRecord(record) {
  return (
    isIncomingRegistered(record) &&
    !isShotWorkType(record) &&
    resolveRecordCurrentProcess(record).key === CURRENT_PROCESS_KEYS.RECEIVED
  );
}

/**
 * 입고등록 Task Workspace records — 생산 미투입만 · 관리번호 중복 제거
 * @param {object[]} [records]
 * @returns {object[]}
 */
export function buildIncomingTaskWorkspaceRecords(records = getOperationsRecords()) {
  return dedupeOperationsRecords(records, isIncomingTaskStageRecord);
}

/**
 * 입고이력 Workspace records — 입고 등록 완료 전체
 * 생산·출고 진행 여부와 무관하게 입고가 완료된 모든 제품을 조회한다.
 * @param {object[]} [records]
 * @returns {object[]}
 */
export function buildInboundHistoryWorkspaceRecords(records = getOperationsRecords()) {
  return dedupeOperationsRecords(records, isIncomingRegistered);
}

/**
 * SHIP_WAIT · 출고 대기 Stage 판정
 * - 성적서 발행 완료 · 재고 > 0 · 출고 미완료
 * - 출고 완료 시 자동으로 false → Workspace에서 제거
 * @param {object} record
 * @returns {boolean}
 */
export function isOutgoingTaskStageRecord(record) {
  const current = resolveRecordCurrentProcess(record);
  return current.key === CURRENT_PROCESS_KEYS.SHIP_WAIT && getStockQty(record) > 0;
}

/**
 * 출고 완료 Stage 판정 (출고완료 Tab)
 * @param {object} record
 * @returns {boolean}
 */
export function isOutgoingCompletedStageRecord(record) {
  return isOutboundShipComplete(record);
}

/** @param {object[]} records @param {(object) => boolean} predicate */
function dedupeOperationsRecords(records, predicate) {
  const seen = new Set();
  const result = [];

  for (const record of records) {
    if (!predicate(record)) continue;
    const key = String(record?.id ?? "").trim();
    if (key) {
      if (seen.has(key)) continue;
      seen.add(key);
    }
    result.push(record);
  }

  return result;
}

/**
 * 출고등록 Task Workspace records — SHIP_WAIT · 출고 대기만
 * @param {object[]} [records]
 * @returns {object[]}
 */
export function buildOutgoingTaskWorkspaceRecords(records = getOperationsRecords()) {
  return dedupeOperationsRecords(records, isOutgoingTaskStageRecord);
}

/**
 * 출고등록 출고완료 Tab records — 출고 완료 Stage만
 * @param {object[]} [records]
 * @returns {object[]}
 */
export function buildOutgoingCompletedWorkspaceRecords(records = getOperationsRecords()) {
  return dedupeOperationsRecords(records, isOutgoingCompletedStageRecord);
}

/**
 * 재고관리 Workspace 판정 — 입고 등록 완료 (재고 집계 대상)
 * - 입고~출고 전 구간의 재고 흐름을 집계 (현재 재고 보유 / 재고없음 / 출고완료 상태는 리스트 계층에서 표기)
 * @param {object} record
 * @returns {boolean}
 */
export function isInventoryWorkspaceRecord(record) {
  return isIncomingRegistered(record) || Boolean(record?.incomingRegistered);
}

/**
 * 재고관리 Workspace records — 입고 등록 완료 (LOT/품목/거래처 집계 SSOT)
 * @param {object[]} [records]
 * @returns {object[]}
 */
export function buildInventoryWorkspaceRecords(records = getOperationsRecords()) {
  return records.filter((record) => isInventoryWorkspaceRecord(record));
}

/**
 * 입출고이력 Workspace records — 입고·출고 전체 이력 (예외 포함 · 전 구간)
 * @param {object[]} [records]
 * @returns {object[]}
 */
export function buildInoutHistoryWorkspaceRecords(records = getOperationsRecords()) {
  return records;
}

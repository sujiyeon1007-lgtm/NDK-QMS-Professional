/**
 * Project TITAN V1.5 — Workflow Pipeline (Event → Store 갱신)
 * Store는 EventBus 구독을 통해 데이터만 갱신
 */

import { TIMELINE_EVENT_TYPES, createTimelineId } from "../data/titanDataModels";
import { WORKFLOW_EVENTS } from "./workflowEvents";
import {
  EQUIPMENT_WORKFLOW_STATE,
  assertEquipmentWorkflowTransition,
  mapWorkflowStateToEquipmentStatus,
  resolveEquipmentWorkflowState,
} from "./equipmentStateMachine";

function formatWorkflowClock(date = new Date()) {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

function timelineMetaFromInput(input) {
  return {
    lotNo: String(input.lotNo ?? "").trim(),
    equipmentId: String(input.equipmentId ?? "").trim(),
    managementId: String(input.managementId ?? "").trim(),
  };
}

function createProductionId() {
  return `PRD-WF-${Date.now()}`;
}

function createInspectionId() {
  return `INS-WF-${Date.now()}`;
}

function createCertificateId() {
  return `CERT-WF-${Date.now()}`;
}

/**
 * @param {import("../data/TitanDataEngine").TitanDataEngine} dataEngine
 * @param {import("./TitanEventBus").TitanEventBus} eventBus
 */
export function registerWorkflowStoreHandlers(dataEngine, eventBus) {
  eventBus.on(WORKFLOW_EVENTS.EQUIPMENT_STATE_CHANGED, (payload) => {
    const { equipmentId, workflowState, patch = {} } = /** @type {Record<string, unknown>} */ (payload);
    if (!equipmentId || !workflowState) return null;

    return dataEngine.equipment.update(String(equipmentId), {
      workflowState,
      status: mapWorkflowStateToEquipmentStatus(
        /** @type {import("./equipmentStateMachine").EquipmentWorkflowState} */ (workflowState)
      ),
      ...patch,
    });
  });

  eventBus.on(WORKFLOW_EVENTS.PRODUCTION_STARTED, (payload) => {
    const input = /** @type {Record<string, unknown>} */ (payload);
    const productionId = String(input.productionId ?? createProductionId());
    const now = formatWorkflowClock();

    const production = dataEngine.production.create({
      productionId,
      lotNo: input.lotNo ?? "",
      equipmentId: input.equipmentId ?? null,
      startTime: input.startTime ?? now,
      endTime: null,
      operator: input.operator ?? null,
      memo: input.memo ?? "",
      payload: {
        workflowState: "열처리중",
        ...(input.payload && typeof input.payload === "object" ? input.payload : {}),
      },
    });

    if (input.lotNo) {
      const lot = dataEngine.lot.getByLotNo(String(input.lotNo));
      if (lot) {
        dataEngine.lot.update(String(input.lotNo), {
          equipmentId: input.equipmentId ?? lot.equipmentId,
          status: "열처리중",
          progress: 0,
        });
      } else {
        dataEngine.lot.create({
          lotNo: String(input.lotNo),
          productNo: input.productNo ?? "",
          productName: input.productName ?? "",
          quantity: Number(input.quantity) || 0,
          process: input.process ?? "",
          progress: 0,
          equipmentId: input.equipmentId ?? null,
          status: "열처리중",
          managementId: input.managementId ?? "",
        });
      }
    }

    dataEngine.timeline.append({
      id: createTimelineId(),
      type: TIMELINE_EVENT_TYPES.CHARGE_START,
      title: "장입 시작",
      target: `${input.equipmentId ?? ""} · ${input.lotNo ?? ""}`.trim(),
      time: now,
      user: input.operator ? String(input.operator) : "생산부",
      detail: "Workflow Engine · startCharging",
      ...timelineMetaFromInput(input),
    });

    eventBus.emit(WORKFLOW_EVENTS.DASHBOARD_REFRESHED, { reason: "production.started" });
    return production;
  });

  eventBus.on(WORKFLOW_EVENTS.PRODUCTION_FINISHED, (payload) => {
    const input = /** @type {Record<string, unknown>} */ (payload);
    const productionId = String(input.productionId ?? "");
    const now = formatWorkflowClock();

    const production = productionId
      ? dataEngine.production.update(productionId, {
          endTime: input.endTime ?? now,
          payload: {
            ...(dataEngine.production.getById(productionId)?.payload ?? {}),
            workflowState: "검사대기",
          },
        })
      : null;

    if (input.lotNo) {
      dataEngine.lot.update(String(input.lotNo), {
        status: "검사대기",
        progress: 100,
      });
    }

    dataEngine.timeline.append({
      id: createTimelineId(),
      type: TIMELINE_EVENT_TYPES.PRODUCTION_COMPLETE,
      title: "생산 완료",
      target: String(input.lotNo ?? input.productionId ?? ""),
      time: now,
      user: input.operator ? String(input.operator) : "생산부",
      detail: "Workflow Engine · finishCharging",
      ...timelineMetaFromInput(input),
    });

    eventBus.emit(WORKFLOW_EVENTS.DASHBOARD_REFRESHED, { reason: "production.finished" });
    return production;
  });

  eventBus.on(WORKFLOW_EVENTS.INSPECTION_STARTED, (payload) => {
    const input = /** @type {Record<string, unknown>} */ (payload);
    const inspectionId = String(input.inspectionId ?? createInspectionId());
    const now = formatWorkflowClock();

    const inspection = dataEngine.quality.addInspection({
      id: inspectionId,
      logId: inspectionId,
      managementId: input.managementId ?? "",
      lotNo: input.lotNo ?? "",
      status: "진행중",
      workflowState: "검사중",
      startedAt: now,
      ...(input.payload && typeof input.payload === "object" ? input.payload : {}),
    });

    if (input.lotNo) {
      dataEngine.lot.update(String(input.lotNo), { status: "검사중" });
    }

    dataEngine.timeline.append({
      id: createTimelineId(),
      type: TIMELINE_EVENT_TYPES.CUSTOM,
      title: "검사 시작",
      target: String(input.lotNo ?? input.managementId ?? inspectionId),
      time: now,
      user: input.inspector ? String(input.inspector) : "품질부",
      detail: "Workflow Engine · startInspection",
      ...timelineMetaFromInput(input),
    });

    eventBus.emit(WORKFLOW_EVENTS.DASHBOARD_REFRESHED, { reason: "inspection.started" });
    return inspection;
  });

  eventBus.on(WORKFLOW_EVENTS.INSPECTION_FINISHED, (payload) => {
    const input = /** @type {Record<string, unknown>} */ (payload);
    const inspectionId = String(input.inspectionId ?? "");
    const now = formatWorkflowClock();

    const inspection = inspectionId
      ? dataEngine.quality.updateInspection(inspectionId, {
          status: "검사완료",
          workflowState: "성적서대기",
          judgment: input.judgment ?? "합격",
          finishedAt: now,
        })
      : null;

    if (input.lotNo) {
      dataEngine.lot.update(String(input.lotNo), { status: "성적서대기" });
    }

    dataEngine.timeline.append({
      id: createTimelineId(),
      type: TIMELINE_EVENT_TYPES.INSPECTION_COMPLETE,
      title: "검사 완료",
      target: String(input.lotNo ?? inspectionId),
      time: now,
      user: input.inspector ? String(input.inspector) : "품질부",
      detail: "Workflow Engine · finishInspection",
      ...timelineMetaFromInput(input),
    });

    eventBus.emit(WORKFLOW_EVENTS.DASHBOARD_REFRESHED, { reason: "inspection.finished" });
    return inspection;
  });

  eventBus.on(WORKFLOW_EVENTS.CERTIFICATE_ISSUED, (payload) => {
    const input = /** @type {Record<string, unknown>} */ (payload);
    const certificateId = String(input.certificateId ?? createCertificateId());
    const now = formatWorkflowClock();

    const certificate = dataEngine.quality.addCertificate({
      id: certificateId,
      certificateId,
      managementId: input.managementId ?? "",
      lotNo: input.lotNo ?? "",
      status: "발행완료",
      issuedAt: now,
      ...(input.payload && typeof input.payload === "object" ? input.payload : {}),
    });

    if (input.lotNo) {
      dataEngine.lot.update(String(input.lotNo), { status: "성적서완료" });
    }

    dataEngine.timeline.append({
      id: createTimelineId(),
      type: TIMELINE_EVENT_TYPES.CERTIFICATE_ISSUED,
      title: "성적서 발행",
      target: String(input.lotNo ?? certificateId),
      time: now,
      user: input.issuer ? String(input.issuer) : "품질부",
      detail: "Workflow Engine · issueCertificate",
      ...timelineMetaFromInput(input),
    });

    eventBus.emit(WORKFLOW_EVENTS.DASHBOARD_REFRESHED, { reason: "certificate.issued" });
    return certificate;
  });

  eventBus.on(WORKFLOW_EVENTS.SHIPMENT_COMPLETED, (payload) => {
    const input = /** @type {Record<string, unknown>} */ (payload);
    const productionId = String(input.productionId ?? "");
    const now = formatWorkflowClock();

    let production = null;
    if (productionId) {
      production = dataEngine.production.update(productionId, {
        payload: {
          ...(dataEngine.production.getById(productionId)?.payload ?? {}),
          shipmentStatus: "출고완료",
          workflowState: "출고완료",
        },
      });
    }

    if (input.lotNo) {
      dataEngine.lot.update(String(input.lotNo), { status: "출고완료" });
    }

    dataEngine.timeline.append({
      id: createTimelineId(),
      type: TIMELINE_EVENT_TYPES.SHIPMENT_COMPLETE,
      title: "출고 완료",
      target: String(input.lotNo ?? productionId),
      time: now,
      user: input.operator ? String(input.operator) : "영업부",
      detail: "Workflow Engine · shipProduct",
      ...timelineMetaFromInput(input),
    });

    eventBus.emit(WORKFLOW_EVENTS.DASHBOARD_REFRESHED, { reason: "shipment.completed" });
    return production;
  });

  eventBus.on(WORKFLOW_EVENTS.DASHBOARD_REFRESHED, () => {
    return dataEngine.dashboard.refreshCache();
  });
}

function transitionEquipment(dataEngine, eventBus, equipmentId, from, to, patch = {}) {
  assertEquipmentWorkflowTransition(from, to);
  eventBus.emit(WORKFLOW_EVENTS.EQUIPMENT_STATE_CHANGED, {
    equipmentId,
    workflowState: to,
    from,
    patch,
  });
  return dataEngine.equipment.getById(equipmentId);
}

/**
 * startCharging — Equipment 상태 변경 → Production 생성 → Timeline → Dashboard
 * @param {import("../data/TitanDataEngine").TitanDataEngine} dataEngine
 * @param {import("./TitanEventBus").TitanEventBus} eventBus
 * @param {Record<string, unknown>} input
 */
export function pipelineStartCharging(dataEngine, eventBus, input) {
  const equipmentId = String(input.equipmentId ?? "").trim();
  const lotNo = String(input.lotNo ?? "").trim();
  if (!equipmentId) throw new Error("equipmentId is required");
  if (!lotNo) throw new Error("lotNo is required");

  const equipment = dataEngine.equipment.getById(equipmentId);
  if (!equipment) throw new Error(`Equipment not found: ${equipmentId}`);
  if (equipment.maintenance) throw new Error("점검중 설비는 Workflow를 시작할 수 없습니다.");

  const currentState = resolveEquipmentWorkflowState(equipment);
  assertEquipmentWorkflowTransition(currentState, EQUIPMENT_WORKFLOW_STATE.CHARGING);
  assertEquipmentWorkflowTransition(
    EQUIPMENT_WORKFLOW_STATE.CHARGING,
    EQUIPMENT_WORKFLOW_STATE.HEAT_TREATING
  );

  const now = formatWorkflowClock();
  const productionId = String(input.productionId ?? createProductionId());

  transitionEquipment(dataEngine, eventBus, equipmentId, currentState, EQUIPMENT_WORKFLOW_STATE.CHARGING, {
    currentLot: lotNo,
    startTime: input.startTime ?? now,
    progress: 0,
  });

  eventBus.emit(WORKFLOW_EVENTS.CHARGING_STARTED, {
    equipmentId,
    lotNo,
    productionId,
    operator: input.operator ?? null,
  });

  transitionEquipment(
    dataEngine,
    eventBus,
    equipmentId,
    EQUIPMENT_WORKFLOW_STATE.CHARGING,
    EQUIPMENT_WORKFLOW_STATE.HEAT_TREATING,
    {
      currentLot: lotNo,
      progress: Number(input.progress) || 0,
      runningSession: {
        lotNo,
        startTime: input.startTime ?? now,
        expectedEndTime: input.expectedEndTime ?? null,
        progress: Number(input.progress) || 0,
      },
    }
  );

  const productionResult = eventBus.emit(WORKFLOW_EVENTS.PRODUCTION_STARTED, {
    ...input,
    equipmentId,
    lotNo,
    productionId,
    startTime: input.startTime ?? now,
  });

  return {
    equipmentId,
    lotNo,
    productionId,
    workflowState: EQUIPMENT_WORKFLOW_STATE.HEAT_TREATING,
    production: productionResult.results?.[0] ?? null,
  };
}

/**
 * finishCharging — Equipment 완료 → Production 종료 → Timeline → Dashboard
 * @param {import("../data/TitanDataEngine").TitanDataEngine} dataEngine
 * @param {import("./TitanEventBus").TitanEventBus} eventBus
 * @param {Record<string, unknown>} input
 */
export function pipelineFinishCharging(dataEngine, eventBus, input) {
  const equipmentId = String(input.equipmentId ?? "").trim();
  if (!equipmentId) throw new Error("equipmentId is required");

  const equipment = dataEngine.equipment.getById(equipmentId);
  if (!equipment) throw new Error(`Equipment not found: ${equipmentId}`);

  const currentState = resolveEquipmentWorkflowState(equipment);
  assertEquipmentWorkflowTransition(currentState, EQUIPMENT_WORKFLOW_STATE.INSPECTION_WAIT);

  const productionId = (() => {
    const explicit = String(input.productionId ?? "").trim();
    if (explicit) return explicit;

    const fromSession = String(equipment.runningSession?.productionId ?? "").trim();
    if (fromSession) return fromSession;

    const matched = dataEngine.production.list().find(
      (row) =>
        String(row.equipmentId ?? "") === equipmentId &&
        !row.endTime &&
        (!input.lotNo || String(row.lotNo ?? "") === String(input.lotNo))
    );
    return String(matched?.productionId ?? "").trim();
  })();

  const lotNo = String(input.lotNo ?? equipment.currentLot ?? "");
  const now = formatWorkflowClock();

  transitionEquipment(
    dataEngine,
    eventBus,
    equipmentId,
    currentState,
    EQUIPMENT_WORKFLOW_STATE.INSPECTION_WAIT,
    {
      progress: 100,
      expectedEndTime: input.endTime ?? now,
      runningSession: null,
    }
  );

  const productionResult = eventBus.emit(WORKFLOW_EVENTS.PRODUCTION_FINISHED, {
    ...input,
    equipmentId,
    lotNo,
    productionId,
    endTime: input.endTime ?? now,
  });

  return {
    equipmentId,
    lotNo,
    productionId,
    workflowState: EQUIPMENT_WORKFLOW_STATE.INSPECTION_WAIT,
    production: productionResult.results?.[0] ?? null,
  };
}

/**
 * startInspection — 품질 상태 변경 → Timeline
 * @param {import("../data/TitanDataEngine").TitanDataEngine} dataEngine
 * @param {import("./TitanEventBus").TitanEventBus} eventBus
 * @param {Record<string, unknown>} input
 */
export function pipelineStartInspection(dataEngine, eventBus, input) {
  const lotNo = String(input.lotNo ?? "").trim();
  if (!lotNo && !input.managementId) {
    throw new Error("lotNo or managementId is required");
  }

  const inspectionResult = eventBus.emit(WORKFLOW_EVENTS.INSPECTION_STARTED, input);
  return {
    lotNo,
    inspection: inspectionResult.results?.[0] ?? null,
  };
}

/**
 * finishInspection — 성적서 대기 → Timeline
 * @param {import("../data/TitanDataEngine").TitanDataEngine} dataEngine
 * @param {import("./TitanEventBus").TitanEventBus} eventBus
 * @param {Record<string, unknown>} input
 */
export function pipelineFinishInspection(dataEngine, eventBus, input) {
  const inspectionId = String(input.inspectionId ?? "").trim();
  if (!inspectionId) throw new Error("inspectionId is required");

  const inspectionResult = eventBus.emit(WORKFLOW_EVENTS.INSPECTION_FINISHED, input);
  return {
    inspectionId,
    inspection: inspectionResult.results?.[0] ?? null,
  };
}

/**
 * issueCertificate — 성적서 상태 변경 → Timeline → Dashboard
 * @param {import("../data/TitanDataEngine").TitanDataEngine} dataEngine
 * @param {import("./TitanEventBus").TitanEventBus} eventBus
 * @param {Record<string, unknown>} input
 */
export function pipelineIssueCertificate(dataEngine, eventBus, input) {
  const lotNo = String(input.lotNo ?? "").trim();
  const equipmentId = String(input.equipmentId ?? "").trim();

  if (equipmentId) {
    const equipment = dataEngine.equipment.getById(equipmentId);
    if (equipment) {
      const currentState = resolveEquipmentWorkflowState(equipment);
      if (currentState === EQUIPMENT_WORKFLOW_STATE.INSPECTION_WAIT) {
        transitionEquipment(
          dataEngine,
          eventBus,
          equipmentId,
          currentState,
          EQUIPMENT_WORKFLOW_STATE.COMPLETE,
          { progress: 100 }
        );
      }
    }
  }

  const certificateResult = eventBus.emit(WORKFLOW_EVENTS.CERTIFICATE_ISSUED, input);
  return {
    lotNo,
    certificate: certificateResult.results?.[0] ?? null,
  };
}

/**
 * shipProduct — 출고 완료 → Timeline → Dashboard
 * @param {import("../data/TitanDataEngine").TitanDataEngine} dataEngine
 * @param {import("./TitanEventBus").TitanEventBus} eventBus
 * @param {Record<string, unknown>} input
 */
export function pipelineShipProduct(dataEngine, eventBus, input) {
  const equipmentId = String(input.equipmentId ?? "").trim();

  if (equipmentId) {
    const equipment = dataEngine.equipment.getById(equipmentId);
    if (equipment) {
      const currentState = resolveEquipmentWorkflowState(equipment);
      if (currentState === EQUIPMENT_WORKFLOW_STATE.INSPECTION_WAIT) {
        transitionEquipment(
          dataEngine,
          eventBus,
          equipmentId,
          currentState,
          EQUIPMENT_WORKFLOW_STATE.COMPLETE
        );
        transitionEquipment(
          dataEngine,
          eventBus,
          equipmentId,
          EQUIPMENT_WORKFLOW_STATE.COMPLETE,
          EQUIPMENT_WORKFLOW_STATE.IDLE,
          {
            currentLot: null,
            progress: 0,
            startTime: null,
            expectedEndTime: null,
            runningSession: null,
          }
        );
      } else if (currentState === EQUIPMENT_WORKFLOW_STATE.COMPLETE) {
        transitionEquipment(
          dataEngine,
          eventBus,
          equipmentId,
          currentState,
          EQUIPMENT_WORKFLOW_STATE.IDLE,
          {
            currentLot: null,
            progress: 0,
            startTime: null,
            expectedEndTime: null,
            runningSession: null,
          }
        );
      }
    }
  }

  const shipmentResult = eventBus.emit(WORKFLOW_EVENTS.SHIPMENT_COMPLETED, input);
  return {
    lotNo: String(input.lotNo ?? ""),
    production: shipmentResult.results?.[0] ?? null,
  };
}

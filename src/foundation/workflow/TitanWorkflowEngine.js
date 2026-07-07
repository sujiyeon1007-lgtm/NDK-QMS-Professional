/**
 * Project TITAN V1.5 — TitanWorkflowEngine (공식 Workflow 진입점)
 *
 * QR Scan → TitanWorkflowEngine → TitanDataEngine → Store → Page
 * Page는 Store를 직접 제어하지 않음 · Workflow 함수만 호출
 */

import { getTitanDataEngine } from "../data";
import { getTitanEventBus, resetTitanEventBusInstance } from "./TitanEventBus";
import { WORKFLOW_ENGINE_VERSION } from "./workflowEvents";
import {
  registerWorkflowStoreHandlers,
  pipelineStartCharging,
  pipelineFinishCharging,
  pipelineStartInspection,
  pipelineFinishInspection,
  pipelineIssueCertificate,
  pipelineShipProduct,
} from "./workflowPipeline";

/** @type {TitanWorkflowEngine | null} */
let workflowInstance = null;

export class TitanWorkflowEngine {
  /** @param {import("../data/TitanDataEngine").TitanDataEngine} dataEngine */
  constructor(dataEngine) {
    this.version = WORKFLOW_ENGINE_VERSION;
    this.dataEngine = dataEngine;
    this.eventBus = getTitanEventBus();
    /** @type {(() => void) | null} */
    this.unregisterHandlers = null;
  }

  init() {
    if (this.unregisterHandlers) return this.getStatus();

    registerWorkflowStoreHandlers(this.dataEngine, this.eventBus);
    this.unregisterHandlers = () => {
      this.eventBus.clear();
      this.unregisterHandlers = null;
    };

    return this.getStatus();
  }

  getStatus() {
    return {
      version: this.version,
      initialized: Boolean(this.unregisterHandlers),
      pipeline: this.dataEngine.getPipelineStatus(),
    };
  }

  /** @param {Record<string, unknown>} input */
  startCharging(input) {
    return pipelineStartCharging(this.dataEngine, this.eventBus, input);
  }

  /** @param {Record<string, unknown>} input */
  finishCharging(input) {
    return pipelineFinishCharging(this.dataEngine, this.eventBus, input);
  }

  /** @param {Record<string, unknown>} input */
  startInspection(input) {
    return pipelineStartInspection(this.dataEngine, this.eventBus, input);
  }

  /** @param {Record<string, unknown>} input */
  finishInspection(input) {
    return pipelineFinishInspection(this.dataEngine, this.eventBus, input);
  }

  /** @param {Record<string, unknown>} input */
  issueCertificate(input) {
    return pipelineIssueCertificate(this.dataEngine, this.eventBus, input);
  }

  /** @param {Record<string, unknown>} input */
  shipProduct(input) {
    return pipelineShipProduct(this.dataEngine, this.eventBus, input);
  }

  /** @param {string} event @param {(payload: unknown) => unknown} handler */
  on(event, handler) {
    return this.eventBus.on(event, handler);
  }

  /** @param {string} event @param {unknown} [payload] */
  emit(event, payload) {
    return this.eventBus.emit(event, payload);
  }
}

/** @returns {TitanWorkflowEngine} */
export function getTitanWorkflowEngine() {
  if (!workflowInstance) {
    const dataEngine = getTitanDataEngine();
    workflowInstance = new TitanWorkflowEngine(dataEngine);
    workflowInstance.init();
  }
  return workflowInstance;
}

/** 테스트 / QA용 — Singleton 재생성 */
export function resetTitanWorkflowEngineInstance() {
  workflowInstance?.unregisterHandlers?.();
  resetTitanEventBusInstance();
  workflowInstance = null;
}

export default getTitanWorkflowEngine;

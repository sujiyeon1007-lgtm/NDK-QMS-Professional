/**
 * Project TITAN V1.5 — Data Engine Models (QR Workflow 대비 · SSOT)
 */

/** @typedef {"idle"|"ready"|"running"|"maintenance"|"breakdown"} EquipmentStatus */

/**
 * @typedef {Object} EquipmentRecord
 * @property {string} equipmentId
 * @property {string} equipmentName
 * @property {string} process
 * @property {EquipmentStatus} status
 * @property {string|null} [currentLot]
 * @property {string|null} [startTime]
 * @property {string|null} [expectedEndTime]
 * @property {number} [progress]
 * @property {string} [code]
 * @property {boolean} [maintenance]
 * @property {string} [smartAccessId]
 */

/**
 * @typedef {Object} LotRecord
 * @property {string} lotNo
 * @property {string} [productNo]
 * @property {string} [productName]
 * @property {number} [quantity]
 * @property {string} [process]
 * @property {number} [progress]
 * @property {string|null} [equipmentId]
 * @property {string} [status]
 * @property {string} [managementId]
 */

/**
 * @typedef {Object} ProductionRecord
 * @property {string} productionId
 * @property {string} [lotNo]
 * @property {string|null} [equipmentId]
 * @property {string|null} [startTime]
 * @property {string|null} [endTime]
 * @property {string|null} [operator]
 * @property {string} [memo]
 * @property {Record<string, unknown>} [payload]
 */

/**
 * @typedef {Object} QualityBundle
 * @property {unknown[]} inspections
 * @property {unknown[]} certificates
 * @property {unknown[]} defects
 * @property {unknown[]} documents
 */

/**
 * @typedef {Object} DashboardSnapshot
 * @property {string} generatedAt
 * @property {Record<string, number>} kpi
 * @property {unknown[]} recentWork
 * @property {Record<string, number>} progress
 */

/**
 * @typedef {"charge_start"|"production_complete"|"inspection_complete"|"certificate_issued"|"shipment_complete"|"custom"} TimelineEventType
 */

/**
 * @typedef {Object} TimelineRecord
 * @property {string} id
 * @property {TimelineEventType} type
 * @property {string} title
 * @property {string} target
 * @property {string} time
 * @property {string} [user]
 * @property {string} [detail]
 * @property {string} [lotNo]
 * @property {string} [equipmentId]
 * @property {string} [managementId]
 */

export const TIMELINE_EVENT_TYPES = {
  CHARGE_START: "charge_start",
  PRODUCTION_COMPLETE: "production_complete",
  INSPECTION_COMPLETE: "inspection_complete",
  CERTIFICATE_ISSUED: "certificate_issued",
  SHIPMENT_COMPLETE: "shipment_complete",
  CUSTOM: "custom",
};

export function createTimelineId() {
  return `TL-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

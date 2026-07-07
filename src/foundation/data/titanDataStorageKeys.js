/**
 * Project TITAN V1.6 — Data Engine SessionStorage Keys
 * UI는 이 파일을 직접 참조하지 않음 · Store / TitanDataEngine 경유
 */

export const TITAN_DATA_ENGINE_VERSION = "V1.6";
export const TITAN_DATA_ENGINE_NAMESPACE = "titan-data-engine-v1.6";

export const TITAN_DATA_STORAGE_KEYS = {
  meta: `${TITAN_DATA_ENGINE_NAMESPACE}/meta`,
  equipment: `${TITAN_DATA_ENGINE_NAMESPACE}/equipment`,
  lots: `${TITAN_DATA_ENGINE_NAMESPACE}/lots`,
  production: `${TITAN_DATA_ENGINE_NAMESPACE}/production`,
  quality: `${TITAN_DATA_ENGINE_NAMESPACE}/quality`,
  dashboard: `${TITAN_DATA_ENGINE_NAMESPACE}/dashboard`,
  timeline: `${TITAN_DATA_ENGINE_NAMESPACE}/timeline`,
  customer: `${TITAN_DATA_ENGINE_NAMESPACE}/master/customer`,
  product: `${TITAN_DATA_ENGINE_NAMESPACE}/master/product`,
  material: `${TITAN_DATA_ENGINE_NAMESPACE}/master/material`,
  process: `${TITAN_DATA_ENGINE_NAMESPACE}/master/process`,
  worker: `${TITAN_DATA_ENGINE_NAMESPACE}/master/worker`,
  company: `${TITAN_DATA_ENGINE_NAMESPACE}/master/company`,
};

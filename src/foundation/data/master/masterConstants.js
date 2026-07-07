/**
 * Project TITAN V1.6 — Master Data Integration constants
 */

/** @deprecated import from masterData.js only for UI — Engine reads session key directly */
export const MASTER_DATA_SESSION_KEY = "project-titan-master-data-v3";

/** Categories synced to TitanDataEngine Master Stores */
export const MASTER_STORE_CATEGORIES = [
  "companies",
  "products",
  "materials",
  "workers",
  "heatTreatment",
  "equipment",
];

export const MASTER_STORE_CATEGORY_ALIASES = {
  customers: "companies",
  customer: "companies",
  material: "materials",
  process: "heatTreatment",
  processes: "heatTreatment",
};

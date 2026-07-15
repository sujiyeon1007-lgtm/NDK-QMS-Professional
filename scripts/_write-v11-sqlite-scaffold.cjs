const fs = require("fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
function write(rel, content) {
  const p = path.join(root, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, content.replace(/\r\n/g, "\n"), "utf8");
  console.log("wrote", rel);
}
write("src/config/titanV11Sprint1MasterRepository.js", `export const V11_SPRINT1_MASTER_VERSION = "V1.1-SPRINT1-MASTER-1.0";
export const V11_SPRINT1_MASTER_DATE = "2026-07-11";
export const V11_SPRINT1_MASTER_CATEGORIES = Object.freeze([
  { key: "companies", label: "companies", legacyKey: "companies", table: "master_companies" },
  { key: "products", label: "products", legacyKey: "products", table: "master_products" },
  { key: "materials", label: "materials", legacyKey: "materials", table: "master_materials" },
  { key: "equipment", label: "equipment", legacyKey: "equipment", table: "master_equipment" },
  { key: "workers", label: "workers", legacyKey: "workers", table: "master_workers" },
  { key: "heatTreatment", label: "process", legacyKey: "heatTreatment", table: "master_processes" },
  { key: "internalItems", label: "internalItems", legacyKey: "internalItems", table: "master_internal_items" },
]);
export const V11_SPRINT1_EXIT_CHECKLIST = Object.freeze([
  "Master Import to SQLite persist",
  "App shutdown restart auto load",
  "600 companies without re-import",
  "Products and equipment master persist",
]);
export const V11_SPRINT1_FROZEN_SURFACES = Object.freeze(["UI","Workflow","QR Engine","Print Engine","Excel Import UX"]);
export function resolveV11MasterTable(categoryKey) {
  const key = String(categoryKey ?? "").trim();
  const row = V11_SPRINT1_MASTER_CATEGORIES.find((item) => item.key === key || item.legacyKey === key);
  return row?.table ?? null;
}
export function resolveV11MasterLegacyKey(categoryKey) {
  const key = String(categoryKey ?? "").trim();
  const row = V11_SPRINT1_MASTER_CATEGORIES.find((item) => item.key === key || item.legacyKey === key);
  return row?.legacyKey ?? key;
}`);
console.log("done");

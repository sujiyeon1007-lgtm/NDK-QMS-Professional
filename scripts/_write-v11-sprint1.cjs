const fs = require("fs");
const path = require("path");
const root = "c:/Users/user1/Desktop/NDK-QMS-Professional";
function write(rel, content) {
  const p = path.join(root, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, content, "utf8");
  console.log("wrote", rel);
}
write("src/config/titanV11Sprint1MasterRepository.js", [
  "/**",
  " * Project TITAN V1.1 Sprint 1 - Master Repository SQLite (PM Official)",
  " */",
  "export const V11_SPRINT1_MASTER_VERSION = \"V1.1-SPRINT1-MASTER-1.0\";",
  "export const V11_SPRINT1_MASTER_DATE = \"2026-07-11\";",
  "export const V11_SPRINT1_MASTER_CATEGORIES = Object.freeze([",
  "  { key: \"companies\", label: \"???\", legacyKey: \"companies\", table: \"master_companies\" },",
  "  { key: \"products\", label: \"??\", legacyKey: \"products\", table: \"master_products\" },",
  "  { key: \"materials\", label: \"??\", legacyKey: \"materials\", table: \"master_materials\" },",
  "  { key: \"equipment\", label: \"??\", legacyKey: \"equipment\", table: \"master_equipment\" },",
  "  { key: \"workers\", label: \"???\", legacyKey: \"workers\", table: \"master_workers\" },",
  "  { key: \"heatTreatment\", label: \"??\", legacyKey: \"heatTreatment\", table: \"master_processes\" },",
  "  { key: \"internalItems\", label: \"?? ??\", legacyKey: \"internalItems\", table: \"master_internal_items\" },",
  "]);",
  "export const V11_SPRINT1_EXIT_CHECKLIST = Object.freeze([",
  "  \"Master Import to SQLite persist\",",
  "  \"App shutdown restart auto load\",",
  "  \"600 companies without re-import\",",
  "  \"Products and equipment master persist\",",
  "]);",
  "export const V11_SPRINT1_FROZEN_SURFACES = Object.freeze([\"UI\", \"Workflow\", \"QR Engine\", \"Print Engine\", \"Excel Import UX\"]);",
  "",
].join("\n"));

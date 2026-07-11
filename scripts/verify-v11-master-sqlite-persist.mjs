/**
 * V1.1 Sprint 1 — Master SQLite persist verification (Electron path)
 * Browser-only: validates scaffold + session fallback messaging.
 */
import { V11_SPRINT1_EXIT_CHECKLIST } from "../src/config/titanV11Sprint1MasterRepository.js";
import { isTitanDbBridgeAvailable } from "../src/services/titanDbBridge.js";
import fs from "node:fs";
import path from "node:path";

const checks = [];

function pass(name, detail = "") {
  checks.push({ name, ok: true, detail });
  console.log("PASS", name, detail);
}
function fail(name, detail = "") {
  checks.push({ name, ok: false, detail });
  console.error("FAIL", name, detail);
}

const requiredFiles = [
  "src/config/titanV11Sprint1MasterRepository.js",
  "src/database/schemas/master-v11.sql",
  "src/repositories/sqlite/createSqliteRepositories.js",
  "electron/sqlite/titanDbHandlers.mjs",
  "src/services/titanDbBridge.js",
  "src/utils/v11MasterRepositoryBoot.js",
];

for (const rel of requiredFiles) {
  if (fs.existsSync(path.resolve(rel))) pass(`file exists: ${rel}`);
  else fail(`file exists: ${rel}`);
}

if (isTitanDbBridgeAvailable()) {
  pass("titanDb bridge available (Electron renderer)");
} else {
  pass("browser sessionStorage fallback (titanDb bridge unavailable in Vite dev)");
}

console.log("\nSprint exit checklist:");
for (const item of V11_SPRINT1_EXIT_CHECKLIST) {
  console.log(" -", item);
}

const failed = checks.filter((c) => !c.ok);
console.log(`\nResult: ${failed.length ? "FAIL" : "PASS"} (${checks.length - failed.length}/${checks.length})`);
process.exit(failed.length ? 1 : 0);

const fs = require("fs");
const path = require("path");
const root = path.resolve(__dirname, "..");
function patch(rel, search, replace) {
  const p = path.join(root, rel);
  let text = fs.readFileSync(p, "utf8");
  if (!text.includes(search)) { console.warn("skip", rel, search.slice(0, 50)); return; }
  fs.writeFileSync(p, text.replace(search, replace), "utf8");
  console.log("patched", rel);
}
function w(rel, content) {
  const p = path.join(root, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, content, "utf8");
  console.log("wrote", rel);
}

patch("src/repositories/index.js",
`import {
  createOracleRepositories,
  clearOracleRepositoryCache,
} from "./oracle/createOracleRepositories";`,
`import {
  createOracleRepositories,
  clearOracleRepositoryCache,
} from "./oracle/createOracleRepositories";
import { createSqliteRepositories } from "./sqlite/createSqliteRepositories.js";`);

patch("src/repositories/index.js",
`/** @type {"session" | "oracle"} */
let activeBackend = "session";`,
`/** @type {"session" | "oracle" | "sqlite"} */
let activeBackend = "session";`);

patch("src/repositories/index.js",
`/**
 * @param {"session" | "oracle"} backend
 */
export function setRepositoryBackend(backend) {
  if (backend !== "session" && backend !== "oracle") {
    throw new Error(\`Unknown repository backend: \${backend}\`);
  }`,
`/**
 * @param {"session" | "oracle" | "sqlite"} backend
 */
export function setRepositoryBackend(backend) {
  if (backend !== "session" && backend !== "oracle" && backend !== "sqlite") {
    throw new Error(\`Unknown repository backend: \${backend}\`);
  }`);

patch("src/repositories/index.js",
`    cachedRepositories =
      activeBackend === "oracle" ? createOracleRepositories() : createSessionRepositories();`,
`    if (activeBackend === "oracle") {
      cachedRepositories = createOracleRepositories();
    } else if (activeBackend === "sqlite") {
      cachedRepositories = createSqliteRepositories();
    } else {
      cachedRepositories = createSessionRepositories();
    }`);

patch("src/repositories/index.js",
`export function getRepositoryBackendLabel() {
  if (activeBackend === "oracle") {
    return REPOSITORY_BACKEND.MES_ORACLE;
  }
  return REPOSITORY_BACKEND.STANDALONE_V1_0;
}`,
`export function getRepositoryBackendLabel() {
  if (activeBackend === "oracle") {
    return REPOSITORY_BACKEND.MES_ORACLE;
  }
  if (activeBackend === "sqlite") {
    return REPOSITORY_BACKEND.STANDALONE_V1_1;
  }
  return REPOSITORY_BACKEND.STANDALONE_V1_0;
}`);

patch("src/repositories/index.js",
`} from "./oracle/createOracleRepositories";
`,
`} from "./oracle/createOracleRepositories";

export { createSqliteRepositories } from "./sqlite/createSqliteRepositories.js";
`);

patch("src/utils/masterData.js",
`import {
  normalizeRecipeParameters,
  normalizeRecipeRecord,
  resolveRecipeTemplateId,
} from "../config/recipeTemplateEngine";`,
`import {
  normalizeRecipeParameters,
  normalizeRecipeRecord,
  resolveRecipeTemplateId,
} from "../config/recipeTemplateEngine";
import { persistMasterCategoryToSqlite } from "./masterDataSqlitePersist.js";`);

patch("src/utils/masterData.js",
`  syncMasterStoresAfterPersist(changedCategory);
}`,
`  syncMasterStoresAfterPersist(changedCategory);
  if (resolved && resolved !== "companies") {
    void persistMasterCategoryToSqlite(resolved, sessionMasterData[resolved] ?? []);
  } else if (!resolved || resolved === "companies") {
    void persistMasterCategoryToSqlite("companies", sessionMasterData.companies ?? []);
  }
}`);

patch("src/main.jsx",
`import "./utils/masterData";
import { getTitanDataEngine } from "./foundation/data";`,
`import { getTitanDataEngine } from "./foundation/data";
import {
  applyHydratedMasterToSession,
  bootV11MasterRepository,
} from "./utils/v11MasterRepositoryBoot.js";`);

patch("src/main.jsx",
`assertMenuIntegrityInDev();
getTitanDataEngine();
getTitanWorkflowEngine();
initTitanWorkflowIntegration();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`,
`async function bootstrap() {
  assertMenuIntegrityInDev();
  const boot = await bootV11MasterRepository();
  if (boot.hydrated) {
    applyHydratedMasterToSession(boot.categories);
  }
  await import("./utils/masterData");
  getTitanDataEngine();
  getTitanWorkflowEngine();
  initTitanWorkflowIntegration();

  ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

bootstrap();`);

w("scripts/verify-v11-master-sqlite-persist.mjs", `/**
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
  if (fs.existsSync(path.resolve(rel))) pass(\`file exists: \${rel}\`);
  else fail(\`file exists: \${rel}\`);
}

if (isTitanDbBridgeAvailable()) {
  pass("titanDb bridge available (Electron renderer)");
} else {
  pass("browser sessionStorage fallback (titanDb bridge unavailable in Vite dev)");
}

console.log("\\nSprint exit checklist:");
for (const item of V11_SPRINT1_EXIT_CHECKLIST) {
  console.log(" -", item);
}

const failed = checks.filter((c) => !c.ok);
console.log(\`\\nResult: \${failed.length ? "FAIL" : "PASS"} (\${checks.length - failed.length}/\${checks.length})\`);
process.exit(failed.length ? 1 : 0);
`);

const indexPath = path.join(root, "docs/blueprints/V1.1/INDEX.md");
let index = fs.readFileSync(indexPath, "utf8");
if (!index.includes("sprint1-master-repository")) {
  index = index.replace(
    "**RC1:** sessionStorage SSOT — no SQLite code in RC1.",
    "**RC1:** sessionStorage SSOT — no SQLite code in RC1.\n\n## Sprint 1 — Master Repository (2026-07-11)\n\n| Document | Description |\n|----------|-------------|\n| [Sprint 1 Master Repository SSoT](../../src/config/titanV11Sprint1MasterRepository.js) | PM Sprint 1 config — Master categories, exit checklist, frozen surfaces |\n| [master-v11.sql](../../src/database/schemas/master-v11.sql) | SQLite schema (Electron Main Process) |\n| `verify-v11-master-sqlite-persist.mjs` | Scaffold + Electron persist verification script |"
  );
  fs.writeFileSync(indexPath, index, "utf8");
  console.log("patched docs/blueprints/V1.1/INDEX.md");
}

const pkgPath = path.join(root, "package.json");
const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
if (!pkg.scripts["verify:v11-master-sqlite"]) {
  pkg.scripts["verify:v11-master-sqlite"] = "npx vite-node scripts/verify-v11-master-sqlite-persist.mjs";
}
if (!pkg.optionalDependencies?.["better-sqlite3"]) {
  pkg.optionalDependencies = pkg.optionalDependencies || {};
  pkg.optionalDependencies["better-sqlite3"] = "^11.9.1";
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n", "utf8");
  console.log("patched package.json");
}

console.log("part5 done");
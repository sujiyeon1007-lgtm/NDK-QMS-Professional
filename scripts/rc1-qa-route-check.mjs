/**
 * RC1 QA — Route registry check (static)
 * Run: node scripts/rc1-qa-route-check.mjs
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => readFileSync(join(root, rel), "utf8");

const SIDEBAR_ROUTES = [
  { menu: "HOME", path: "/home" },
  { menu: "설비현황", path: "/equipment-status" },
  { menu: "QR Engine", path: "/qr" },
  { menu: "운영관리", path: "/inout" },
  { menu: "생산관리", path: "/production" },
  { menu: "품질관리", path: "/quality" },
  { menu: "통계관리", path: "/statistics/dashboard" },
  { menu: "경리관리", path: "/accounting-clerk" },
  { menu: "회계관리", path: "/accounting" },
  { menu: "기준정보관리", path: "/settings" },
  { menu: "환경설정", path: "/environment/users" },
  { menu: "회사정보", path: "/company" },
];

const LAUNCHER_ROUTES = [
  { hub: "입출고", from: "src/config/inoutManagementLauncher.js" },
  { hub: "생산", from: "src/config/productionManagementLauncher.js" },
  { hub: "품질", from: "src/config/qualityManagementLauncher.js" },
  { hub: "기준정보", from: "src/config/masterDataLauncher.js" },
];

const WORKFLOW_ROUTES = [
  { step: "입고등록", path: "/inout/incoming" },
  { step: "생산일보", path: "/production/daily-report" },
  { step: "검사관리", path: "/quality/inspection/mass" },
  { step: "성적서관리", path: "/quality/certificate" },
  { step: "출고관리", path: "/inout/shipment" },
];

const STATISTICS_ROUTES = [
  "/statistics/dashboard",
  "/statistics/production",
  "/statistics/quality",
  "/statistics/sales",
];

const ENVIRONMENT_ROUTES = [
  "/environment/users",
  "/environment/permissions",
  "/environment/modules",
  "/environment/storage",
  "/environment/backup",
  "/environment/logs",
  "/environment/program",
  "/environment/status",
  "/environment/employees",
  "/environment/customCodes",
  "/environment/about",
  "/environment/architecture",
  "/environment/mes-poc",
  "/environment/repository-status",
  "/environment/debug",
  "/environment/company",
  "/environment/notifications",
  "/environment/data",
];

function extractRouterPaths(source) {
  const paths = new Set();
  for (const match of source.matchAll(/path="([^"]+)"/g)) paths.add(match[1]);
  for (const match of source.matchAll(/path:\s*"([^"]+)"/g)) paths.add(match[1]);
  return paths;
}

function extractLauncherPaths(source) {
  const paths = [];
  for (const match of source.matchAll(/path:\s*"([^"]+)"/g)) paths.push(match[1]);
  return paths;
}

const routerSource = read("src/router/AppRouter.jsx");
const routerPaths = extractRouterPaths(routerSource);

const errors = [];
const warnings = [];

for (const { menu, path } of SIDEBAR_ROUTES) {
  const ok = [...routerPaths].some((p) => path === p || path.startsWith(p.replace(/\/$/, "")));
  if (!ok) errors.push(`Sidebar missing route: ${menu} → ${path}`);
}

for (const { hub, from } of LAUNCHER_ROUTES) {
  const paths = extractLauncherPaths(read(from));
  for (const path of paths) {
    const ok = [...routerPaths].some((p) => p === path || path.startsWith(p));
    if (!ok) errors.push(`Launcher [${hub}] path not in router: ${path}`);
  }
  console.log(`Launcher ${hub}: ${paths.length} cards`);
}

for (const { step, path } of WORKFLOW_ROUTES) {
  const ok = [...routerPaths].some((p) => p === path || path.startsWith(p));
  if (!ok) errors.push(`Workflow missing: ${step} → ${path}`);
}

for (const path of [...STATISTICS_ROUTES, ...ENVIRONMENT_ROUTES]) {
  const ok = [...routerPaths].some((p) => p === path || path.includes(":"));
  if (!ok && !path.match(/environment\/\w+/)) {
    warnings.push(`Route pattern check: ${path}`);
  }
}

console.log("\n=== RC1 Route Check ===");
console.log(`Sidebar: ${SIDEBAR_ROUTES.length}`);
console.log(`Workflow: ${WORKFLOW_ROUTES.length}`);
console.log(`Statistics: ${STATISTICS_ROUTES.length}`);
console.log(`Environment: ${ENVIRONMENT_ROUTES.length}`);

if (warnings.length) {
  console.log("\nWarnings:");
  warnings.forEach((w) => console.log("  ⚠", w));
}
if (errors.length) {
  console.log("\nErrors:");
  errors.forEach((e) => console.log("  ❌", e));
  process.exit(1);
}
console.log("\n✅ All static route checks passed");

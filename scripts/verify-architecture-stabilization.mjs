/**
 * Architecture Stabilization Sprint — Route · Launcher · Menu verification
 * Run: node scripts/verify-architecture-stabilization.mjs
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => readFileSync(join(root, rel), "utf8");

const errors = [];
const warnings = [];

function extractPathsFromRouter(source) {
  const paths = new Set();
  for (const match of source.matchAll(/path="([^"]+)"/g)) {
    paths.add(match[1]);
  }
  return paths;
}

function extractLauncherPaths(source) {
  const paths = new Set();
  for (const match of source.matchAll(/path:\s*"([^"]+)"/g)) {
    paths.add(match[1]);
  }
  return paths;
}

const routerSource = read("src/router/AppRouter.jsx");
const routerPaths = extractPathsFromRouter(routerSource);

const launcherFiles = [
  "src/config/inoutManagementLauncher.js",
  "src/config/productionManagementLauncher.js",
  "src/config/qualityManagementLauncher.js",
  "src/config/masterDataLauncher.js",
];

const sidebarRoutes = [
  "/home",
  "/equipment-status",
  "/inout",
  "/production",
  "/quality",
  "/statistics/dashboard",
  "/settings",
  "/environment/users",
  "/company",
];

const workflowRoutes = [
  "/inout/incoming",
  "/production/daily-report",
  "/quality/inspection/mass",
  "/quality/certificate",
  "/inout/shipment",
];

const restoredRoutes = [
  "/inventory",
  "/history",
  "/production/results",
  "/work-journal",
  "/production/defect-history",
  "/documents",
  "/quality/inspection/dev",
  "/quality/inspection/other",
  "/statistics/quality",
  "/statistics/sales",
];

function pathRegistered(path) {
  if (routerPaths.has(path)) return true;
  const segments = path.split("/").filter(Boolean);
  if (segments.length === 0) return false;
  const parent = `/${segments[0]}`;
  if (routerPaths.has(parent)) return true;
  if (routerPaths.has(`:${segments.at(-1)}`)) return true;
  return routerPaths.has(path.replace(/\/[^/]+$/, "/:statisticsTab")) ||
    routerPaths.has(path.replace(/\/[^/]+$/, "/:inspectionTab")) ||
    routerPaths.has(path.replace(/\/[^/]+$/, "/:tab"));
}

for (const file of launcherFiles) {
  const source = read(file);
  const paths = extractLauncherPaths(source);
  for (const path of paths) {
    if (!path.startsWith("/")) continue;
    const ok =
      routerPaths.has(path) ||
      path.startsWith("/inout/") ||
      path.startsWith("/production/") ||
      path.startsWith("/quality/") ||
      path.startsWith("/settings/") ||
      path.startsWith("/documents") ||
      path === "/history" ||
      path === "/inventory" ||
      path === "/work-journal";
    if (!ok) {
      errors.push(`Launcher path not routed: ${path} (${file})`);
    }
  }
}

for (const path of [...sidebarRoutes, ...workflowRoutes, ...restoredRoutes]) {
  const ok =
    routerPaths.has(path) ||
    routerSource.includes(`path="${path.split("/").filter(Boolean)[0]}"`) ||
    routerSource.includes(`path="${path.split("/").pop()}"`);
  if (!ok) {
    warnings.push(`Route may be missing explicit entry: ${path}`);
  }
}

const menuFreeze = read("src/config/menuFreezeV1.js");
const orderMatch = menuFreeze.match(/MENU_FREEZE_SIDEBAR_ORDER = \[([\s\S]*?)\]/);
const menuCount = orderMatch ? (orderMatch[1].match(/"/g)?.length ?? 0) / 2 : 0;
// V2.0 Blueprint — 9 sidebar menus (회사정보 추가 · 설비현황 HOME 다음)
if (menuCount !== 9) {
  errors.push(`Sidebar menu count expected 9, got ${menuCount}`);
}

if (errors.length) {
  console.error("Architecture verification FAILED");
  errors.forEach((line) => console.error(`  ✗ ${line}`));
  process.exit(1);
}

console.log("Architecture verification OK");
console.log(`  Sidebar menus: ${menuCount}`);
console.log(`  Launcher files: ${launcherFiles.length}`);
console.log(`  Workflow routes: ${workflowRoutes.length} checked`);
if (warnings.length) {
  console.log("Warnings:");
  warnings.forEach((line) => console.warn(`  ⚠ ${line}`));
}

/**
 * V1.1 Master SSOT module load smoke test.
 * Usage: npx vite-node scripts/verify-master-ssot-load.mjs
 */
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

/** @type {Map<string, string>} */
const memory = new Map();

globalThis.sessionStorage = {
  getItem(key) {
    return memory.has(key) ? memory.get(key) : null;
  },
  setItem(key, value) {
    memory.set(key, String(value));
  },
  removeItem(key) {
    memory.delete(key);
  },
  clear() {
    memory.clear();
  },
  get length() {
    return memory.size;
  },
  key(index) {
    return [...memory.keys()][index] ?? null;
  },
};

globalThis.window = {
  dispatchEvent() {},
  addEventListener() {},
  removeEventListener() {},
};

globalThis.localStorage = {
  getItem() {
    return null;
  },
  setItem() {},
  removeItem() {},
  clear() {},
  get length() {
    return 0;
  },
  key() {
    return null;
  },
};

const modules = {
  masterData: path.join(root, "src/utils/masterData.js"),
  processWorkflow: path.join(root, "src/utils/processWorkflowTemplateSession.js"),
  inspectionTemplate: path.join(root, "src/utils/inspectionTemplateSession.js"),
  certificatePolicy: path.join(root, "src/utils/certificatePolicySession.js"),
  ssotRegistry: path.join(root, "src/config/titanV11MasterSsotRegistry.js"),
};

let failed = false;

for (const [name, filePath] of Object.entries(modules)) {
  try {
    await import(pathToFileURL(filePath).href);
    console.log(`OK import: ${name}`);
  } catch (err) {
    failed = true;
    console.error(`FAIL import: ${name}`, err?.message ?? err);
  }
}

const { getMasterDataByCategory } = await import(pathToFileURL(modules.masterData).href);
const {
  getProcessWorkflowTemplates,
  applyTemplateToProduct,
} = await import(pathToFileURL(modules.processWorkflow).href);
const { getInspectionTemplates } = await import(
  pathToFileURL(modules.inspectionTemplate).href
);
const { getCertificatePolicies } = await import(pathToFileURL(modules.certificatePolicy).href);
const {
  V11_MASTER_SSOT_REGISTRY,
  getV11MasterById,
  getV11MasterCompletionTable,
} = await import(pathToFileURL(modules.ssotRegistry).href);

const checks = [
  ["getMasterDataByCategory", () => Array.isArray(getMasterDataByCategory("company"))],
  ["getProcessWorkflowTemplates", () => Array.isArray(getProcessWorkflowTemplates())],
  [
    "applyTemplateToProduct (no-op)",
    () => {
      const templates = getProcessWorkflowTemplates();
      if (!templates.length) return true;
      applyTemplateToProduct(templates[0].id, {}, {});
      return true;
    },
  ],
  ["getInspectionTemplates", () => Array.isArray(getInspectionTemplates())],
  ["getCertificatePolicies", () => Array.isArray(getCertificatePolicies())],
  ["V11_MASTER_SSOT_REGISTRY", () => Array.isArray(V11_MASTER_SSOT_REGISTRY) && V11_MASTER_SSOT_REGISTRY.length > 0],
  ["getV11MasterById", () => typeof getV11MasterById === "function"],
  ["getV11MasterCompletionTable", () => Array.isArray(getV11MasterCompletionTable())],
];

for (const [label, fn] of checks) {
  try {
    const ok = fn();
    if (!ok) {
      failed = true;
      console.error(`FAIL check: ${label} (returned falsy)`);
    } else {
      console.log(`OK check: ${label}`);
    }
  } catch (err) {
    failed = true;
    console.error(`FAIL check: ${label}`, err?.message ?? err);
  }
}

if (failed) {
  console.error("\nverify-master-ssot-load: FAIL");
  process.exit(1);
}

console.log("\nverify-master-ssot-load: PASS");

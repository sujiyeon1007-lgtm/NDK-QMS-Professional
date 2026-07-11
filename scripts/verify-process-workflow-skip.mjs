/**
 * PM 789 - process skip/override verification
 * Usage: npx vite-node scripts/verify-process-workflow-skip.mjs
 */
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
globalThis.localStorage = globalThis.sessionStorage;

import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const productProcessWorkflow = pathToFileURL(
  path.join(root, "src/utils/productProcessWorkflow.js")
).href;
const ndkWorkflow = pathToFileURL(path.join(root, "src/utils/ndkWorkflow.js")).href;

const {
  resolveProcessStepCompletion,
  buildWorkflowChangeLogEntry,
  appendWorkflowChangeLog,
  shouldPromptProcessStepOnComplete,
  getProcessStepCompleteDialogModel,
} = await import(productProcessWorkflow);
const { buildProductHistoryTimeline } = await import(ndkWorkflow);

const CLEAN = "\uC138\uCC29";
const ION = "\uC774\uC628\uC9C8\uD654";
const SHOT = "\uC1FC\uD2B8";

const workflow = [
  { order: 1, processCategory: "cleaning", processDetail: CLEAN },
  { order: 2, processCategory: "heatTreatment", processDetail: ION },
  { order: 3, processCategory: "shot", processDetail: SHOT },
];

const record = {
  id: "test-record-1",
  processWorkflow: workflow,
  currentProcessStepIndex: 0,
  currentProcessCategory: "cleaning",
  currentProcessDetail: CLEAN,
};

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
  console.log("OK:", message);
}

assert(shouldPromptProcessStepOnComplete(record) === true, "prompt on step 0 of 3");

const model = getProcessStepCompleteDialogModel(record);
assert(model.defaultNextIndex === 1, "default next index is 1");
assert(model.remainingSteps.length === 2, "two remaining steps");

const autoAdvance = resolveProcessStepCompletion(record);
assert(autoAdvance?.mode === "advance", "auto advance mode");
assert(autoAdvance?.toIndex === 1, "auto advance to index 1");
assert(autoAdvance?.isAutoAdvance === true, "auto advance flag");

const skipResult = resolveProcessStepCompletion(record, 2);
assert(skipResult?.mode === "advance", "skip advance mode");
assert(skipResult?.toIndex === 2, "skip to index 2");
assert(skipResult?.isAutoAdvance === false, "skip is not auto advance");
assert(skipResult?.patch?.currentProcessDetail === SHOT, "patch sets shot detail");

const logEntry = buildWorkflowChangeLogEntry(record, {
  fromIndex: 0,
  toIndex: 2,
  user: "test-worker",
  note: "skip shot step",
});
assert(logEntry.action === "WORKFLOW_SKIP", "WORKFLOW_SKIP action");
assert(logEntry.fromStep === 0 && logEntry.toStep === 2, "from/to step indices");

const withLog = {
  ...record,
  workflowChangeLog: appendWorkflowChangeLog(record, logEntry),
};
assert(withLog.workflowChangeLog.length === 1, "one log entry persisted");

const timeline = buildProductHistoryTimeline({
  ...withLog,
  currentProcessStepIndex: 2,
  currentProcessDetail: SHOT,
});
assert(timeline.some((row) => row.key === "workflow-change-0"), "timeline includes workflow-change-0");

const lastStep = { ...record, currentProcessStepIndex: 2 };
assert(shouldPromptProcessStepOnComplete(lastStep) === false, "no prompt on last step");
assert(resolveProcessStepCompletion(lastStep)?.mode === "complete_final", "complete_final on last step");

console.log("\nAll process workflow skip tests passed.");

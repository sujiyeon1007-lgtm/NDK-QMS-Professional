const fs = require("fs");
const path = "scripts/verify-workflow-golden-path-p0.mjs";
let s = fs.readFileSync(path, "utf8");
s = s.replace(/const workflowIndex = pathToFileURL\(path\.join\(root, "src\/foundation\/workflow\/index\.js"\)\)\.href;\r?\n/, "");
s = s.replace(/  const \{ resetTitanWorkflowEngineInstance \} = await import\(workflowIndex\);\r?\n/, "");
s = s.replace(/  const \{ initTitanWorkflowIntegration, resetTitanWorkflowIntegrationForTests \} = await import\(integrationIndex\);\r?\n/, "");
s = s.replace(/  resetTitanWorkflowEngineInstance\(\);\r?\n  resetTitanWorkflowIntegrationForTests\(\);\r?\n  initTitanWorkflowIntegration\(\);\r?\n/, "");
s = s.replace('workflowStatus: "WORK_WAIT",', 'workflowStatus: "",');
s = s.replace(
  "  const { applyMoveToProductionWaiting } = await import(workflowStatusIndex);",
  "  const { WORKFLOW_STATUS, applyMoveToProductionWaiting, isProductionWaitingStageRecord, getWorkflowStatus } = await import(workflowStatusIndex);"
);
s = s.replace(
  "  const { getChargeableLots, ensureLotBeforeCharging } = await import(equipmentServiceIndex);",
  "  const { getChargeableLots, ensureLotBeforeCharging, getEquipmentById } = await import(equipmentServiceIndex);"
);
s = s.replace(
  '  step(label + " chargeable lot row", Boolean(waitingRow), "rows=" + chargeable.length);',
  '  const ionEq = getEquipmentById(EQUIPMENT_ID);\n  step(label + " production waiting", isProductionWaitingStageRecord(record), getWorkflowStatus(record) || "null");\n  step(label + " chargeable lot row", Boolean(waitingRow), "rows=" + chargeable.length + " eq=" + (ionEq?.status ?? "?"));'
);
fs.writeFileSync(path, s, "utf8");
console.log("patched", s.length);
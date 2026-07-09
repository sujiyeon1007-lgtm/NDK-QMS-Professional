/**
 * Project TITAN - Operations Route Registry (SSoT, RC1.1 Official Freeze)
 * @see src/config/rc11OfficialFreeze.js
 */

export const OPERATION_ROUTES = {
  inboundPending: "/operations/inbound-pending",
  inboundHistory: "/operations/inbound-history",
  productionPending: "/operations/production-pending",
  equipmentStatus: "/operations/equipment-status",
  dailyWork: "/operations/daily-work",
  shotStatus: "/operations/shot-status",
  shipmentRegister: "/operations/shipment-register",
  shipmentHistory: "/operations/shipment-history",
};

export const OPERATION_ROUTE_LABELS = {
  inboundPending: "\uC785\uACE0 \uB300\uAE30",
  inboundHistory: "\uC785\uACE0 \uC774\uB825",
  productionPending: "\uC0DD\uC0B0 \uB300\uAE30",
  equipmentStatus: "\uC124\uBE44 \uAC00\uB3D9 \uD604\uD669",
  dailyWork: "\uC791\uC5C5\uC77C\uBCF4",
  shotStatus: "\uC1FC\uD2B8 \uC791\uC5C5\uD604\uD669",
  shipmentRegister: "\uCD9C\uACE0 \uB4F1\uB85D",
  shipmentHistory: "\uCD9C\uACE0 \uC774\uB825",
};

export const OPERATION_ROUTE_GROUP = {
  inboundPending: "inoutManagement",
  inboundHistory: "inoutManagement",
  shipmentRegister: "inoutManagement",
  shipmentHistory: "inoutManagement",
  productionPending: "productionManagement",
  equipmentStatus: "productionManagement",
  dailyWork: "productionManagement",
  shotStatus: "productionManagement",
};

export const OPERATION_LEGACY_ROUTE_ALIASES = {
  "/production/plan": OPERATION_ROUTES.productionPending,
  "/production/equipment-status": OPERATION_ROUTES.equipmentStatus,
  "/production/daily-report": OPERATION_ROUTES.dailyWork,
  "/production/shot": OPERATION_ROUTES.shotStatus,
};

export function getOperationRouteKeyByPath(pathname = "") {
  const pathValue = String(pathname).split("?")[0];
  const entry = Object.entries(OPERATION_ROUTES).find(([, value]) => value === pathValue);
  return entry?.[0] ?? null;
}

/** RC1.1 - Operations Workflow UX navigation hints (workflow data unchanged) */
export const OPERATIONS_WORKFLOW_NEXT_STEPS = {
  inboundRegisterComplete: {
    id: "inboundRegisterComplete",
    title: "\uC785\uACE0 \uB4F1\uB85D \uC644\uB8CC",
    message: "\uC785\uACE0 \uB4F1\uB85D\uC774 \uC644\uB8CC\uB418\uC5C8\uC2B5\uB2C8\uB2E4.",
    hint: "\uB2E4\uC74C \uB2E8\uACC4\uB85C \uC0DD\uC0B0 \uB300\uAE30 \uD654\uBA74\uC5D0\uC11C \uC791\uC5C5\uC744 \uC774\uC5B4\uAC08 \uC218 \uC788\uC2B5\uB2C8\uB2E4.",
    nextLabel: "\uC0DD\uC0B0 \uB300\uAE30\uB85C \uC774\uB3D9",
    nextPath: OPERATION_ROUTES.productionPending,
    stayLabel: "\uC785\uACE0 \uB300\uAE30\uC5D0 \uBA38\uBB34\uB974\uAE30",
  },
  inboundListPrinted: {
    id: "inboundListPrinted",
    title: "\uC785\uACE0\uB9AC\uC2A4\uD2B8 \uCD9C\uB825 \uC644\uB8CC",
    message: "\uC785\uACE0\uB9AC\uC2A4\uD2B8 \uCD9C\uB825\uC774 \uC644\uB8CC\uB418\uC5C8\uC2B5\uB2C8\uB2E4.",
    hint: "\uC0DD\uC0B0\uBD80\uC5D0 \uC804\uB2EC \uD6C4 \uC0DD\uC0B0 \uB300\uAE30\uC5D0\uC11C \uC791\uC5C5\uC744 \uC9C4\uD589\uD558\uC138\uC694.",
    nextLabel: "\uC0DD\uC0B0 \uB300\uAE30\uB85C \uC774\uB3D9",
    nextPath: OPERATION_ROUTES.productionPending,
    stayLabel: "\uC785\uACE0 \uB300\uAE30\uC5D0 \uBA38\uBB34\uB974\uAE30",
  },
  productionLotCreated: {
    id: "productionLotCreated",
    title: "LOT \uC0DD\uC131 \uC644\uB8CC",
    message: "LOT \uC0DD\uC131\uC774 \uC644\uB8CC\uB418\uC5C8\uC2B5\uB2C8\uB2E4.",
    hint: "\uC791\uC5C5\uC77C\uBCF4 \uD654\uBA74\uC5D0\uC11C \uC0DD\uC0B0 \uC815\uBCF4\uB97C \uB4F1\uB85D\uD558\uC138\uC694.",
    nextLabel: "\uC791\uC5C5\uC77C\uBCF4\uB85C \uC774\uB3D9",
    nextPath: OPERATION_ROUTES.dailyWork,
    stayLabel: "\uC0DD\uC0B0 \uB300\uAE30\uC5D0 \uBA38\uBB34\uB974\uAE30",
  },
  shotComplete: {
    id: "shotComplete",
    title: "\uC1FC\uD2B8 \uC791\uC5C5 \uC644\uB8CC",
    message: "\uC1FC\uD2B8 \uC791\uC5C5\uC774 \uC644\uB8CC\uB418\uC5C8\uC2B5\uB2C8\uB2E4.",
    hint: "\uCD9C\uACE0 \uB4F1\uB85D \uD654\uBA74\uC5D0\uC11C \uCD9C\uACE0\uB97C \uC9C4\uD589\uD558\uC138\uC694.",
    nextLabel: "\uCD9C\uACE0 \uB4F1\uB85D\uC73C\uB85C \uC774\uB3D9",
    nextPath: OPERATION_ROUTES.shipmentRegister,
    stayLabel: "\uC1FC\uD2B8 \uC791\uC5C5\uC5D0 \uBA38\uBB34\uB974\uAE30",
  },
  outboundCompleteOnly: {
    id: "outboundCompleteOnly",
    title: "\uCD9C\uACE0 \uB4F1\uB85D \uC644\uB8CC",
    message: "\uCD9C\uACE0 \uB4F1\uB85D\uC774 \uC644\uB8CC\uB418\uC5C8\uC2B5\uB2C8\uB2E4. \uAC70\uB798\uBA85\uC138\uC11C\uB294 \uBCF4\uB958 \uC0C1\uD0DC\uC785\uB2C8\uB2E4.",
    hint: "\uAC70\uB798\uBA85\uC138\uC11C\uB294 \uCD9C\uACE0 \uB4F1\uB85D \uD654\uBA74 \uB610\uB294 \uCD9C\uACE0 \uC774\uB825\uC5D0\uC11C \uB098\uC911\uC5D0 \uBC1C\uD589\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.",
    nextLabel: "\uCD9C\uACE0 \uC774\uB825 \uBCF4\uAE30",
    nextPath: OPERATION_ROUTES.shipmentHistory,
    stayLabel: "\uCD9C\uACE0 \uB4F1\uB85D\uC5D0 \uBA38\uBB34\uB974\uAE30",
  },
  statementIssued: {
    id: "statementIssued",
    title: "\uAC70\uB798\uBA85\uC138\uC11C \uBC1C\uD589 \uC644\uB8CC",
    message: "\uAC70\uB798\uBA85\uC138\uC11C\uAC00 \uBC1C\uD589\uB418\uC5C8\uC2B5\uB2C8\uB2E4.",
    hint: "\uCD9C\uACE0 \uC774\uB825\uC5D0\uC11C \uBC1C\uD589 \uB0B4\uC5ED\uC744 \uD655\uC778\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.",
    nextLabel: "\uCD9C\uACE0 \uC774\uB825 \uBCF4\uAE30",
    nextPath: OPERATION_ROUTES.shipmentHistory,
    stayLabel: "\uCD9C\uACE0 \uB4F1\uB85D\uC5D0 \uBA38\uBB34\uB974\uAE30",
  },
};

export function getOperationsWorkflowNextStep(stepId) {
  return OPERATIONS_WORKFLOW_NEXT_STEPS[stepId] ?? null;
}
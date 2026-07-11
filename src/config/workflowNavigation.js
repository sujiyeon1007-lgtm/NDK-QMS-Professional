/**
 * RC1 Workflow Navigation UX - SSoT (PM Final)
 * Guides register/work screens only; does not force workflow transitions.
 */
import { OPERATION_ROUTES } from "./operationsRouteRegistry";

export const MASTER_WORKFLOW_ROUTES = {
  productRegister: "/settings/products",
};

export const QUALITY_WORKFLOW_ROUTES = {
  inspectionRegister: "/quality/inspection/register",
  inspectionRegisterEntry: "/quality/inspection/register/entry",
  certificateRegister: "/quality/certificate/register",
  certificateStatus: "/quality/certificate/status",
};

export const WORKFLOW_NAVIGATION_STEPS = {
  productRegister: {
    id: "productRegister",
    label: "\uC81C\uD488\uB4F1\uB85D",
    path: MASTER_WORKFLOW_ROUTES.productRegister,
    prev: [],
    next: ["inboundManagement"],
  },
  inboundManagement: {
    id: "inboundManagement",
    label: "\uC785\uACE0\uAD00\uB9AC",
    path: OPERATION_ROUTES.inboundPending,
    prev: ["productRegister"],
    next: ["productionPending"],
  },
  productionPending: {
    id: "productionPending",
    label: "\uC0DD\uC0B0\uB300\uAE30",
    path: OPERATION_ROUTES.productionPending,
    prev: ["inboundManagement"],
    next: ["equipmentStatus"],
  },
  equipmentStatus: {
    id: "equipmentStatus",
    label: "\uC124\uBE44\uAC00\uB3D9\uD604\uD669",
    path: OPERATION_ROUTES.equipmentStatus,
    prev: ["productionPending"],
    next: ["dailyWork"],
  },
  dailyWork: {
    id: "dailyWork",
    label: "\uC791\uC5C5\uC77C\uBCF4",
    path: OPERATION_ROUTES.dailyWork,
    prev: ["equipmentStatus"],
    next: ["inspectionRegister"],
  },
  inspectionRegister: {
    id: "inspectionRegister",
    label: "\uAC80\uC0AC\uB4F1\uB85D",
    path: QUALITY_WORKFLOW_ROUTES.inspectionRegister,
    prev: ["dailyWork"],
    next: ["certificateRegister"],
  },
  certificateRegister: {
    id: "certificateRegister",
    label: "\uC131\uC801\uC11C\uB4F1\uB85D",
    path: QUALITY_WORKFLOW_ROUTES.certificateRegister,
    prev: ["inspectionRegister"],
    next: ["outboundManagement"],
  },
  outboundManagement: {
    id: "outboundManagement",
    label: "\uCD9C\uACE0\uAD00\uB9AC",
    path: OPERATION_ROUTES.shipmentRegister,
    prev: ["certificateRegister"],
    next: ["outboundHistory"],
  },
  outboundHistory: {
    id: "outboundHistory",
    label: "\uCD9C\uACE0\uC774\uB825",
    path: OPERATION_ROUTES.shipmentHistory,
    prev: ["outboundManagement"],
    next: [],
  },
};

const PATH_TO_STEP_ID = Object.values(WORKFLOW_NAVIGATION_STEPS).reduce((acc, step) => {
  acc[step.path] = step.id;
  return acc;
}, {});

PATH_TO_STEP_ID[QUALITY_WORKFLOW_ROUTES.inspectionRegisterEntry] = "inspectionRegister";

export function resolveWorkflowNavigationStepId(pathname = "") {
  const path = String(pathname).split("?")[0];
  return PATH_TO_STEP_ID[path] ?? null;
}

export function getWorkflowNavigationContext(stepId) {
  const current = WORKFLOW_NAVIGATION_STEPS[stepId];
  if (!current) return null;
  const prev = (current.prev ?? []).map((id) => WORKFLOW_NAVIGATION_STEPS[id]).filter(Boolean);
  const next = (current.next ?? []).map((id) => WORKFLOW_NAVIGATION_STEPS[id]).filter(Boolean);
  return { current, prev, next };
}

export const WORKFLOW_COMPLETION_DIALOGS = {
  inboundComplete: {
    id: "inboundComplete",
    title: "\uC785\uACE0 \uC644\uB8CC",
    message: "\uC785\uACE0\uAC00 \uC644\uB8CC\uB418\uC5C8\uC2B5\uB2C8\uB2E4.",
    hint: "\uC0DD\uC0B0 \uB300\uAE30 \uD654\uBA74\uC5D0\uC11C LOT \uC0DD\uC131 \uBC0F \uC791\uC5C5\uC744 \uC774\uC5B4\uAC08 \uC218 \uC788\uC2B5\uB2C8\uB2E4.",
    primaryLabel: "\uC0DD\uC0B0\uB300\uAE30\uB85C \uC774\uB3D9",
    primaryPath: OPERATION_ROUTES.productionPending,
    secondaryLabel: "\uACC4\uC18D \uC785\uACE0\uB4F1\uB85D",
  },
  productionStart: {
    id: "productionStart",
    title: "\uC0DD\uC0B0 \uC2DC\uC791",
    message: "\uC0DD\uC0B0\uC774 \uC2DC\uC791\uB418\uC5C8\uC2B5\uB2C8\uB2E4.",
    hint: "\uC124\uBE44 \uAC00\uB3D9 \uD604\uD669\uC5D0\uC11C \uC7A5\uC785 \u00B7 \uC6B4\uC804 \uC0C1\uD0DC\uB97C \uD655\uC778\uD558\uC138\uC694.",
    primaryLabel: "\uC124\uBE44\uAC00\uB3D9\uD604\uD669\uC73C\uB85C \uC774\uB3D9",
    primaryPath: OPERATION_ROUTES.equipmentStatus,
    secondaryLabel: "\uACC4\uC18D \uC0DD\uC0B0\uB300\uAE30",
    secondaryPath: OPERATION_ROUTES.productionPending,
  },
  productionComplete: {
    id: "productionComplete",
    title: "\uC0DD\uC0B0 \uC644\uB8CC",
    message: "\uC0DD\uC0B0\uC774 \uC644\uB8CC\uB418\uC5C8\uC2B5\uB2C8\uB2E4.",
    hint: "\uC791\uC5C5\uC77C\uBCF4 \uD654\uBA74\uC5D0\uC11C \uC0DD\uC0B0 \uC815\uBCF4\uB97C \uD655\uC778\u00B7 \uB4F1\uB85D\uD558\uC138\uC694.",
    primaryLabel: "\uC791\uC5C5\uC77C\uBCF4\uB85C \uC774\uB3D9",
    primaryPath: OPERATION_ROUTES.dailyWork,
    secondaryLabel: "\uACC4\uC18D \uC0DD\uC0B0",
  },
  dailyWorkSaveComplete: {
    id: "dailyWorkSaveComplete",
    title: "\uC791\uC5C5\uC77C\uBCF4 \uC800\uC7A5 \uC644\uB8CC",
    message: "\uC791\uC5C5\uC77C\uBCF4\uAC00 \uC800\uC7A5\uB418\uC5C8\uC2B5\uB2C8\uB2E4.",
    hint: "\uAC80\uC0AC \uB4F1\uB85D \uD654\uBA74\uC5D0\uC11C \uAC80\uC0AC \uB9AC\uD3EC\uD2B8\uB97C \uC791\uC131\uD558\uC138\uC694.",
    primaryLabel: "\uAC80\uC0AC\uB4F1\uB85D\uC73C\uB85C \uC774\uB3D9",
    primaryPath: QUALITY_WORKFLOW_ROUTES.inspectionRegister,
    secondaryLabel: "\uACC4\uC18D \uC791\uC5C5\uC77C\uBCF4",
  },
  inspectionComplete: {
    id: "inspectionComplete",
    title: "\uAC80\uC0AC \uC644\uB8CC",
    message: "\uAC80\uC0AC\uAC00 \uC644\uB8CC\uB418\uC5C8\uC2B5\uB2C8\uB2E4.",
    hint: "\uC131\uC801\uC11C \uB4F1\uB85D \uD654\uBA74\uC5D0\uC11C \uC131\uC801\uC11C\uB97C \uBC1C\uD589\uD558\uC138\uC694.",
    primaryLabel: "\uC131\uC801\uC11C\uB4F1\uB85D\uC73C\uB85C \uC774\uB3D9",
    primaryPath: QUALITY_WORKFLOW_ROUTES.certificateRegister,
    secondaryLabel: "\uACC4\uC18D \uAC80\uC0AC",
  },
  certificateIssueComplete: {
    id: "certificateIssueComplete",
    title: "\uC131\uC801\uC11C \uBC1C\uD589 \uC644\uB8CC",
    message: "\uC131\uC801\uC11C \uBC1C\uD589\uC774 \uC644\uB8CC\uB418\uC5C8\uC2B5\uB2C8\uB2E4.",
    hint: "\uCD9C\uACE0 \uAD00\uB9AC \uD654\uBA74\uC5D0\uC11C \uCD9C\uACE0\uB97C \uC9C4\uD589\uD558\uC138\uC694.",
    primaryLabel: "\uCD9C\uACE0\uAD00\uB9AC\uB85C \uC774\uB3D9",
    primaryPath: OPERATION_ROUTES.shipmentRegister,
    secondaryLabel: "\uC131\uC801\uC11C\uD604\uD669 \uBCF4\uAE30",
    secondaryPath: QUALITY_WORKFLOW_ROUTES.certificateStatus,
  },
  outboundComplete: {
    id: "outboundComplete",
    title: "\uCD9C\uACE0 \uC644\uB8CC",
    message: "\uCD9C\uACE0\uAC00 \uC644\uB8CC\uB418\uC5C8\uC2B5\uB2C8\uB2E4.",
    hint: "\uCD9C\uACE0 \uC774\uB825\uC5D0\uC11C \uB4F1\uB85D \uB0B4\uC5ED\uC744 \uD655\uC778\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.",
    primaryLabel: "\uCD9C\uACE0\uC774\uB825 \uBCF4\uAE30",
    primaryPath: OPERATION_ROUTES.shipmentHistory,
    secondaryLabel: "\uACC4\uC18D \uCD9C\uACE0\uB4F1\uB85D",
  },
};

export function getWorkflowCompletionDialog(completionId) {
  const dialog = WORKFLOW_COMPLETION_DIALOGS[completionId];
  if (!dialog) return null;
  return {
    title: dialog.title,
    message: dialog.message,
    hint: dialog.hint,
    nextLabel: dialog.primaryLabel,
    nextPath: dialog.primaryPath,
    stayLabel: dialog.secondaryLabel,
    stayPath: dialog.secondaryPath,
  };
}
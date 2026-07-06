import TitanProcessNameCell from "../foundation/components/TitanProcessNameCell";
import { isHeatTreatmentProcessLabel } from "../config/heatTreatmentProcessColors";
import {
  isWorkflowStageLabel,
  normalizeWorkflowProcessKey,
} from "../config/workflowProcessColors";
import {
  getScreenWorkflowProcess,
  resolveRecordCurrentProcess,
} from "./workflowProcessStatus";

/**
 * 현재공정(Workflow stage) Chip — 전 화면 공통
 *
 * V1.4: 전 화면 dynamic 9-stage 현재공정 — resolveRecordCurrentProcess SSoT
 *
 * @param {object | null | undefined} row
 * @param {{ labelKey?: string, processKeyKey?: string, className?: string }} [options]
 */
export function renderWorkflowProcessChip(row, options = {}) {
  const { labelKey = "currentProcess", processKeyKey, className = "" } = options;
  const screenKey = row?.screenKey;

  if (screenKey) {
    const label = row?.[labelKey] ?? row?.workflowProcess ?? getScreenWorkflowProcess(screenKey);
    if (isHeatTreatmentProcessLabel(label)) {
      return "—";
    }
    const processKey = normalizeWorkflowProcessKey(
      row?.[processKeyKey ?? "currentProcessKey"] ?? row?.currentProcessVariant ?? label
    );
    return (
      <TitanProcessNameCell label={label} processKey={processKey} className={className} />
    );
  }

  const record = row?.record ?? null;

  if (record) {
    const current = resolveRecordCurrentProcess(record);
    return (
      <TitanProcessNameCell
        label={current.label}
        processKey={current.key}
        className={className}
      />
    );
  }

  let label = row?.[labelKey] ?? row?.workflowProcess;
  const processKey =
    row?.[processKeyKey ?? "currentProcessKey"] ??
    row?.currentProcessVariant ??
    row?.processKey ??
    label;

  if (isHeatTreatmentProcessLabel(label)) {
    return "—";
  }

  if (!label || label === "—") {
    return "—";
  }

  const normalized = normalizeWorkflowProcessKey(processKey ?? label);
  const staleIncomingFallback =
    normalized === "incoming" && !isWorkflowStageLabel(label) && !String(label).includes("입고");

  if (staleIncomingFallback) {
    return "—";
  }

  return (
    <TitanProcessNameCell
      label={label}
      processKey={normalized}
      className={className}
    />
  );
}

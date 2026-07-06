import TitanProcessNameCell from "../../foundation/components/TitanProcessNameCell";
import { resolveRecordCurrentProcess } from "../../utils/workflowProcessStatus";

/** 목록 — 현재공정 Badge (resolveRecordCurrentProcess SSoT) */
export default function HomeCurrentProcessBadgeCell({ row }) {
  const record = row?.record ?? null;
  const current = record ? resolveRecordCurrentProcess(record) : null;
  const label = current?.label ?? row?.currentProcess ?? "—";
  const processKey = current?.key ?? row?.currentProcessKey ?? row?.processKey ?? "incoming";

  if (!label || label === "—") {
    return <span className="home-current-process-badge__empty">—</span>;
  }

  return (
    <TitanProcessNameCell
      label={label}
      processKey={processKey}
      className="home-current-process-badge"
    />
  );
}

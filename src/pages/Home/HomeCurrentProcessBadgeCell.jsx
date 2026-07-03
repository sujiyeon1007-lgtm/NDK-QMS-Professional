import StatusChip from "../../foundation/components/StatusChip";

const PROCESS_CHIP_VARIANT = {
  incoming: "incoming",
  production: "production",
  inspection: "inspect",
  certificate: "certificate",
  shipment: "ship-wait",
};

/** 목록 — 현재공정 Badge (buildHomeRowWorkflow 와 동일 값) */
export default function HomeCurrentProcessBadgeCell({ row }) {
  const label = row?.currentProcess ?? "—";
  const processKey = row?.processKey ?? "incoming";
  const allDone = row?.phases?.every((phase) => phase.state === "done");
  const variant = allDone ? "ship-done" : PROCESS_CHIP_VARIANT[processKey] ?? "wait";

  if (!label || label === "—") {
    return <span className="home-current-process-badge__empty">—</span>;
  }

  return (
    <StatusChip variant={variant} className="home-current-process-badge">
      {label}
    </StatusChip>
  );
}

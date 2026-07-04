import StatusChip from "../../foundation/components/StatusChip";

/** 목록 — 현재공정 Badge (buildHomeRowWorkflow 와 동일 값) */
export default function HomeCurrentProcessBadgeCell({ row }) {
  const label = row?.currentProcess ?? "—";
  const variant = row?.currentProcessVariant ?? "wait";

  if (!label || label === "—") {
    return <span className="home-current-process-badge__empty">—</span>;
  }

  return (
    <StatusChip variant={variant} className="home-current-process-badge">
      {label}
    </StatusChip>
  );
}

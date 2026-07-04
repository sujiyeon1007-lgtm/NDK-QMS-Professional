const STATUS_VARIANTS = {
  progress: "titan-status-chip--progress",
  complete: "titan-status-chip--complete",
  wait: "titan-status-chip--wait",
  hold: "titan-status-chip--hold",
  defect: "titan-status-chip--defect",
  incoming: "titan-status-chip--incoming",
  production: "titan-status-chip--production",
  certificate: "titan-status-chip--certificate",
  "prod-wait": "titan-status-chip--prod-wait",
  "prod-done": "titan-status-chip--prod-done",
  inspect: "titan-status-chip--inspect",
  "inspect-wait": "titan-status-chip--inspect-wait",
  "inspect-done": "titan-status-chip--inspect-done",
  "cert-wait": "titan-status-chip--cert-wait",
  "cert-done": "titan-status-chip--cert-done",
  "ship-wait": "titan-status-chip--ship-wait",
  "ship-ready": "titan-status-chip--ship-ready",
  "ship-done": "titan-status-chip--ship-done",
  info: "titan-status-chip--info",
};

const HT_PROCESS_VARIANTS = {
  "gas-nitriding": "titan-ht-process--gas-nitriding",
  "ion-nitriding": "titan-ht-process--ion-nitriding",
  carburizing: "titan-ht-process--carburizing",
  "induction-hardening": "titan-ht-process--induction-hardening",
  "salt-bath-nitriding": "titan-ht-process--salt-bath-nitriding",
  "vacuum-heat-treat": "titan-ht-process--vacuum-heat-treat",
  annealing: "titan-ht-process--annealing",
  normalizing: "titan-ht-process--normalizing",
  "quench-temper": "titan-ht-process--quench-temper",
  "soft-nitriding": "titan-ht-process--soft-nitriding",
  default: "titan-ht-process--default",
};

export default function StatusChip({ children, variant = "wait", kind = "status", className = "" }) {
  if (kind === "process" || HT_PROCESS_VARIANTS[variant]) {
    const processTone = HT_PROCESS_VARIANTS[variant] ?? HT_PROCESS_VARIANTS.default;
    return (
      <span className={`titan-ht-process-chip ${processTone} ${className}`.trim()}>
        <span className="titan-ht-process-chip__dot" aria-hidden="true" />
        <span className="titan-ht-process-chip__label">{children}</span>
      </span>
    );
  }

  const tone = STATUS_VARIANTS[variant] ?? STATUS_VARIANTS.wait;
  return (
    <span className={`titan-status-chip ${tone} ${className}`.trim()}>{children}</span>
  );
}

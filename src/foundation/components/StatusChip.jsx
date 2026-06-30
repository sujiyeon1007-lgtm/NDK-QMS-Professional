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
  inspect: "titan-status-chip--inspect",
  "ship-wait": "titan-status-chip--ship-wait",
};

export default function StatusChip({ children, variant = "wait", className = "" }) {
  const tone = STATUS_VARIANTS[variant] ?? STATUS_VARIANTS.wait;
  return (
    <span className={`titan-status-chip ${tone} ${className}`.trim()}>{children}</span>
  );
}

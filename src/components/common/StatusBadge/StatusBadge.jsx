function StatusBadge({ status, className = "" }) {
  return <span className={`status-badge ${status} ${className}`.trim()}>{status}</span>;
}

export default StatusBadge;

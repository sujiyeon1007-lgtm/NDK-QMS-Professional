const COLOR_MAP = {
  blue: "info",
  green: "success",
  orange: "warning",
  red: "danger",
  gray: "inactive",
};

export default function TitanStatusBadge({
  children,
  text,
  status = "inactive",
  color,
  className = "",
  ...props
}) {
  const resolved = COLOR_MAP[color] ?? status;
  return (
    <span className={`titan-status-badge titan-status-badge--${resolved} ${className}`.trim()} {...props}>
      {children ?? text}
    </span>
  );
}

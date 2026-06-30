export default function TitanAdvancedSearch({ open, children, className = "" }) {
  return (
    <div
      className={`titan-advanced-search${open ? " titan-advanced-search--open" : ""} ${className}`.trim()}
      aria-hidden={!open}
    >
      <div className="titan-advanced-search__inner">{children}</div>
    </div>
  );
}

export default function TitanLoadingSkeleton({
  rows = 1,
  className = "",
  itemClassName = "",
  "aria-label": ariaLabel = "Loading",
}) {
  return (
    <div className={`titan-loading-skeleton-group ${className}`.trim()} aria-label={ariaLabel} aria-busy="true">
      {Array.from({ length: rows }).map((_, index) => (
        <span
          key={index}
          className={`titan-loading-skeleton ${itemClassName}`.trim()}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

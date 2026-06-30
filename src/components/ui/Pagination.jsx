export default function Pagination({
  page = 1,
  totalPages = 1,
  totalCount,
  onPageChange,
  maxButtons = 5,
  className = "",
}) {
  const safeTotal = Math.max(1, totalPages);
  const safePage = Math.min(Math.max(1, page), safeTotal);

  const pages = [];
  const start = Math.max(1, safePage - Math.floor(maxButtons / 2));
  const end = Math.min(safeTotal, start + maxButtons - 1);
  const adjustedStart = Math.max(1, end - maxButtons + 1);

  for (let i = adjustedStart; i <= end; i += 1) {
    pages.push(i);
  }

  return (
    <div className={`ndk-pagination-wrap ${className}`.trim()}>
      <nav className="ndk-pagination" aria-label="페이지">
        {adjustedStart > 1 ? (
          <>
            <button
              type="button"
              className={`ndk-pagination__btn${safePage === 1 ? " is-active" : ""}`}
              onClick={() => onPageChange?.(1)}
            >
              1
            </button>
            {adjustedStart > 2 ? <span className="ndk-pagination__ellipsis">…</span> : null}
          </>
        ) : null}
        {pages.map((pageNum) => (
          <button
            key={pageNum}
            type="button"
            className={`ndk-pagination__btn${safePage === pageNum ? " is-active" : ""}`}
            aria-current={safePage === pageNum ? "page" : undefined}
            onClick={() => onPageChange?.(pageNum)}
          >
            {pageNum}
          </button>
        ))}
        {end < safeTotal ? (
          <>
            {end < safeTotal - 1 ? <span className="ndk-pagination__ellipsis">…</span> : null}
            <button
              type="button"
              className={`ndk-pagination__btn${safePage === safeTotal ? " is-active" : ""}`}
              onClick={() => onPageChange?.(safeTotal)}
            >
              {safeTotal}
            </button>
          </>
        ) : null}
      </nav>
      {totalCount != null ? (
        <span className="ndk-pagination__total">총 {totalCount.toLocaleString()}건</span>
      ) : null}
    </div>
  );
}

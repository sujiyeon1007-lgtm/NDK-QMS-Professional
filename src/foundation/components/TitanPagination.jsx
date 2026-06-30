export default function TitanPagination({
  page,
  totalPages,
  onPageChange,
  className = "",
  maxVisible = 5,
}) {
  const pages = buildVisiblePages(page, totalPages, maxVisible);

  return (
    <nav className={`titan-pagination ${className}`.trim()} aria-label="페이지 네비게이션">
      <button
        type="button"
        className="titan-pagination__btn"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        aria-label="이전 페이지"
      >
        ◀
      </button>
      {pages.map((p, index) =>
        p === "…" ? (
          <span key={`ellipsis-${index}`} className="titan-pagination__ellipsis">
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            className={`titan-pagination__btn${p === page ? " active" : ""}`}
            onClick={() => onPageChange(p)}
            aria-current={p === page ? "page" : undefined}
          >
            {p}
          </button>
        )
      )}
      <button
        type="button"
        className="titan-pagination__btn"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        aria-label="다음 페이지"
      >
        ▶
      </button>
    </nav>
  );
}

function buildVisiblePages(page, totalPages, maxVisible) {
  if (totalPages <= maxVisible) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const half = Math.floor(maxVisible / 2);
  let start = Math.max(1, page - half);
  let end = Math.min(totalPages, start + maxVisible - 1);
  start = Math.max(1, end - maxVisible + 1);

  const result = [];
  for (let i = start; i <= end; i += 1) {
    result.push(i);
  }
  return result;
}

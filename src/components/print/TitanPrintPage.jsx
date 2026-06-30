/** Project TITAN 공통 A4 출력 페이지 */
function TitanPrintPage({
  pageNumber,
  totalPages,
  isLast = false,
  printDateTime = "",
  printUser = "",
  orientation = "portrait",
  children,
}) {
  return (
    <article
      className={`titan-print-page${isLast ? " is-last" : ""}`}
      data-print-orientation={orientation}
      aria-label={`출력 페이지 ${pageNumber}`}
    >
      <div className="titan-print-page-body">{children}</div>
      <footer className="titan-print-page-footer">
        <span className="titan-print-footer-meta">
          {printDateTime && <em>출력일시 {printDateTime}</em>}
          {printUser && <em>출력 사용자 {printUser}</em>}
        </span>
        <span className="titan-print-footer-page">
          Page {pageNumber} / {totalPages}
        </span>
      </footer>
    </article>
  );
}

export default TitanPrintPage;

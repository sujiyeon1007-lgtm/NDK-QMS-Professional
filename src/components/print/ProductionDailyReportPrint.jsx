import { useMemo } from "react";
import { getPrintDateTime, getPrintUser } from "../../utils/titanPrintContext";
import { buildHtlPrintLayout, HTL_PRINT_TITLE } from "../../utils/htlWorkListPrintLayout";
import { PRINT_ORIENTATION } from "../../utils/titanPrintLayout";
import TitanPrintPage from "./TitanPrintPage";
import TitanPrintPageHeader from "./TitanPrintPageHeader";
import TitanPrintTable from "./TitanPrintTable";
import "./titan-print.css";

/**
 * 생산일보 출력 — 열처리 작업 요청 리스트 양식 + 상단 열처리 조건 (V1.0)
 */
function ProductionDailyReportPrint({
  rows,
  listNo = "",
  printDate = "",
  workDate = "",
  workMemo = "",
  heatTreatmentConditions = "",
  printDateTime = "",
  printUser = "",
}) {
  const resolvedPrintDateTime = printDateTime || getPrintDateTime();
  const resolvedPrintUser = printUser || getPrintUser();
  const trimmedMemo = workMemo.trim();
  const trimmedConditions = heatTreatmentConditions.trim();

  const layout = useMemo(
    () => buildHtlPrintLayout(rows, workDate, { workMemo: trimmedMemo }),
    [rows, workDate, trimmedMemo]
  );
  const { columns, columnWidths, orientation, pages } = layout;
  const totalPages = pages.length;
  const isLandscape = orientation === PRINT_ORIENTATION.LANDSCAPE;

  return (
    <div
      className={`titan-print-document htl-work-list-print production-daily-report-print${
        isLandscape ? " titan-print-landscape" : ""
      }`}
      data-print-orientation={orientation}
      aria-label="생산일보"
    >
      {pages.map((pageRows, pageIndex) => (
        <TitanPrintPage
          key={`daily-report-page-${pageIndex}`}
          pageNumber={pageIndex + 1}
          totalPages={totalPages}
          isLast={pageIndex === totalPages - 1}
          printDateTime={resolvedPrintDateTime}
          printUser={resolvedPrintUser}
          orientation={orientation}
        >
          <TitanPrintPageHeader title={HTL_PRINT_TITLE} />

          {(listNo || printDate) && (
            <div className="titan-print-meta">
              {listNo && (
                <span>
                  리스트 No. <strong>{listNo}</strong>
                </span>
              )}
              {printDate && (
                <span>
                  작업일 <strong>{printDate}</strong>
                </span>
              )}
            </div>
          )}

          {pageIndex === 0 && trimmedConditions ? (
            <section className="titan-print-memo" aria-label="열처리 조건">
              <h2>열처리 조건</h2>
              <p>{trimmedConditions}</p>
            </section>
          ) : null}

          <TitanPrintTable columns={columns} rows={pageRows} columnWidths={columnWidths} />

          {pageIndex === totalPages - 1 && trimmedMemo && (
            <section className="titan-print-memo" aria-label="전달사항">
              <h2>전달사항</h2>
              <p>{trimmedMemo}</p>
            </section>
          )}
        </TitanPrintPage>
      ))}
    </div>
  );
}

export default ProductionDailyReportPrint;

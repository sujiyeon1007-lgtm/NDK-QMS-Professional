import { useMemo } from "react";
import { getPrintDateTime, getPrintUser } from "../../utils/titanPrintContext";
import {
  buildProductionDailyPrintLayout,
  PRODUCTION_DAILY_PRINT_TITLE,
} from "../../utils/productionDailyReportPrintLayout";
import { PRINT_ORIENTATION } from "../../utils/titanPrintLayout";
import TitanPrintPage from "./TitanPrintPage";
import TitanPrintPageHeader from "./TitanPrintPageHeader";
import TitanPrintTable from "./TitanPrintTable";
import "./titan-print.css";

function ProductionDailyReportPrint({
  rows,
  reportDate = "",
  reportMemo = "",
  printDateTime = "",
  printUser = "",
}) {
  const resolvedPrintDateTime = printDateTime || getPrintDateTime();
  const resolvedPrintUser = printUser || getPrintUser();
  const trimmedMemo = reportMemo.trim();

  const layout = useMemo(
    () => buildProductionDailyPrintLayout(rows, { reportMemo: trimmedMemo }),
    [rows, trimmedMemo]
  );
  const { columns, columnWidths, orientation, pages } = layout;
  const totalPages = pages.length;
  const isLandscape = orientation === PRINT_ORIENTATION.LANDSCAPE;

  return (
    <div
      className={`titan-print-document production-daily-report-print${
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
          <TitanPrintPageHeader title={PRODUCTION_DAILY_PRINT_TITLE} />

          {reportDate && (
            <div className="titan-print-meta">
              <span>
                보고 기준일 <strong>{reportDate}</strong>
              </span>
            </div>
          )}

          <TitanPrintTable columns={columns} rows={pageRows} columnWidths={columnWidths} />

          {pageIndex === totalPages - 1 && trimmedMemo && (
            <section className="titan-print-memo" aria-label="특이사항">
              <h2>특이사항</h2>
              <p>{trimmedMemo}</p>
            </section>
          )}
        </TitanPrintPage>
      ))}
    </div>
  );
}

export default ProductionDailyReportPrint;

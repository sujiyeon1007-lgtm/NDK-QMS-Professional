import { useMemo } from "react";
import { getPrintDateTime, getPrintUser } from "../../utils/titanPrintContext";
import { buildOutboundPrintLayout, OUTBOUND_PRINT_TITLE } from "../../utils/outboundListPrintLayout";
import { PRINT_ORIENTATION } from "../../utils/titanPrintLayout";
import TitanPrintPage from "./TitanPrintPage";
import TitanPrintPageHeader from "./TitanPrintPageHeader";
import TitanPrintTable from "./TitanPrintTable";
import "./titan-print.css";

function OutboundListPrint({
  rows,
  listNo = "",
  printDate = "",
  shipDate = "",
  workMemo = "",
  printDateTime = "",
  printUser = "",
}) {
  const resolvedPrintDateTime = printDateTime || getPrintDateTime();
  const resolvedPrintUser = printUser || getPrintUser();
  const trimmedMemo = workMemo.trim();
  const resolvedShipDate = shipDate || printDate;

  const layout = useMemo(
    () => buildOutboundPrintLayout(rows, resolvedShipDate, { workMemo: trimmedMemo }),
    [rows, resolvedShipDate, trimmedMemo]
  );
  const { columns, columnWidths, orientation, pages } = layout;
  const totalPages = pages.length;
  const isLandscape = orientation === PRINT_ORIENTATION.LANDSCAPE;

  return (
    <div
      className={`titan-print-document outbound-list-print${
        isLandscape ? " titan-print-landscape" : ""
      }`}
      data-print-orientation={orientation}
      aria-label="출고 리스트"
    >
      {pages.map((pageRows, pageIndex) => (
        <TitanPrintPage
          key={`outbound-page-${pageIndex}`}
          pageNumber={pageIndex + 1}
          totalPages={totalPages}
          isLast={pageIndex === totalPages - 1}
          printDateTime={resolvedPrintDateTime}
          printUser={resolvedPrintUser}
          orientation={orientation}
        >
          <TitanPrintPageHeader title={OUTBOUND_PRINT_TITLE} />

          {(listNo || printDate) && (
            <div className="titan-print-meta">
              {listNo && (
                <span>
                  리스트 No. <strong>{listNo}</strong>
                </span>
              )}
              {printDate && (
                <span>
                  출력 기준일 <strong>{printDate}</strong>
                </span>
              )}
            </div>
          )}

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

export default OutboundListPrint;

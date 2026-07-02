import { useMemo } from "react";
import { getPrintDateTime, getPrintUser } from "../../utils/titanPrintContext";
import { buildTitanDocumentQrPayloadFromRows } from "../../utils/titanDocumentQr";
import { TITAN_LIST_PRINT_DOCUMENT_CLASS, TITAN_LIST_DOCUMENT_CODES } from "../../config/titanListPrintStandard";
import { buildHtlPrintLayout, HTL_PRINT_TITLE } from "../../utils/htlWorkListPrintLayout";
import TitanPrintDocumentMeta from "./TitanPrintDocumentMeta";
import TitanPrintOfficialFooter from "./TitanPrintOfficialFooter";
import TitanPrintPage from "./TitanPrintPage";
import TitanPrintPageHeader from "./TitanPrintPageHeader";
import TitanPrintTable from "./TitanPrintTable";
import "./TitanPrintDocumentMeta.css";
import "./titan-print.css";

function resolveOutputDate(printDate = "", printDateTime = "") {
  if (printDate) return printDate;
  const source = printDateTime || getPrintDateTime();
  const match = String(source).match(/\d{4}-\d{2}-\d{2}/);
  return match ? match[0] : "";
}

function HeatTreatmentWorkListPrint({
  rows,
  listNo = "",
  incomingDate = "",
  printDate = "",
  outputDate = "",
  workMemo = "",
  printDateTime = "",
  printUser = "",
}) {
  const resolvedPrintDateTime = printDateTime || getPrintDateTime();
  const resolvedPrintUser = printUser || getPrintUser();
  const resolvedOutputDate = resolveOutputDate(outputDate || printDate, resolvedPrintDateTime);
  const trimmedMemo = workMemo.trim();

  const layout = useMemo(
    () => buildHtlPrintLayout(rows, "", { workMemo: trimmedMemo }),
    [rows, trimmedMemo]
  );
  const { columns, columnWidths, orientation, pages } = layout;
  const totalPages = pages.length;

  const qrValue = useMemo(
    () =>
      buildTitanDocumentQrPayloadFromRows({
        kind: "HTL",
        docNo: listNo,
        rows: rows.map((row) => ({
          managementId: row.managementId ?? row.id,
          company: row.company,
          partNo: row.partNo,
          lotNo: row.lotNo,
        })),
      }),
    [listNo, rows]
  );

  const renderCell = (row, column) => {
    if (column.checkbox) {
      return <span className="titan-print-checkbox" aria-hidden="true" />;
    }
    return column.getValue(row);
  };

  return (
    <div
      className={`titan-print-document htl-work-list-print ${TITAN_LIST_PRINT_DOCUMENT_CLASS} titan-print-landscape`}
      data-print-orientation={orientation}
      aria-label="열처리 작업 요청 리스트"
    >
      {pages.map((pageRows, pageIndex) => (
        <TitanPrintPage
          key={`htl-page-${pageIndex}`}
          pageNumber={pageIndex + 1}
          totalPages={totalPages}
          isLast={pageIndex === totalPages - 1}
          printDateTime={resolvedPrintDateTime}
          printUser={resolvedPrintUser}
          orientation={orientation}
        >
          <TitanPrintPageHeader title={HTL_PRINT_TITLE} />

          <TitanPrintDocumentMeta
            docNo={listNo}
            incomingDate={incomingDate}
            outputDate={resolvedOutputDate}
            qrValue={qrValue}
            qrLabel="열처리 작업 요청 리스트 QR"
          />

          <TitanPrintTable
            columns={columns}
            rows={pageRows}
            columnWidths={columnWidths}
            renderCell={renderCell}
          />

          {pageIndex === totalPages - 1 && trimmedMemo && (
            <section className="titan-print-memo" aria-label="전달사항">
              <h2>전달사항</h2>
              <p>{trimmedMemo}</p>
            </section>
          )}

          <TitanPrintOfficialFooter documentCode={TITAN_LIST_DOCUMENT_CODES.HTL} />
        </TitanPrintPage>
      ))}
    </div>
  );
}

export default HeatTreatmentWorkListPrint;

import { useMemo } from "react";
import { getPrintDateTime, getPrintUser } from "../../utils/titanPrintContext";
import { buildTitanDocumentQrPayloadFromRows } from "../../utils/titanDocumentQr";
import { TITAN_LIST_PRINT_DOCUMENT_CLASS, TITAN_LIST_DOCUMENT_CODES } from "../../config/titanListPrintStandard";
import { buildOutboundPrintLayout, OUTBOUND_PRINT_TITLE } from "../../utils/outboundListPrintLayout";
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

function OutboundListPrint({
  rows,
  listNo = "",
  incomingDate = "",
  printDate = "",
  outputDate = "",
  shipDate = "",
  workMemo = "",
  printDateTime = "",
  printUser = "",
}) {
  const resolvedPrintDateTime = printDateTime || getPrintDateTime();
  const resolvedPrintUser = printUser || getPrintUser();
  const resolvedOutputDate = resolveOutputDate(outputDate || printDate, resolvedPrintDateTime);
  const resolvedShipDate = shipDate || printDate;
  const trimmedMemo = workMemo.trim();

  const layout = useMemo(
    () => buildOutboundPrintLayout(rows, resolvedShipDate, { workMemo: trimmedMemo }),
    [rows, resolvedShipDate, trimmedMemo]
  );
  const { columns, columnWidths, orientation, pages } = layout;
  const totalPages = pages.length;

  const qrValue = useMemo(
    () =>
      buildTitanDocumentQrPayloadFromRows({
        kind: "OUT",
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

  return (
    <div
      className={`titan-print-document outbound-list-print ${TITAN_LIST_PRINT_DOCUMENT_CLASS} titan-print-landscape`}
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

          <TitanPrintDocumentMeta
            docNo={listNo}
            incomingDate={incomingDate || resolvedShipDate}
            outputDate={resolvedOutputDate}
            qrValue={qrValue}
            qrLabel="출고 리스트 QR"
          />

          <TitanPrintTable columns={columns} rows={pageRows} columnWidths={columnWidths} />

          {pageIndex === totalPages - 1 && trimmedMemo && (
            <section className="titan-print-memo" aria-label="전달사항">
              <h2>전달사항</h2>
              <p>{trimmedMemo}</p>
            </section>
          )}

          <TitanPrintOfficialFooter
            documentCode={TITAN_LIST_DOCUMENT_CODES.OUT}
            notes={[
              "※ 출고수량 · 출고일 · LOT No.는 출고 등록 시 전산 입력합니다.",
              "※ 거래명세서는 별도 출력 양식을 사용합니다.",
            ]}
          />
        </TitanPrintPage>
      ))}
    </div>
  );
}

export default OutboundListPrint;

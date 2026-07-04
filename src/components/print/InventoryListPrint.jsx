import { useMemo } from "react";
import { INVENTORY_PRINT } from "../../config/inventoryManagementPolicy";
import { TITAN_LIST_PRINT_DOCUMENT_CLASS } from "../../config/titanListPrintStandard";
import { getPrintDateTime, getPrintUser } from "../../utils/titanPrintContext";
import { getPrintOutputDate } from "../../utils/titanPrintDates";
import { buildInventoryPrintLayout, INVENTORY_PRINT_TITLE } from "../../utils/inventoryListPrintLayout";
import TitanPrintDocumentMeta from "./TitanPrintDocumentMeta";
import TitanPrintOfficialFooter from "./TitanPrintOfficialFooter";
import TitanPrintPage from "./TitanPrintPage";
import TitanPrintPageHeader from "./TitanPrintPageHeader";
import TitanPrintTable from "./TitanPrintTable";
import "./TitanPrintDocumentMeta.css";
import "./titan-print.css";

function InventoryListPrint({
  rows = [],
  viewMode = "byItem",
  listNo = "",
  outputDate = "",
  printDateTime = "",
  printUser = "",
  viewLabel = "품목별",
}) {
  const resolvedPrintDateTime = printDateTime || getPrintDateTime();
  const resolvedPrintUser = printUser || getPrintUser();
  const resolvedOutputDate = outputDate || getPrintOutputDate();
  const resolvedListNo = listNo || `${INVENTORY_PRINT.documentCode}-${resolvedOutputDate.replace(/-/g, "")}-001`;

  const layout = useMemo(
    () => buildInventoryPrintLayout(rows, viewMode),
    [rows, viewMode]
  );
  const { columns, columnWidths, orientation, pages } = layout;
  const totalPages = pages.length;

  return (
    <div
      className={`titan-print-document inventory-list-print ${TITAN_LIST_PRINT_DOCUMENT_CLASS} titan-print-landscape`}
      data-print-orientation={orientation}
      aria-label="재고 현황 리스트"
    >
      {pages.map((pageRows, pageIndex) => (
        <TitanPrintPage
          key={`inventory-page-${pageIndex}`}
          pageNumber={pageIndex + 1}
          totalPages={totalPages}
          isLast={pageIndex === totalPages - 1}
          printDateTime={resolvedPrintDateTime}
          printUser={resolvedPrintUser}
          orientation={orientation}
        >
          <TitanPrintPageHeader title={`${INVENTORY_PRINT_TITLE} (${viewLabel})`} />

          <TitanPrintDocumentMeta
            docNo={resolvedListNo}
            incomingDate={resolvedOutputDate}
            outputDate={resolvedOutputDate}
            qrValue=""
            qrLabel="재고 리스트 QR"
          />

          <TitanPrintTable columns={columns} rows={pageRows} columnWidths={columnWidths} />

          <TitanPrintOfficialFooter
            documentCode={INVENTORY_PRINT.documentCode}
            notes={[
              "※ 재고는 입고·출고 업무 데이터를 기반으로 자동 계산됩니다.",
              "※ 본 문서는 조회용 출력물이며 재고 조정·실사 기능은 V2.0 예정입니다.",
            ]}
          />
        </TitanPrintPage>
      ))}
    </div>
  );
}

export default InventoryListPrint;

import { useMemo } from "react";
import { getPrintDateTime, getPrintUser } from "../../utils/titanPrintContext";
import { buildTitanDocumentQrPayloadFromRows } from "../../utils/titanDocumentQr";
import {
  TITAN_LIST_DOCUMENT_CODES,
  TITAN_LIST_PRINT_DOCUMENT_CLASS,
} from "../../config/titanListPrintStandard";
import {
  buildProductionDailyChargeLayout,
  PRODUCTION_DAILY_PRINT_TITLE,
} from "../../utils/productionDailyReportPrintLayout";
import TitanPrintDocumentMeta from "./TitanPrintDocumentMeta";
import TitanPrintOfficialFooter from "./TitanPrintOfficialFooter";
import TitanPrintPage from "./TitanPrintPage";
import TitanPrintPageHeader from "./TitanPrintPageHeader";
import TitanPrintTable from "./TitanPrintTable";
import "./TitanPrintDocumentMeta.css";
import "./titan-print.css";

function resolveOutputDate(outputDate = "", printDateTime = "") {
  if (outputDate) return outputDate;
  const source = printDateTime || getPrintDateTime();
  const match = String(source).match(/\d{4}-\d{2}-\d{2}/);
  return match ? match[0] : "";
}

function ProductionDailyReportLotPage({
  bundle,
  pageIndex,
  totalPages,
  pageRows,
  columns,
  columnWidths,
  outputDate,
  printDateTime,
  printUser,
  orientation,
}) {
  const qrValue = useMemo(
    () =>
      buildTitanDocumentQrPayloadFromRows({
        kind: "DPR",
        docNo: bundle.docNo,
        rows: bundle.chargeProducts.map((row) => ({
          managementId: row.managementId,
          company: row.company,
          partNo: row.partNo,
          lotNo: bundle.lotNo,
        })),
      }),
    [bundle]
  );

  const trimmedConditions = bundle.heatTreatmentConditions?.trim() ?? "";
  const trimmedNote = bundle.note?.trim() ?? "";

  return (
    <TitanPrintPage
      pageNumber={pageIndex + 1}
      totalPages={totalPages}
      isLast={pageIndex === totalPages - 1}
      printDateTime={printDateTime}
      printUser={printUser}
      orientation={orientation}
    >
      <TitanPrintPageHeader title={PRODUCTION_DAILY_PRINT_TITLE} />

      <TitanPrintDocumentMeta
        docNo={bundle.docNo}
        lotNo={bundle.lotNo}
        workDate={bundle.workDate}
        outputDate={outputDate}
        equipment={bundle.equipment}
        worker={bundle.worker}
        qrValue={qrValue}
        qrLabel="생산일보 QR"
      />

      <section className="titan-print-section" aria-label="장입 제품 리스트">
        <h2 className="titan-print-section__title">장입 제품 리스트</h2>
        <TitanPrintTable columns={columns} rows={pageRows} columnWidths={columnWidths} />
      </section>

      {pageIndex === 0 && trimmedConditions ? (
        <section className="titan-print-memo" aria-label="열처리 조건">
          <h2>열처리 조건</h2>
          <p>{trimmedConditions}</p>
        </section>
      ) : null}

      {pageIndex === totalPages - 1 && trimmedNote ? (
        <section className="titan-print-memo" aria-label="비고">
          <h2>비고</h2>
          <p>{trimmedNote}</p>
        </section>
      ) : null}

      {pageIndex === totalPages - 1 ? (
        <TitanPrintOfficialFooter
          documentCode={TITAN_LIST_DOCUMENT_CODES.DPR}
          notes={["※ 로트번호 · 장입 제품 · 열처리 조건은 생산일보 등록 데이터를 출력합니다."]}
        />
      ) : null}
    </TitanPrintPage>
  );
}

/**
 * 생산일보 출력 — LOT당 1부 · 등록 데이터 자동 반영
 */
function ProductionDailyReportPrint({
  bundles = [],
  outputDate = "",
  printDateTime = "",
  printUser = "",
}) {
  const resolvedPrintDateTime = printDateTime || getPrintDateTime();
  const resolvedPrintUser = printUser || getPrintUser();
  const resolvedOutputDate = resolveOutputDate(outputDate, resolvedPrintDateTime);

  if (!bundles.length) return null;

  return (
    <div
      className={`titan-print-document production-daily-report-print ${TITAN_LIST_PRINT_DOCUMENT_CLASS} titan-print-landscape`}
      data-print-orientation="landscape"
      aria-label="생산일보"
    >
      {bundles.map((bundle) => {
        const layout = buildProductionDailyChargeLayout(bundle.chargeProducts, { note: bundle.note });
        const { columns, columnWidths, orientation, pages } = layout;
        const totalPages = pages.length;

        return pages.map((pageRows, pageIndex) => (
          <ProductionDailyReportLotPage
            key={`${bundle.lotNo}-${bundle.docNo}-page-${pageIndex}`}
            bundle={bundle}
            pageIndex={pageIndex}
            totalPages={totalPages}
            pageRows={pageRows}
            columns={columns}
            columnWidths={columnWidths}
            outputDate={resolvedOutputDate}
            printDateTime={resolvedPrintDateTime}
            printUser={resolvedPrintUser}
            orientation={orientation}
          />
        ));
      })}
    </div>
  );
}

export default ProductionDailyReportPrint;

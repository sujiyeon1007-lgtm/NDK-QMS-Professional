import { getPrintDateTime, getPrintUser } from "../../utils/titanPrintContext";
import TitanPrintPage from "./TitanPrintPage";
import TitanPrintPageHeader from "./TitanPrintPageHeader";
import InspectionReportDocument from "../quality/InspectionReportDocument";
import "./inspection-report-print.css";
import "./titan-print.css";

function InspectionReportPrint({ report, printDateTime = "", printUser = "" }) {
  if (!report) return null;

  const resolvedPrintDateTime = printDateTime || getPrintDateTime();
  const resolvedPrintUser = printUser || getPrintUser();

  return (
    <div
      className="titan-print-document inspection-report-print titan-print-landscape"
      data-print-orientation="landscape"
      aria-label="검사 리포트"
    >
      <TitanPrintPage
        pageNumber={1}
        totalPages={1}
        isLast
        printDateTime={resolvedPrintDateTime}
        printUser={resolvedPrintUser}
        orientation="landscape"
      >
        <TitanPrintPageHeader title={`검사 리포트 (${report.reportNo})`} />
        <InspectionReportDocument report={report} mode="print" />
      </TitanPrintPage>
    </div>
  );
}

export default InspectionReportPrint;

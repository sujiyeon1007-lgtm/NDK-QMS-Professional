import { formatQtyWithUnit } from "../../utils/productUnits";
import { getPrintDateTime, getPrintUser } from "../../utils/titanPrintContext";
import TitanPrintPage from "./TitanPrintPage";
import TitanPrintPageHeader from "./TitanPrintPageHeader";
import "./titan-print.css";

function InspectionLogPrint({ log, printDateTime = "", printUser = "" }) {
  if (!log) return null;

  const resolvedPrintDateTime = printDateTime || getPrintDateTime();
  const resolvedPrintUser = printUser || getPrintUser();

  return (
    <div className="titan-print-document inspection-log-print" aria-label="검사일지 출력">
      <TitanPrintPage
        pageNumber={1}
        totalPages={1}
        isLast
        printDateTime={resolvedPrintDateTime}
        printUser={resolvedPrintUser}
        orientation="portrait"
      >
        <TitanPrintPageHeader title="검사일지" />

        <div className="titan-print-meta">
          <span>
            검사일자 <strong>{log.inspectionDate}</strong>
          </span>
          <span>
            구분 <strong>{log.category}</strong>
          </span>
          <span>
            관리번호 <strong>{log.managementId}</strong>
          </span>
        </div>

        <section className="titan-print-section">
          <h2>기본정보</h2>
          <table className="titan-print-info-table">
            <tbody>
              <tr>
                <th>업체명</th>
                <td colSpan={3}>{log.company}</td>
              </tr>
              <tr>
                <th>품명</th>
                <td>{log.partName}</td>
                <th>품번</th>
                <td>{log.partNo}</td>
              </tr>
              <tr>
                <th>도번</th>
                <td>{log.drawingNo || "—"}</td>
                <th>재질</th>
                <td>{log.material}</td>
              </tr>
              <tr>
                <th>LOT 번호</th>
                <td>{log.lotNo || "—"}</td>
                <th>수량</th>
                <td>{formatQtyWithUnit(log.qty, log.unit)}</td>
              </tr>
              <tr>
                <th>담당자</th>
                <td colSpan={3}>{log.assignee}</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section className="titan-print-section">
          <h2>검사정보</h2>
          <table className="titan-print-info-table">
            <tbody>
              <tr>
                <th>검사 항목</th>
                <td colSpan={3}>{log.inspectionItem || "—"}</td>
              </tr>
              <tr>
                <th>검사 기준</th>
                <td colSpan={3}>{log.inspectionStandard || "—"}</td>
              </tr>
              <tr>
                <th>측정값</th>
                <td>{log.measuredValue || "—"}</td>
                <th>판정</th>
                <td>{log.judgment || "—"}</td>
              </tr>
              <tr>
                <th>검사 장비</th>
                <td>{log.inspectionEquipment || "—"}</td>
                <th>검사 위치</th>
                <td>{log.inspectionLocation || "—"}</td>
              </tr>
              <tr>
                <th>비고</th>
                <td colSpan={3}>{log.note || "—"}</td>
              </tr>
            </tbody>
          </table>
        </section>
      </TitanPrintPage>
    </div>
  );
}

export default InspectionLogPrint;

import { formatQtySummaryByUnit, formatQtyWithUnit } from "../../utils/productUnits";
import LotQrCode from "../common/LotQrCode/LotQrCode";
import NdkLogo from "../common/NdkLogo";

function WorkSheetLotPreview({ lotGroup }) {
  const totalQtySummary = formatQtySummaryByUnit(lotGroup.records);

  return (
    <div className="wps-preview-stage" aria-label="작업관리표 미리보기">
      <article className="wps-sheet">
        <header className="wps-header">
          <NdkLogo className="ndk-logo--sheet-lg" />
          <h1>작 업 관 리 표</h1>
          <div className="wps-meta">
            <span>
              LOT <strong>{lotGroup.lotNo}</strong>
            </span>
            <span>
              작업일 <strong>{lotGroup.workDate || "—"}</strong>
            </span>
            <span>
              품목 <strong>{lotGroup.records.length}건</strong>
            </span>
          </div>
        </header>

        <div className="wps-body-grid">
          <div className="wps-products-wrap">
            <p className="wps-products-caption">
              동일 LOT 포함 제품 · 관리번호 {lotGroup.records.length}건 · 총 {totalQtySummary}
            </p>
            <table className="wps-products-table">
              <thead>
                <tr>
                  <th>No</th>
                  <th>관리번호</th>
                  <th>업체</th>
                  <th>품명</th>
                  <th>품번</th>
                  <th>도번</th>
                  <th>재질</th>
                  <th>수량</th>
                  <th>열처리</th>
                  <th>완료</th>
                  <th>비고</th>
                </tr>
              </thead>
              <tbody>
                {lotGroup.records.map((record, index) => (
                  <tr key={record.id}>
                    <td>{index + 1}</td>
                    <td>{record.id}</td>
                    <td>{record.company}</td>
                    <td>{record.partName}</td>
                    <td>{record.partNo}</td>
                    <td>{record.drawingNo || "—"}</td>
                    <td>{record.material}</td>
                    <td>{formatQtyWithUnit(record.qty, record.unit)}</td>
                    <td>{record.heatTreatment}</td>
                    <td>{record.completionStatus}</td>
                    <td>{record.note || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="wps-qr-block">
            <LotQrCode lotNo={lotGroup.lotNo} size={96} />
            <p className="wps-qr-caption">
              LOT 기준 QR 1개
              <br />
              스캔 시 동일 LOT 전체 제품 조회
            </p>
          </div>
        </div>
      </article>
    </div>
  );
}

export default WorkSheetLotPreview;

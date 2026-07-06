import StatusChip from "../StatusChip";
import TitanProcessNameCell from "../TitanProcessNameCell";

export default function TitanStandardDetailPopupProductHeader({ summary }) {
  if (!summary) return null;

  const currentProcess =
    summary.currentProcess && summary.currentProcess !== "—" ? summary.currentProcess : "—";

  return (
    <header
      className="titan-standard-detail-popup__header-card"
      id="titan-standard-detail-popup-summary"
    >
      <div className="titan-standard-detail-popup__header-block">
        <strong className="titan-standard-detail-popup__product-identity">
          {summary.company} | {summary.partName}
        </strong>
        <span className="titan-standard-detail-popup__product-part-no">{summary.partNo}</span>
        <span className="titan-standard-detail-popup__product-lot">LOT : {summary.lotNo}</span>
      </div>
      <div className="titan-standard-detail-popup__header-block titan-standard-detail-popup__header-block--meta">
        <div className="titan-standard-detail-popup__header-process">
          <span className="titan-standard-detail-popup__header-label">현재공정</span>
          {currentProcess !== "—" ? (
            <TitanProcessNameCell
              label={currentProcess}
              processKey={summary.currentProcessVariant ?? summary.currentProcess}
            />
          ) : (
            <span className="titan-standard-detail-popup__header-value">—</span>
          )}
        </div>
        <div className="titan-standard-detail-popup__header-status">
          <span className="titan-standard-detail-popup__header-label">현재상태</span>
          <StatusChip variant={summary.statusVariant}>{summary.statusLabel}</StatusChip>
        </div>
      </div>
    </header>
  );
}

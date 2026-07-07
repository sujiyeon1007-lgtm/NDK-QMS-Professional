import StatusChip from "../../../foundation/components/StatusChip";
import "./CurrentProcess.css";

export default function CurrentProcess({ session }) {
  const progress = session?.progress ?? 0;
  const equipmentName = session?.equipmentName ?? "—";
  const lotNo = session?.lotNo ?? "—";
  const startTime = session?.startTime ?? "—";
  const expectedEndTime = session?.expectedEndTime ?? "—";
  const statusLabel = session?.statusLabel ?? "대기";

  return (
    <section className="qr-current-process" aria-label="현재 장입 중">
      <div className="qr-current-process__header">
        <h3 className="qr-current-process__title">현재 장입 중</h3>
        <StatusChip variant={session ? "progress" : "wait"}>{statusLabel}</StatusChip>
      </div>

      <div className="qr-current-process__grid">
        <div className="qr-current-process__field">
          <span className="qr-current-process__label">설비명</span>
          <strong className="qr-current-process__value">{equipmentName}</strong>
        </div>
        <div className="qr-current-process__field">
          <span className="qr-current-process__label">LOT</span>
          <strong className="qr-current-process__value">{lotNo}</strong>
        </div>
        <div className="qr-current-process__field">
          <span className="qr-current-process__label">시작시간</span>
          <span className="qr-current-process__value">{startTime}</span>
        </div>
        <div className="qr-current-process__field">
          <span className="qr-current-process__label">예상 종료</span>
          <span className="qr-current-process__value">{expectedEndTime}</span>
        </div>
      </div>

      <div className="qr-current-process__progress-wrap">
        <div className="qr-current-process__progress-meta">
          <span className="qr-current-process__label">진행률</span>
          <strong>{progress}%</strong>
        </div>
        <div
          className="qr-current-process__progress-track"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
          aria-label="열처리 진행률"
        >
          <span className="qr-current-process__progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </section>
  );
}

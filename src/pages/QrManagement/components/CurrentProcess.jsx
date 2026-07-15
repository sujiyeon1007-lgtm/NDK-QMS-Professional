import StatusChip from "../../../foundation/components/StatusChip";
import { getRecipeById } from "../../../utils/actualWorkRecordStore";
import "./CurrentProcess.css";

export default function CurrentProcess({ session, compact = false, mode = "default" }) {
  const isRunningMonitor = mode === "running-monitor";
  const progress = session?.progress ?? 0;
  const equipmentName = session?.equipmentName ?? "—";
  const lotNo = session?.lotNo ?? "—";
  const startTime = session?.startTime ?? "—";
  const expectedEndTime = session?.expectedEndTime ?? "—";
  const statusLabel = session?.statusLabel ?? "대기";
  const operator = String(session?.operator ?? session?.workerName ?? "").trim() || "—";
  const recipeId = String(session?.recipeId ?? "").trim();
  const recipeName =
    String(session?.recipeName ?? "").trim() ||
    (recipeId ? getRecipeById(recipeId)?.name : "") ||
    "—";

  return (
    <section
      className={`qr-current-process${compact ? " qr-current-process--compact" : ""}${
        isRunningMonitor ? " qr-current-process--running-monitor" : ""
      }`}
      aria-label={isRunningMonitor ? "현재 작업 정보" : "현재 장입 중"}
    >
      <div className="qr-current-process__header">
        <h3 className="qr-current-process__title">
          {isRunningMonitor ? "현재 작업 정보" : "현재 장입 중"}
        </h3>
        {!isRunningMonitor ? (
          <StatusChip variant={session ? "progress" : "wait"}>{statusLabel}</StatusChip>
        ) : null}
      </div>

      <div className="qr-current-process__grid">
        <div className="qr-current-process__field">
          <span className="qr-current-process__label">설비명</span>
          <strong className="qr-current-process__value">{equipmentName}</strong>
        </div>
        <div className="qr-current-process__field">
          <span className="qr-current-process__label">{isRunningMonitor ? "현재 LOT" : "LOT"}</span>
          <strong className="qr-current-process__value">{lotNo}</strong>
        </div>
        {isRunningMonitor ? (
          <>
            <div className="qr-current-process__field">
              <span className="qr-current-process__label">담당자</span>
              <strong className="qr-current-process__value">{operator}</strong>
            </div>
            <div className="qr-current-process__field">
              <span className="qr-current-process__label">Recipe</span>
              <strong className="qr-current-process__value">{recipeName}</strong>
            </div>
          </>
        ) : null}
        <div className="qr-current-process__field">
          <span className="qr-current-process__label">
            {isRunningMonitor ? "작업 시작시간" : "시작시간"}
          </span>
          <span className="qr-current-process__value">{startTime}</span>
        </div>
        <div className="qr-current-process__field">
          <span className="qr-current-process__label">예상 종료시간</span>
          <span className="qr-current-process__value">{expectedEndTime}</span>
        </div>
      </div>

      {!isRunningMonitor ? (
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
      ) : null}
    </section>
  );
}

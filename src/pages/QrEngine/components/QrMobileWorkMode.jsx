import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { EQUIPMENT_RUN_STATUS_META } from "../../../config/equipmentConfig";
import { PrimaryButton, SecondaryButton } from "../../../foundation/components/Button";
import StatusChip from "../../../foundation/components/StatusChip";
import "./QrMobileWorkMode.css";

const WORK_CONDITION_FIELDS = [
  { key: "treatmentTemp", label: "온도", placeholder: "예: 520" },
  { key: "treatmentTime", label: "유지시간", placeholder: "예: 12h" },
  { key: "gasCondition", label: "가스 조건", placeholder: "예: NH3 35%" },
  { key: "processPressure", label: "압력", placeholder: "예: 2.0bar" },
  { key: "coolingMethod", label: "냉각 방법", placeholder: "예: 공냉" },
  { key: "chargeQty", label: "장입량", placeholder: "예: 120" },
];

export default function QrMobileWorkMode({
  view,
  buttonState,
  onStart,
  onFinish,
  workflowError = "",
  availableLots = [],
  activeLotId = null,
  onSelectLot,
}) {
  const [conditionsOpen, setConditionsOpen] = useState(false);
  const [conditions, setConditions] = useState({});
  const [memo, setMemo] = useState("");

  const actionPayload = useMemo(
    () => ({
      workConditions: conditions,
      workMemo: memo,
    }),
    [conditions, memo]
  );

  if (!view) return null;

  const summary = view.equipmentSummary ?? {};
  const statusMeta = EQUIPMENT_RUN_STATUS_META[summary.status] ?? EQUIPMENT_RUN_STATUS_META.idle;
  const summaryLotNo = summary.currentLotNo && summary.currentLotNo !== "-" ? summary.currentLotNo : "";
  const lotNo = view.lotNo || summaryLotNo || "";
  const lotLink = view.links?.lotLifecycle ?? `/quality/lot-lifecycle?lot=${encodeURIComponent(lotNo)}`;
  const startDisabled = !buttonState?.showStart || !buttonState?.startEnabled;
  const finishDisabled = !buttonState?.showComplete || !buttonState?.completeEnabled;

  return (
    <section className="qr-mobile-work-mode" aria-label="모바일 작업 모드">
      <header className="qr-mobile-work-mode__header">
        <span className="qr-mobile-work-mode__eyebrow">Mobile Work Mode</span>
        <h2>{summary.equipmentName ?? "-"}</h2>
        <StatusChip variant={statusMeta.variant}>
          {statusMeta.emoji} {statusMeta.label}
        </StatusChip>
      </header>

      <div className="qr-mobile-work-mode__lot">
        <span>현재 LOT</span>
        <strong>{lotNo || "-"}</strong>
      </div>

      {!lotNo ? (
        <div className="qr-mobile-work-mode__waiting" aria-label="입고 대기">
          <div className="qr-mobile-work-mode__waiting-head">
            <strong>입고 대기</strong>
            <span>{availableLots.length.toLocaleString("ko-KR")}건</span>
          </div>
          {availableLots.length ? (
            <ol>
              {availableLots.slice(0, 6).map((row) => (
                <li key={row.id ?? row.lotNo}>
                  <button
                    type="button"
                    className={row.id === activeLotId ? "is-active" : ""}
                    onClick={() => onSelectLot?.(row.id)}
                  >
                    <span>{row.partName ?? row.itemName ?? row.partNo ?? row.lotNo}</span>
                    <strong>{row.partNo ?? row.lotNo ?? "-"}</strong>
                    <em>
                      {(row.companyName ?? row.customerName ?? "-")} · {row.material ?? "-"} ·{" "}
                      {row.qty?.toLocaleString("ko-KR") ?? "-"} {row.unit ?? ""}
                    </em>
                  </button>
                </li>
              ))}
            </ol>
          ) : (
            <p>장입 가능한 입고 대기 LOT가 없습니다.</p>
          )}
        </div>
      ) : null}

      <div className="qr-mobile-work-mode__actions" role="group" aria-label="모바일 작업 액션">
        <PrimaryButton
          type="button"
          className="qr-mobile-work-mode__action qr-mobile-work-mode__action--start"
          disabled={startDisabled}
          aria-disabled={startDisabled}
          onClick={() => onStart?.(actionPayload)}
        >
          작업 시작
        </PrimaryButton>
        <SecondaryButton
          type="button"
          className="qr-mobile-work-mode__action qr-mobile-work-mode__action--finish"
          disabled={finishDisabled}
          aria-disabled={finishDisabled}
          onClick={() => onFinish?.(actionPayload)}
        >
          작업 종료
        </SecondaryButton>
        {lotNo ? (
          <Link className="qr-mobile-work-mode__link" to={lotLink}>
            LOT 보기
          </Link>
        ) : (
          <button className="qr-mobile-work-mode__link" type="button" disabled>
            LOT 보기
          </button>
        )}
        {lotNo ? (
          <Link className="qr-mobile-work-mode__link" to={lotLink}>
            작업 이력
          </Link>
        ) : (
          <button className="qr-mobile-work-mode__link" type="button" disabled>
            작업 이력
          </button>
        )}
      </div>

      <div className="qr-mobile-work-mode__conditions">
        <button type="button" onClick={() => setConditionsOpen((value) => !value)}>
          작업 조건 선택 입력 {conditionsOpen ? "닫기" : "열기"}
        </button>
        {conditionsOpen ? (
          <div className="qr-mobile-work-mode__condition-fields">
            {WORK_CONDITION_FIELDS.map((field) => (
              <label key={field.key}>
                <span>{field.label}</span>
                <input
                  value={conditions[field.key] ?? ""}
                  placeholder={field.placeholder}
                  onChange={(event) =>
                    setConditions((prev) => ({ ...prev, [field.key]: event.target.value }))
                  }
                />
              </label>
            ))}
            <label className="qr-mobile-work-mode__condition-memo">
              <span>메모</span>
              <textarea
                rows={3}
                value={memo}
                placeholder="작업 메모"
                onChange={(event) => setMemo(event.target.value)}
              />
            </label>
          </div>
        ) : null}
      </div>

      {workflowError ? (
        <p className="qr-mobile-work-mode__error" role="alert">
          {workflowError}
        </p>
      ) : null}

      <dl className="qr-mobile-work-mode__status">
        <div>
          <dt>현재 상태</dt>
          <dd>{statusMeta.emoji} {statusMeta.label}</dd>
        </div>
        <div>
          <dt>담당 작업자</dt>
          <dd>{summary.operator ?? "-"}</dd>
        </div>
        <div>
          <dt>현재 공정</dt>
          <dd>{summary.process ?? "-"}</dd>
        </div>
        <div>
          <dt>작업 시작 시간</dt>
          <dd>{summary.startTime ?? "-"}</dd>
        </div>
      </dl>
    </section>
  );
}
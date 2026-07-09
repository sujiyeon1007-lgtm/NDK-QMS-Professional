import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { CheckCircle2, X } from "lucide-react";

import { OPERATION_ROUTES } from "../../config/operationsRouteRegistry";
import { QR_ENGINE_COPY, QR_ENGINE_ROUTES } from "../../config/qrEngineArchitecture";
import { PrimaryButton, SecondaryButton } from "../../foundation/components/Button";
import { getEquipmentDetailSnapshot } from "../../utils/equipmentWorkflowService";
import { buildEquipmentWorkPanelSummary } from "../../utils/qrEngineService";
import { buildQrWorkflowTechnologyView } from "../../utils/qrWorkflowTechnologyBridge";
import { getAvailableLots } from "../QrManagement/services/qrWorkflowService";
import QrWorkflowTechnologyStack from "../QrManagement/components/QrWorkflowTechnologyStack";
import { useQRWorkflow } from "../QrManagement/hooks/useQRWorkflow";
import QrMobileWorkMode from "./components/QrMobileWorkMode";
import QrEnginePageShell, { qrEngineBreadcrumbTrail } from "./QrEnginePageShell";
import "../QrManagement/QRManagement.css";
import "../QrManagement/components/QrWorkflowTechnologyStack.css";

function QrEngineEquipmentWorkSummary({ summary, title = "\uC124\uBE44 \uC791\uC5C5 \uD604\uD669" }) {
  if (!summary) return null;

  const items = [
    { label: "\uC124\uBE44\uBA85", value: summary.equipmentName },
    { label: "\uC791\uC5C5\uC790", value: summary.worker },
    { label: "\uC2DC\uC791\uC2DC\uAC04", value: summary.startTime },
    { label: "\uC608\uC0C1 \uC885\uB8CC\uC2DC\uAC04", value: summary.expectedEndTime },
    {
      label: "\uAE08\uC77C \uC791\uC5C5 \uAC74\uC218",
      value: `${Number(summary.todayWorkCount ?? 0).toLocaleString("ko-KR")}\uAC74`,
    },
  ];

  return (
    <section className="qr-engine-work-summary" aria-label={title}>
      <h3 className="qr-engine-work-summary__title">{title}</h3>
      <div className="qr-engine-work-summary__grid">
        {items.map((item) => (
          <div key={item.label} className="qr-engine-work-summary__item">
            <span className="qr-engine-work-summary__label">{item.label}</span>
            <strong className="qr-engine-work-summary__value">{item.value}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}

function QrEngineEquipmentWaitingLots({
  availableLots = [],
  activeLotId = null,
  onSelectLot,
  waitingLotLabel = "\uC0DD\uC0B0 \uB300\uAE30 LOT",
  highlight = false,
}) {
  if (!availableLots.length) return null;

  return (
    <section
      className={`qr-engine-equipment-waiting${highlight ? " is-highlight" : ""}`}
      aria-label={waitingLotLabel}
    >
      <header className="qr-engine-equipment-waiting__head">
        <strong>{waitingLotLabel}</strong>
        <span>{`${availableLots.length.toLocaleString("ko-KR")}\uAC74`}</span>
      </header>
      <ol className="qr-engine-equipment-waiting__list">
        {availableLots.slice(0, 8).map((row) => (
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
    </section>
  );
}

function QrEngineWorkCompleteDialog({
  open,
  lotNo = "",
  equipmentName = "",
  waitingLotCount = 0,
  onLifecycle,
  onNextLot,
  onEquipmentStatus,
  onClose,
}) {
  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.classList.add("qr-engine-work-complete-open");
    document.body.style.overflow = "hidden";

    const handleKey = (event) => {
      if (event.key === "Escape") onClose?.();
    };

    window.addEventListener("keydown", handleKey);

    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.classList.remove("qr-engine-work-complete-open");
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  const resolvedLot = String(lotNo ?? "").trim();

  return createPortal(
    <div className="qr-engine-work-complete-overlay" role="presentation" onClick={onClose}>
      <div
        className="qr-engine-work-complete-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="qr-engine-work-complete-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="qr-engine-work-complete-dialog__header">
          <CheckCircle2 size={22} aria-hidden="true" />
          <div>
            <h2 id="qr-engine-work-complete-title">{QR_ENGINE_COPY.equipmentWorkCompleteTitle}</h2>
            <p>{equipmentName || "-"}</p>
          </div>
          <button
            type="button"
            className="qr-engine-work-complete-dialog__close"
            onClick={onClose}
            aria-label="\uB2EB\uAE30"
          >
            <X size={18} />
          </button>
        </header>

        <div className="qr-engine-work-complete-dialog__body">
          {resolvedLot ? (
            <p>
              LOT <strong>{resolvedLot}</strong> {"\uC791\uC5C5\uC774 \uC644\uB8CC\uB418\uC5C8\uC2B5\uB2C8\uB2E4."}
            </p>
          ) : (
            <p>{"\uC124\uBE44 \uC791\uC5C5\uC774 \uC644\uB8CC\uB418\uC5C8\uC2B5\uB2C8\uB2E4."}</p>
          )}
          <p className="qr-engine-work-complete-dialog__question">
            {QR_ENGINE_COPY.equipmentWorkCompleteQuestion}
          </p>
          {waitingLotCount > 0 ? (
            <p className="qr-engine-work-complete-dialog__hint">
              {"\uC0DD\uC0B0 \uB300\uAE30 LOT "}
              <strong>
                {waitingLotCount.toLocaleString("ko-KR")}
                {"\uAC74"}
              </strong>
              {" — "}
              {QR_ENGINE_COPY.equipmentWorkCompleteNextLotHint}
            </p>
          ) : null}
        </div>

        <footer className="qr-engine-work-complete-dialog__footer">
          <PrimaryButton type="button" onClick={onLifecycle} disabled={!resolvedLot}>
            {QR_ENGINE_COPY.equipmentWorkCompleteLifecycle}
          </PrimaryButton>
          <SecondaryButton type="button" onClick={onNextLot}>
            {QR_ENGINE_COPY.equipmentWorkCompleteNextLot}
          </SecondaryButton>
          <SecondaryButton type="button" onClick={onEquipmentStatus}>
            {QR_ENGINE_COPY.equipmentWorkCompleteEquipmentStatus}
          </SecondaryButton>
        </footer>
      </div>
    </div>,
    document.body
  );
}

export default function QrEngineEquipmentWorkPage() {
  const navigate = useNavigate();
  const { equipmentId } = useParams();
  const [completeDialog, setCompleteDialog] = useState({
    open: false,
    lotNo: "",
    waitingLotCount: 0,
  });
  const [highlightNextLot, setHighlightNextLot] = useState(false);

  const {
    selectedEquipment,
    activeSession,
    availableLots,
    activeLotId,
    chargingButtons,
    workflowError,
    selectLot,
    handleStartCharging,
    handleFinishCharging,
    refreshKey,
  } = useQRWorkflow(equipmentId);

  const detail = useMemo(
    () => getEquipmentDetailSnapshot(equipmentId),
    [equipmentId, refreshKey]
  );

  const selectedLotRow = useMemo(
    () => availableLots.find((row) => row.id === activeLotId) ?? null,
    [availableLots, activeLotId]
  );

  const technologyView = useMemo(
    () =>
      buildQrWorkflowTechnologyView({
        equipmentDetail: detail,
        equipment: selectedEquipment,
        activeSession,
        selectedLotRow,
      }),
    [detail, selectedEquipment, activeSession, selectedLotRow, refreshKey]
  );

  const workSummary = useMemo(
    () =>
      buildEquipmentWorkPanelSummary({
        equipmentId,
        detail,
        activeSession,
      }),
    [equipmentId, detail, activeSession, refreshKey, completeDialog.open]
  );

  const activeLotNo = useMemo(() => {
    const sessionLot = String(activeSession?.lotNo ?? "").trim();
    if (sessionLot) return sessionLot;
    const currentLot = String(detail?.currentLotNo ?? "").trim();
    if (currentLot) return currentLot;
    return String(selectedLotRow?.lotNo ?? "").trim();
  }, [activeSession?.lotNo, detail?.currentLotNo, selectedLotRow?.lotNo]);

  const handleFinishWork = useCallback(
    (options) => {
      const lotNo =
        String(activeSession?.lotNo ?? "").trim() ||
        String(selectedLotRow?.lotNo ?? "").trim() ||
        activeLotNo;
      handleFinishCharging(options);
      selectLot(null);
      const waitingLotCount = getAvailableLots(equipmentId).length;
      setCompleteDialog({
        open: true,
        lotNo,
        waitingLotCount,
      });
    },
    [
      activeLotNo,
      activeSession?.lotNo,
      equipmentId,
      handleFinishCharging,
      selectLot,
      selectedLotRow?.lotNo,
    ]
  );

  const closeCompleteDialog = useCallback(() => {
    setCompleteDialog((prev) => ({ ...prev, open: false }));
    setHighlightNextLot(false);
  }, []);

  const handleLifecycleFromDialog = useCallback(() => {
    const lotNo = String(completeDialog.lotNo ?? "").trim();
    closeCompleteDialog();
    if (lotNo) {
      navigate(QR_ENGINE_ROUTES.lotLifecycle(lotNo));
    }
  }, [closeCompleteDialog, completeDialog.lotNo, navigate]);

  const handleNextLotFromDialog = useCallback(() => {
    closeCompleteDialog();
    setHighlightNextLot(true);
    selectLot(null);
  }, [closeCompleteDialog, selectLot]);

  const handleEquipmentStatusFromDialog = useCallback(() => {
    closeCompleteDialog();
    navigate(OPERATION_ROUTES.equipmentStatus);
  }, [closeCompleteDialog, navigate]);

  if (!detail || !selectedEquipment) {
    return <Navigate to={QR_ENGINE_ROUTES.scan} replace />;
  }

  const title = detail.equipmentName ?? selectedEquipment.name ?? equipmentId;

  return (
    <QrEnginePageShell
      breadcrumbItems={[
        ...qrEngineBreadcrumbTrail(QR_ENGINE_COPY.equipmentWorkTitle),
        { label: title },
      ]}
      title={title}
      description={`${detail.process ?? ""} · ${QR_ENGINE_COPY.equipmentWorkIntro}`}
    >
      <div className="qr-engine-page qr-management-page">
        <QrEngineEquipmentWorkSummary
          summary={workSummary}
          title={QR_ENGINE_COPY.equipmentWorkSummaryTitle}
        />

        <p className="qr-engine-hint" role="note">
          {QR_ENGINE_COPY.equipmentFinishLifecycleHint}
        </p>

        <div className="qr-engine-work-actions">
          {activeLotNo ? (
            <Link
              className="titan-btn titan-btn--primary"
              to={QR_ENGINE_ROUTES.lotLifecycle(activeLotNo)}
            >
              LOT Lifecycle
            </Link>
          ) : null}
          <Link
            className="titan-btn titan-btn--secondary"
            to={OPERATION_ROUTES.equipmentStatus}
          >
            {QR_ENGINE_COPY.equipmentWorkCompleteEquipmentStatus}
          </Link>
          <Link
            className="titan-btn titan-btn--secondary"
            to={QR_ENGINE_ROUTES.chargingEquipment(equipmentId)}
          >
            {QR_ENGINE_COPY.openCharging}
          </Link>
          <Link className="titan-btn titan-btn--secondary" to={QR_ENGINE_ROUTES.scan}>
            {QR_ENGINE_COPY.backToScan}
          </Link>
          <Link className="titan-btn titan-btn--secondary" to={QR_ENGINE_ROUTES.dashboard}>
            {QR_ENGINE_COPY.backToDashboard}
          </Link>
        </div>

        <QrMobileWorkMode
          view={technologyView}
          buttonState={chargingButtons}
          onStart={handleStartCharging}
          onFinish={handleFinishWork}
          workflowError={workflowError}
          availableLots={availableLots}
          activeLotId={activeLotId}
          onSelectLot={selectLot}
          currentLotLabel={QR_ENGINE_COPY.equipmentCurrentLotLabel}
          waitingLotLabel={QR_ENGINE_COPY.equipmentWaitingLotLabel}
          highlightWaitingLots={highlightNextLot}
        />

        <div className="qr-engine-equipment-desktop-stack">
          {!activeLotNo ? (
            <QrEngineEquipmentWaitingLots
              availableLots={availableLots}
              activeLotId={activeLotId}
              onSelectLot={selectLot}
              waitingLotLabel={QR_ENGINE_COPY.equipmentWaitingLotLabel}
              highlight={highlightNextLot}
            />
          ) : null}
          <QrWorkflowTechnologyStack
            view={technologyView}
            buttonState={chargingButtons}
            onStart={handleStartCharging}
            onFinish={handleFinishWork}
          />
        </div>
        {workflowError ? (
          <p className="home-empty" role="alert">
            {workflowError}
          </p>
        ) : null}
      </div>

      <QrEngineWorkCompleteDialog
        open={completeDialog.open}
        lotNo={completeDialog.lotNo}
        equipmentName={workSummary.equipmentName}
        waitingLotCount={completeDialog.waitingLotCount}
        onLifecycle={handleLifecycleFromDialog}
        onNextLot={handleNextLotFromDialog}
        onEquipmentStatus={handleEquipmentStatusFromDialog}
        onClose={closeCompleteDialog}
      />
    </QrEnginePageShell>
  );
}

import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

import TitanDetailPopup from "../../foundation/components/TitanDetailPopup";
import StatusChip from "../../foundation/components/StatusChip";
import TitanWorkflowNextStepDialog from "../../foundation/components/TitanWorkflowNextStepDialog";
import { EQUIPMENT_RUN_STATUS_META } from "../../config/equipmentConfig";
import { resolveChargeQty, resolveRemainingChargeQty } from "../../utils/equipmentChargingQty";
import { getEquipmentDetailSnapshot } from "../../utils/equipmentWorkflowService";
import ProcessStepCompleteDialog from "../Production/charging/ProcessStepCompleteDialog";
import EquipmentChargingWorkflowContent from "../QrManagement/components/EquipmentChargingWorkflowContent";
import { useQRWorkflow } from "../QrManagement/hooks/useQRWorkflow";
import "../QrManagement/components/EquipmentChargingWorkflowContent.css";
import "../QrManagement/QRManagement.css";

function computePopupSummary(liveDetail, availableLots = []) {
  const lotNos = new Set();
  if (liveDetail?.currentLotNo) lotNos.add(String(liveDetail.currentLotNo).trim());

  availableLots.forEach((row) => {
    const lotNo = String(row?.lotNo ?? "").trim();
    if (lotNo) lotNos.add(lotNo);
  });

  const totalQty = availableLots.reduce(
    (sum, row) => sum + (resolveRemainingChargeQty(row) || resolveChargeQty(row) || 0),
    0
  );
  const runningQty = Number(liveDetail?.chargeQty) || 0;
  const isRunning = liveDetail?.status === "running";

  return {
    lotCount: lotNos.size || availableLots.length,
    totalEa: isRunning ? totalQty + runningQty : totalQty,
    utilization: isRunning ? Number(liveDetail?.utilization ?? liveDetail?.progress ?? 0) : 0,
  };
}

/**
 * Control Room — Equipment Popup (설비 View · 관제 + 장입 작업)
 * RC1 P0: compact summary + left LOT list / right work info split
 */
export default function ControlRoomEquipmentPopup({ equipmentId, detail, open, onClose }) {
  const navigate = useNavigate();
  const workflow = useQRWorkflow(open ? equipmentId : null, { onChargingFinished: onClose });

  const liveDetail = useMemo(() => {
    if (!equipmentId) return detail ?? null;
    return getEquipmentDetailSnapshot(equipmentId) ?? detail ?? null;
  }, [detail, equipmentId, workflow.refreshKey]);

  const statusMeta = liveDetail
    ? EQUIPMENT_RUN_STATUS_META[liveDetail.status] ?? EQUIPMENT_RUN_STATUS_META.idle
    : null;
  const isRunning = liveDetail?.status === "running";
  const summary = useMemo(
    () => computePopupSummary(liveDetail, workflow.availableLots),
    [liveDetail, workflow.availableLots]
  );

  return (
    <>
      <TitanDetailPopup
        open={open}
        onClose={onClose}
        title={liveDetail ? `설비 상세 — ${liveDetail.equipmentName}` : "설비 상세"}
        size="large"
        renderTabContent={() => {
          if (!liveDetail || !equipmentId) {
            return <p className="control-room-equipment-popup__empty">설비 정보를 불러올 수 없습니다.</p>;
          }

          return (
            <div className="control-room-equipment-popup control-room-equipment-popup--rc1">
              <header className="control-room-equipment-popup__summary" aria-label="설비 요약">
                <div className="control-room-equipment-popup__summary-main">
                  <strong className="control-room-equipment-popup__summary-name">
                    {liveDetail.equipmentName}
                  </strong>
                  <StatusChip variant={statusMeta.variant}>
                    {statusMeta.emoji} {statusMeta.label}
                  </StatusChip>
                  {liveDetail.alarm ? (
                    <span
                      className={`control-room-equipment-card__alarm control-room-equipment-card__alarm--${liveDetail.alarm.level}`}
                    >
                      {liveDetail.alarm.label}
                    </span>
                  ) : null}
                </div>

                <dl className="control-room-equipment-popup__summary-stats">
                  <div>
                    <dt>LOT</dt>
                    <dd>{summary.lotCount}건</dd>
                  </div>
                  <div>
                    <dt>총 EA</dt>
                    <dd>{summary.totalEa > 0 ? summary.totalEa.toLocaleString("ko-KR") : "—"}</dd>
                  </div>
                  <div>
                    <dt>가동률</dt>
                    <dd>{isRunning ? `${summary.utilization}%` : "—"}</dd>
                  </div>
                  {isRunning ? (
                    <div className="control-room-equipment-popup__summary-progress">
                      <dt>진행률</dt>
                      <dd>
                        <div
                          className="control-room-equipment-popup__summary-progress-track"
                          role="progressbar"
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-valuenow={summary.utilization}
                        >
                          <span
                            className="control-room-equipment-popup__summary-progress-fill"
                            style={{ width: `${summary.utilization}%` }}
                          />
                        </div>
                        <strong>{summary.utilization}%</strong>
                      </dd>
                    </div>
                  ) : null}
                </dl>
              </header>

              <EquipmentChargingWorkflowContent
                layout="popup-split"
                availableLots={workflow.availableLots}
                activeLotId={workflow.activeLotId}
                activeSession={workflow.activeSession}
                selectLot={workflow.selectLot}
                chargingButtons={workflow.chargingButtons}
                handleStartCharging={workflow.handleStartCharging}
                handleFinishCharging={workflow.handleFinishCharging}
                workflowError={workflow.workflowError}
                draftLotNo={workflow.draftLotNo}
                autoLotNo={workflow.autoLotNo}
                lotInputMode={workflow.lotInputMode}
                setLotInputMode={workflow.setLotInputMode}
                setDraftLotNo={workflow.setDraftLotNo}
                restoreAutoLotNo={workflow.restoreAutoLotNo}
                chargeQtyEnabled={workflow.chargeQtyEnabled}
                setChargeQtyEnabled={workflow.setChargeQtyEnabled}
                draftChargeQty={workflow.draftChargeQty}
                setDraftChargeQty={workflow.setDraftChargeQty}
                selectedChargeRowIds={workflow.selectedChargeRowIds}
                toggleChargeRow={workflow.toggleChargeRow}
                toggleAllChargeRows={workflow.toggleAllChargeRows}
                chargeQtyByRowId={workflow.chargeQtyByRowId}
                setChargeQtyForRow={workflow.setChargeQtyForRow}
                totalChargeQty={workflow.totalChargeQty}
                processName={liveDetail?.process ?? workflow.selectedEquipment?.process ?? ""}
              />
            </div>
          );
        }}
      />

      <ProcessStepCompleteDialog
        open={workflow.stepCompleteDialog.open}
        record={workflow.stepCompleteDialog.record}
        onClose={workflow.closeStepCompleteDialog}
        onConfirm={workflow.confirmStepComplete}
      />

      <TitanWorkflowNextStepDialog
        open={Boolean(workflow.workflowNextStep)}
        step={workflow.workflowNextStep}
        onNavigate={(path) => {
          navigate(path);
          workflow.setWorkflowNextStep(null);
          onClose?.();
        }}
        onStay={() => workflow.setWorkflowNextStep(null)}
        onClose={() => workflow.setWorkflowNextStep(null)}
      />
    </>
  );
}

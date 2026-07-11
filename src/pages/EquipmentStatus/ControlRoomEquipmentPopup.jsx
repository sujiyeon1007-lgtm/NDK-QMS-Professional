import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

import TitanDetailPopup from "../../foundation/components/TitanDetailPopup";
import StatusChip from "../../foundation/components/StatusChip";
import TitanWorkflowNextStepDialog from "../../foundation/components/TitanWorkflowNextStepDialog";
import { EQUIPMENT_RUN_STATUS_META } from "../../config/equipmentConfig";
import { getEquipmentDetailSnapshot } from "../../utils/equipmentWorkflowService";
import HomeAnimatedProgressBar from "../Home/HomeAnimatedProgressBar";
import ProcessStepCompleteDialog from "../Production/charging/ProcessStepCompleteDialog";
import EquipmentChargingWorkflowContent from "../QrManagement/components/EquipmentChargingWorkflowContent";
import { useQRWorkflow } from "../QrManagement/hooks/useQRWorkflow";
import "../QrManagement/components/EquipmentChargingWorkflowContent.css";
import "../QrManagement/QRManagement.css";

/**
 * Control Room — Equipment Popup (설비 View · 관제 + 장입 작업)
 * 설비 카드 클릭 시 설비 모니터링 정보와 장입 Workflow를 함께 제공합니다.
 */
export default function ControlRoomEquipmentPopup({ equipmentId, detail, open, onClose }) {
  const navigate = useNavigate();
  const workflow = useQRWorkflow(open ? equipmentId : null);

  const liveDetail = useMemo(() => {
    if (!equipmentId) return detail ?? null;
    return getEquipmentDetailSnapshot(equipmentId) ?? detail ?? null;
  }, [detail, equipmentId, workflow.refreshKey]);

  const statusMeta = liveDetail
    ? EQUIPMENT_RUN_STATUS_META[liveDetail.status] ?? EQUIPMENT_RUN_STATUS_META.idle
    : null;
  const isRunning = liveDetail?.status === "running";
  const progress = isRunning ? liveDetail?.progress ?? liveDetail?.utilization ?? 0 : 0;

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
            <div className="control-room-equipment-popup control-room-equipment-popup--full">
              <section className="control-room-equipment-popup__monitor" aria-label="설비 모니터링">
                <div className="control-room-equipment-popup__head">
                  <h3>{liveDetail.equipmentName}</h3>
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

                <dl className="control-room-equipment-popup__grid">
                  <div>
                    <dt>현재 LOT</dt>
                    <dd>{liveDetail.currentLotNo ?? "—"}</dd>
                  </div>
                  <div>
                    <dt>작업상태</dt>
                    <dd>
                      {statusMeta.emoji} {statusMeta.label}
                    </dd>
                  </div>
                  <div>
                    <dt>시작시간</dt>
                    <dd>{liveDetail.startTime ?? "—"}</dd>
                  </div>
                  <div>
                    <dt>예상종료시간</dt>
                    <dd>{liveDetail.expectedEndTime ?? "—"}</dd>
                  </div>
                </dl>

                <div className="control-room-equipment-popup__util">
                  <span className="control-room-equipment-popup__util-label">진행률</span>
                  <HomeAnimatedProgressBar percent={progress} processKey="production" />
                </div>

                {liveDetail.sameLotProducts?.length > 0 ? (
                  <div className="control-room-equipment-popup__same-lot">
                    <h4>동일 LOT 제품</h4>
                    {liveDetail.currentLotNo ? (
                      <p className="control-room-equipment-popup__lot-no">{liveDetail.currentLotNo}</p>
                    ) : null}
                    <ul>
                      {liveDetail.sameLotProducts.map((product) => (
                        <li key={product.partName}>{product.partName}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </section>

              <section className="control-room-equipment-popup__workflow" aria-label="장입 작업">
                <h3 className="control-room-equipment-popup__workflow-title">장입 작업</h3>
                <EquipmentChargingWorkflowContent
                  layout="popup"
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
                />
              </section>
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

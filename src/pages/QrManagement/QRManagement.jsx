import TitanListInteractionHint from "../../foundation/components/TitanListInteractionHint";
import PageTopBar from "../../foundation/layout/PageTopBar";
import { QR_CHARGING_PAGE_COPY } from "../../config/equipmentConfig";
import { TITAN_MENU_CATALOG } from "../../config/menuConfig";
import EquipmentCard from "./components/EquipmentCard";
import EquipmentSummaryBar from "./components/EquipmentSummaryBar";
import EquipmentChargingActions from "./components/EquipmentChargingActions";
import LotTable from "./components/LotTable";
import CurrentProcess from "./components/CurrentProcess";
import { useQRWorkflow } from "./hooks/useQRWorkflow";
import "./QRManagement.css";

const PAGE_META = TITAN_MENU_CATALOG.qrCharging?.pageMeta ?? {
  kicker: "Smart Access",
  title: QR_CHARGING_PAGE_COPY.title,
  description: QR_CHARGING_PAGE_COPY.description,
};

export default function QRManagement() {
  const {
    equipmentList,
    equipmentSummary,
    selectedEquipmentId,
    chargingButtons,
    availableLots,
    activeLotId,
    activeSession,
    selectEquipment,
    selectLot,
  } = useQRWorkflow();

  return (
    <div className="qr-management-page">
      <PageTopBar
        kicker={PAGE_META.kicker}
        title={PAGE_META.title}
        description={PAGE_META.description}
      />

      <EquipmentSummaryBar summary={equipmentSummary} />

      <TitanListInteractionHint />

      <div className="qr-management-page__workspace">
        <aside className="qr-management-page__equipment-panel" aria-label="설비 리스트">
          <h2 className="qr-management-page__section-title">{QR_CHARGING_PAGE_COPY.equipmentSectionTitle}</h2>
          <div className="qr-management-page__equipment-list">
            {equipmentList.map((equipment) => (
              <EquipmentCard
                key={equipment.id}
                equipment={equipment}
                selected={equipment.id === selectedEquipmentId}
                onSelect={selectEquipment}
              />
            ))}
          </div>
        </aside>

        <section className="qr-management-page__lot-panel" aria-label="장입 가능 LOT">
          <h2 className="qr-management-page__section-title">{QR_CHARGING_PAGE_COPY.lotSectionTitle}</h2>
          <LotTable rows={availableLots} activeRowId={activeLotId} onRowClick={(row) => selectLot(row.id)} />
        </section>
      </div>

      <div
        className={`qr-management-page__footer${
          chargingButtons.showStart || chargingButtons.showComplete
            ? ""
            : " qr-management-page__footer--no-actions"
        }`}
      >
        <CurrentProcess session={activeSession} />
        <EquipmentChargingActions buttonState={chargingButtons} />
      </div>
    </div>
  );
}

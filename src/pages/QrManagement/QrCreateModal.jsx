import { useMemo, useState } from "react";

import TitanRegisterModal from "../../foundation/components/TitanRegisterModal";
import {
  getQrCreatableEquipmentRecords,
  getQrCreatableProductionRecords,
} from "../../utils/qrManagementSession";
import { formatQtyWithUnit } from "../../utils/productUnits";

export default function QrCreateModal({ open, onClose, onCreate, mode = "inout" }) {
  const [selectedKey, setSelectedKey] = useState("");
  const isEquipment = mode === "equipment";

  const candidates = useMemo(() => {
    if (!open) return [];
    return isEquipment ? getQrCreatableEquipmentRecords() : getQrCreatableProductionRecords();
  }, [open, isEquipment]);

  const handleClose = () => {
    setSelectedKey("");
    onClose?.();
  };

  const handleSubmit = () => {
    if (!selectedKey) {
      window.alert(isEquipment ? "QR을 생성할 설비를 선택하세요." : "QR을 생성할 제품을 선택하세요.");
      return;
    }
    onCreate?.(selectedKey);
    handleClose();
  };

  return (
    <TitanRegisterModal
      open={open}
      title="QR 생성"
      submitLabel="QR 생성"
      onClose={handleClose}
      onSubmit={handleSubmit}
    >
      <p className="qr-mgmt-create-modal__desc">
        {isEquipment
          ? "QR이 없는 설비만 선택할 수 있습니다."
          : "입고 등록된 제품 중 QR이 없는 품목만 선택할 수 있습니다."}
      </p>
      {candidates.length === 0 ? (
        <p className="qr-mgmt-create-modal__empty">생성 가능한 항목이 없습니다.</p>
      ) : (
        <div className="qr-mgmt-create-modal__list">
          {candidates.map((record) => {
            const key = isEquipment ? record.code : record.id;
            return (
              <label
                key={key}
                className={`qr-mgmt-create-modal__item${selectedKey === key ? " is-selected" : ""}`}
              >
                <input
                  type="radio"
                  name="qr-create-target"
                  value={key}
                  checked={selectedKey === key}
                  onChange={() => setSelectedKey(key)}
                />
                <span className="qr-mgmt-create-modal__item-main">
                  <strong>{isEquipment ? record.name : record.partName}</strong>
                  <em>{key}</em>
                </span>
                <span className="qr-mgmt-create-modal__item-meta">
                  {isEquipment
                    ? `${record.location || "—"} · ${record.inspectionCycle || "월 1회"}`
                    : `${record.company} · LOT ${record.lotNo || "—"} · ${formatQtyWithUnit(record.qty, record.unit ?? "EA")}`}
                </span>
              </label>
            );
          })}
        </div>
      )}
    </TitanRegisterModal>
  );
}

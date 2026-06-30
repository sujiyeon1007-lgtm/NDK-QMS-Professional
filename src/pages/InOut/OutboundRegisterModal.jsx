import { useEffect, useState } from "react";
import Input from "../../foundation/components/Input";
import TitanRegisterModal from "../../foundation/components/TitanRegisterModal";
import { OUTBOUND_REGISTER_LABEL } from "../../config/registerModalStandard";
import { getMasterDataByCategory } from "../../utils/masterData";
import {
  getSessionProductionRecords,
  updateSessionProductionRecord,
} from "../../utils/productionRecords";
import { getJournalReferenceDate } from "../../utils/workJournalData";

const EMPTY_FORM = {
  managementId: "",
  shipQty: "",
  shipDate: "",
  manager: "",
  note: "",
};

export default function OutboundRegisterModal({ open, onClose, onRegister }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const records = getSessionProductionRecords().filter((r) => r.incomingRegistered);
  const workers = getMasterDataByCategory("workers");

  useEffect(() => {
    if (open) {
      setForm({
        ...EMPTY_FORM,
        shipDate: getJournalReferenceDate(),
        manager: workers[0]?.name ?? "관리자",
      });
    }
  }, [open, workers]);

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    if (!form.managementId.trim()) return;
    onRegister(form);
    onClose();
  };

  return (
    <TitanRegisterModal
      open={open}
      onClose={onClose}
      onSubmit={handleSubmit}
      kicker="입출고관리"
      title={OUTBOUND_REGISTER_LABEL}
      titleId="outbound-register-modal-title"
      size="wide"
    >
      <div className="titan-modal__grid">
        <label className="titan-modal__field titan-modal__field--full">
          <span>관리번호</span>
          <select
            value={form.managementId}
            onChange={(e) => updateField("managementId", e.target.value)}
          >
            <option value="">선택</option>
            {records.map((record) => (
              <option key={record.id} value={record.id}>
                {record.id} · {record.company} · {record.partName}
              </option>
            ))}
          </select>
        </label>
        <label className="titan-modal__field">
          <span>수량</span>
          <Input
            value={form.shipQty}
            onChange={(e) => updateField("shipQty", e.target.value)}
            placeholder="출고 수량"
          />
        </label>
        <label className="titan-modal__field">
          <span>출고일</span>
          <Input
            type="date"
            value={form.shipDate}
            onChange={(e) => updateField("shipDate", e.target.value)}
          />
        </label>
        <label className="titan-modal__field">
          <span>담당자</span>
          <select value={form.manager} onChange={(e) => updateField("manager", e.target.value)}>
            <option value="">선택</option>
            {workers.map((item) => (
              <option key={item.id} value={item.name}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
        <label className="titan-modal__field titan-modal__field--full">
          <span>비고</span>
          <Input
            value={form.note}
            onChange={(e) => updateField("note", e.target.value)}
            placeholder="비고"
          />
        </label>
      </div>
    </TitanRegisterModal>
  );
}

export function applyOutboundRegister(form) {
  if (!form.managementId.trim()) return null;
  updateSessionProductionRecord(form.managementId.trim(), {
    outboundRegistered: true,
    outboundDate: form.shipDate || getJournalReferenceDate(),
    outboundManager: form.manager || "관리자",
    note: form.note?.trim() || undefined,
  });
  return form.managementId.trim();
}

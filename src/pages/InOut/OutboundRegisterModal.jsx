import { useEffect, useMemo, useState } from "react";
import Input from "../../foundation/components/Input";
import TitanRegisterModal from "../../foundation/components/TitanRegisterModal";
import TitanCascadeProductPicker from "../../foundation/components/TitanCascadeProductPicker";
import TitanSearchableSelect from "../../foundation/components/TitanSearchableSelect";
import { OUTBOUND_REGISTER_LABEL } from "../../config/registerModalStandard";
import { getActiveWorkers } from "../../utils/masterData";
import { getStockQty } from "../../utils/inventory";
import {
  getOutboundEligibleRecords,
  mapRecordToOutboundRegisterForm,
  validateOutboundRegisterForm,
} from "../../utils/outboundRegistration";
import { getSessionProductionRecords } from "../../utils/productionRecords";
import { getPrintOutputDate } from "../../utils/titanPrintDates";
import { resolveDefaultAssigneeFromAuth } from "../../utils/titanAssigneeResolver";

const EMPTY_FORM = mapRecordToOutboundRegisterForm(null);

function formatOutboundRecordOption(record) {
  return `${record.id} · ${record.company} · ${record.partName} · 실재고 ${getStockQty(record)} EA`;
}

function resolveRegisterRecord(managementId, eligibleRecords = []) {
  const trimmed = managementId?.trim();
  if (!trimmed) return null;

  return (
    eligibleRecords.find((item) => item.id === trimmed) ??
    getSessionProductionRecords().find((item) => item.id === trimmed) ??
    null
  );
}

export default function OutboundRegisterModal({ open, onClose, onRegister, initialManagementId = "" }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const workers = useMemo(() => getActiveWorkers(), [open]);

  const eligibleRecords = useMemo(() => (open ? getOutboundEligibleRecords() : []), [open]);

  const displayRecords = useMemo(() => {
    const records = [...eligibleRecords];
    const current = resolveRegisterRecord(form.managementId, records);
    if (current && !records.some((item) => item.id === current.id)) {
      records.unshift(current);
    }
    return records;
  }, [eligibleRecords, form.managementId]);

  const outboundRecordOptions = useMemo(
    () => displayRecords.map((record) => formatOutboundRecordOption(record)),
    [displayRecords]
  );

  const selectedOutboundOption = useMemo(() => {
    const record = displayRecords.find((item) => item.id === form.managementId);
    return record ? formatOutboundRecordOption(record) : "";
  }, [displayRecords, form.managementId]);

  useEffect(() => {
    if (!open) return;

    const records = getOutboundEligibleRecords();
    const baseForm = {
      ...EMPTY_FORM,
      shipDate: getPrintOutputDate(),
      manager: resolveDefaultAssigneeFromAuth(),
    };

    const record = resolveRegisterRecord(initialManagementId, records);
    setForm(mapRecordToOutboundRegisterForm(record, baseForm));
  }, [open, initialManagementId]);

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleManagementChange = (managementId) => {
    const record = resolveRegisterRecord(managementId, eligibleRecords);
    setForm(mapRecordToOutboundRegisterForm(record, { ...form, managementId, shipQty: "" }));
  };

  const handleSubmit = () => {
    try {
      const validation = validateOutboundRegisterForm(form);
      if (!validation.ok) {
        window.alert(validation.message || "출고 등록 정보를 확인하세요.");
        return;
      }

      onRegister?.({
        ok: true,
        form: { ...form },
        managementId: validation.record.id,
        record: validation.record,
        shipQty: validation.shipQty,
        stockBefore: validation.stock,
        stockAfter: validation.stock - validation.shipQty,
      });
      onClose?.();
    } catch (error) {
      console.error("[OutboundRegisterModal] submit failed", error);
      window.alert(error?.message || "출고 등록 중 오류가 발생했습니다.");
    }
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
      <div className="titan-modal__section">
        <p className="titan-modal__section-title">출고 대상 선택</p>
        <TitanSearchableSelect
          className="titan-modal__field titan-modal__field--full"
          label="관리번호"
          value={selectedOutboundOption}
          onChange={(option) => {
            const managementId = option.split(" · ")[0]?.trim() ?? "";
            handleManagementChange(managementId);
          }}
          options={outboundRecordOptions}
          placeholder="관리번호 선택"
        />
      </div>

      <div className="titan-modal__section">
        <p className="titan-modal__section-title">기본 정보</p>
        <div className="titan-modal__grid">
          <label className="titan-modal__field">
            <span>LOT</span>
            <Input value={form.lotNo} readOnly disabled />
          </label>
          <label className="titan-modal__field">
            <span>업체명</span>
            <Input value={form.company} readOnly disabled />
          </label>
          <label className="titan-modal__field">
            <span>품명</span>
            <Input value={form.partName} readOnly disabled />
          </label>
          <label className="titan-modal__field">
            <span>품번</span>
            <Input value={form.partNo} readOnly disabled />
          </label>
          <label className="titan-modal__field">
            <span>재질</span>
            <Input value={form.material} readOnly disabled />
          </label>
          <label className="titan-modal__field">
            <span>공정</span>
            <Input value={form.processName} readOnly disabled />
          </label>
        </div>
      </div>

      <div className="titan-modal__section">
        <p className="titan-modal__section-title">수량</p>
        <div className="titan-modal__grid">
          <label className="titan-modal__field">
            <span>실재고(EA)</span>
            <Input value={form.stockQty} readOnly disabled placeholder="자동 입력" />
          </label>
          <label className="titan-modal__field">
            <span>출고수량(EA)</span>
            <Input
              value={form.shipQty}
              onChange={(e) => updateField("shipQty", e.target.value)}
              placeholder="출고 수량 입력"
            />
          </label>
        </div>
      </div>

      <div className="titan-modal__section">
        <p className="titan-modal__section-title">출고 정보</p>
        <div className="titan-modal__grid">
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
      </div>
    </TitanRegisterModal>
  );
}

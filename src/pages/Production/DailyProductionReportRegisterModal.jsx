import Input from "../../foundation/components/Input";
import TitanRegisterModal from "../../foundation/components/TitanRegisterModal";
import { createEmptyProductionDailyReportRegister } from "../../config/listSearchStandard";
import { PRODUCTION_DAILY_REGISTER_LABEL } from "../../config/registerModalStandard";
import { getProductionProcessCodes } from "../../config/productionProcessCodes";
import { getMasterDataByCategory } from "../../utils/masterData";
import { getSessionProductionRecords } from "../../utils/productionRecords";
import { useEffect, useState } from "react";

export default function DailyProductionReportRegisterModal({ open, onClose, onRegister }) {
  const [form, setForm] = useState(createEmptyProductionDailyReportRegister());

  const companies = getMasterDataByCategory("companies");
  const equipmentList = getMasterDataByCategory("equipment");
  const workerList = getMasterDataByCategory("workers");
  const processCodes = getProductionProcessCodes();

  useEffect(() => {
    if (open) {
      setForm(createEmptyProductionDailyReportRegister());
    }
  }, [open]);

  const updateField = (key, value) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "managementId") {
        const existing = getSessionProductionRecords().find((r) => r.id === value.trim());
        if (existing) {
          return {
            ...next,
            company: existing.company || prev.company,
            lotNo: existing.lotNo?.trim() || prev.lotNo,
            process: existing.heatTreatment || prev.process,
            partName: existing.partName || prev.partName,
            partNo: existing.partNo || prev.partNo,
            material: existing.material || prev.material,
            qty: existing.qty != null ? String(existing.qty) : prev.qty,
            workDate: existing.workDate || prev.workDate,
            equipment: existing.equipment || prev.equipment,
            worker: existing.registrar || prev.worker,
            note: existing.note || prev.note,
          };
        }
      }
      return next;
    });
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
      kicker="생산관리"
      title={PRODUCTION_DAILY_REGISTER_LABEL}
      titleId="daily-report-modal-title"
      size="wide"
    >
      <div className="titan-modal__grid">
        <label className="titan-modal__field">
          <span>관리번호</span>
          <Input
            value={form.managementId}
            onChange={(e) => updateField("managementId", e.target.value)}
            placeholder="관리번호"
          />
        </label>
        <label className="titan-modal__field">
          <span>LOT.NO</span>
          <Input
            value={form.lotNo}
            onChange={(e) => updateField("lotNo", e.target.value)}
            placeholder="LOT.NO"
          />
        </label>
        <label className="titan-modal__field">
          <span>업체명</span>
          <select value={form.company} onChange={(e) => updateField("company", e.target.value)}>
            <option value="">선택</option>
            {companies.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="titan-modal__field">
          <span>품명</span>
          <Input
            value={form.partName}
            onChange={(e) => updateField("partName", e.target.value)}
            placeholder="품명"
          />
        </label>
        <label className="titan-modal__field">
          <span>품번</span>
          <Input
            value={form.partNo}
            onChange={(e) => updateField("partNo", e.target.value)}
            placeholder="품번"
          />
        </label>
        <label className="titan-modal__field">
          <span>재질</span>
          <Input
            value={form.material}
            onChange={(e) => updateField("material", e.target.value)}
            placeholder="재질"
          />
        </label>
        <label className="titan-modal__field">
          <span>수량</span>
          <Input
            value={form.qty}
            onChange={(e) => updateField("qty", e.target.value)}
            placeholder="수량"
          />
        </label>
        <label className="titan-modal__field">
          <span>공정</span>
          <select value={form.process} onChange={(e) => updateField("process", e.target.value)}>
            <option value="">선택</option>
            {processCodes.map((item) => (
              <option key={item.id} value={item.name}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
        <label className="titan-modal__field">
          <span>작업일</span>
          <Input
            type="date"
            value={form.workDate}
            onChange={(e) => updateField("workDate", e.target.value)}
          />
        </label>
        <label className="titan-modal__field">
          <span>설비</span>
          <select value={form.equipment} onChange={(e) => updateField("equipment", e.target.value)}>
            <option value="">선택</option>
            {equipmentList.map((item) => (
              <option key={item.id} value={item.name ?? item.code}>
                {item.name ?? item.code}
              </option>
            ))}
          </select>
        </label>
        <label className="titan-modal__field">
          <span>작업자</span>
          <select value={form.worker} onChange={(e) => updateField("worker", e.target.value)}>
            <option value="">선택</option>
            {workerList.map((item) => (
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

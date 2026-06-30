import { useEffect, useState } from "react";
import Input from "../../foundation/components/Input";
import TitanRegisterModal from "../../foundation/components/TitanRegisterModal";
import { createEmptyInspectionLogRegister } from "../../config/listSearchStandard";
import { INSPECTION_LOG_REGISTER_LABEL } from "../../config/registerModalStandard";
import { INSPECTION_ITEM_OPTIONS, INSPECTION_RESULT_OPTIONS } from "../../config/qualityDashboard";
import { getProductionProcessCodes, getProductionProcessName } from "../../config/productionProcessCodes";
import { getMasterDataByCategory } from "../../utils/masterData";
import { getSessionProductionRecords } from "../../utils/productionRecords";
import { getCurrentTitanUser } from "../../utils/titanHistorySession";
import { getJournalReferenceDate } from "../../utils/workJournalData";

export default function InspectionLogRegisterModal({ open, onClose, onRegister, initialData = null }) {
  const [form, setForm] = useState(createEmptyInspectionLogRegister());

  const companies = getMasterDataByCategory("companies");
  const workers = getMasterDataByCategory("workers");
  const processCodes = getProductionProcessCodes();

  useEffect(() => {
    if (!open) return;
    if (initialData) {
      setForm({
        ...createEmptyInspectionLogRegister(),
        ...initialData,
        inspectionDate: initialData.inspectionDate || getJournalReferenceDate(),
        assignee: initialData.assignee || getCurrentTitanUser(),
        inspectionItems: Array.isArray(initialData.inspectionItems) ? initialData.inspectionItems : [],
        judgment: initialData.judgment === "불합격" ? "불합격" : "합격",
      });
      return;
    }
    setForm({
      ...createEmptyInspectionLogRegister(),
      inspectionDate: getJournalReferenceDate(),
      assignee: getCurrentTitanUser(),
    });
  }, [open, initialData]);

  const updateField = (key, value) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "managementId") {
        const existing = getSessionProductionRecords().find((record) => record.id === value.trim());
        if (existing) {
          return {
            ...next,
            company: existing.company || prev.company,
            lotNo: existing.lotNo?.trim() || prev.lotNo,
            partName: existing.partName || prev.partName,
            partNo: existing.partNo || prev.partNo,
            material: existing.material || prev.material,
            process: getProductionProcessName(existing) !== "—" ? getProductionProcessName(existing) : prev.process,
            qty: existing.qty != null ? String(existing.qty) : prev.qty,
            unit: existing.unit || prev.unit,
          };
        }
      }
      return next;
    });
  };

  const toggleInspectionItem = (item) => {
    setForm((prev) => {
      const items = prev.inspectionItems.includes(item)
        ? prev.inspectionItems.filter((value) => value !== item)
        : [...prev.inspectionItems, item];
      return { ...prev, inspectionItems: items };
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
      kicker="품질관리"
      title={INSPECTION_LOG_REGISTER_LABEL}
      titleId="inspection-log-register-title"
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
            {companies.map((company) => (
              <option key={company.id} value={company.name}>
                {company.name}
              </option>
            ))}
          </select>
        </label>
        <label className="titan-modal__field">
          <span>품명</span>
          <Input value={form.partName} onChange={(e) => updateField("partName", e.target.value)} />
        </label>
        <label className="titan-modal__field">
          <span>품번</span>
          <Input value={form.partNo} onChange={(e) => updateField("partNo", e.target.value)} />
        </label>
        <label className="titan-modal__field">
          <span>재질</span>
          <Input value={form.material} onChange={(e) => updateField("material", e.target.value)} />
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
          <span>수량</span>
          <Input
            value={form.qty}
            onChange={(e) => updateField("qty", e.target.value)}
            placeholder="수량"
          />
        </label>
        <label className="titan-modal__field">
          <span>검사일</span>
          <Input
            type="date"
            value={form.inspectionDate}
            onChange={(e) => updateField("inspectionDate", e.target.value)}
          />
        </label>
        <label className="titan-modal__field">
          <span>검사자</span>
          <select value={form.assignee} onChange={(e) => updateField("assignee", e.target.value)}>
            <option value="">선택</option>
            {workers.map((worker) => (
              <option key={worker.id} value={worker.name}>
                {worker.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <fieldset className="quality-register-fieldset">
        <legend>검사 항목 추가</legend>
        <div className="quality-register-checks">
          {INSPECTION_ITEM_OPTIONS.map((item) => (
            <label key={item} className="quality-register-check">
              <input
                type="checkbox"
                checked={form.inspectionItems.includes(item)}
                onChange={() => toggleInspectionItem(item)}
              />
              <span>{item}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="quality-register-fieldset">
        <legend>검사 결과</legend>
        <div className="quality-register-radios">
          {INSPECTION_RESULT_OPTIONS.map((value) => (
            <label key={value} className="quality-register-radio">
              <input
                type="radio"
                name="inspection-judgment"
                value={value}
                checked={form.judgment === value}
                onChange={() => updateField("judgment", value)}
              />
              <span>{value}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <label className="titan-modal__field titan-modal__field--full">
        <span>비고</span>
        <textarea
          className="titan-modal__textarea"
          rows={3}
          value={form.note}
          onChange={(e) => updateField("note", e.target.value)}
          placeholder="비고"
        />
      </label>
    </TitanRegisterModal>
  );
}

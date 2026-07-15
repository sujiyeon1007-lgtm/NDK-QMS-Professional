import { useState } from "react";
import TitanCascadeProductPicker from "../../foundation/components/TitanCascadeProductPicker";
import { TitanAutoComplete } from "../../foundation/components/TitanSearchAutocomplete";
import {
  INSPECTION_CATEGORIES,
  INSPECTION_JUDGMENTS,
} from "../../utils/inspectionLogSession";
import { getActiveWorkers } from "../../utils/masterData";
import { mapProductToFormAutofill } from "../../utils/productMasterSearch";
import { getSessionProductionRecords } from "../../utils/productionRecords";
import { resolveDefaultAssigneeFromAuth } from "../../utils/titanAssigneeResolver";
import { getJournalReferenceDate } from "../../utils/workJournalData";
import { getProductUnitOptions, normalizeProductUnit } from "../../utils/productUnits";
import { resolveChargeQty } from "../../utils/equipmentChargingQty";
import "./InspectionLogEntryModal.css";

const emptyProductFields = {
  partName: "",
  partNo: "",
  drawingNo: "",
  material: "",
  spec: "",
  unitPrice: "",
};

const emptyForm = () => ({
  inspectionDate: getJournalReferenceDate(),
  category: "양산",
  managementId: "",
  company: "",
  ...emptyProductFields,
  lotNo: "",
  qty: "",
  unit: "EA",
  assignee: resolveDefaultAssigneeFromAuth(),
  inspectionItem: "",
  inspectionStandard: "",
  measuredValue: "",
  judgment: "보류",
  inspectionEquipment: "",
  inspectionLocation: "",
  note: "",
});

function InspectionLogEntryForm({ initialData, onClose, onSave }) {
  const [form, setForm] = useState(() =>
    initialData ? { ...emptyForm(), ...initialData } : emptyForm()
  );
  const unitOptions = getProductUnitOptions();
  const workerOptions = getActiveWorkers();

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleCompanyChange = (value) => {
    setForm((prev) => ({
      ...prev,
      company: value,
      ...emptyProductFields,
    }));
  };

  const handleCascadeChange = (selection, product) => {
    if (product) {
      const autofill = mapProductToFormAutofill(product);
      setForm((prev) => ({
        ...prev,
        partName: autofill.partName,
        partNo: autofill.partNo,
        drawingNo: autofill.drawingNo,
        material: autofill.material,
        spec: autofill.spec,
        unitPrice: autofill.unitPrice,
        unit: autofill.unit || prev.unit,
      }));
      return;
    }
    setForm((prev) => ({
      ...prev,
      partName: selection.partName,
      partNo: selection.partNo,
      drawingNo: selection.drawingNo,
    }));
  };

  const handleManagementIdBlur = () => {
    const trimmed = form.managementId.trim();
    if (!trimmed) return;
    const record = getSessionProductionRecords().find((item) => item.id === trimmed);
    if (!record) return;
    setForm((prev) => ({
      ...prev,
      managementId: record.id,
      company: record.company,
      partName: record.partName,
      partNo: record.partNo,
      drawingNo: record.drawingNo || "",
      material: record.material,
      spec: record.spec || "",
      unitPrice: record.unitPrice != null ? String(record.unitPrice) : "",
      lotNo: record.lotNo || prev.lotNo,
      qty: String(resolveChargeQty(record, { lotNo: record.lotNo }) || ""),
      unit: record.unit || "EA",
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!form.managementId.trim()) {
      window.alert("관리번호를 입력하세요.");
      return;
    }
    onSave({
      ...form,
      qty: Number(form.qty) || 0,
      unit: normalizeProductUnit(form.unit),
    });
  };

  return (
    <>
      <header className="inspection-log-modal-header">
        <div>
          <p className="inspection-log-modal-kicker">Inspection Log</p>
          <h2 id="inspection-log-modal-title">
            {initialData?.id ? "검사일지 수정" : "검사일지 등록"}
          </h2>
        </div>
        <button type="button" className="inspection-log-modal-close" onClick={onClose}>
          닫기
        </button>
      </header>

      <form className="inspection-log-modal-form" onSubmit={handleSubmit}>
        <section className="inspection-log-form-section">
          <h3>기본정보</h3>
          <div className="inspection-log-form-grid">
            <label>
              <span>검사일자</span>
              <input
                type="date"
                value={form.inspectionDate}
                onChange={(event) => handleChange("inspectionDate", event.target.value)}
              />
            </label>
            <label>
              <span>구분</span>
              <select
                value={form.category}
                onChange={(event) => handleChange("category", event.target.value)}
              >
                {INSPECTION_CATEGORIES.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>관리번호</span>
              <input
                type="text"
                value={form.managementId}
                onChange={(event) => handleChange("managementId", event.target.value)}
                onBlur={handleManagementIdBlur}
                placeholder="관리번호 입력"
              />
            </label>
            <label>
              <span>LOT 번호</span>
              <input
                type="text"
                value={form.lotNo}
                onChange={(event) => handleChange("lotNo", event.target.value)}
              />
            </label>
            <TitanAutoComplete
              fieldType="company"
              label="업체명"
              value={form.company}
              onChange={(value) => handleChange("company", value)}
              onSelect={handleCompanyChange}
              placeholder="거래처 검색"
            />
            <TitanCascadeProductPicker
              inline
              company={form.company}
              value={{
                partName: form.partName,
                partNo: form.partNo,
                drawingNo: form.drawingNo,
              }}
              onChange={handleCascadeChange}
              autoFields={{
                material: form.material,
                spec: form.spec,
                unitPrice: form.unitPrice,
                drawingNo: form.drawingNo,
              }}
              fieldClassName=""
              kicker="검사 등록"
            />
            <label>
              <span>수량</span>
              <div className="inspection-log-qty-unit">
                <input
                  type="number"
                  min="0"
                  value={form.qty}
                  onChange={(event) => handleChange("qty", event.target.value)}
                />
                <select
                  value={form.unit}
                  onChange={(event) => handleChange("unit", event.target.value)}
                >
                  {unitOptions.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
              </div>
            </label>
            <label>
              <span>담당자</span>
              <select
                value={form.assignee}
                onChange={(event) => handleChange("assignee", event.target.value)}
              >
                <option value="">작업자 선택</option>
                {workerOptions.map((worker) => (
                  <option key={worker.id} value={worker.name}>
                    {worker.name}
                    {worker.department ? ` · ${worker.department}` : ""}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>

        <section className="inspection-log-form-section">
          <h3>검사정보</h3>
          <div className="inspection-log-form-grid">
            <label className="span-2">
              <span>검사 항목</span>
              <input
                type="text"
                value={form.inspectionItem}
                onChange={(event) => handleChange("inspectionItem", event.target.value)}
              />
            </label>
            <label className="span-2">
              <span>검사 기준</span>
              <input
                type="text"
                value={form.inspectionStandard}
                onChange={(event) => handleChange("inspectionStandard", event.target.value)}
              />
            </label>
            <label>
              <span>측정값</span>
              <input
                type="text"
                value={form.measuredValue}
                onChange={(event) => handleChange("measuredValue", event.target.value)}
              />
            </label>
            <label>
              <span>판정</span>
              <select
                value={form.judgment}
                onChange={(event) => handleChange("judgment", event.target.value)}
              >
                {INSPECTION_JUDGMENTS.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>검사 장비</span>
              <input
                type="text"
                value={form.inspectionEquipment}
                onChange={(event) => handleChange("inspectionEquipment", event.target.value)}
              />
            </label>
            <label>
              <span>검사 위치</span>
              <input
                type="text"
                value={form.inspectionLocation}
                onChange={(event) => handleChange("inspectionLocation", event.target.value)}
              />
            </label>
            <label className="span-2">
              <span>비고</span>
              <textarea
                rows={3}
                value={form.note}
                onChange={(event) => handleChange("note", event.target.value)}
              />
            </label>
          </div>
        </section>

        <footer className="inspection-log-modal-footer">
          <button type="button" className="inspection-log-btn" onClick={onClose}>
            취소
          </button>
          <button type="submit" className="inspection-log-btn primary">
            저장
          </button>
        </footer>
      </form>
    </>
  );
}

function InspectionLogEntryModal({ open, initialData, onClose, onSave }) {
  if (!open) return null;

  return (
    <div className="inspection-log-modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="inspection-log-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="inspection-log-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <InspectionLogEntryForm
          key={initialData?.id ?? "create"}
          initialData={initialData}
          onClose={onClose}
          onSave={onSave}
        />
      </div>
    </div>
  );
}

export default InspectionLogEntryModal;

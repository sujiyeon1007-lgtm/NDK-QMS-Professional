import { useEffect, useState } from "react";
import Input from "../../foundation/components/Input";
import TitanRegisterModal from "../../foundation/components/TitanRegisterModal";
import TitanCascadeProductPicker from "../../foundation/components/TitanCascadeProductPicker";
import { TitanAutoComplete } from "../../foundation/components/TitanSearchAutocomplete";
import { CERTIFICATE_FILE_REGISTER_LABEL } from "../../config/registerModalStandard";
import { createEmptyCertificateRegister } from "../../config/listSearchStandard";
import { mapProductToFormAutofill } from "../../utils/productMasterSearch";
import { getSessionProductionRecords } from "../../utils/productionRecords";
import { buildCertificateEntryFromRecord } from "../../utils/certificateSession";
import {
  resolveAssigneeWorkerOptions,
  resolveDefaultAssigneeFromAuth,
} from "../../utils/titanAssigneeResolver";

const emptyProductFields = {
  lotNo: "",
  partName: "",
  partNo: "",
  drawingNo: "",
  material: "",
  spec: "",
  unitPrice: "",
  process: "",
  qty: "",
  unit: "EA",
};

export default function CertificateRegisterModal({ open, onClose, onRegister, initialData = null }) {
  const [form, setForm] = useState(createEmptyCertificateRegister());

  useEffect(() => {
    if (!open) return;
    if (initialData) {
      setForm({
        ...createEmptyCertificateRegister(),
        ...initialData,
        excelFile: initialData.excelFile ?? null,
        pdfFile: initialData.pdfFile ?? null,
      });
      return;
    }
    setForm({
      ...createEmptyCertificateRegister(),
      registeredBy: resolveDefaultAssigneeFromAuth(),
    });
  }, [open, initialData]);

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
        process: autofill.process || prev.process,
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

  const updateField = (key, value) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "managementId") {
        const existing = getSessionProductionRecords().find((record) => record.id === value.trim());
        if (existing) {
          const fromInspection = buildCertificateEntryFromRecord(existing);
          return {
            ...next,
            company: fromInspection.company || prev.company,
            lotNo: fromInspection.lotNo || prev.lotNo,
            partName: fromInspection.partName || prev.partName,
            partNo: fromInspection.partNo || prev.partNo,
            drawingNo: existing.drawingNo || prev.drawingNo,
            material: fromInspection.material || prev.material,
            spec: existing.spec || prev.spec,
            unitPrice:
              existing.unitPrice != null ? String(existing.unitPrice) : prev.unitPrice,
            process: fromInspection.process || prev.process,
            qty: fromInspection.qty != null ? String(fromInspection.qty) : prev.qty,
            unit: fromInspection.unit || prev.unit,
            registeredBy: fromInspection.registeredBy || prev.registeredBy,
          };
        }
      }
      return next;
    });
  };

  const handleFileChange = (key, event) => {
    const file = event.target.files?.[0] ?? null;
    updateField(key, file);
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
      title={CERTIFICATE_FILE_REGISTER_LABEL}
      titleId="certificate-register-title"
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
          <Input value={form.lotNo} onChange={(e) => updateField("lotNo", e.target.value)} />
        </label>
        <TitanAutoComplete
          fieldType="company"
          label="업체명"
          className="titan-modal__field"
          value={form.company}
          onChange={(value) => updateField("company", value)}
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
            process: form.process,
            drawingNo: form.drawingNo,
          }}
          fieldClassName="titan-modal__field"
          kicker="성적서 등록"
        />

        <label className="titan-modal__field">
          <span>담당자</span>
          <select value={form.registeredBy} onChange={(e) => updateField("registeredBy", e.target.value)}>
            <option value="">담당자 선택</option>
            {resolveAssigneeWorkerOptions().map((worker) => (
              <option key={worker.id} value={worker.name}>
                {worker.name}
                {worker.department ? ` · ${worker.department}` : ""}
              </option>
            ))}
          </select>
        </label>

        <label className="titan-modal__field">
          <span>수량</span>
          <Input value={form.qty} onChange={(e) => updateField("qty", e.target.value)} />
        </label>
      </div>

      <div className="quality-register-files">
        <label className="quality-register-file">
          <span>엑셀 선택</span>
          <Input type="file" accept=".xlsx,.xls" onChange={(e) => handleFileChange("excelFile", e)} />
          {form.excelFile?.name ? <em>{form.excelFile.name}</em> : null}
        </label>
        <label className="quality-register-file">
          <span>PDF 선택</span>
          <Input type="file" accept=".pdf" onChange={(e) => handleFileChange("pdfFile", e)} />
          {form.pdfFile?.name ? <em>{form.pdfFile.name}</em> : null}
        </label>
      </div>
    </TitanRegisterModal>
  );
}

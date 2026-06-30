import { useEffect, useState } from "react";
import Input from "../../foundation/components/Input";
import TitanRegisterModal from "../../foundation/components/TitanRegisterModal";
import { createEmptyCertificateRegister } from "../../config/listSearchStandard";
import { CERTIFICATE_FILE_REGISTER_LABEL } from "../../config/registerModalStandard";
import { getProductionProcessCodes, getProductionProcessName } from "../../config/productionProcessCodes";
import { getMasterDataByCategory } from "../../utils/masterData";
import { getSessionProductionRecords } from "../../utils/productionRecords";

export default function CertificateRegisterModal({ open, onClose, onRegister, initialData = null }) {
  const [form, setForm] = useState(createEmptyCertificateRegister());

  const companies = getMasterDataByCategory("companies");
  const processCodes = getProductionProcessCodes();

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
    setForm(createEmptyCertificateRegister());
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

  const handleFileChange = (key, event) => {
    const file = event.target.files?.[0] ?? null;
    updateField(key, file);
  };

  const handleSubmit = () => {
    if (!form.managementId.trim()) return;
    if (!form.excelFile && !form.pdfFile) return;
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

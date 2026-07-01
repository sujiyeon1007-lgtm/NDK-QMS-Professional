import { useEffect, useMemo, useState } from "react";
import TitanRegisterModal from "./TitanRegisterModal";
import {
  generateProductManagementCode,
  getActiveMasterNames,
  stageMasterAdd,
} from "../../utils/masterData";
import "../../pages/Settings/MasterDataManagement.css";

const emptyForm = {
  partNo: "",
  name: "",
  material: "",
  spec: "",
  unitPrice: "",
  process: "",
};

export default function QuickProductRegisterModal({
  open,
  onClose,
  company,
  partNo = "",
  partName = "",
  onSaved,
  kicker = "등록",
}) {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const materialOptions = useMemo(() => getActiveMasterNames("materials"), [open]);
  const processOptions = useMemo(() => getActiveMasterNames("heatTreatment"), [open]);

  useEffect(() => {
    if (!open) return;
    setForm({
      partNo: partNo ?? "",
      name: partName ?? "",
      material: "",
      spec: "",
      unitPrice: "",
      process: "",
    });
    setError("");
  }, [open, partNo, partName]);

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError("");
  };

  const handleSubmit = () => {
    if (!company?.trim()) {
      setError("업체명을 먼저 선택하세요.");
      return;
    }
    if (!form.partNo?.trim()) {
      setError("품번을 입력하세요.");
      return;
    }
    if (!form.name?.trim()) {
      setError("품명을 입력하세요.");
      return;
    }

    const code = generateProductManagementCode(company);
    const result = stageMasterAdd("products", {
      code,
      company: company.trim(),
      partNo: form.partNo.trim(),
      name: form.name.trim(),
      material: form.material.trim(),
      spec: form.spec.trim(),
      unitPrice: form.unitPrice,
      process: form.process.trim(),
      active: true,
    });

    if (!result.ok) {
      setError(result.message || "제품 등록에 실패했습니다.");
      return;
    }

    onSaved?.(result.row);
    onClose();
  };

  if (!open) return null;

  return (
    <TitanRegisterModal
      open={open}
      onClose={onClose}
      onSubmit={handleSubmit}
      kicker={kicker}
      title="제품 간편 등록"
      submitLabel="저장"
      size="wide"
    >
      {error ? (
        <p className="master-register-modal__error" role="alert">
          {error}
        </p>
      ) : null}
      <div className="master-register-modal__grid">
        <label className="master-register-modal__field">
          <span>품명 *</span>
          <input
            type="text"
            placeholder="품명"
            value={form.name}
            onChange={(event) => updateField("name", event.target.value)}
          />
        </label>
        <label className="master-register-modal__field">
          <span>품번 *</span>
          <input
            type="text"
            placeholder="품번"
            value={form.partNo}
            onChange={(event) => updateField("partNo", event.target.value)}
          />
        </label>
        <label className="master-register-modal__field">
          <span>규격</span>
          <input
            type="text"
            placeholder="규격"
            value={form.spec}
            onChange={(event) => updateField("spec", event.target.value)}
          />
        </label>
        <label className="master-register-modal__field">
          <span>재질</span>
          <select
            value={form.material}
            onChange={(event) => updateField("material", event.target.value)}
          >
            <option value="">재질 선택</option>
            {materialOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <label className="master-register-modal__field">
          <span>기본단가</span>
          <input
            type="text"
            placeholder="예: 1500"
            value={form.unitPrice}
            onChange={(event) => updateField("unitPrice", event.target.value)}
          />
        </label>
        <label className="master-register-modal__field">
          <span>기본 열처리 종류</span>
          <select
            value={form.process}
            onChange={(event) => updateField("process", event.target.value)}
          >
            <option value="">공정 선택</option>
            {processOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      </div>
    </TitanRegisterModal>
  );
}

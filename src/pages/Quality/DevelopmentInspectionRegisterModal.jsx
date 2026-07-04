import { useEffect, useState } from "react";
import Input from "../../foundation/components/Input";
import TitanRegisterModal from "../../foundation/components/TitanRegisterModal";
import { DEVELOPMENT_INSPECTION_STATUS } from "../../config/inspectionManagement";
import { getMasterDataByCategory } from "../../utils/masterData";
import { createEmptyDevelopmentInspectionRegister } from "../../utils/developmentInspectionSession";

export default function DevelopmentInspectionRegisterModal({
  open,
  onClose,
  onRegister,
  initialRecord = null,
  mode = "create",
}) {
  const [form, setForm] = useState(createEmptyDevelopmentInspectionRegister());
  const companies = getMasterDataByCategory("companies");

  useEffect(() => {
    if (!open) return;
    if (initialRecord) {
      setForm({
        id: initialRecord.id,
        testName: initialRecord.testName || "",
        company: initialRecord.company || "",
        partName: initialRecord.partName || "",
        material: initialRecord.material || "",
        requester: initialRecord.requester || "",
        registeredDate: initialRecord.registeredDate || "",
        status: initialRecord.status || "대기",
        testPurpose: initialRecord.testPurpose || "",
        measurementItems: initialRecord.measurementItems || "",
        note: initialRecord.note || "",
        attachments: initialRecord.attachments || [],
        createdAt: initialRecord.createdAt,
      });
      return;
    }
    setForm(createEmptyDevelopmentInspectionRegister());
  }, [open, initialRecord]);

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    if (!form.testName.trim()) return;
    onRegister(form);
    onClose();
  };

  const title =
    mode === "inspect"
      ? "개발 검사일지 작성"
      : mode === "edit"
        ? "개발검사 수정"
        : "개발검사 등록";

  return (
    <TitanRegisterModal
      open={open}
      onClose={onClose}
      onSubmit={handleSubmit}
      kicker="검사관리"
      title={title}
      titleId="development-inspection-modal-title"
      size="wide"
    >
      <div className="titan-modal__grid">
        <label className="titan-modal__field titan-modal__field--span-2">
          <span>시험명</span>
          <Input
            value={form.testName}
            onChange={(e) => updateField("testName", e.target.value)}
            placeholder="시험명"
          />
        </label>
        <label className="titan-modal__field">
          <span>업체명</span>
          <Input
            value={form.company}
            onChange={(e) => updateField("company", e.target.value)}
            placeholder="업체명"
            list="dev-inspection-companies"
          />
          <datalist id="dev-inspection-companies">
            {companies.map((company) => (
              <option key={company.id ?? company.name} value={company.name} />
            ))}
          </datalist>
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
          <span>재질</span>
          <Input
            value={form.material}
            onChange={(e) => updateField("material", e.target.value)}
            placeholder="재질"
          />
        </label>
        <label className="titan-modal__field">
          <span>의뢰자</span>
          <Input
            value={form.requester}
            onChange={(e) => updateField("requester", e.target.value)}
            placeholder="의뢰자"
          />
        </label>
        <label className="titan-modal__field">
          <span>등록일</span>
          <Input
            type="date"
            value={form.registeredDate}
            onChange={(e) => updateField("registeredDate", e.target.value)}
          />
        </label>
        <label className="titan-modal__field">
          <span>상태</span>
          <select
            className="titan-search-panel__select"
            value={form.status}
            onChange={(e) => updateField("status", e.target.value)}
          >
            {DEVELOPMENT_INSPECTION_STATUS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>
        <label className="titan-modal__field titan-modal__field--span-2">
          <span>시험 목적</span>
          <Input
            value={form.testPurpose}
            onChange={(e) => updateField("testPurpose", e.target.value)}
            placeholder="시험 목적"
          />
        </label>
        <label className="titan-modal__field titan-modal__field--span-2">
          <span>측정 항목</span>
          <Input
            value={form.measurementItems}
            onChange={(e) => updateField("measurementItems", e.target.value)}
            placeholder="측정 항목"
          />
        </label>
        <label className="titan-modal__field titan-modal__field--span-2">
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

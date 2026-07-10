import { useEffect, useMemo, useState } from "react";
import Input from "../../foundation/components/Input";
import TitanRegisterModal from "../../foundation/components/TitanRegisterModal";
import TitanCascadeProductPicker from "../../foundation/components/TitanCascadeProductPicker";
import TitanSearchableSelect from "../../foundation/components/TitanSearchableSelect";
import { OTHER_INSPECTION_CATEGORIES, OTHER_INSPECTION_STATUS } from "../../config/inspectionManagement";
import { getActiveMasterNames } from "../../utils/masterData";
import { mapProductToFormAutofill } from "../../utils/productMasterSearch";
import { createEmptyOtherInspectionRegister } from "../../utils/otherInspectionSession";

export default function OtherInspectionRegisterModal({
  open,
  onClose,
  onRegister,
  initialRecord = null,
  mode = "create",
}) {
  const [form, setForm] = useState(createEmptyOtherInspectionRegister());
  const companyOptions = useMemo(() => getActiveMasterNames("companies"), [open]);

  useEffect(() => {
    if (!open) return;
    if (initialRecord) {
      setForm({
        id: initialRecord.id,
        category: initialRecord.category || "기타",
        company: initialRecord.company || "",
        partName: initialRecord.partName || "",
        content: initialRecord.content || "",
        assignee: initialRecord.assignee || "",
        registeredDate: initialRecord.registeredDate || "",
        status: initialRecord.status || "대기",
        note: initialRecord.note || "",
        attachments: initialRecord.attachments || [],
        createdAt: initialRecord.createdAt,
      });
      return;
    }
    setForm(createEmptyOtherInspectionRegister());
  }, [open, initialRecord]);

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleCompanyChange = (value) => {
    setForm((prev) => ({
      ...prev,
      company: value,
      partName: "",
    }));
  };

  const handleCascadeChange = (selection, product) => {
    if (product) {
      const autofill = mapProductToFormAutofill(product);
      setForm((prev) => ({
        ...prev,
        partName: autofill.partName,
      }));
      return;
    }
    setForm((prev) => ({
      ...prev,
      partName: selection.partName,
    }));
  };

  const handleSubmit = () => {
    if (!form.content.trim()) return;
    onRegister(form);
    onClose();
  };

  const title =
    mode === "inspect"
      ? "기타 검사일지 작성"
      : mode === "edit"
        ? "기타검사 수정"
        : "기타검사 등록";

  return (
    <TitanRegisterModal
      open={open}
      onClose={onClose}
      onSubmit={handleSubmit}
      kicker="검사관리"
      title={title}
      titleId="other-inspection-modal-title"
      size="wide"
    >
      <div className="titan-modal__grid">
        <label className="titan-modal__field">
          <span>구분</span>
          <select
            className="titan-search-panel__select"
            value={form.category}
            onChange={(e) => updateField("category", e.target.value)}
          >
            {OTHER_INSPECTION_CATEGORIES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <label className="titan-modal__field">
          <span>상태</span>
          <select
            className="titan-search-panel__select"
            value={form.status}
            onChange={(e) => updateField("status", e.target.value)}
          >
            {OTHER_INSPECTION_STATUS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>
        <TitanSearchableSelect
          className="titan-modal__field"
          label="업체"
          value={form.company}
          onChange={handleCompanyChange}
          options={companyOptions}
          placeholder="거래처 선택"
        />
        <TitanCascadeProductPicker
          inline
          partNameOnly
          showDrawingNo={false}
          company={form.company}
          value={{
            partName: form.partName,
            partNo: "",
            drawingNo: "",
          }}
          onChange={handleCascadeChange}
          fieldClassName="titan-modal__field"
          kicker="기타검사 등록"
        />
        <label className="titan-modal__field titan-modal__field--span-2">
          <span>내용</span>
          <Input
            value={form.content}
            onChange={(e) => updateField("content", e.target.value)}
            placeholder="검사 내용"
          />
        </label>
        <label className="titan-modal__field">
          <span>담당자</span>
          <Input
            value={form.assignee}
            onChange={(e) => updateField("assignee", e.target.value)}
            placeholder="담당자"
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

import { useEffect, useState } from "react";
import Input from "../../foundation/components/Input";
import TitanRegisterModal from "../../foundation/components/TitanRegisterModal";
import { DEPARTMENT_WORK_REGISTER_LABEL } from "../../config/registerModalStandard";
import {
  DEPARTMENT_DEFINITIONS,
  DEPARTMENT_WORK_PRIORITY,
  DEPARTMENT_WORK_STATUS,
} from "../../config/departmentWorkDashboard";
import { getMasterDataByCategory } from "../../utils/masterData";
import { getSessionProductionRecords } from "../../utils/productionRecords";
import { createEmptyDepartmentWorkRegister } from "../../utils/departmentWorkSession";

export default function DepartmentWorkRegisterModal({
  open,
  onClose,
  onRegister,
  defaultDepartmentId = "quality",
  initialTask = null,
}) {
  const [form, setForm] = useState(createEmptyDepartmentWorkRegister(defaultDepartmentId));

  const companies = getMasterDataByCategory("companies");

  useEffect(() => {
    if (!open) return;
    if (initialTask) {
      setForm({
        id: initialTask.id,
        title: initialTask.title || "",
        departmentId: initialTask.departmentId || defaultDepartmentId,
        assignee: initialTask.assignee || "",
        content: initialTask.content || "",
        requestDate: initialTask.requestDate || "",
        dueDate: initialTask.dueDate || "",
        priority: initialTask.priority || "보통",
        status: initialTask.status || "대기",
        note: initialTask.note || "",
        company: initialTask.company || "",
        partName: initialTask.partName || "",
        partNo: initialTask.partNo || "",
        material: initialTask.material || "",
        managementId: initialTask.managementId || "",
        createdAt: initialTask.createdAt,
      });
      return;
    }
    setForm(createEmptyDepartmentWorkRegister(defaultDepartmentId));
  }, [open, initialTask, defaultDepartmentId]);

  const updateField = (key, value) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "managementId") {
        const existing = getSessionProductionRecords().find((record) => record.id === value.trim());
        if (existing) {
          return {
            ...next,
            company: existing.company || prev.company,
            partName: existing.partName || prev.partName,
            partNo: existing.partNo || prev.partNo,
            material: existing.material || prev.material,
          };
        }
      }
      return next;
    });
  };

  const handleSubmit = () => {
    if (!form.title.trim() || !form.departmentId) return;
    onRegister(form);
    onClose();
  };

  return (
    <TitanRegisterModal
      open={open}
      onClose={onClose}
      onSubmit={handleSubmit}
      kicker="부서별 업무"
      title={DEPARTMENT_WORK_REGISTER_LABEL}
      titleId="department-work-modal-title"
      size="wide"
    >
      <div className="titan-modal__grid">
        <label className="titan-modal__field titan-modal__field--span-2">
          <span>업무명</span>
          <Input
            value={form.title}
            onChange={(e) => updateField("title", e.target.value)}
            placeholder="업무명"
          />
        </label>
        <label className="titan-modal__field">
          <span>담당부서</span>
          <select
            className="titan-search-panel__select"
            value={form.departmentId}
            onChange={(e) => updateField("departmentId", e.target.value)}
          >
            {DEPARTMENT_DEFINITIONS.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <label className="titan-modal__field">
          <span>담당자</span>
          <Input
            value={form.assignee}
            onChange={(e) => updateField("assignee", e.target.value)}
            placeholder="담당자"
          />
        </label>
        <label className="titan-modal__field titan-modal__field--span-2">
          <span>업무 내용</span>
          <textarea
            className="titan-modal__textarea"
            value={form.content}
            onChange={(e) => updateField("content", e.target.value)}
            placeholder="업무 내용"
            rows={3}
          />
        </label>
        <label className="titan-modal__field">
          <span>요청일</span>
          <Input
            type="date"
            value={form.requestDate}
            onChange={(e) => updateField("requestDate", e.target.value)}
          />
        </label>
        <label className="titan-modal__field">
          <span>완료 예정일</span>
          <Input
            type="date"
            value={form.dueDate}
            onChange={(e) => updateField("dueDate", e.target.value)}
          />
        </label>
        <label className="titan-modal__field">
          <span>우선순위</span>
          <select
            className="titan-search-panel__select"
            value={form.priority}
            onChange={(e) => updateField("priority", e.target.value)}
          >
            {DEPARTMENT_WORK_PRIORITY.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label className="titan-modal__field">
          <span>진행상태</span>
          <select
            className="titan-search-panel__select"
            value={form.status}
            onChange={(e) => updateField("status", e.target.value)}
          >
            {DEPARTMENT_WORK_STATUS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label className="titan-modal__field">
          <span>관리번호</span>
          <Input
            value={form.managementId}
            onChange={(e) => updateField("managementId", e.target.value)}
            placeholder="관리번호 (선택)"
          />
        </label>
        <label className="titan-modal__field">
          <span>업체명</span>
          <select
            className="titan-search-panel__select"
            value={form.company}
            onChange={(e) => updateField("company", e.target.value)}
          >
            <option value="">선택</option>
            {companies.map((item) => (
              <option key={item.id ?? item.code} value={item.name ?? item.code}>
                {item.name ?? item.code}
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

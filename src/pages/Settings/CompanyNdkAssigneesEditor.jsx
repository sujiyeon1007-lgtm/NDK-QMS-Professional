import { Plus, Trash2 } from "lucide-react";

import { SecondaryButton } from "../../foundation/components/Button";
import {
  COMPANY_NDK_ASSIGNEE_FIELDS,
  createEmptyCompanyNdkAssignee,
} from "../../utils/companyNdkAssigneesModel";

export default function CompanyNdkAssigneesEditor({ assignees = [], onChange }) {
  const rows = assignees.length > 0 ? assignees : [createEmptyCompanyNdkAssignee("ndk-new-1")];

  const updateAssignee = (index, key, value) => {
    onChange(rows.map((row, rowIndex) => (rowIndex === index ? { ...row, [key]: value } : row)));
  };

  const addAssignee = () => {
    onChange([...rows, createEmptyCompanyNdkAssignee(`ndk-new-${rows.length + 1}`)]);
  };

  const removeAssignee = (index) => {
    const nextRows = rows.filter((_, rowIndex) => rowIndex !== index);
    onChange(nextRows.length > 0 ? nextRows : [createEmptyCompanyNdkAssignee("ndk-new-1")]);
  };

  const commitRows = (nextRows) => {
    onChange(
      nextRows.filter((row) =>
        [row.name, row.department, row.position, row.phone, row.email].some((value) =>
          String(value ?? "").trim()
        )
      )
    );
  };

  return (
    <div className="company-contacts-editor company-ndk-assignees-editor">
      <div className="company-contacts-editor__head">
        <strong>우리회사 담당자</strong>
        <span>해당 거래처 담당 NDK 직원 · 여러 명 지정 가능</span>
      </div>

      {rows.map((assignee, index) => (
        <div key={assignee.id ?? `ndk-${index}`} className="company-contacts-editor__card">
          <div className="company-contacts-editor__card-head">
            <strong className="company-ndk-assignees-editor__index">담당자 {index + 1}</strong>
            <SecondaryButton
              type="button"
              onClick={() => removeAssignee(index)}
              disabled={rows.length <= 1}
            >
              <Trash2 size={14} aria-hidden="true" />
              삭제
            </SecondaryButton>
          </div>

          <div className="company-contacts-editor__grid">
            {COMPANY_NDK_ASSIGNEE_FIELDS.map((field) => (
              <label key={field.key} className="company-contacts-editor__field">
                <span>{field.label}</span>
                <input
                  type="text"
                  value={assignee[field.key] ?? ""}
                  placeholder={field.label}
                  onChange={(event) => updateAssignee(index, field.key, event.target.value)}
                  onBlur={() => commitRows(rows)}
                />
              </label>
            ))}
          </div>
        </div>
      ))}

      <SecondaryButton type="button" onClick={addAssignee}>
        <Plus size={14} aria-hidden="true" />
        담당자 추가
      </SecondaryButton>
    </div>
  );
}

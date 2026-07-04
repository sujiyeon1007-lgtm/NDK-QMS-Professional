import { Plus, Trash2 } from "lucide-react";

import { SecondaryButton } from "../../foundation/components/Button";
import {
  COMPANY_CONTACT_FIELDS,
  createEmptyCompanyContact,
} from "../../utils/companyContactsModel";

export default function CompanyContactsEditor({ contacts = [], onChange }) {
  const rows = contacts.length > 0 ? contacts : [createEmptyCompanyContact("ct-new-1")];

  const updateRows = (nextRows) => {
    onChange(nextRows.filter((row) => row.name?.trim() || row.mobile?.trim() || row.email?.trim()));
  };

  const updateContact = (index, key, value) => {
    const nextRows = rows.map((row, rowIndex) =>
      rowIndex === index ? { ...row, [key]: value } : row
    );
    onChange(nextRows);
  };

  const setPrimary = (index) => {
    onChange(rows.map((row, rowIndex) => ({ ...row, isPrimary: rowIndex === index })));
  };

  const addContact = () => {
    onChange([...rows, createEmptyCompanyContact(`ct-new-${rows.length + 1}`)]);
  };

  const removeContact = (index) => {
    const nextRows = rows.filter((_, rowIndex) => rowIndex !== index);
    updateRows(nextRows.length > 0 ? nextRows : [createEmptyCompanyContact("ct-new-1")]);
  };

  return (
    <div className="company-contacts-editor">
      <div className="company-contacts-editor__head">
        <strong>거래처 담당자</strong>
        <span>업체 소속 담당자 · 여러 명 등록 가능 (직원정보와 분리)</span>
      </div>

      {rows.map((contact, index) => (
        <div key={contact.id ?? `contact-${index}`} className="company-contacts-editor__card">
          <div className="company-contacts-editor__card-head">
            <label className="company-contacts-editor__primary">
              <input
                type="radio"
                name="company-primary-contact"
                checked={Boolean(contact.isPrimary) || (index === 0 && !rows.some((row) => row.isPrimary))}
                onChange={() => setPrimary(index)}
              />
              대표 담당자
            </label>
            <SecondaryButton type="button" onClick={() => removeContact(index)} disabled={rows.length <= 1}>
              <Trash2 size={14} aria-hidden="true" />
              삭제
            </SecondaryButton>
          </div>

          <div className="company-contacts-editor__grid">
            {COMPANY_CONTACT_FIELDS.map((field) => (
              <label key={field.key} className="company-contacts-editor__field">
                <span>{field.label}</span>
                <input
                  type="text"
                  value={contact[field.key] ?? ""}
                  placeholder={field.label}
                  onChange={(event) => updateContact(index, field.key, event.target.value)}
                />
              </label>
            ))}
          </div>
        </div>
      ))}

      <SecondaryButton type="button" onClick={addContact}>
        <Plus size={14} aria-hidden="true" />
        담당자 추가
      </SecondaryButton>
    </div>
  );
}

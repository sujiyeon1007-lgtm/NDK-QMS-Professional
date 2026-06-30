import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, Save } from "lucide-react";
import { STATUS_GROUPS, validateMasterRow } from "../../utils/masterData";
import "./MasterDataFormModal.css";

const emptyForm = {
  code: "",
  name: "",
  note: "",
  group: "",
  active: true,
};

function getInitialForm(mode, initialRow) {
  if (mode === "edit" && initialRow) {
    return {
      code: initialRow.code ?? "",
      name: initialRow.name ?? "",
      note: initialRow.note ?? "",
      group: initialRow.group ?? "",
      active: initialRow.active !== false,
    };
  }
  return emptyForm;
}

function MasterDataFormModal({ mode, categoryKey, categoryLabel, initialRow, onSave, onClose }) {
  const [form, setForm] = useState(() => getInitialForm(mode, initialRow));
  const [error, setError] = useState("");

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.classList.add("master-modal-open");
    document.body.style.overflow = "hidden";

    const handleKey = (event) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKey);

    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.classList.remove("master-modal-open");
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const validation = validateMasterRow(
      categoryKey,
      form,
      mode === "edit" ? "edit" : "add",
      initialRow?.id
    );
    if (!validation.ok) {
      setError(validation.message);
      return;
    }
    onSave(form);
  };

  const showGroup = categoryKey === "status";
  const title = mode === "edit" ? "기준정보 수정" : "기준정보 추가";

  return createPortal(
    <div className="master-modal-overlay" role="presentation" onClick={onClose}>
      <div
        className="master-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="master-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="master-modal-header">
          <div>
            <p className="master-modal-kicker">{categoryLabel}</p>
            <h2 id="master-modal-title">{title}</h2>
          </div>
          <button type="button" className="master-modal-close" onClick={onClose} aria-label="닫기">
            <X size={20} />
          </button>
        </header>

        <form className="master-modal-body" onSubmit={handleSubmit}>
          {error && (
            <p className="master-modal-error" role="alert">
              {error}
            </p>
          )}

          <div className="master-form-grid">
            <label className="master-form-field">
              <span>코드 *</span>
              <input
                type="text"
                placeholder="예: DH, SCM440"
                value={form.code}
                onChange={(e) => updateField("code", e.target.value)}
                autoFocus
              />
            </label>

            <label className="master-form-field">
              <span>명칭 *</span>
              <input
                type="text"
                placeholder="표시 명칭"
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
              />
            </label>

            {showGroup && (
              <label className="master-form-field span-2">
                <span>구분 *</span>
                <select value={form.group} onChange={(e) => updateField("group", e.target.value)}>
                  <option value="">구분 선택</option>
                  {STATUS_GROUPS.map((group) => (
                    <option key={group} value={group}>
                      {group}
                    </option>
                  ))}
                </select>
              </label>
            )}

            <label className="master-form-field span-2">
              <span>비고</span>
              <textarea
                rows={2}
                placeholder="특이사항"
                value={form.note}
                onChange={(e) => updateField("note", e.target.value)}
              />
            </label>

            <label className="master-form-field master-form-toggle">
              <span>사용 여부</span>
              <button
                type="button"
                className={`master-toggle-btn${form.active ? " on" : ""}`}
                onClick={() => updateField("active", !form.active)}
                aria-pressed={form.active}
              >
                <span className="master-toggle-knob" />
              </button>
              <em>{form.active ? "사용 (Y)" : "미사용 (N)"}</em>
            </label>
          </div>

          <footer className="master-modal-footer">
            <button type="button" className="master-modal-btn" onClick={onClose}>
              취소
            </button>
            <button type="submit" className="master-modal-btn primary">
              <Save size={16} />
              {mode === "edit" ? "수정" : "추가"}
            </button>
          </footer>
        </form>
      </div>
    </div>,
    document.body
  );
}

export default MasterDataFormModal;

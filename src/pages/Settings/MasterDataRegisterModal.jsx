import { useEffect, useMemo, useState } from "react";
import TitanRegisterModal from "../../foundation/components/TitanRegisterModal";
import { getActiveMasterNames, validateMasterRow } from "../../utils/masterData";

const DEFAULT_FORM = { code: "", name: "", note: "", active: true };

function buildInitialForm(screen, initialRow) {
  if (!initialRow) {
    const form = { ...DEFAULT_FORM };
    screen.formFields.forEach((field) => {
      if (field.type === "toggle") form[field.key] = true;
      else if (field.type === "select") form[field.key] = field.selectOptions?.[0]?.value ?? "";
      else form[field.key] = "";
    });
    return form;
  }

  const form = { ...DEFAULT_FORM };
  screen.formFields.forEach((field) => {
    if (field.key === "description") {
      form[field.key] = initialRow.description ?? initialRow.note ?? "";
    } else if (field.type === "toggle") {
      form[field.key] = initialRow.active !== false;
    } else {
      form[field.key] = initialRow[field.key] ?? "";
    }
  });
  return form;
}

function MasterFieldInput({ field, value, onChange, options = [] }) {
  if (field.type === "textarea") {
    return (
      <textarea
        rows={2}
        placeholder={field.placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    );
  }

  if (field.type === "toggle") {
    return (
      <button
        type="button"
        className={`master-form-toggle${value ? " on" : ""}`}
        onClick={() => onChange(!value)}
        aria-pressed={value}
      >
        <span className="master-form-toggle__knob" />
        <em>{value ? "사용 (Y)" : "미사용 (N)"}</em>
      </button>
    );
  }

  if (field.type === "select" || field.optionsKey) {
    return (
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="">{field.placeholder ?? "선택"}</option>
        {(field.selectOptions ?? options).map((opt) => {
          const optionValue = typeof opt === "string" ? opt : opt.value;
          const optionLabel = typeof opt === "string" ? opt : opt.label;
          return (
            <option key={optionValue} value={optionValue}>
              {optionLabel}
            </option>
          );
        })}
      </select>
    );
  }

  return (
    <input
      type="text"
      placeholder={field.placeholder}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

export default function MasterDataRegisterModal({
  open,
  onClose,
  onSave,
  screen,
  mode = "add",
  initialRow = null,
}) {
  const [form, setForm] = useState(() => buildInitialForm(screen, initialRow));
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setForm(buildInitialForm(screen, initialRow));
      setError("");
    }
  }, [open, screen, initialRow]);

  const optionMap = useMemo(
    () => ({
      companies: getActiveMasterNames("companies"),
      materials: getActiveMasterNames("materials"),
      units: getActiveMasterNames("units"),
      heatTreatment: getActiveMasterNames("heatTreatment"),
    }),
    [open]
  );

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError("");
  };

  const handleSubmit = () => {
    const validation = validateMasterRow(
      screen.categoryKey,
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

  if (!open || !screen) return null;

  return (
    <TitanRegisterModal
      open={open}
      onClose={onClose}
      onSubmit={handleSubmit}
      kicker={screen.title}
      title={mode === "edit" ? "기준정보 수정" : "기준정보 등록"}
      submitLabel={mode === "edit" ? "수정" : "등록"}
    >
      {error ? (
        <p className="master-register-modal__error" role="alert">
          {error}
        </p>
      ) : null}
      <div className="master-register-modal__grid">
        {screen.formFields.map((field) => (
          <label
            key={field.key}
            className={`master-register-modal__field${field.span === 2 ? " span-2" : ""}`}
          >
            <span>
              {field.label}
              {field.required ? " *" : ""}
            </span>
            <MasterFieldInput
              field={field}
              value={form[field.key] ?? ""}
              onChange={(value) => updateField(field.key, value)}
              options={field.optionsKey ? optionMap[field.optionsKey] ?? [] : []}
            />
          </label>
        ))}
      </div>
    </TitanRegisterModal>
  );
}

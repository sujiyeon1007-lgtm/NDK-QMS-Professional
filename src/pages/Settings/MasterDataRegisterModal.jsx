import { useEffect, useMemo, useState } from "react";
import TitanRegisterModal from "../../foundation/components/TitanRegisterModal";
import { buildCompanyAbbreviation } from "../../utils/companyAbbreviation";
import { getActiveMasterNames, getMasterDataByCategory, validateMasterRow } from "../../utils/masterData";

const DEFAULT_FORM = { code: "", name: "", note: "", active: true };

function buildInitialForm(screen, initialRow, defaultValues = null) {
  if (!initialRow) {
    const form = { ...DEFAULT_FORM };
    screen.formFields.forEach((field) => {
      if (field.type === "toggle") form[field.key] = true;
      else if (field.type === "select") form[field.key] = field.selectOptions?.[0]?.value ?? "";
      else form[field.key] = "";
    });
    form.abbreviationManual = false;
    form.abbreviationLocked = false;
    if (defaultValues && typeof defaultValues === "object") {
      Object.entries(defaultValues).forEach(([key, value]) => {
        if (value != null && value !== "") form[key] = value;
      });
    }
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
  form.abbreviationManual = Boolean(initialRow.abbreviationManual);
  form.abbreviationLocked = Boolean(initialRow.abbreviationLocked);
  return form;
}

function MasterFieldInput({ field, value, onChange, options = [], readOnly = false, helperText = "" }) {
  if (field.type === "textarea") {
    return (
      <textarea
        rows={2}
        placeholder={field.placeholder}
        value={value}
        readOnly={readOnly}
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

  if (field.type === "readonly" || readOnly) {
    return (
      <>
        <input type="text" className="master-form-readonly" value={value} readOnly aria-readonly="true" />
        {helperText ? <small className="master-form-helper">{helperText}</small> : null}
      </>
    );
  }

  return (
    <>
      <input
        type="text"
        placeholder={field.placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      {helperText ? <small className="master-form-helper">{helperText}</small> : null}
    </>
  );
}

export default function MasterDataRegisterModal({
  open,
  onClose,
  onSave,
  screen,
  mode = "add",
  initialRow = null,
  defaultValues = null,
}) {
  const [form, setForm] = useState(() => buildInitialForm(screen, initialRow, defaultValues));
  const [error, setError] = useState("");

  const isCompanyScreen = screen?.categoryKey === "companies";

  useEffect(() => {
    if (open) {
      setForm(buildInitialForm(screen, initialRow, defaultValues));
      setError("");
    }
  }, [open, screen, initialRow, defaultValues]);

  const companyPeers = useMemo(() => {
    if (!isCompanyScreen) return [];
    return getMasterDataByCategory("companies").filter((row) => row.id !== initialRow?.id);
  }, [open, isCompanyScreen, initialRow?.id]);

  const autoAbbreviation = useMemo(() => {
    if (!isCompanyScreen || !form.name?.trim()) return "";
    return buildCompanyAbbreviation(form.name, companyPeers);
  }, [isCompanyScreen, form.name, companyPeers]);

  useEffect(() => {
    if (!open || !isCompanyScreen) return;
    if (form.abbreviationManual || form.abbreviationLocked) return;
    if (!autoAbbreviation) return;
    setForm((prev) => {
      if (prev.abbreviation === autoAbbreviation && prev.code === autoAbbreviation) return prev;
      return { ...prev, abbreviation: autoAbbreviation, code: autoAbbreviation };
    });
  }, [open, isCompanyScreen, autoAbbreviation, form.abbreviationManual, form.abbreviationLocked]);

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
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (isCompanyScreen && key === "abbreviation") {
        next.abbreviationManual = true;
        next.abbreviationLocked = mode === "edit";
        next.code = String(value ?? "").trim().toUpperCase() || prev.code;
      }
      return next;
    });
    setError("");
  };

  const handleSubmit = () => {
    const payload = { ...form };
    if (isCompanyScreen && !payload.abbreviationManual && !payload.abbreviationLocked) {
      payload.abbreviation = autoAbbreviation || payload.abbreviation;
      payload.code = payload.code || payload.abbreviation;
    }

    const validation = validateMasterRow(
      screen.categoryKey,
      payload,
      mode === "edit" ? "edit" : "add",
      initialRow?.id
    );
    if (!validation.ok) {
      setError(validation.message);
      return;
    }
    onSave(payload);
  };

  const getAbbreviationFieldProps = (field) => {
    if (field.type !== "abbreviation") return { readOnly: false, helperText: "" };

    if (mode === "add") {
      return {
        readOnly: true,
        helperText: "업체명 기준 자동 생성 · 사용자 직접 입력 불가",
      };
    }

    if (form.abbreviationLocked) {
      return {
        readOnly: true,
        helperText: "관리자 수정 완료 · 약칭 고정",
      };
    }

    return {
      readOnly: false,
      helperText: "충돌·부적합 시 관리자 1회 수정 가능 · 저장 후 고정",
    };
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
        {screen.formFields.map((field) => {
          const abbrevProps = getAbbreviationFieldProps(field);
          const fieldType = field.type === "abbreviation" ? "text" : field.type;
          return (
            <label
              key={field.key}
              className={`master-register-modal__field${field.span === 2 ? " span-2" : ""}`}
            >
              <span>
                {field.label}
                {field.required ? " *" : ""}
              </span>
              <MasterFieldInput
                field={{ ...field, type: fieldType }}
                value={form[field.key] ?? ""}
                onChange={(value) => updateField(field.key, value)}
                options={field.optionsKey ? optionMap[field.optionsKey] ?? [] : []}
                readOnly={abbrevProps.readOnly}
                helperText={abbrevProps.helperText}
              />
            </label>
          );
        })}
      </div>
    </TitanRegisterModal>
  );
}

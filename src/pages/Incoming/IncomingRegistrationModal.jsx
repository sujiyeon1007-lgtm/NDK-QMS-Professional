import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { X, Sparkles } from "lucide-react";
import { PrimaryButton, SecondaryButton } from "../../foundation/components/Button";
import TitanCascadeProductPicker from "../../foundation/components/TitanCascadeProductPicker";
import {
  getActiveMasterNames,
  getCompanyCodeMap,
} from "../../utils/masterData";
import { mapProductToFormAutofill } from "../../utils/productMasterSearch";
import { getProductUnitOptions, parseQtyWithUnit } from "../../utils/productUnits";
import { getJournalReferenceDate } from "../../utils/workJournalData";
import { INBOUND_REGISTER_LABEL } from "../../config/registerModalStandard";
import TitanRegisterSummaryText from "../../foundation/components/TitanRegisterSummaryText";
import "./IncomingRegistrationModal.css";

const ADMIN_CATEGORY_MAP = {
  "업체명": "/settings/companies",
};

const emptyProductFields = {
  partName: "",
  partNo: "",
  drawingNo: "",
  material: "",
  spec: "",
  unitPrice: "",
  heatTreatment: "",
};

const emptyForm = {
  company: "",
  ...emptyProductFields,
  qty: "",
  unit: "EA",
  dueDate: "",
  urgent: false,
  note: "",
};

function AdminSelectField({
  label,
  value,
  options,
  placeholder,
  onChange,
  onAdminClick,
  className = "",
}) {
  return (
    <label className={`form-field ${className}`.trim()}>
      <span>{label}</span>
      <div className="admin-select-wrap">
        <select value={value} onChange={(event) => onChange(event.target.value)}>
          <option value="">{placeholder}</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <button
          type="button"
          className="admin-manage-btn"
          title="관리자 설정"
          aria-label={`${label} 관리자 설정`}
          onClick={onAdminClick}
        >
          *
        </button>
      </div>
    </label>
  );
}

function IncomingRegistrationModal({
  onClose,
  onRegister,
  companyCodeMap: companyCodeMapProp,
  initialForm = null,
}) {
  const navigate = useNavigate();
  const companyCodeMap = useMemo(
    () => companyCodeMapProp ?? getCompanyCodeMap(),
    [companyCodeMapProp]
  );
  const companyOptions = useMemo(() => getActiveMasterNames("companies"), []);
  const unitOptions = useMemo(() => getProductUnitOptions(), []);

  const [autoId, setAutoId] = useState(true);
  const [manualId, setManualId] = useState("");
  const [form, setForm] = useState(() =>
    initialForm ? { ...emptyForm, ...initialForm } : emptyForm
  );

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.classList.add("titan-modal-open");
    document.body.style.overflow = "hidden";

    const handleKey = (event) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKey);

    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.classList.remove("titan-modal-open");
      document.body.style.overflow = previousOverflow;
      document.body.style.removeProperty("pointer-events");
    };
  }, [onClose]);

  const previewAutoId = form.company
    ? `${companyCodeMap[form.company] || "XX"}_${getJournalReferenceDate().replace(/-/g, "")}_001`
    : "업체코드_날짜_순번";

  const displayId = autoId
    ? `자동 생성 예정\n(${previewAutoId})`
    : manualId.trim() || "번호 미입력";

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleCompanyChange = (value) => {
    setForm((prev) => ({
      ...prev,
      company: value,
      ...emptyProductFields,
    }));
  };

  const handleCascadeChange = (selection, product) => {
    if (product) {
      const autofill = mapProductToFormAutofill(product);
      setForm((prev) => ({
        ...prev,
        partName: autofill.partName,
        partNo: autofill.partNo,
        drawingNo: autofill.drawingNo,
        material: autofill.material,
        spec: autofill.spec,
        unitPrice: autofill.unitPrice,
        heatTreatment: autofill.process || prev.heatTreatment,
        unit: autofill.unit || prev.unit,
      }));
      return;
    }
    setForm((prev) => ({
      ...prev,
      partName: selection.partName,
      partNo: selection.partNo,
      drawingNo: selection.drawingNo,
      ...(selection.partNo
        ? {}
        : {
            material: "",
            spec: "",
            unitPrice: "",
            heatTreatment: prev.heatTreatment,
          }),
    }));
  };

  const handleQtyBlur = () => {
    const parsed = parseQtyWithUnit(form.qty, form.unit);
    setForm((prev) => ({
      ...prev,
      qty: parsed.qty ? String(parsed.qty) : prev.qty,
      unit: parsed.unit,
    }));
  };

  const handleAdminManage = (type) => {
    const path = ADMIN_CATEGORY_MAP[type];
    onClose();
    navigate(path ?? "/settings/companies");
  };

  const handleRegisterClick = () => {
    if (!form.company || !form.partName || !form.partNo || !form.qty) {
      console.log("[UI] 입고 등록 — 필수값 미입력", form);
      return;
    }

    const managementId = autoId
      ? `${companyCodeMap[form.company] || "XX"}_${getJournalReferenceDate().replace(/-/g, "")}_${String(Date.now()).slice(-3)}`
      : manualId.trim();

    if (!managementId) {
      console.log("[UI] 입고 등록 — 관리번호 없음");
      return;
    }

    onRegister?.(form, managementId);
    onClose();
  };

  return createPortal(
    <div className="incoming-modal-overlay" role="presentation" onClick={onClose}>
      <div
        className="incoming-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="incoming-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="incoming-modal-header">
          <div>
            <p className="incoming-modal-kicker">입출고관리</p>
            <h2 id="incoming-modal-title">{INBOUND_REGISTER_LABEL}</h2>
          </div>

          <div className="mgmt-id-area">
            <span className="mgmt-id-label">관리번호</span>
            <div className="mgmt-id-controls">
              <label className="auto-id-toggle">
                <input
                  type="checkbox"
                  checked={autoId}
                  onChange={(event) => setAutoId(event.target.checked)}
                />
                자동생성
              </label>
              <span className="mgmt-or">또는</span>
              <button
                type="button"
                className="mgmt-generate-btn"
                onClick={() => setAutoId(false)}
              >
                <Sparkles size={15} />
                관리번호 생성
              </button>
            </div>
            {!autoId && (
              <input
                type="text"
                className="mgmt-manual-input"
                placeholder="SE_20260627_001"
                value={manualId}
                onChange={(event) => setManualId(event.target.value)}
              />
            )}
          </div>

          <button
            type="button"
            className="incoming-modal-close"
            onClick={onClose}
            aria-label="닫기"
          >
            <X size={20} />
          </button>
        </header>

        <div className="incoming-modal-body">
          <section className="incoming-form-section">
            <h3>기본정보</h3>
            <p className="incoming-form-desc">업체 선택 후 Product Master에서 제품을 선택하세요</p>

            <div className="incoming-form-grid">
              <AdminSelectField
                className="span-2"
                label="업체명"
                value={form.company}
                options={companyOptions}
                placeholder="업체 선택"
                onChange={handleCompanyChange}
                onAdminClick={() => handleAdminManage("업체명")}
              />

              <TitanCascadeProductPicker
                inline
                company={form.company}
                value={{
                  partName: form.partName,
                  partNo: form.partNo,
                  drawingNo: form.drawingNo,
                }}
                onChange={handleCascadeChange}
                autoFields={{
                  material: form.material,
                  spec: form.spec,
                  unitPrice: form.unitPrice,
                  process: form.heatTreatment,
                  drawingNo: form.drawingNo,
                }}
                fieldClassName="form-field"
                kicker="입고 등록"
              />

              <label className="form-field">
                <span>수량</span>
                <input
                  type="text"
                  placeholder="20 또는 20 EA"
                  value={form.qty}
                  onChange={(event) => updateField("qty", event.target.value)}
                  onBlur={handleQtyBlur}
                />
              </label>

              <label className="form-field">
                <span>단위</span>
                <select
                  value={form.unit}
                  onChange={(event) => updateField("unit", event.target.value)}
                >
                  {unitOptions.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
              </label>

              <label className="form-field">
                <span>납기</span>
                <input
                  type="date"
                  value={form.dueDate}
                  onChange={(event) => updateField("dueDate", event.target.value)}
                />
              </label>

              <label className="form-field toggle-field">
                <span>긴급 여부</span>
                <div className="toggle-wrap">
                  <button
                    type="button"
                    className={`toggle-btn${form.urgent ? " on" : ""}`}
                    onClick={() => updateField("urgent", !form.urgent)}
                    aria-pressed={form.urgent}
                  >
                    <span className="toggle-knob" />
                  </button>
                  <span className="toggle-label">{form.urgent ? "긴급" : "일반"}</span>
                </div>
              </label>

              <label className="form-field span-2">
                <span>비고</span>
                <textarea
                  rows={2}
                  placeholder="특이사항 입력"
                  value={form.note}
                  onChange={(event) => updateField("note", event.target.value)}
                />
              </label>
            </div>
          </section>

          <aside className="incoming-summary-card titan-register-summary">
            <h3>입력값 요약</h3>

            <div className="summary-block">
              <p>관리번호</p>
              <TitanRegisterSummaryText text={displayId} as="strong" />
            </div>

            <div className="summary-divider" />

            <div className="summary-block">
              <p>업체 / 품번</p>
              <TitanRegisterSummaryText text={form.company || "-"} as="strong" />
              <TitanRegisterSummaryText text={form.partNo || "품번 미선택"} />
            </div>

            <div className="summary-divider" />

            <div className="summary-block">
              <p>현재 상태</p>
              <span className="status-badge 입고예정">입고예정</span>
            </div>

            <div className="summary-divider" />

            <div className="summary-next-task">
              <p>다음 업무</p>
              <TitanRegisterSummaryText text="Workflow 자유 선택" as="strong" />
              <TitanRegisterSummaryText text="거래명세서 · 출고 즉시 가능" />
            </div>
          </aside>
        </div>

        <footer className="incoming-modal-footer">
          <SecondaryButton type="button" onClick={onClose}>
            취소
          </SecondaryButton>
          <PrimaryButton type="button" onClick={handleRegisterClick}>
            등록
          </PrimaryButton>
        </footer>
      </div>
    </div>,
    document.body
  );
}

export default IncomingRegistrationModal;

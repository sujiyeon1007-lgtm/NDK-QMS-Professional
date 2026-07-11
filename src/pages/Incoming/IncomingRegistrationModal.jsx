import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { X, Sparkles } from "lucide-react";
import { PrimaryButton, SecondaryButton } from "../../foundation/components/Button";
import TitanCascadeProductPicker from "../../foundation/components/TitanCascadeProductPicker";
import TitanSearchableSelect from "../../foundation/components/TitanSearchableSelect";
import { TitanAutoComplete } from "../../foundation/components/TitanSearchAutocomplete";
import {
  getCompanyCodeMap,
} from "../../utils/masterData";
import { subscribeWorkflowDataRefresh } from "../../utils/titanWorkflowRefresh";
import { mapProductToFormAutofill } from "../../utils/productMasterSearch";
import { getProductUnitOptions, parseQtyWithUnit } from "../../utils/productUnits";
import { getJournalReferenceDate } from "../../utils/workJournalData";
import {
  resolveAssigneeWorkerOptions,
  resolveDefaultAssigneeFromAuth,
} from "../../utils/titanAssigneeResolver";
import {
  INBOUND_EDIT_LABEL,
  INBOUND_REGISTER_LABEL,
} from "../../config/registerModalStandard";
import {
  DEFAULT_CERTIFICATE_ISSUE_POLICY,
  CERTIFICATE_ISSUE_POLICY_OPTIONS,
  getCertificateIssuePolicyFromProduct,
  normalizeCertificateIssuePolicy,
} from "../../utils/certificateIssuePolicy";
import {
  INSPECTION_TYPE,
  INSPECTION_TYPE_OPTIONS,
} from "../../config/inspectionManagement";
import { resolveInboundInspectionType } from "../../utils/inboundDataFields";
import { DEFAULT_WORK_TYPE_ID, WORK_TYPE_OPTIONS } from "../../config/workTypeWorkflow";
import { INBOUND_HEAT_TREATMENT_PROCESS_OPTIONS } from "../../config/inboundStatusWorkflow";
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
  processDetail: "",
};

const emptyForm = {
  company: "",
  manager: "",
  ...emptyProductFields,
  qty: "",
  unit: "EA",
  lotNo: "",
  customerLotNo: "",
  purchaseOrderNo: "",
  workType: DEFAULT_WORK_TYPE_ID,
  incomingDate: "",
  dueDate: "",
  urgent: false,
  note: "",
  certificateIssuePolicy: DEFAULT_CERTIFICATE_ISSUE_POLICY,
  certificateIssuePolicySource: "product",
  inspectionType: INSPECTION_TYPE.MASS,
  inspectionTypeSource: "product",
};

function IncomingRegistrationModal({
  onClose,
  onRegister,
  onUpdate,
  companyCodeMap: companyCodeMapProp,
  initialForm = null,
  mode = "create",
  editManagementId = null,
}) {
  const isEdit = mode === "edit" && Boolean(editManagementId);
  const navigate = useNavigate();
  const [masterRefreshKey, setMasterRefreshKey] = useState(0);

  useEffect(() => {
    return subscribeWorkflowDataRefresh((event) => {
      const category = event?.detail?.category;
      if (!category || category === "all" || category === "companies" || category === "customers") {
        setMasterRefreshKey((key) => key + 1);
      }
    });
  }, []);

  const companyCodeMap = useMemo(
    () => companyCodeMapProp ?? getCompanyCodeMap(),
    [companyCodeMapProp, masterRefreshKey]
  );
  const managerOptions = useMemo(() => resolveAssigneeWorkerOptions(), []);
  const unitOptions = useMemo(() => getProductUnitOptions(), []);

  const [autoId, setAutoId] = useState(() => !isEdit);
  const [manualId, setManualId] = useState(() => (isEdit ? editManagementId : ""));
  const [form, setForm] = useState(() =>
    initialForm
      ? { ...emptyForm, incomingDate: getJournalReferenceDate(), ...initialForm }
      : { ...emptyForm, incomingDate: getJournalReferenceDate(), manager: resolveDefaultAssigneeFromAuth() }
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

  const displayId = isEdit
    ? editManagementId
    : autoId
      ? `자동 생성 예정\n(${previewAutoId})`
      : manualId.trim() || "번호 미입력";

  const modalTitle = isEdit ? INBOUND_EDIT_LABEL : INBOUND_REGISTER_LABEL;
  const submitLabel = isEdit ? "저장" : "등록";

  const updateField = (key, value) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "certificateIssuePolicy") {
        next.certificateIssuePolicy = normalizeCertificateIssuePolicy(value);
        next.certificateIssuePolicySource = "inbound_override";
      }
      if (key === "inspectionType") {
        next.inspectionType = value === INSPECTION_TYPE.DEVELOPMENT ? INSPECTION_TYPE.DEVELOPMENT : INSPECTION_TYPE.MASS;
        next.inspectionTypeSource = "inbound_override";
      }
      return next;
    });
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
      const productPolicy = getCertificateIssuePolicyFromProduct(product);
      setForm((prev) => ({
        ...prev,
        partName: autofill.partName,
        partNo: autofill.partNo,
        drawingNo: autofill.drawingNo,
        material: autofill.material,
        spec: autofill.spec,
        unitPrice: autofill.unitPrice,
        heatTreatment: autofill.process || autofill.heatTreatment || prev.heatTreatment,
        processDetail: autofill.processDetail || autofill.heatTreatment || prev.processDetail,
        unit: autofill.unit || prev.unit,
        inspectionType: autofill.inspectionType || INSPECTION_TYPE.MASS,
        inspectionTypeSource: "product",
        certificateIssuePolicy: productPolicy,
        certificateIssuePolicySource: "product",
      }));
      return;
    }
    setForm((prev) => ({
      ...prev,
      partName: selection.partName,
      partNo: selection.partNo,
      drawingNo: selection.drawingNo,
      ...(selection.partName
        ? {}
        : {
            material: "",
            spec: "",
            unitPrice: "",
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

  const buildPayload = () => {
    if (!form.company || !form.partName || !form.partNo || !form.qty) {
      window.alert("거래처 · 품명 · 품번 · 수량은 필수입니다.");
      return null;
    }

    const managementId = isEdit
      ? editManagementId
      : autoId
        ? `${companyCodeMap[form.company] || "XX"}_${getJournalReferenceDate().replace(/-/g, "")}_${String(Date.now()).slice(-3)}`
        : manualId.trim();

    if (!managementId) {
      window.alert("관리번호를 입력하세요.");
      return null;
    }

    return { form, managementId };
  };

  const handleSubmitClick = () => {
    const payload = buildPayload();
    if (!payload) return;

    if (isEdit) {
      onUpdate?.(payload.form, payload.managementId);
    } else {
      onRegister?.(payload.form, payload.managementId);
    }
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
            <p className="incoming-modal-kicker">입고현황</p>
            <h2 id="incoming-modal-title">{modalTitle}</h2>
          </div>

          <div className="mgmt-id-area">
            <span className="mgmt-id-label">관리번호</span>
            {isEdit ? (
              <strong className="mgmt-id-fixed">{editManagementId}</strong>
            ) : (
              <>
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
              </>
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
            <h3>입고 정보</h3>
            <p className="incoming-form-desc">
              품명을 선택하면 제품 Master에서 품번 · 재질 · 규격이 자동 입력됩니다.
            </p>

            <div className="incoming-form-grid">
              <label className="form-field">
                <span>입고일</span>
                <input
                  type="date"
                  value={form.incomingDate}
                  onChange={(event) => updateField("incomingDate", event.target.value)}
                />
              </label>

              <div className="form-field span-2">
                <span>거래처</span>
                <div className="admin-select-wrap admin-searchable-select-wrap">
                  <TitanAutoComplete
                    fieldType="company"
                    value={form.company}
                    onChange={(value) => updateField("company", value)}
                    onSelect={handleCompanyChange}
                    placeholder="거래처 검색"
                    className="admin-searchable-select"
                  />
                  <button
                    type="button"
                    className="admin-manage-btn"
                    title="관리자 설정"
                    aria-label="거래처 관리자 설정"
                    onClick={() => handleAdminManage("업체명")}
                  >
                    *
                  </button>
                </div>
              </div>

              <label className="form-field">
                <span>담당자</span>
                <select value={form.manager} onChange={(event) => updateField("manager", event.target.value)}>
                  <option value="">담당자 선택</option>
                  {managerOptions.map((worker) => (
                    <option key={worker.id} value={worker.name}>
                      {worker.name}
                      {worker.department ? ` · ${worker.department}` : ""}
                    </option>
                  ))}
                </select>
              </label>

              <label className="form-field">
                <span>발주번호</span>
                <input
                  type="text"
                  placeholder="선택 입력"
                  value={form.purchaseOrderNo}
                  onChange={(event) => updateField("purchaseOrderNo", event.target.value)}
                />
              </label>

              <label className="form-field">
                <span>작업유형</span>
                <select value={form.workType} onChange={(event) => updateField("workType", event.target.value)}>
                  {WORK_TYPE_OPTIONS.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="form-field">
                <span>검사 유형</span>
                <select
                  value={form.inspectionType ?? INSPECTION_TYPE.MASS}
                  onChange={(event) => updateField("inspectionType", event.target.value)}
                >
                  {INSPECTION_TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="form-field">
                <span>{"\uC131\uC801\uC11C \uBC1C\uD589 \uC815\uCC45"}</span>
                <select
                  value={form.certificateIssuePolicy ?? DEFAULT_CERTIFICATE_ISSUE_POLICY}
                  onChange={(event) => updateField("certificateIssuePolicy", event.target.value)}
                >
                  {CERTIFICATE_ISSUE_POLICY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <TitanCascadeProductPicker
                inline
                partNameOnly
                showDrawingNo={false}
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
                }}
                fieldClassName="form-field"
                kicker="입고 등록"
              />

              <TitanSearchableSelect
                className="form-field"
                label="열처리 공정"
                value={form.heatTreatment}
                onChange={(value) => {
                  setForm((prev) => ({
                    ...prev,
                    heatTreatment: value,
                    processDetail: value,
                  }));
                }}
                options={INBOUND_HEAT_TREATMENT_PROCESS_OPTIONS}
                placeholder="공정 선택"
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
                <span>업체 LOT</span>
                <input
                  type="text"
                  placeholder="업체 LOT"
                  value={form.customerLotNo}
                  onChange={(event) => updateField("customerLotNo", event.target.value)}
                />
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
              <p>거래처 / 품명</p>
              <TitanRegisterSummaryText text={form.company || "-"} as="strong" />
              <TitanRegisterSummaryText text={form.partName || "품명 미선택"} />
              <TitanRegisterSummaryText text={form.partNo || "품번 자동"} />
            </div>

            <div className="summary-divider" />

            <div className="summary-block">
              <p>담당자</p>
              <TitanRegisterSummaryText text={form.manager || "-"} as="strong" />
            </div>

            <div className="summary-divider" />

            <div className="summary-block">
              <p>작업유형</p>
              <TitanRegisterSummaryText
                text={WORK_TYPE_OPTIONS.find((item) => item.id === form.workType)?.label || "열처리"}
                as="strong"
              />
            </div>

            <div className="summary-divider" />

            <div className="summary-block">
              <p>현재 상태</p>
              <span className="status-badge 입고예정">입고등록</span>
            </div>
          </aside>
        </div>

        <footer className="incoming-modal-footer">
          <SecondaryButton type="button" onClick={onClose}>
            취소
          </SecondaryButton>
          <PrimaryButton type="button" onClick={handleSubmitClick}>
            {submitLabel}
          </PrimaryButton>
        </footer>
      </div>
    </div>,
    document.body
  );
}

export default IncomingRegistrationModal;

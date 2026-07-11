import { useEffect, useMemo, useState } from "react";
import { Link2, Trash2 } from "lucide-react";
import TitanRegisterModal from "../../foundation/components/TitanRegisterModal";
import { TitanAutoComplete } from "../../foundation/components/TitanSearchAutocomplete";
import TitanWorkspaceModal from "../../foundation/components/TitanWorkspaceModal";
import { SecondaryButton } from "../../foundation/components/Button";
import { buildCompanyAbbreviation } from "../../utils/companyAbbreviation";
import {
  generateProductManagementCode,
  getActiveMasterNames,
  getMasterDataByCategory,
  validateMasterRow,
} from "../../utils/masterData";
import {
  PRODUCT_PROCESS_CATEGORIES,
  getProductProcessDetailOptions,
  inferProcessCategoryFromDetail,
} from "../../config/productProcessSelection";
import CompanyContactsEditor from "./CompanyContactsEditor";
import CompanyNdkAssigneesEditor from "./CompanyNdkAssigneesEditor";
import ProductInspectionSpecEditor, {
  normalizeProductInspectionSpec,
} from "./ProductInspectionSpecEditor";
import { getQualityDocumentRegistryRows } from "../../utils/qualityDocumentRegistry";
import {
  createDefaultSpecification,
  normalizeDocumentLinks,
} from "../../utils/productSpecificationModel";
import { getCertificateIssuePolicyFromProduct } from "../../utils/certificateIssuePolicy";
import { getProductSpecificationForEdit } from "../../utils/productMasterInspectionSpec";
import {
  isProductUnitOther,
  PRODUCT_UNIT_OPTIONS,
  splitProductUnitForForm,
} from "../../utils/productUnits";
import {
  buildProcessWorkflowFromLegacy,
  normalizeProcessWorkflow,
  normalizeProcessWorkflowEditor,
} from "../../utils/productProcessWorkflow";
import { getInspectionTemplates, resolveInspectionSpecFromTemplate } from "../../utils/inspectionTemplateSession";
import { getCertificatePolicies } from "../../utils/certificatePolicySession";
import { DEFAULT_CERTIFICATE_POLICY_ID } from "../../config/certificatePolicyMaster";
import {
  applyTemplateToProduct,
  getProcessWorkflowTemplates,
} from "../../utils/processWorkflowTemplateSession";
import "../Settings/ProductInspectionManagement.css";

const DEFAULT_FORM = { code: "", name: "", note: "", active: true };

function ProductMasterReferenceSection({ form, onChange }) {
  const inspectionTemplates = useMemo(() => getInspectionTemplates(), []);
  const certificatePolicies = useMemo(() => getCertificatePolicies(), []);
  const processTemplates = useMemo(() => getProcessWorkflowTemplates(), []);

  return (
    <section className="product-inspection-modal__section">
      <h3>{"Master \uCC38\uC870 (V1.1)"}</h3>
      <div className="product-inspection-modal__grid">
        <label className="product-inspection-modal__field">
          <span>{"\uACF5\uC815\uC720\uD615 Template"}</span>
          <select
            value={form.processWorkflowTemplateId ?? ""}
            onChange={(event) => {
              const processWorkflowTemplateId = event.target.value;
              if (!processWorkflowTemplateId) {
                onChange({ processWorkflowTemplateId: "" });
                return;
              }
              const applied = applyTemplateToProduct(processWorkflowTemplateId, {}, form);
              if (!applied) {
                onChange({ processWorkflowTemplateId });
                return;
              }
              onChange({
                processWorkflowTemplateId: applied.processWorkflowTemplateId,
                processWorkflow: normalizeProcessWorkflow(applied.processWorkflow),
                processCategory: applied.processWorkflow[0]?.processCategory ?? form.processCategory,
                processDetail: applied.processWorkflow[0]?.processDetail ?? form.processDetail,
              });
            }}
          >
            <option value="">{"\uC120\uD0DD (\uC218\uB3D9 \uACF5\uC815 \uD3B8\uC9D1\uAE30)"}</option>
            {processTemplates.map((row) => (
              <option key={row.id} value={row.id}>
                {row.label}
              </option>
            ))}
          </select>
        </label>
        <label className="product-inspection-modal__field">
          <span>{"\uAC80\uC0AC Template"}</span>
          <select
            value={form.inspectionTemplateId ?? ""}
            onChange={(event) => {
              const inspectionTemplateId = event.target.value;
              const templateSpec = resolveInspectionSpecFromTemplate(inspectionTemplateId);
              onChange({
                inspectionTemplateId,
                specification: templateSpec
                  ? normalizeProductInspectionSpec(templateSpec)
                  : form.specification,
              });
            }}
          >
            <option value="">{"\uC120\uD0DD"}</option>
            {inspectionTemplates.map((row) => (
              <option key={row.id} value={row.id}>
                {row.label}
              </option>
            ))}
          </select>
        </label>
        <label className="product-inspection-modal__field">
          <span>{"\uC131\uC801\uC11C \uC815\uCC45"}</span>
          <select
            value={form.certificatePolicyId ?? DEFAULT_CERTIFICATE_POLICY_ID}
            onChange={(event) => onChange({ certificatePolicyId: event.target.value })}
          >
            {certificatePolicies.map((row) => (
              <option key={row.id} value={row.id}>
                {row.displayLabel ?? row.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <p className="master-form-helper">
        {"\uACF5\uC815\uC720\uD615 Template \u00B7 \uAC80\uC0AC Template \u00B7 \uC131\uC801\uC11C \uC815\uCC45 \uC120\uD0DD \uC2DC \uACF5\uC815 Workflow \u00B7 \uAC80\uC0AC \uAE30\uC900\uC774 \uC790\uB3D9 \uC5F0\uACB0\uB429\uB2C8\uB2E4. \uACF5\uC815 \uC608\uC678\uB294 \uC544\uB798 \uACF5\uC815 \uD3B8\uC9D1\uAE30\uC5D0\uC11C \uC218\uC815\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4."}
      </p>
    </section>
  );
}

const PRODUCT_WORKFLOW_FIELD_KEYS = new Set(["processCategory", "processDetail"]);
const PRODUCT_BOTTOM_FIELD_KEYS = new Set(["description", "note"]);

function ProductProcessWorkflowEditor({
  workflow = [],
  processCategory = "",
  processDetail = "",
  onChange,
}) {
  const steps = workflow.length
    ? normalizeProcessWorkflowEditor(workflow)
    : normalizeProcessWorkflowEditor(
        normalizeProcessWorkflow(buildProcessWorkflowFromLegacy(processCategory, processDetail))
      );
  const safeSteps = steps.length
    ? steps
    : [{ order: 1, processCategory: "", processDetail: "" }];

  const emit = (nextSteps) => onChange?.(normalizeProcessWorkflowEditor(nextSteps));

  const updateStep = (index, patch) => {
    emit(
      safeSteps.map((step, stepIndex) =>
        stepIndex === index ? { ...step, ...patch, order: stepIndex + 1 } : step
      )
    );
  };

  return (
    <section className="product-inspection-modal__section product-process-workflow-editor">
      <div className="product-process-workflow-editor__header">
        <h3>{"\uACF5\uC815 Workflow"}</h3>
        <SecondaryButton type="button" onClick={() => emit([...safeSteps, { order: safeSteps.length + 1, processCategory: "", processDetail: "" }])}>
          {"\uB2E8\uACC4 \uCD94\uAC00"}
        </SecondaryButton>
      </div>
      <ol className="product-process-workflow-editor__list">
        {safeSteps.map((step, index) => {
          const detailOptions = getProductProcessDetailOptions(step.processCategory);
          return (
            <li key={`workflow-step-${index}`} className="product-process-workflow-editor__item">
              <span className="product-process-workflow-editor__order">{index + 1}</span>
              <label>
                <span>{"\uACF5\uC815"}</span>
                <select
                  value={step.processCategory ?? ""}
                  onChange={(event) => {
                    const nextCategory = event.target.value;
                    const options = getProductProcessDetailOptions(nextCategory);
                    updateStep(index, {
                      processCategory: nextCategory,
                      processDetail: options.includes(step.processDetail) ? step.processDetail : options[0] ?? "",
                    });
                  }}
                >
                  <option value="">{"\uC120\uD0DD"}</option>
                  {PRODUCT_PROCESS_CATEGORIES.map((item) => (
                    <option key={item.id} value={item.id} disabled={item.enabled === false}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>{"\uC138\uBD80\uACF5\uC815"}</span>
                <select
                  value={step.processDetail ?? ""}
                  disabled={!step.processCategory}
                  onChange={(event) => {
                    const nextDetail = event.target.value;
                    updateStep(index, {
                      processDetail: nextDetail,
                      processCategory: step.processCategory || inferProcessCategoryFromDetail(nextDetail),
                    });
                  }}
                >
                  <option value="">
                    {step.processCategory
                      ? "\uC120\uD0DD"
                      : "\uBA3C\uC800 \uACF5\uC815\uC744 \uC120\uD0DD\uD558\uC138\uC694."}
                  </option>
                  {detailOptions.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>
              <div className="product-process-workflow-editor__actions">
                <button type="button" disabled={index === 0} onClick={() => {
                  const next = [...safeSteps];
                  const [item] = next.splice(index, 1);
                  next.splice(index - 1, 0, item);
                  emit(next);
                }}>{"\uC704\uB85C"}</button>
                <button type="button" disabled={index === safeSteps.length - 1} onClick={() => {
                  const next = [...safeSteps];
                  const [item] = next.splice(index, 1);
                  next.splice(index + 1, 0, item);
                  emit(next);
                }}>{"\uC544\uB798\uB85C"}</button>
                <button type="button" disabled={safeSteps.length <= 1} onClick={() => emit(safeSteps.filter((_, i) => i !== index))}>
                  {"\uC0AD\uC81C"}
                </button>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function filterDocumentsForProduct(rows, { company = "", partNo = "" } = {}) {
  const companyKey = company.trim().toLowerCase();
  const partKey = partNo.trim().toLowerCase();
  if (!companyKey && !partKey) return rows;
  return rows.filter((row) => {
    const rowCompany = String(row.company ?? "").toLowerCase();
    const rowPart = String(row.partNo ?? "").toLowerCase();
    if (partKey && rowPart && rowPart === partKey) return true;
    if (companyKey && rowCompany && rowCompany === companyKey) return true;
    if (partKey && rowPart.includes(partKey)) return true;
    return !partKey && !companyKey;
  });
}

function ProductDocumentLinksEditor({ documentLinks = [], company = "", partNo = "", onChange }) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [query, setQuery] = useState("");
  const links = useMemo(() => normalizeDocumentLinks(documentLinks), [documentLinks]);
  const availableRows = useMemo(() => {
    const all = getQualityDocumentRegistryRows();
    const scoped = filterDocumentsForProduct(all, { company, partNo });
    const linkedIds = new Set(links.map((link) => link.documentId));
    const q = query.trim().toLowerCase();
    return scoped
      .filter((row) => !linkedIds.has(row.id))
      .filter((row) => {
        if (!q) return true;
        return [row.title, row.documentNo, row.documentTypeLabel, row.partNo, row.company]
          .join(" ")
          .toLowerCase()
          .includes(q);
      });
  }, [company, partNo, links, query, pickerOpen]);

  const addLink = (row) => {
    onChange?.(
      normalizeDocumentLinks([
        ...links,
        {
          documentId: row.id,
          type: row.documentType || row.documentTypeLabel,
          title: row.title || row.documentNo,
          documentNo: row.documentNo,
        },
      ])
    );
    setPickerOpen(false);
    setQuery("");
  };

  return (
    <section className="product-inspection-modal__section" aria-label={"\uBB38\uC11C \uC5F0\uACB0"}>
      <div className="criteria-depth-block__head">
        <h3>{"\uBB38\uC11C \uC5F0\uACB0"}</h3>
        <SecondaryButton type="button" onClick={() => setPickerOpen(true)}>
          <Link2 size={14} />
          {"\uBB38\uC11C \uC5F0\uACB0"}
        </SecondaryButton>
      </div>
      <p className="master-form-helper">
        {"\uAD00\uB828 \uB3C4\uBA74 \u00B7 \uAD00\uB828 \uBB38\uC11C\uB97C \uBB38\uC11C\uAD00\uB9AC\uC5D0\uC11C \uCC38\uC870\uB85C \uC5F0\uACB0\uD569\uB2C8\uB2E4."}
      </p>
      {links.length === 0 ? (
        <p className="criteria-preview">{"\uC5F0\uACB0\uB41C \uBB38\uC11C\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4."}</p>
      ) : (
        <table className="erp-table product-spec-table">
          <thead>
            <tr>
              <th>{"\uBB38\uC11C\uC885\uB958"}</th>
              <th>{"\uBB38\uC11C\uBC88\uD638"}</th>
              <th>{"\uC81C\uBAA9"}</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {links.map((link) => (
              <tr key={link.documentId}>
                <td>{link.type || "\u2014"}</td>
                <td>{link.documentNo || link.documentId}</td>
                <td>{link.title || "\u2014"}</td>
                <td>
                  <button
                    type="button"
                    className="criteria-surface-row__remove"
                    onClick={() => onChange?.(links.filter((item) => item.documentId !== link.documentId))}
                    aria-label={"\uBB38\uC11C \uC5F0\uACB0 \uD574\uC81C"}
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <TitanWorkspaceModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        title={"\uBB38\uC11C \uC120\uD0DD"}
        kicker={"\uBB38\uC11C\uAD00\uB9AC"}
        size="standard"
      >
        <div className="product-inspection-modal__grid">
          <label className="product-inspection-modal__field span-2">
            <span>{"\uAC80\uC0C9"}</span>
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={"\uBB38\uC11C\uBA85 \u00B7 \uBB38\uC11C\uBC88\uD638 \u00B7 \uD488\uBC88"}
            />
          </label>
        </div>
        <table className="erp-table product-spec-table">
          <thead>
            <tr>
              <th>{"\uC885\uB958"}</th>
              <th>{"\uBB38\uC11C\uBC88\uD638"}</th>
              <th>{"\uC81C\uBAA9"}</th>
              <th>{"\uD488\uBC88"}</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {availableRows.length === 0 ? (
              <tr>
                <td colSpan={5}>{"\uC120\uD0DD \uAC00\uB2A5\uD55C \uBB38\uC11C\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4."}</td>
              </tr>
            ) : (
              availableRows.slice(0, 50).map((row) => (
                <tr key={row.id}>
                  <td>{row.documentTypeLabel || row.documentType}</td>
                  <td>{row.documentNo}</td>
                  <td>{row.title}</td>
                  <td>{row.partNo}</td>
                  <td>
                    <SecondaryButton type="button" onClick={() => addLink(row)}>
                      {"\uC5F0\uACB0"}
                    </SecondaryButton>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </TitanWorkspaceModal>
    </section>
  );
}

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
    if (screen?.categoryKey === "companies") {
      form.contacts = [];
      form.ndkAssignees = [];
    }
    if (defaultValues && typeof defaultValues === "object") {
      Object.entries(defaultValues).forEach(([key, value]) => {
        if (value != null && value !== "") form[key] = value;
      });
    }
    if (screen?.categoryKey === "products") {
      form.specification = normalizeProductInspectionSpec(createDefaultSpecification());
      form.documentLinks = [];
      form.description = "";
      form.note = "";
      form.processWorkflow = [];
      form.processWorkflowTemplateId = "";
      form.inspectionTemplateId = "";
      form.certificatePolicyId = DEFAULT_CERTIFICATE_POLICY_ID;
      form.inspectionType = "mass";
      form.unit = "EA";
      form.unitCustom = "";
    }
    return form;
  }

  const form = { ...DEFAULT_FORM };
  screen.formFields.forEach((field) => {
    if (field.type === "toggle") {
      form[field.key] = initialRow.active !== false;
    } else {
      form[field.key] = initialRow[field.key] ?? "";
    }
  });
  if (screen?.categoryKey === "products") {
    form.processCategory =
      initialRow.processCategory ?? inferProcessCategoryFromDetail(initialRow.processDetail, initialRow.process);
    form.processDetail = initialRow.processDetail ?? initialRow.process ?? "";
    form.processWorkflow = normalizeProcessWorkflow(
      initialRow.processWorkflow?.length
        ? initialRow.processWorkflow
        : buildProcessWorkflowFromLegacy(form.processCategory, form.processDetail, initialRow.process)
    );
    form.inspectionTemplateId = initialRow.inspectionTemplateId ?? "";
    form.processWorkflowTemplateId = initialRow.processWorkflowTemplateId ?? "";
    form.certificatePolicyId = initialRow.certificatePolicyId ?? DEFAULT_CERTIFICATE_POLICY_ID;
    form.specification = getProductSpecificationForEdit(initialRow);
    form.documentLinks = normalizeDocumentLinks(initialRow.documentLinks);
    form.description = initialRow.description ?? "";
    form.note = initialRow.note ?? "";
    const unitParts = splitProductUnitForForm(initialRow.unit);
    form.unit = unitParts.unit;
    form.unitCustom = unitParts.unitCustom;
    form.inspectionType = initialRow.inspectionType === "development" ? "development" : "mass";
  }
  form.abbreviationManual = Boolean(initialRow.abbreviationManual);
  form.abbreviationLocked = Boolean(initialRow.abbreviationLocked);
  if (screen?.categoryKey === "companies") {
    form.contacts = Array.isArray(initialRow.contacts) ? initialRow.contacts : [];
    form.ndkAssignees = Array.isArray(initialRow.ndkAssignees) ? initialRow.ndkAssignees : [];
  }
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
  const isProductScreen = screen?.categoryKey === "products";

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

  useEffect(() => {
    if (!open || !isProductScreen || mode !== "add") return;
    if (!form.company?.trim()) return;
    const nextCode = generateProductManagementCode(form.company);
    setForm((prev) => (prev.code === nextCode ? prev : { ...prev, code: nextCode }));
  }, [open, isProductScreen, mode, form.company]);

  const optionMap = useMemo(
    () => ({
      companies: getActiveMasterNames("companies"),
      materials: getActiveMasterNames("materials"),
      units: getActiveMasterNames("units"),
      heatTreatment: getActiveMasterNames("heatTreatment"),
    }),
    [open]
  );

  const processDetailOptions = useMemo(
    () => getProductProcessDetailOptions(form.processCategory),
    [form.processCategory]
  );

  const productCoreFields = useMemo(() => {
    if (!isProductScreen) return [];
    return screen.formFields.filter(
      (field) =>
        !PRODUCT_BOTTOM_FIELD_KEYS.has(field.key) && !PRODUCT_WORKFLOW_FIELD_KEYS.has(field.key)
    );
  }, [isProductScreen, screen]);

  const updateField = (key, value) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (isCompanyScreen && key === "abbreviation") {
        next.abbreviationManual = true;
        next.abbreviationLocked = mode === "edit";
        next.code = String(value ?? "").trim().toUpperCase() || prev.code;
      }
      if (isProductScreen && key === "company" && mode === "add") {
        next.code = value?.trim() ? generateProductManagementCode(value) : "";
      }
      if (isProductScreen && key === "processCategory") {
        const details = getProductProcessDetailOptions(value);
        next.processDetail = details.includes(prev.processDetail) ? prev.processDetail : details[0] ?? "";
        next.processWorkflow = normalizeProcessWorkflow(
          buildProcessWorkflowFromLegacy(value, next.processDetail, prev.process)
        );
      }
      if (isProductScreen && key === "processDetail") {
        next.processWorkflow = normalizeProcessWorkflow(
          buildProcessWorkflowFromLegacy(prev.processCategory, value, prev.process)
        );
      }
      return next;
    });
    setError("");
  };

  const handleSubmit = () => {
    const payload = { ...form };
    if (isProductScreen && form.specification) {
      payload.specification = normalizeProductInspectionSpec(form.specification);
      payload.processWorkflow = normalizeProcessWorkflow(form.processWorkflow);
      payload.documentLinks = normalizeDocumentLinks(form.documentLinks);
      payload.inspectionTemplateId = String(form.inspectionTemplateId ?? "").trim();
      payload.processWorkflowTemplateId = String(form.processWorkflowTemplateId ?? "").trim();
      payload.certificatePolicyId = String(form.certificatePolicyId ?? DEFAULT_CERTIFICATE_POLICY_ID).trim();
      payload.inspectionType = form.inspectionType === "development" ? "development" : "mass";
      payload.certificateIssuePolicy = getCertificateIssuePolicyFromProduct({
        certificatePolicyId: payload.certificatePolicyId,
        specification: payload.specification,
      });
      if (!payload.processWorkflow?.length) {
        setError("\uACF5\uC815 Workflow\uB97C \uAD6C\uC131\uD558\uC138\uC694.");
        return;
      }
    }
    if (isCompanyScreen && !payload.abbreviationManual && !payload.abbreviationLocked) {
      payload.abbreviation = autoAbbreviation || payload.abbreviation;
      payload.code = payload.code || payload.abbreviation;
    }

    if (isProductScreen && mode === "add" && payload.company && !payload.code) {
      payload.code = generateProductManagementCode(payload.company);
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

    if (form.abbreviationLocked) {
      return {
        readOnly: true,
        helperText: "관리자 수정 완료 · 약칭 고정",
      };
    }

    return {
      readOnly: false,
      helperText:
        mode === "add"
          ? "업체명 기준 자동 제안 · 필요 시 수정 가능"
          : "충돌·부적합 시 관리자 1회 수정 가능 · 저장 후 고정",
    };
  };

  const renderProductField = (field) => {
    if (field.type === "companyAutocomplete") {
      return (
        <TitanAutoComplete
          fieldType="company"
          value={form.company ?? ""}
          onChange={(value) => updateField("company", value)}
          placeholder={field.placeholder ?? "거래처 검색"}
        />
      );
    }
    if (field.type === "autoCode") {
      return (
        <MasterFieldInput
          field={{ ...field, type: "readonly" }}
          value={form.code ?? ""}
          onChange={() => {}}
          readOnly
          helperText={mode === "add" ? "업체 선택 시 자동 생성 · 수동 입력 불가" : "등록된 관리번호"}
        />
      );
    }
    if (field.type === "processCategory") {
      return (
        <select value={form.processCategory ?? ""} onChange={(e) => updateField("processCategory", e.target.value)}>
          <option value="">{field.placeholder ?? "공정 선택"}</option>
          {PRODUCT_PROCESS_CATEGORIES.map((item) => (
            <option key={item.id} value={item.id} disabled={item.enabled === false}>
              {item.label}
              {item.planned ? " (예정)" : ""}
            </option>
          ))}
        </select>
      );
    }
    if (field.type === "processDetail") {
      return (
        <select
          value={form.processDetail ?? ""}
          onChange={(e) => updateField("processDetail", e.target.value)}
          disabled={!form.processCategory}
        >
          <option value="">
            {form.processCategory ? (field.placeholder ?? "\uC138\uBD80\uACF5\uC815 \uC120\uD0DD") : "\uBA3C\uC800 \uACF5\uC815\uC744 \uC120\uD0DD\uD558\uC138\uC694."}
          </option>
          {processDetailOptions.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      );
    }
    if (field.type === "productUnit") {
      return (
        <>
          <select value={form.unit ?? "EA"} onChange={(e) => updateField("unit", e.target.value)}>
            {PRODUCT_UNIT_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {isProductUnitOther(form.unit) ? (
            <input
              type="text"
              value={form.unitCustom ?? ""}
              onChange={(e) => updateField("unitCustom", e.target.value.toUpperCase())}
              placeholder="직접 입력 (예: PCS)"
              style={{ marginTop: 6 }}
            />
          ) : null}
        </>
      );
    }
    return null;
  };

  const renderFieldGrid = (fields) => (
    <div className="master-register-modal__grid">
      {fields.map((field) => {
        const abbrevProps = getAbbreviationFieldProps(field);
        const fieldType = field.type === "abbreviation" ? "text" : field.type;
        const productField = isProductScreen ? renderProductField(field) : null;
        return (
          <label
            key={field.key}
            className={`master-register-modal__field${field.span === 2 ? " span-2" : ""}`}
          >
            <span>
              {field.label}
              {field.required ? " *" : ""}
            </span>
            {productField ?? (
              <MasterFieldInput
                field={{ ...field, type: fieldType }}
                value={form[field.key] ?? ""}
                onChange={(value) => updateField(field.key, value)}
                options={field.optionsKey ? optionMap[field.optionsKey] ?? [] : []}
                readOnly={abbrevProps.readOnly}
                helperText={abbrevProps.helperText}
              />
            )}
          </label>
        );
      })}
    </div>
  );

  if (!open || !screen) return null;

  return (
    <TitanRegisterModal
      open={open}
      onClose={onClose}
      onSubmit={handleSubmit}
      kicker={screen.title}
      title={mode === "edit" ? "기준정보 수정" : "기준정보 등록"}
      submitLabel={mode === "edit" ? "수정" : "등록"}
      size={isProductScreen ? "wide" : undefined}
    >
      {error ? (
        <p className="master-register-modal__error" role="alert">
          {error}
        </p>
      ) : null}

      {isProductScreen ? (
        <>
          <section className="product-inspection-modal__section">
            <h3>제품정보</h3>
            {renderFieldGrid(productCoreFields)}
          </section>

          <ProductMasterReferenceSection
            form={form}
            onChange={(patch) => setForm((prev) => ({ ...prev, ...patch }))}
          />

          <ProductProcessWorkflowEditor
            workflow={form.processWorkflow}
            processCategory={form.processCategory}
            processDetail={form.processDetail}
            onChange={(processWorkflow) => {
              const firstStep = processWorkflow[0];
              setForm((prev) => ({
                ...prev,
                processWorkflow,
                processWorkflowTemplateId: "",
                processCategory: firstStep?.processCategory ?? prev.processCategory,
                processDetail: firstStep?.processDetail ?? prev.processDetail,
              }));
            }}
          />

          <ProductInspectionSpecEditor
            specification={form.specification}
            onChange={(specification) => setForm((prev) => ({ ...prev, specification }))}
          />

          <ProductDocumentLinksEditor
            documentLinks={form.documentLinks}
            company={form.company}
            partNo={form.partNo}
            onChange={(documentLinks) => setForm((prev) => ({ ...prev, documentLinks }))}
          />

          <section className="product-inspection-modal__section">
            <h3>제품 설명</h3>
            <label className="master-register-modal__field span-2">
              <span>제품 설명</span>
              <textarea
                rows={2}
                placeholder="제품 특성 · 용도 · 주의사항"
                value={form.description ?? ""}
                onChange={(event) => updateField("description", event.target.value)}
              />
            </label>
          </section>

          <section className="product-inspection-modal__section">
            <h3>비고</h3>
            <label className="master-register-modal__field span-2">
              <span>비고</span>
              <textarea
                rows={2}
                value={form.note ?? ""}
                onChange={(event) => updateField("note", event.target.value)}
              />
            </label>
          </section>
        </>
      ) : (
        renderFieldGrid(screen.formFields)
      )}

      {isCompanyScreen ? (
        <>
          <CompanyContactsEditor
            contacts={form.contacts ?? []}
            onChange={(contacts) => setForm((prev) => ({ ...prev, contacts }))}
          />
          <CompanyNdkAssigneesEditor
            assignees={form.ndkAssignees ?? []}
            onChange={(ndkAssignees) => setForm((prev) => ({ ...prev, ndkAssignees }))}
          />
        </>
      ) : null}
    </TitanRegisterModal>
  );
}

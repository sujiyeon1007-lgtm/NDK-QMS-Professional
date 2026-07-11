import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import TitanRegisterModal from "../../foundation/components/TitanRegisterModal";
import { SecondaryButton } from "../../foundation/components/Button";
import { normalizeSpecification } from "../../utils/productSpecificationModel";
import {
  SPEC_CONDITIONS,
  addCustomHardnessUnit,
  createEmptyHardnessEntry,
  formatCriterionDisplay,
  formatHardnessEntryDisplay,
  formatSurfaceHardnessForCertificate,
  getAvailableHardnessUnits,
  normalizeInspectionCriteriaSpec,
  syncStructuredHardnessItems,
} from "../../utils/inspectionCriteriaModel";
import { getMasterDataByCategory } from "../../utils/masterData";
import {
  getCurrentDrawingRevision,
  downloadRevisionFile,
} from "../../utils/productDrawingSession";
import {
  createEmptyInspectionForm,
  upsertProductInspection,
} from "../../utils/productInspectionSession";

function applyProductToForm(form, product) {
  if (!product) return form;
  const drawing = getCurrentDrawingRevision(product.id);
  return {
    ...form,
    productId: product.id,
    partNo: product.partNo,
    company: product.company ?? "",
    partName: product.name ?? "",
    drawingNo: drawing?.drawingNo || product.drawingNo || "",
    material: product.material ?? "",
    revision: drawing?.revision ?? "",
    revisionDate: drawing?.revisionDate ?? "",
    currentDrawing: drawing,
  };
}

function getSimpleHardnessItem(spec, key) {
  return (
    spec.hardness?.items?.find((item) => item.key === key) ?? {
      key,
      spec: "",
      disabled: false,
    }
  );
}

function getDepthItem(spec, key) {
  const synced = syncStructuredHardnessItems(spec);
  return (
    synced.hardness.items.find((item) => item.key === key) ?? {
      key,
      disabled: key === "caseDepth",
      value: "",
      valueTo: "",
      condition: "범위",
      unit: "mm",
    }
  );
}

function DepthCriterionEditor({ title, item, onChange }) {
  const preview = item.disabled ? "없음" : formatCriterionDisplay(item);

  return (
    <div className="criteria-depth-block span-2">
      <div className="criteria-depth-block__head">
        <strong>{title}</strong>
        <label className="criteria-depth-block__toggle">
          <input
            type="checkbox"
            checked={!item.disabled}
            onChange={(event) => onChange({ disabled: !event.target.checked })}
          />
          사용
        </label>
      </div>
      {!item.disabled ? (
        <div className="criteria-depth-block__grid">
          <label className="product-inspection-modal__field">
            <span>{title}</span>
            <input
              type="text"
              value={item.value}
              onChange={(event) => onChange({ value: event.target.value })}
              placeholder="0.40"
            />
          </label>
          {item.condition === "범위" ? (
            <label className="product-inspection-modal__field">
              <span>~</span>
              <input
                type="text"
                value={item.valueTo}
                onChange={(event) => onChange({ valueTo: event.target.value })}
                placeholder="0.40"
              />
            </label>
          ) : (
            <div className="product-inspection-modal__field" aria-hidden="true" />
          )}
          <label className="product-inspection-modal__field">
            <span>스펙</span>
            <select value={item.condition} onChange={(event) => onChange({ condition: event.target.value })}>
              {SPEC_CONDITIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <p className="criteria-preview span-2">성적서 표기: {preview || "—"}</p>
        </div>
      ) : null}
    </div>
  );
}

function SurfaceHardnessEditor({ entries, units, onChange, onAddEntry, onRemoveEntry, onAddUnit }) {
  const [newUnit, setNewUnit] = useState("");

  return (
    <div className="criteria-surface-block span-2">
      <div className="criteria-depth-block__head">
        <strong>표면경도</strong>
        <SecondaryButton type="button" onClick={onAddEntry}>
          <Plus size={14} />
          단위 추가
        </SecondaryButton>
      </div>

      {entries.map((entry, index) => (
        <div key={entry.id} className="criteria-surface-row">
          <label className="product-inspection-modal__field">
            <span>표면경도 기준{entries.length > 1 ? ` ${index + 1}` : ""}</span>
            <input
              type="text"
              value={entry.value}
              onChange={(event) => onChange(entry.id, { value: event.target.value })}
              placeholder={entry.condition === "범위" ? "550" : "0.40"}
            />
          </label>
          {entry.condition === "범위" ? (
            <label className="product-inspection-modal__field">
              <span>~</span>
              <input
                type="text"
                value={entry.valueTo}
                onChange={(event) => onChange(entry.id, { valueTo: event.target.value })}
                placeholder="700"
              />
            </label>
          ) : (
            <div className="product-inspection-modal__field" aria-hidden="true" />
          )}
          <label className="product-inspection-modal__field">
            <span>표면경도 스펙</span>
            <select
              value={entry.condition}
              onChange={(event) => onChange(entry.id, { condition: event.target.value })}
            >
              {SPEC_CONDITIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label className="product-inspection-modal__field">
            <span>경도 단위</span>
            <select value={entry.unit} onChange={(event) => onChange(entry.id, { unit: event.target.value })}>
              {units.map((unit) => (
                <option key={unit} value={unit}>
                  {unit}
                </option>
              ))}
            </select>
          </label>
          {entries.length > 1 ? (
            <button
              type="button"
              className="criteria-surface-row__remove"
              onClick={() => onRemoveEntry(entry.id)}
              aria-label="표면경도 행 삭제"
            >
              <Trash2 size={14} />
            </button>
          ) : null}
          <p className="criteria-preview span-4">미리보기: {formatHardnessEntryDisplay(entry) || "—"}</p>
        </div>
      ))}

      <div className="criteria-unit-add">
        <input
          type="text"
          value={newUnit}
          onChange={(event) => setNewUnit(event.target.value.toUpperCase())}
          placeholder="HBW"
        />
        <SecondaryButton
          type="button"
          onClick={() => {
            if (!newUnit.trim()) return;
            onAddUnit(newUnit.trim());
            setNewUnit("");
          }}
        >
          + 단위 추가
        </SecondaryButton>
      </div>

      <p className="criteria-preview criteria-preview--summary">
        성적서 표기: {formatSurfaceHardnessForCertificate(entries) || "—"}
      </p>
    </div>
  );
}

export default function ProductInspectionRegisterModal({
  open,
  onClose,
  onSaved,
  initialProductId = null,
  initialInspection = null,
}) {
  const [form, setForm] = useState(createEmptyInspectionForm());
  const [error, setError] = useState("");

  const products = useMemo(
    () => getMasterDataByCategory("products").filter((row) => row.active !== false),
    [open]
  );

  useEffect(() => {
    if (!open) return;
    const product =
      products.find((row) => row.id === initialProductId) ??
      products.find((row) => row.id === initialInspection?.productId) ??
      null;
    const base = createEmptyInspectionForm(product);
    if (initialInspection) {
      const productForm = applyProductToForm(base, product);
      setForm({
        ...productForm,
        specification: normalizeInspectionCriteriaSpec(normalizeSpecification(initialInspection.specification)),
        note: initialInspection.note ?? "",
      });
    } else {
      setForm(base);
    }
    setError("");
  }, [open, initialProductId, initialInspection, products]);

  const spec = form.specification;
  const hardnessUnits = getAvailableHardnessUnits(spec);
  const surfaceEntries = spec.hardness?.surfaceEntries ?? [];
  const caseDepth = getDepthItem(spec, "caseDepth");
  const effectiveDepth = getDepthItem(spec, "effectiveDepth");
  const compoundLayer = getSimpleHardnessItem(spec, "compoundLayer");

  const updateSpec = (updater) => {
    setForm((prev) => {
      const nextSpec = typeof updater === "function" ? updater(prev.specification) : updater;
      return { ...prev, specification: syncStructuredHardnessItems(nextSpec) };
    });
  };

  const updateDepthItem = (key, patch) => {
    updateSpec((current) => ({
      ...current,
      hardness: {
        ...current.hardness,
        items: current.hardness.items.map((item) => (item.key === key ? { ...item, ...patch } : item)),
      },
    }));
  };

  const updateSimpleItem = (key, specValue) => {
    updateSpec((current) => ({
      ...current,
      hardness: {
        ...current.hardness,
        items: current.hardness.items.map((item) =>
          item.key === key ? { ...item, spec: specValue, disabled: specValue.trim() === "없음" } : item
        ),
      },
    }));
  };

  const updateSurfaceEntry = (entryId, patch) => {
    updateSpec((current) => ({
      ...current,
      hardness: {
        ...current.hardness,
        surfaceEntries: (current.hardness.surfaceEntries ?? []).map((entry) =>
          entry.id === entryId ? { ...entry, ...patch } : entry
        ),
      },
    }));
  };

  const addSurfaceEntry = () => {
    updateSpec((current) => ({
      ...current,
      hardness: {
        ...current.hardness,
        surfaceEntries: [...(current.hardness.surfaceEntries ?? []), createEmptyHardnessEntry("HV")],
      },
    }));
  };

  const removeSurfaceEntry = (entryId) => {
    updateSpec((current) => ({
      ...current,
      hardness: {
        ...current.hardness,
        surfaceEntries: (current.hardness.surfaceEntries ?? []).filter((entry) => entry.id !== entryId),
      },
    }));
  };

  const handleAddUnit = (unit) => {
    updateSpec((current) => addCustomHardnessUnit(current, unit));
  };

  const handleProductChange = (productId) => {
    const product = products.find((row) => row.id === productId) ?? null;
    setForm((prev) => applyProductToForm({ ...prev, productId }, product));
  };

  const handleSubmit = () => {
    if (!form.productId) {
      setError("제품을 선택하세요.");
      return;
    }
    const payload = {
      ...form,
      specification: syncStructuredHardnessItems(form.specification),
    };
    const result = upsertProductInspection(payload);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    onSaved?.(result.row);
  };

  if (!open) return null;

  return (
    <TitanRegisterModal
      open={open}
      onClose={onClose}
      onSubmit={handleSubmit}
      kicker="검사기준관리"
      title="제품별 검사기준 등록"
      submitLabel={initialInspection ? "수정" : "등록"}
      size="wide"
    >
      {error ? (
        <p className="product-inspection-modal__error" role="alert">
          {error}
        </p>
      ) : null}

      <section className="product-inspection-modal__section">
        <h3>제품 선택</h3>
        <div className="product-inspection-modal__grid">
          <label className="product-inspection-modal__field span-2">
            <span>제품 *</span>
            <select value={form.productId} onChange={(event) => handleProductChange(event.target.value)}>
              <option value="">제품 선택</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.partNo} · {product.name}
                </option>
              ))}
            </select>
          </label>
          <label className="product-inspection-modal__field">
            <span>업체명</span>
            <input type="text" value={form.company} readOnly />
          </label>
          <label className="product-inspection-modal__field">
            <span>품명</span>
            <input type="text" value={form.partName} readOnly />
          </label>
          <label className="product-inspection-modal__field">
            <span>품번</span>
            <input type="text" value={form.partNo} readOnly />
          </label>
          <label className="product-inspection-modal__field">
            <span>도번</span>
            <input type="text" value={form.drawingNo} readOnly />
          </label>
          <label className="product-inspection-modal__field">
            <span>재질</span>
            <input type="text" value={form.material} readOnly />
          </label>
          <label className="product-inspection-modal__field">
            <span>현재 Revision</span>
            <input type="text" value={form.revision ? `Rev ${form.revision}` : "—"} readOnly />
          </label>
          <label className="product-inspection-modal__field">
            <span>개정일</span>
            <input type="text" value={form.revisionDate || "—"} readOnly />
          </label>
        </div>
      </section>

      <section className="product-inspection-modal__section">
        <h3>검사기준</h3>
        <div className="product-inspection-modal__grid product-inspection-modal__grid--criteria">
          <SurfaceHardnessEditor
            entries={surfaceEntries}
            units={hardnessUnits}
            onChange={updateSurfaceEntry}
            onAddEntry={addSurfaceEntry}
            onRemoveEntry={removeSurfaceEntry}
            onAddUnit={handleAddUnit}
          />

          <DepthCriterionEditor
            title="경화깊이 기준"
            item={caseDepth}
            onChange={(patch) => updateDepthItem("caseDepth", patch)}
          />

          <DepthCriterionEditor
            title="유효경화깊이 기준"
            item={effectiveDepth}
            onChange={(patch) => updateDepthItem("effectiveDepth", patch)}
          />

          <label className="product-inspection-modal__field">
            <span>화합물층</span>
            <input
              type="text"
              value={compoundLayer.disabled ? "없음" : compoundLayer.spec ?? ""}
              onChange={(event) => updateSimpleItem("compoundLayer", event.target.value)}
              placeholder="5~15 μm"
            />
          </label>

          <label className="product-inspection-modal__field span-2">
            <span>조직 기준</span>
            <input
              type="text"
              value={spec.microstructure?.note ?? (spec.microstructure?.enabled ? "사용" : "")}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  specification: {
                    ...prev.specification,
                    microstructure: { enabled: true, note: event.target.value },
                  },
                }))
              }
              placeholder="martensite + 잔류 austenite"
            />
          </label>
          <label className="product-inspection-modal__field span-2">
            <span>기타 검사 기준</span>
            <textarea
              rows={2}
              value={spec.other?.note ?? ""}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  specification: {
                    ...prev.specification,
                    other: { enabled: true, note: event.target.value },
                  },
                }))
              }
            />
          </label>
        </div>
      </section>

      <section className="product-inspection-modal__section">
        <h3>최신 도면 (제품관리 연동)</h3>
        {form.currentDrawing?.dataUrl ? (
          <div className="product-inspection-detail__drawing">
            <div className="product-inspection-detail__drawing-head">
              <strong>
                {form.currentDrawing.drawingNo || form.drawingNo || "도면"}
                {form.currentDrawing.revision ? ` · Rev ${form.currentDrawing.revision}` : ""}
              </strong>
              <SecondaryButton type="button" onClick={() => downloadRevisionFile(form.currentDrawing)}>
                다운로드
              </SecondaryButton>
            </div>
            {form.currentDrawing.mimeType === "application/pdf" ? (
              <iframe
                title="도면 미리보기"
                src={form.currentDrawing.dataUrl}
                className="product-inspection-detail__preview product-inspection-detail__preview--pdf"
              />
            ) : (
              <img
                src={form.currentDrawing.dataUrl}
                alt={form.currentDrawing.fileName || "도면"}
                className="product-inspection-detail__preview"
              />
            )}
          </div>
        ) : (
          <p className="product-drawing-detail__empty">
            제품관리에 등록된 도면이 없습니다. 제품관리에서 Revision을 등록하세요.
          </p>
        )}
      </section>
    </TitanRegisterModal>
  );
}

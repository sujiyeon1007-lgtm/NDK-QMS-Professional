import { useEffect, useMemo, useRef, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { SecondaryButton } from "../../foundation/components/Button";
import {
  CERTIFICATE_OUTPUT_MODES,
  EFFECTIVE_DEPTH_BASIS_OPTIONS,
  createDefaultSpecification,
  normalizeSpecification,
  MICROSTRUCTURE_MAGNIFICATION_OPTIONS,
  DEFAULT_MICROSTRUCTURE_MAGNIFICATION,
} from "../../utils/productSpecificationModel";
import { CERTIFICATE_ISSUE_POLICY_OPTIONS } from "../../utils/certificateIssuePolicy";
import {
  SPEC_CONDITIONS,
  JUDGMENT_METHODS,
  HARDNESS_UNIT_OPTIONS,
  COMPOUND_LAYER_UNITS,
  DEPTH_SPEC_CONDITIONS,
  addCustomHardnessUnit,
  createEmptyHardnessEntry,
  formatCriterionDisplay,
  formatHardnessEntryDisplay,
  formatSurfaceHardnessForCertificate,
  formatSpecOnlyDisplay,
  getAvailableHardnessUnits,
  normalizeInspectionCriteriaSpec,
  resolveCorePlusOffset,
  syncStructuredHardnessItems,
  CASE_DEPTH_CALC_METHOD_OPTIONS,
  resolveCaseDepthCalcMethod,
  buildCaseDepthJudgmentPatch,
  finalizeCaseDepthJudgmentPatch,
  DEFAULT_CASE_DEPTH_JUDGMENT_HV,
} from "../../utils/inspectionCriteriaModel";
import "../Settings/ProductInspectionManagement.css";
import MicrostructurePhotoSlots, { normalizePhotoSlots } from "./MicrostructurePhotoSlots";

function createDimensionId() {
  return `dim-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Local draft for numeric HV fields — commit to parent on blur only */
function useNumericDraftField(externalValue, onCommit) {
  const external = externalValue == null ? "" : String(externalValue);
  const [draft, setDraft] = useState(external);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!isEditing) {
      setDraft(external);
    }
  }, [external, isEditing]);

  return {
    value: isEditing ? draft : external,
    onFocus: () => {
      setIsEditing(true);
      setDraft(external);
    },
    onChange: (event) => setDraft(event.target.value),
    onBlur: (event) => {
      setIsEditing(false);
      onCommit(event.target.value);
    },
  };
}

export function normalizeProductInspectionSpec(specification) {
  return syncStructuredHardnessItems(
    normalizeInspectionCriteriaSpec(
      normalizeSpecification(specification ?? createDefaultSpecification())
    )
  );
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

function getHardnessCriterionItem(spec, key) {
  const synced = syncStructuredHardnessItems(spec);
  return (
    synced.hardness.items.find((item) => item.key === key) ?? {
      key,
      disabled: true,
      value: "",
      valueTo: "",
      condition: "범위",
      unit: key === "compoundLayer" ? "μm" : "HV",
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

function HardnessCriterionEditor({ title, item, onChange, defaultUnit = "HV", unitOptions = HARDNESS_UNIT_OPTIONS }) {
  const preview = item.disabled
    ? "없음"
    : formatSpecOnlyDisplay({
        min: item.value,
        max: item.valueTo,
        unit: item.unit || defaultUnit,
        condition: item.condition || "범위",
      });
  const method = item.condition || item.judgmentMethod || "범위";
  const showRange = method === "범위";
  const showCorePlus = method === "Core + 값";
  const showFixedHv = method === "고정 HV";
  const showDirect = method === "직접 입력";
  const units = unitOptions?.length ? unitOptions : HARDNESS_UNIT_OPTIONS;

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
          <p className="criteria-preview span-2 criteria-preview--label">제품 스펙 (합격 범위)</p>
          <label className="product-inspection-modal__field">
            <span>판정 방식</span>
            <select value={method} onChange={(event) => onChange({ condition: event.target.value })}>
              {JUDGMENT_METHODS.filter((option) => option !== "Core + 값" && option !== "고정 HV").map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label className="product-inspection-modal__field">
            <span>단위</span>
            <select value={item.unit || defaultUnit} onChange={(event) => onChange({ unit: event.target.value })}>
              {units.map((unit) => (
                <option key={unit} value={unit}>
                  {unit}
                </option>
              ))}
            </select>
          </label>
          {showCorePlus ? (
            <label className="product-inspection-modal__field">
              <span>추가값 (HV)</span>
              <input
                type="number"
                min={1}
                value={item.corePlusOffset ?? item.value ?? 50}
                onChange={(event) =>
                  onChange({ corePlusOffset: event.target.value, value: event.target.value })
                }
                placeholder="50"
              />
            </label>
          ) : null}
          {!showDirect ? (
            <label className="product-inspection-modal__field">
              <span>{showFixedHv ? "고정 HV" : "기준값"}</span>
              <input
                type="text"
                value={item.value}
                onChange={(event) => onChange({ value: event.target.value })}
                placeholder={showFixedHv ? "550" : "250"}
              />
            </label>
          ) : (
            <label className="product-inspection-modal__field span-2">
              <span>직접 입력</span>
              <input
                type="text"
                value={item.value}
                onChange={(event) => onChange({ value: event.target.value })}
                placeholder="250~350 HV"
              />
            </label>
          )}
          {showRange ? (
            <label className="product-inspection-modal__field">
              <span>~</span>
              <input
                type="text"
                value={item.valueTo}
                onChange={(event) => onChange({ valueTo: event.target.value })}
                placeholder="350"
              />
            </label>
          ) : null}
          {showCorePlus ? (
            <p className="criteria-preview span-2">
              판정: 심부경도 + {resolveCorePlusOffset(item.corePlusOffset ?? item.value)}HV (검사 등록 시
              자동 계산)
            </p>
          ) : null}
          <p className="criteria-preview span-2">성적서 스펙 표기: {preview || "—"}</p>
        </div>
      ) : null}
    </div>
  );
}

function formatEffectiveDepthBasisLabel(basis, specifiedHv, corePlusOffset) {
  if (basis === "specifiedHv") {
    return `지정 HV ${specifiedHv ?? 390}HV`;
  }
  if (basis === "corePlus50") {
    return `심부경도 + ${resolveCorePlusOffset(corePlusOffset, 50)}HV`;
  }
  return "390HV (고정)";
}

function DepthCriterionEditor({
  title,
  item,
  onChange,
  depthMode = "effectiveDepth",
  heatTreatment = {},
  onHeatTreatmentChange,
  certificateOutputMode,
}) {
  const specPreview = item.disabled
    ? "없음"
    : formatSpecOnlyDisplay({
        min: item.value,
        max: item.valueTo,
        unit: item.unit || "mm",
        condition: item.specCondition || item.condition || "범위",
      });
  const method = item.specCondition || item.condition || "범위";
  const isCaseDepth = depthMode === "caseDepth";
  const caseCalcMethod = isCaseDepth ? resolveCaseDepthCalcMethod(item) : null;
  const effectiveBasis = heatTreatment.effectiveDepthBasis ?? "hv390";
  const specifiedHv = heatTreatment.specifiedHv ?? 390;
  const corePlusOffset = resolveCorePlusOffset(heatTreatment.corePlusOffset, 50);
  const caseJudgmentHv = item.judgmentHv ?? String(DEFAULT_CASE_DEPTH_JUDGMENT_HV);
  const caseCorePlusOffset = item.corePlusOffset ?? "50";
  const grindingAllowanceMm = heatTreatment.grindingAllowanceMm ?? 0.15;

  const caseJudgmentHvField = useNumericDraftField(caseJudgmentHv, (raw) =>
    onChange(
      finalizeCaseDepthJudgmentPatch(caseCalcMethod, raw, caseCorePlusOffset)
    )
  );
  const caseCorePlusField = useNumericDraftField(caseCorePlusOffset, (raw) =>
    onChange(
      finalizeCaseDepthJudgmentPatch(caseCalcMethod, caseJudgmentHv, raw)
    )
  );
  const specifiedHvField = useNumericDraftField(
    heatTreatment.specifiedHv ?? DEFAULT_CASE_DEPTH_JUDGMENT_HV,
    (raw) => {
      const parsed = Number(raw);
      onHeatTreatmentChange?.({
        specifiedHv:
          !Number.isNaN(parsed) && parsed > 0 ? parsed : DEFAULT_CASE_DEPTH_JUDGMENT_HV,
      });
    }
  );
  const effectiveCorePlusField = useNumericDraftField(corePlusOffset, (raw) =>
    onHeatTreatmentChange?.({
      corePlusOffset: resolveCorePlusOffset(raw, 50),
    })
  );

  const showCaseHvThreshold = isCaseDepth && caseCalcMethod === "fixedHv";
  const showCaseCorePlus = isCaseDepth && caseCalcMethod === "corePlusOffset";
  const showEffectiveSpecifiedHv = !isCaseDepth && effectiveBasis === "specifiedHv";
  const showEffectiveCorePlus = !isCaseDepth && effectiveBasis === "corePlus50";

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
          <p className="criteria-preview span-2 criteria-preview--label">제품 스펙 (합격 범위)</p>
          <label className="product-inspection-modal__field">
            <span>판정 방식</span>
            <select
              value={method}
              onChange={(event) => onChange({ specCondition: event.target.value, condition: event.target.value })}
            >
              {DEPTH_SPEC_CONDITIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label className="product-inspection-modal__field">
            <span>기준값 (mm)</span>
            <input
              type="text"
              value={item.value}
              onChange={(event) => onChange({ value: event.target.value })}
              placeholder="0.40"
            />
          </label>
          {method === "범위" ? (
            <label className="product-inspection-modal__field">
              <span>~</span>
              <input
                type="text"
                value={item.valueTo}
                onChange={(event) => onChange({ valueTo: event.target.value })}
                placeholder="0.60"
              />
            </label>
          ) : (
            <div className="product-inspection-modal__field" aria-hidden="true" />
          )}

          <p className="criteria-preview span-2 criteria-preview--label">판정 기준 (자동 계산)</p>

          {isCaseDepth ? (
            <>
              {showCaseHvThreshold ? (
                <label className="product-inspection-modal__field">
                  <span>기준값 (HV)</span>
                  <input
                    type="number"
                    min={1}
                    {...caseJudgmentHvField}
                    placeholder="390"
                  />
                </label>
              ) : (
                <div className="product-inspection-modal__field" aria-hidden="true" />
              )}
              <label className="product-inspection-modal__field">
                <span>계산방식</span>
                <select
                  value={caseCalcMethod ?? "fixedHv"}
                  onChange={(event) => {
                    const nextMethod = event.target.value;
                    onChange(
                      finalizeCaseDepthJudgmentPatch(nextMethod, caseJudgmentHv, caseCorePlusOffset)
                    );
                  }}
                >
                  {CASE_DEPTH_CALC_METHOD_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              {showCaseCorePlus ? (
                <label className="product-inspection-modal__field">
                  <span>추가값 (HV)</span>
                  <input
                    type="number"
                    min={1}
                    {...caseCorePlusField}
                    placeholder="50"
                  />
                </label>
              ) : null}
              {showCaseHvThreshold ? (
                <p className="criteria-preview span-2">
                  경화깊이 = HV 곡선에서 {caseJudgmentHvField.value || "—"}HV 직선보간
                </p>
              ) : null}
              {showCaseCorePlus ? (
                <p className="criteria-preview span-2">
                  판정: Core + {caseCorePlusField.value}HV (검사 등록 시 자동 계산)
                </p>
              ) : null}
              <label className="product-inspection-modal__field">
                <span>연마여유 (mm)</span>
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  value={grindingAllowanceMm}
                  onChange={(event) =>
                    onHeatTreatmentChange?.({
                      grindingAllowanceMm: Number(event.target.value) || 0,
                    })
                  }
                />
              </label>
            </>
          ) : (
            <>
              <label className="product-inspection-modal__field">
                <span>판정 기준 (HV)</span>
                <select
                  value={effectiveBasis}
                  onChange={(event) =>
                    onHeatTreatmentChange?.({ effectiveDepthBasis: event.target.value })
                  }
                >
                  {EFFECTIVE_DEPTH_BASIS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              {showEffectiveSpecifiedHv ? (
                <label className="product-inspection-modal__field">
                  <span>지정 HV</span>
                  <input
                    type="number"
                    min={1}
                    {...specifiedHvField}
                    placeholder="420"
                  />
                </label>
              ) : showEffectiveCorePlus ? (
                <label className="product-inspection-modal__field">
                  <span>추가값 (HV)</span>
                  <input
                    type="number"
                    min={1}
                    {...effectiveCorePlusField}
                    placeholder="50"
                  />
                </label>
              ) : (
                <div className="product-inspection-modal__field" aria-hidden="true" />
              )}
              <label className="product-inspection-modal__field">
                <span>계산방식</span>
                <input type="text" readOnly className="master-form-readonly" value="HV 곡선 직선보간" />
              </label>
              {showEffectiveCorePlus ? (
                <p className="criteria-preview span-2">
                  임계값 = 검사 심부경도 + {corePlusOffset}HV (검사 등록 시 자동 계산)
                </p>
              ) : (
                <p className="criteria-preview span-2">
                  유효경화깊이 = HV 곡선에서{" "}
                  {formatEffectiveDepthBasisLabel(
                    effectiveBasis,
                    specifiedHvField.value,
                    effectiveCorePlusField.value
                  )}{" "}
                  직선보간
                </p>
              )}
              {certificateOutputMode ? (
                <p className="criteria-preview span-2">
                  성적서 출력:{" "}
                  {CERTIFICATE_OUTPUT_MODES.find((opt) => opt.value === certificateOutputMode)?.label ??
                    certificateOutputMode}
                </p>
              ) : null}
            </>
          )}

          <p className="criteria-preview span-2">성적서 스펙 표기: {specPreview || "—"}</p>
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
        <strong>{"\uD45C\uBA74\uACBD\uB3C4"}</strong>
        <SecondaryButton type="button" onClick={onAddEntry}>
          <Plus size={14} />
          {"\uB2E8\uC704 \uCD94\uAC00"}
        </SecondaryButton>
      </div>

      {entries.map((entry, index) => (
        <div key={entry.id} className="criteria-surface-row">
          <label className="product-inspection-modal__field">
            <span>
              {"\uD45C\uBA74\uACBD\uB3C4 \uAE30\uC900"}
              {entries.length > 1 ? ` ${index + 1}` : ""}
            </span>
            <input
              type="text"
              value={entry.value}
              onChange={(event) => onChange(entry.id, { value: event.target.value })}
              placeholder={entry.condition === "\uBC94\uC704" ? "550" : "0.40"}
            />
          </label>
          {entry.condition === "\uBC94\uC704" ? (
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
            <span>{"\uD45C\uBA74\uACBD\uB3C4 \uC2A4\uD399"}</span>
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
            <span>{"\uACBD\uB3C4 \uB2E8\uC704"}</span>
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
              aria-label={"\uD45C\uBA74\uACBD\uB3C4 \uD589 \uC0AD\uC81C"}
            >
              <Trash2 size={14} />
            </button>
          ) : null}
          <p className="criteria-preview span-4">{"\uBBF8\uB9AC\uBCF4\uAE30"}: {formatHardnessEntryDisplay(entry) || "\u2014"}</p>
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
          + {"\uB2E8\uC704 \uCD94\uAC00"}
        </SecondaryButton>
      </div>

      <p className="criteria-preview criteria-preview--summary">
        {"\uC131\uC801\uC11C \uD45C\uAE30"}: {formatSurfaceHardnessForCertificate(entries) || "\u2014"}
      </p>
    </div>
  );
}

export default function ProductInspectionSpecEditor({ specification, onChange }) {
  const spec = useMemo(() => normalizeProductInspectionSpec(specification), [specification]);
  const hardnessUnits = useMemo(() => getAvailableHardnessUnits(spec), [spec]);
  const surfaceEntries = spec.hardness?.surfaceEntries ?? [];
  const caseDepth = getDepthItem(spec, "caseDepth");
  const effectiveDepth = getDepthItem(spec, "effectiveDepth");
  const compoundLayer = getHardnessCriterionItem(spec, "compoundLayer");
  const heatTreatment = spec.heatTreatment ?? {};
  const certificatePolicy = spec.certificatePolicy ?? {};

  const emit = (nextSpec) => {
    onChange?.(nextSpec);
  };

  const updateSpec = (updater) => {
    const nextSpec = typeof updater === "function" ? updater(spec) : updater;
    emit(syncStructuredHardnessItems(nextSpec));
  };

  const updateHeatTreatment = (patch) => {
    emit({
      ...spec,
      heatTreatment: { ...heatTreatment, ...patch },
    });
  };

  const updateCertificatePolicy = (patch) => {
    emit({
      ...spec,
      certificatePolicy: { ...certificatePolicy, ...patch },
    });
  };

  const updateDepthItem = (key, patch) => {
    updateSpec({
      ...spec,
      hardness: {
        ...spec.hardness,
        items: spec.hardness.items.map((item) => (item.key === key ? { ...item, ...patch } : item)),
      },
    });
  };

  const updateHardnessCriterion = (key, patch) => {
    updateDepthItem(key, patch);
  };

  const updateSimpleItem = (key, specValue) => {
    updateSpec({
      ...spec,
      hardness: {
        ...spec.hardness,
        items: spec.hardness.items.map((item) =>
          item.key === key ? { ...item, spec: specValue, disabled: specValue.trim() === "\uC5C6\uC74C" } : item
        ),
      },
    });
  };

  const updateSurfaceEntry = (entryId, patch) => {
    updateSpec({
      ...spec,
      hardness: {
        ...spec.hardness,
        surfaceEntries: (spec.hardness.surfaceEntries ?? []).map((entry) =>
          entry.id === entryId ? { ...entry, ...patch } : entry
        ),
      },
    });
  };

  const addSurfaceEntry = () => {
    updateSpec({
      ...spec,
      hardness: {
        ...spec.hardness,
        surfaceEntries: [...(spec.hardness.surfaceEntries ?? []), createEmptyHardnessEntry("HV")],
      },
    });
  };

  const removeSurfaceEntry = (entryId) => {
    updateSpec({
      ...spec,
      hardness: {
        ...spec.hardness,
        surfaceEntries: (spec.hardness.surfaceEntries ?? []).filter((entry) => entry.id !== entryId),
      },
    });
  };

  const handleAddUnit = (unit) => {
    updateSpec(addCustomHardnessUnit(spec, unit));
  };

  const updateSpecSection = (sectionKey, patch) => {
    emit({
      ...spec,
      [sectionKey]: { ...(spec[sectionKey] ?? {}), ...patch },
    });
  };

  const addDimensionItem = () => {
    emit({
      ...spec,
      dimension: {
        ...spec.dimension,
        items: [...(spec.dimension?.items ?? []), { id: createDimensionId(), label: "", spec: "" }],
      },
    });
  };

  const updateDimensionItem = (index, patch) => {
    const items = (spec.dimension?.items ?? []).map((item, itemIndex) =>
      itemIndex === index ? { ...item, ...patch } : item
    );
    emit({
      ...spec,
      dimension: { ...spec.dimension, items },
    });
  };

  const removeDimensionItem = (index) => {
    emit({
      ...spec,
      dimension: {
        ...spec.dimension,
        items: (spec.dimension?.items ?? []).filter((_, itemIndex) => itemIndex !== index),
      },
    });
  };

  return (
    <div className="product-inspection-spec-editor" aria-label="검사 Master 설정">
      <section className="product-inspection-modal__section">
        <h3>검사 Master</h3>
        <p className="master-form-helper">항목별 사용 여부 · 판정 방식 · 기준값을 제품 Default Specification으로 저장합니다.</p>
      </section>
      <section className="product-inspection-modal__section">
        <h3>열처리 계산 · 성적서 출력</h3>
        <div className="product-inspection-modal__grid">
          <label className="product-inspection-modal__field span-2">
            <span>{"\uC131\uC801\uC11C \uCD9C\uB825 \uBC29\uC2DD"}</span>
            <select
              value={heatTreatment.certificateOutputMode ?? "all"}
              onChange={(event) => updateHeatTreatment({ certificateOutputMode: event.target.value })}
            >
              {CERTIFICATE_OUTPUT_MODES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="product-inspection-modal__field span-2">
            <span>{"\uC131\uC801\uC11C \uBC1C\uD589 \uC815\uCC45"}</span>
            <select
              value={certificatePolicy.issuePolicy ?? "always_issue"}
              onChange={(event) => updateCertificatePolicy({ issuePolicy: event.target.value })}
            >
              {CERTIFICATE_ISSUE_POLICY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <p className="master-form-helper">
          연마여유 · 경화깊이 판정 HV는 아래 경화깊이 검사 항목 카드에서 설정합니다.
        </p>
      </section>

      <section className="product-inspection-modal__section">
        <h3>검사 항목</h3>
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
            title="경화깊이"
            item={caseDepth}
            depthMode="caseDepth"
            heatTreatment={heatTreatment}
            onHeatTreatmentChange={updateHeatTreatment}
            onChange={(patch) => updateDepthItem("caseDepth", patch)}
          />

          <DepthCriterionEditor
            title="유효경화깊이"
            item={effectiveDepth}
            depthMode="effectiveDepth"
            heatTreatment={heatTreatment}
            onHeatTreatmentChange={updateHeatTreatment}
            certificateOutputMode={heatTreatment.certificateOutputMode}
            onChange={(patch) => updateDepthItem("effectiveDepth", patch)}
          />

          <HardnessCriterionEditor
            title="화합물층"
            item={compoundLayer}
            defaultUnit="μm"
            unitOptions={COMPOUND_LAYER_UNITS}
            onChange={(patch) => updateHardnessCriterion("compoundLayer", patch)}
          />
        </div>
      </section>

      <section className="product-inspection-modal__section">
        <h3>{"\uCD94\uAC00 \uAC80\uC0AC \uD56D\uBAA9"}</h3>
        <div className="product-inspection-modal__grid product-inspection-modal__grid--criteria">
          <div className="criteria-depth-block span-2">
            <div className="criteria-depth-block__head">
              <strong>{"\uCE58\uC218\uAC80\uC0AC"}</strong>
              <label className="criteria-depth-block__toggle">
                <input
                  type="checkbox"
                  checked={Boolean(spec.dimension?.enabled)}
                  onChange={(event) => updateSpecSection("dimension", { enabled: event.target.checked })}
                />
                {"\uC0AC\uC6A9"}
              </label>
            </div>
            {spec.dimension?.enabled ? (
              <div className="criteria-depth-block__grid">
                <div className="product-inspection-modal__field span-4">
                  <SecondaryButton type="button" onClick={addDimensionItem}>
                    {"\uD56D\uBAA9 \uCD94\uAC00"}
                  </SecondaryButton>
                </div>
                <table className="erp-table product-spec-table span-4">
                  <thead>
                    <tr>
                      <th>{"\uD56D\uBAA9"}</th>
                      <th>{"\uC2A4\uD399"}</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {(spec.dimension?.items ?? []).map((item, index) => (
                      <tr key={item.id || index}>
                        <td>
                          <input
                            type="text"
                            value={item.label ?? ""}
                            onChange={(event) => updateDimensionItem(index, { label: event.target.value })}
                            placeholder={"\uC678\uACBD"}
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            value={item.spec ?? ""}
                            onChange={(event) => updateDimensionItem(index, { spec: event.target.value })}
                            placeholder="20+-0.02"
                          />
                        </td>
                        <td>
                          <SecondaryButton type="button" onClick={() => removeDimensionItem(index)}>
                            {"\uC0AD\uC81C"}
                          </SecondaryButton>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
          </div>

          <div className="criteria-depth-block span-2">
            <div className="criteria-depth-block__head">
              <strong>{"\uC870\uC9C1\uC0AC\uC9C4"}</strong>
              <label className="criteria-depth-block__toggle">
                <input
                  type="checkbox"
                  checked={Boolean(spec.microstructure?.enabled)}
                  onChange={(event) =>
                    updateSpecSection("microstructure", {
                      enabled: event.target.checked,
                      magnification: spec.microstructure?.magnification ?? DEFAULT_MICROSTRUCTURE_MAGNIFICATION,
                      referencePhotos: event.target.checked
                        ? normalizePhotoSlots(spec.microstructure?.referencePhotos)
                        : [],
                    })
                  }
                />
                {"\uC870\uC9C1\uC0AC\uC9C4 \uC0AC\uC6A9"}
              </label>
            </div>
            {spec.microstructure?.enabled ? (
              <div className="criteria-depth-block__grid">
                <label className="product-inspection-modal__field">
                  <span>기본 배율</span>
                  <select
                    value={spec.microstructure?.magnification ?? DEFAULT_MICROSTRUCTURE_MAGNIFICATION}
                    onChange={(event) =>
                      updateSpecSection("microstructure", {
                        magnification: Number(event.target.value) || DEFAULT_MICROSTRUCTURE_MAGNIFICATION,
                      })
                    }
                  >
                    {MICROSTRUCTURE_MAGNIFICATION_OPTIONS.map((value) => (
                      <option key={value} value={value}>
                        {value}배
                      </option>
                    ))}
                  </select>
                </label>
                <div className="span-4">
                  <MicrostructurePhotoSlots
                    photos={spec.microstructure?.referencePhotos}
                    onChange={(referencePhotos) =>
                      updateSpecSection("microstructure", { referencePhotos })
                    }
                  />
                </div>
                <p className="criteria-preview span-4">
                  {"\uC81C\uD488 Master \uCC38\uC870 \uC774\uBBF8\uC9C0 \u00B7 \uAC80\uC0AC \uB4F1\uB85D \uC2DC \uB3D9\uC77C \uCCA8\uBD80 UI\uB85C \uC2E4\uCE21 \uC0AC\uC9C4 \uC800\uC7A5"}
                </p>
              </div>
            ) : null}
          </div>

          <div className="criteria-depth-block span-2">
            <div className="criteria-depth-block__head">
              <strong>{"\uAE30\uD0C0\uAC80\uC0AC"}</strong>
              <label className="criteria-depth-block__toggle">
                <input
                  type="checkbox"
                  checked={Boolean(spec.other?.enabled)}
                  onChange={(event) => updateSpecSection("other", { enabled: event.target.checked })}
                />
                {"\uC0AC\uC6A9"}
              </label>
            </div>
            {spec.other?.enabled ? (
              <div className="criteria-depth-block__grid">
                <label className="product-inspection-modal__field span-4">
                  <span>{"\uAE30\uD0C0 \uAC80\uC0AC \uAE30\uC900"}</span>
                  <textarea
                    rows={2}
                    value={spec.other?.note ?? ""}
                    onChange={(event) => updateSpecSection("other", { note: event.target.value })}
                    placeholder={"\uCD94\uAC00 \uAC80\uC0AC \uAE30\uC900 \uBA54\uBAA8"}
                  />
                </label>
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}

import { useEffect, useMemo, useState } from "react";
import Input from "../../foundation/components/Input";
import { SecondaryButton } from "../../foundation/components/Button";
import TitanRegisterModal from "../../foundation/components/TitanRegisterModal";
import TitanSearchableSelect from "../../foundation/components/TitanSearchableSelect";
import {
  APPEARANCE_ITEM_KEYS,
  CERTIFICATE_OUTPUT_MODES,
  createEmptyProductRegistration,
  EFFECTIVE_DEPTH_BASIS_OPTIONS,
  HARDNESS_ITEM_KEYS,
  HARDNESS_UNITS,
  normalizeSpecification,
} from "../../utils/productSpecificationModel";
import { getActiveMasterNames } from "../../utils/masterData";
import { getProductionProcessCodes } from "../../config/productionProcessCodes";
import "../../pages/Quality/QualityManagement.css";

const PRODUCT_REGISTER_LABEL = "제품\n등록";

function createDimensionId() {
  return `dim-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export default function ProductRegisterModal({ open, onClose, onRegister, initialData = null }) {
  const [form, setForm] = useState(createEmptyProductRegistration());

  const companyOptions = useMemo(() => getActiveMasterNames("companies"), [open]);
  const processOptions = useMemo(
    () => getProductionProcessCodes().map((item) => item.name),
    [open]
  );

  useEffect(() => {
    if (!open) return;
    if (initialData) {
      setForm({
        ...createEmptyProductRegistration(),
        ...initialData,
        specification: normalizeSpecification(initialData.specification),
      });
      return;
    }
    setForm(createEmptyProductRegistration());
  }, [open, initialData]);

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateSpecSection = (section, patch) => {
    setForm((prev) => ({
      ...prev,
      specification: {
        ...prev.specification,
        [section]: {
          ...prev.specification[section],
          ...patch,
        },
      },
    }));
  };

  const updateHardnessItem = (index, patch) => {
    setForm((prev) => {
      const items = prev.specification.hardness.items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...patch } : item
      );
      return {
        ...prev,
        specification: {
          ...prev.specification,
          hardness: { ...prev.specification.hardness, items },
        },
      };
    });
  };

  const addDimensionItem = () => {
    setForm((prev) => ({
      ...prev,
      specification: {
        ...prev.specification,
        dimension: {
          ...prev.specification.dimension,
          items: [
            ...prev.specification.dimension.items,
            { id: createDimensionId(), label: "", spec: "" },
          ],
        },
      },
    }));
  };

  const updateDimensionItem = (index, patch) => {
    setForm((prev) => {
      const items = prev.specification.dimension.items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...patch } : item
      );
      return {
        ...prev,
        specification: {
          ...prev.specification,
          dimension: { ...prev.specification.dimension, items },
        },
      };
    });
  };

  const removeDimensionItem = (index) => {
    setForm((prev) => ({
      ...prev,
      specification: {
        ...prev.specification,
        dimension: {
          ...prev.specification.dimension,
          items: prev.specification.dimension.items.filter((_, itemIndex) => itemIndex !== index),
        },
      },
    }));
  };

  const updateHeatTreatment = (patch) => {
    setForm((prev) => ({
      ...prev,
      specification: {
        ...prev.specification,
        heatTreatment: {
          ...prev.specification.heatTreatment,
          ...patch,
        },
      },
    }));
  };

  const handleSubmit = () => {
    if (!form.partNo.trim() || !form.partName.trim()) return;
    onRegister({
      ...form,
      specification: normalizeSpecification(form.specification),
    });
    onClose();
  };

  return (
    <TitanRegisterModal
      open={open}
      onClose={onClose}
      onSubmit={handleSubmit}
      kicker="기준정보관리"
      title={PRODUCT_REGISTER_LABEL}
      titleId="product-register-title"
      size="wide"
    >
      <fieldset className="quality-register-fieldset">
        <legend>① 기본정보</legend>
        <div className="titan-modal__grid">
          <TitanSearchableSelect
            className="titan-modal__field"
            label="업체명"
            value={form.company}
            onChange={(value) => updateField("company", value)}
            options={companyOptions}
            placeholder="거래처 선택"
          />
          <label className="titan-modal__field">
            <span>품명</span>
            <Input value={form.partName} onChange={(e) => updateField("partName", e.target.value)} />
          </label>
          <label className="titan-modal__field">
            <span>품번</span>
            <Input value={form.partNo} onChange={(e) => updateField("partNo", e.target.value)} />
          </label>
          <label className="titan-modal__field">
            <span>도번</span>
            <Input value={form.drawingNo} onChange={(e) => updateField("drawingNo", e.target.value)} />
          </label>
          <label className="titan-modal__field">
            <span>재질</span>
            <Input value={form.material} onChange={(e) => updateField("material", e.target.value)} />
          </label>
          <TitanSearchableSelect
            className="titan-modal__field"
            label="열처리 공정"
            value={form.process}
            onChange={(value) => updateField("process", value)}
            options={processOptions}
            placeholder="공정 선택"
          />
          <label className="titan-modal__field titan-modal__field--full">
            <span>비고</span>
            <Input value={form.note} onChange={(e) => updateField("note", e.target.value)} />
          </label>
        </div>
      </fieldset>

      <fieldset className="quality-register-fieldset">
        <legend>② 검사기준 — 외관검사</legend>
        <label className="quality-register-check">
          <input
            type="checkbox"
            checked={form.specification.appearance.enabled}
            onChange={(e) => updateSpecSection("appearance", { enabled: e.target.checked })}
          />
          <span>사용</span>
        </label>
        <div className="quality-register-checks">
          {APPEARANCE_ITEM_KEYS.map((item, index) => (
            <label key={item.key} className="quality-register-check">
              <input
                type="checkbox"
                checked={form.specification.appearance.items[index]?.enabled !== false}
                onChange={(e) => {
                  const items = form.specification.appearance.items.map((row, rowIndex) =>
                    rowIndex === index ? { ...row, enabled: e.target.checked } : row
                  );
                  updateSpecSection("appearance", { items });
                }}
              />
              <span>{item.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="quality-register-fieldset">
        <legend>③ 검사기준 — 경도검사</legend>
        <div className="quality-register-checks">
          <label className="quality-register-check">
            <input
              type="checkbox"
              checked={form.specification.hardness.enabled}
              onChange={(e) => updateSpecSection("hardness", { enabled: e.target.checked })}
            />
            <span>사용</span>
          </label>
          <label className="quality-register-check">
            <span>단위</span>
            <select
              value={form.specification.hardness.unit}
              onChange={(e) => updateSpecSection("hardness", { unit: e.target.value })}
            >
              {HARDNESS_UNITS.map((unit) => (
                <option key={unit} value={unit}>
                  {unit}
                </option>
              ))}
            </select>
          </label>
        </div>
        <table className="erp-table product-spec-table">
          <thead>
            <tr>
              <th>항목</th>
              <th>스펙</th>
              <th>없음</th>
            </tr>
          </thead>
          <tbody>
            {HARDNESS_ITEM_KEYS.map((meta, index) => {
              const item = form.specification.hardness.items[index];
              return (
                <tr key={meta.key}>
                  <td>{meta.label}</td>
                  <td>
                    <Input
                      value={item?.disabled ? "없음" : item?.spec || ""}
                      disabled={item?.disabled}
                      onChange={(e) => updateHardnessItem(index, { spec: e.target.value, disabled: false })}
                      placeholder="예) 550~700"
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      checked={Boolean(item?.disabled)}
                      onChange={(e) =>
                        updateHardnessItem(index, {
                          disabled: e.target.checked,
                          spec: e.target.checked ? "없음" : "",
                        })
                      }
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </fieldset>

      <fieldset className="quality-register-fieldset">
        <legend>④ 검사기준 — 경화곡선 데이터</legend>
        <label className="quality-register-check">
          <input
            type="checkbox"
            checked={form.specification.hardeningDepth?.enabled !== false}
            onChange={(e) => updateSpecSection("hardeningDepth", { enabled: e.target.checked })}
          />
          <span>경화곡선 데이터 사용</span>
        </label>
      </fieldset>

      <fieldset className="quality-register-fieldset">
        <legend>④-1 열처리 계산 · 성적서 출력 (업체+품번)</legend>
        <div className="quality-register-checks quality-register-checks--stack">
          <span className="quality-register-label">유효경화깊이 계산 기준</span>
          {EFFECTIVE_DEPTH_BASIS_OPTIONS.map((option) => (
            <label key={option.value} className="quality-register-check">
              <input
                type="radio"
                name="effectiveDepthBasis"
                checked={form.specification.heatTreatment.effectiveDepthBasis === option.value}
                onChange={() => updateHeatTreatment({ effectiveDepthBasis: option.value })}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
        {form.specification.heatTreatment.effectiveDepthBasis === "specifiedHv" ? (
          <label className="titan-modal__field">
            <span>지정 HV</span>
            <Input
              type="number"
              min={1}
              value={form.specification.heatTreatment.specifiedHv}
              onChange={(e) => updateHeatTreatment({ specifiedHv: e.target.value })}
              placeholder="예) 420, 513, 550"
            />
          </label>
        ) : null}
        <label className="titan-modal__field">
          <span>기본 연마여유 (mm)</span>
          <Input
            type="number"
            min={0}
            step={0.01}
            value={form.specification.heatTreatment.grindingAllowanceMm}
            onChange={(e) => updateHeatTreatment({ grindingAllowanceMm: e.target.value })}
            placeholder="예) 0.10, 0.15, 0.20"
          />
        </label>
        <div className="quality-register-checks quality-register-checks--stack">
          <span className="quality-register-label">성적서·리포트 출력 방식</span>
          {CERTIFICATE_OUTPUT_MODES.map((option) => (
            <label key={option.value} className="quality-register-check">
              <input
                type="radio"
                name="certificateOutputMode"
                checked={form.specification.heatTreatment.certificateOutputMode === option.value}
                onChange={() => updateHeatTreatment({ certificateOutputMode: option.value })}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="quality-register-fieldset">
        <legend>⑤ 검사기준 — 치수검사</legend>
        <div className="quality-register-checks">
          <label className="quality-register-check">
            <input
              type="checkbox"
              checked={form.specification.dimension.enabled}
              onChange={(e) => updateSpecSection("dimension", { enabled: e.target.checked })}
            />
            <span>사용</span>
          </label>
          <span>단위 mm</span>
          <SecondaryButton type="button" onClick={addDimensionItem}>
            항목 추가
          </SecondaryButton>
        </div>
        <table className="erp-table product-spec-table">
          <thead>
            <tr>
              <th>항목</th>
              <th>스펙</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {form.specification.dimension.items.map((item, index) => (
              <tr key={item.id}>
                <td>
                  <Input
                    value={item.label}
                    onChange={(e) => updateDimensionItem(index, { label: e.target.value })}
                    placeholder="예) 외경"
                  />
                </td>
                <td>
                  <Input
                    value={item.spec}
                    onChange={(e) => updateDimensionItem(index, { spec: e.target.value })}
                    placeholder="예) 20±0.02"
                  />
                </td>
                <td>
                  <SecondaryButton type="button" onClick={() => removeDimensionItem(index)}>
                    삭제
                  </SecondaryButton>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </fieldset>

      <fieldset className="quality-register-fieldset">
        <legend>⑥ 조직검사 · ⑦ 기타검사</legend>
        <div className="quality-register-checks">
          <label className="quality-register-check">
            <input
              type="checkbox"
              checked={form.specification.microstructure.enabled}
              onChange={(e) => updateSpecSection("microstructure", { enabled: e.target.checked })}
            />
            <span>조직검사 사용</span>
          </label>
          <label className="quality-register-check">
            <input
              type="checkbox"
              checked={form.specification.other.enabled}
              onChange={(e) => updateSpecSection("other", { enabled: e.target.checked })}
            />
            <span>기타검사 사용</span>
          </label>
        </div>
        <label className="titan-modal__field titan-modal__field--full">
          <span>기타검사 메모</span>
          <textarea
            className="titan-modal__textarea"
            rows={2}
            value={form.specification.other.note}
            onChange={(e) => updateSpecSection("other", { note: e.target.value })}
            placeholder="자유 입력"
          />
        </label>
      </fieldset>
    </TitanRegisterModal>
  );
}

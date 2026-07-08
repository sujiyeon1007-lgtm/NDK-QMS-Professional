import { useEffect, useMemo, useState } from "react";
import TitanRegisterModal from "../../foundation/components/TitanRegisterModal";
import { AWR_STATUS_OPTIONS } from "../../config/actualWorkRecordModel";
import {
  getActualParameterFields,
  getApprovedRecipesForSelection,
  getRecipeById,
} from "../../utils/actualWorkRecordStore";

function buildInitialForm(initialRow) {
  if (initialRow) {
    return {
      recipeId: initialRow.recipeId ?? "",
      lotNo: initialRow.lotNo ?? "",
      mesManagementNo: initialRow.mesManagementNo ?? "",
      equipmentName: initialRow.equipmentName ?? "",
      workerName: initialRow.workerName ?? "",
      chargeStartAt: initialRow.chargeStartAt ?? "",
      chargeEndAt: initialRow.chargeEndAt ?? "",
      workMemo: initialRow.workMemo ?? "",
      status: initialRow.status ?? "in-progress",
      actualParameters: { ...(initialRow.actualParameters ?? {}) },
    };
  }
  return {
    recipeId: "",
    lotNo: "",
    mesManagementNo: "",
    equipmentName: "",
    workerName: "",
    chargeStartAt: "",
    chargeEndAt: "",
    workMemo: "",
    status: "draft",
    actualParameters: {},
  };
}

/**
 * Sprint 9 Phase 3 · 실제 작업 조건 입력 모달
 * 표준 Recipe = 읽기 전용 참조 · 입력 항목은 Template Parameter 자동 생성.
 */
export default function ActualWorkRecordModal({ open, onClose, onSave, mode = "add", initialRow = null }) {
  const [form, setForm] = useState(() => buildInitialForm(initialRow));
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setForm(buildInitialForm(initialRow));
      setError("");
    }
  }, [open, initialRow]);

  const approvedRecipes = useMemo(() => (open ? getApprovedRecipesForSelection() : []), [open]);
  const selectedRecipe = useMemo(
    () => (form.recipeId ? getRecipeById(form.recipeId) : null),
    [form.recipeId]
  );
  const paramSections = useMemo(
    () => (selectedRecipe ? getActualParameterFields(selectedRecipe) : []),
    [selectedRecipe]
  );

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError("");
  };

  const updateParam = (key, value) => {
    setForm((prev) => ({
      ...prev,
      actualParameters: { ...prev.actualParameters, [key]: value },
    }));
  };

  const handleSubmit = () => {
    if (!form.recipeId) {
      setError("표준 Recipe(Approved)를 선택하세요.");
      return;
    }
    if (!form.lotNo.trim()) {
      setError("LOT.NO는 필수입니다.");
      return;
    }
    onSave(form);
  };

  if (!open) return null;

  return (
    <TitanRegisterModal
      open={open}
      onClose={onClose}
      onSubmit={handleSubmit}
      kicker="실제 작업 조건"
      title={mode === "edit" ? "실제 작업 조건 수정" : "실제 작업 조건 등록"}
      submitLabel={mode === "edit" ? "수정" : "등록"}
    >
      {error ? (
        <p className="master-register-modal__error" role="alert">
          {error}
        </p>
      ) : null}

      <div className="awr-modal__section">
        <h4 className="awr-modal__subtitle">표준 Recipe 참조 (읽기 전용)</h4>
        <div className="master-register-modal__grid">
          <label className="master-register-modal__field span-2">
            <span>표준 Recipe (Approved) *</span>
            <select
              value={form.recipeId}
              onChange={(event) => updateField("recipeId", event.target.value)}
              disabled={mode === "edit"}
            >
              <option value="">선택</option>
              {approvedRecipes.map((recipe) => (
                <option key={recipe.id} value={recipe.id}>
                  {recipe.name} · {recipe.code} · {recipe.versionNo}
                </option>
              ))}
            </select>
          </label>
          {selectedRecipe ? (
            <div className="awr-modal__ref span-2">
              공정 <strong>{selectedRecipe.processName || "—"}</strong> · 재질{" "}
              <strong>{selectedRecipe.materialName || "—"}</strong> · Version{" "}
              <strong>{selectedRecipe.versionNo || "V1"}</strong>
              <em> — 표준 Recipe는 수정되지 않습니다.</em>
            </div>
          ) : null}
        </div>
      </div>

      <div className="awr-modal__section">
        <h4 className="awr-modal__subtitle">작업 정보</h4>
        <div className="master-register-modal__grid">
          <label className="master-register-modal__field">
            <span>LOT.NO *</span>
            <input
              type="text"
              value={form.lotNo}
              onChange={(event) => updateField("lotNo", event.target.value)}
              placeholder="예) LOT-20260708-001"
            />
          </label>
          <label className="master-register-modal__field">
            <span>관리번호</span>
            <input
              type="text"
              value={form.mesManagementNo}
              onChange={(event) => updateField("mesManagementNo", event.target.value)}
              placeholder="예) DL260708-004"
            />
          </label>
          <label className="master-register-modal__field">
            <span>설비</span>
            <input
              type="text"
              value={form.equipmentName}
              onChange={(event) => updateField("equipmentName", event.target.value)}
              placeholder="예) 3S-1"
            />
          </label>
          <label className="master-register-modal__field">
            <span>작업자</span>
            <input
              type="text"
              value={form.workerName}
              onChange={(event) => updateField("workerName", event.target.value)}
              placeholder="예) 김작업"
            />
          </label>
          <label className="master-register-modal__field">
            <span>장입 시작</span>
            <input
              type="text"
              value={form.chargeStartAt}
              onChange={(event) => updateField("chargeStartAt", event.target.value)}
              placeholder="예) 2026-07-08 09:00"
            />
          </label>
          <label className="master-register-modal__field">
            <span>장입 종료</span>
            <input
              type="text"
              value={form.chargeEndAt}
              onChange={(event) => updateField("chargeEndAt", event.target.value)}
              placeholder="예) 2026-07-08 15:00"
            />
          </label>
          <label className="master-register-modal__field">
            <span>상태</span>
            <select value={form.status} onChange={(event) => updateField("status", event.target.value)}>
              {AWR_STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
          <label className="master-register-modal__field span-2">
            <span>작업 메모</span>
            <textarea
              rows={2}
              value={form.workMemo}
              onChange={(event) => updateField("workMemo", event.target.value)}
              placeholder="현장 특이사항"
            />
          </label>
        </div>
      </div>

      <div className="awr-modal__section">
        <h4 className="awr-modal__subtitle">실제 작업 조건 (작업자 입력)</h4>
        {selectedRecipe ? (
          paramSections.map((section) => (
            <div key={section.id} className="awr-modal__param-group">
              <h5 className="awr-modal__param-title">{section.label}</h5>
              <div className="master-register-modal__grid">
                {section.fields.map((field) => (
                  <label key={field.key} className="master-register-modal__field">
                    <span>
                      {field.label}
                      {field.unit ? ` (${field.unit})` : ""}
                      {field.required ? " *" : ""}
                    </span>
                    <input
                      type="text"
                      value={form.actualParameters[field.key] ?? ""}
                      onChange={(event) => updateParam(field.key, event.target.value)}
                      placeholder={
                        field.standardValue ? `표준 ${field.standardValue}` : "실제 사용값"
                      }
                    />
                  </label>
                ))}
              </div>
            </div>
          ))
        ) : (
          <p className="awr-modal__hint">표준 Recipe를 선택하면 공정별 입력 항목이 자동 생성됩니다.</p>
        )}
      </div>
    </TitanRegisterModal>
  );
}

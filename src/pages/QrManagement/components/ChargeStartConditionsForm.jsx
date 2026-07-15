import { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from "react";

import {
  buildEmptyChargeWorkConditions,
  getChargeWorkConditionFields,
  normalizeRecipeParameters,
  resolveChargeWorkConditionProfileId,
} from "../../../config/recipeTemplateEngine";
import { getApprovedRecipesForSelection, getRecipeById } from "../../../utils/actualWorkRecordStore";
import { getActiveWorkers } from "../../../utils/masterData";
import { getCurrentTitanUser } from "../../../utils/titanHistorySession";
import "./EquipmentChargingWorkflowContent.css";

const RECIPE_DIRECT_INPUT = "__direct__";

function filterRecipesByProcess(recipes, processName) {
  const norm = String(processName ?? "").replace(/\s+/g, "");
  if (!norm) return recipes;
  const matched = recipes.filter(
    (recipe) => String(recipe.processName ?? "").replace(/\s+/g, "") === norm
  );
  return matched.length > 0 ? matched : recipes;
}

function resolveDefaultWorker(workers, currentUser) {
  const user = String(currentUser ?? "").trim();
  if (!user) return workers[0]?.name ?? "";
  return workers.some((row) => row.name === user) ? user : workers[0]?.name ?? user;
}

const ChargeStartConditionsForm = forwardRef(function ChargeStartConditionsForm(
  { processName = "", lotSummary = "", enabled = true, compact = false },
  ref
) {
  const [worker, setWorker] = useState("");
  const [recipeSelectValue, setRecipeSelectValue] = useState("");
  const [recipeCustomText, setRecipeCustomText] = useState("");
  const [conditions, setConditions] = useState({});
  const [error, setError] = useState("");

  const conditionFields = useMemo(
    () => getChargeWorkConditionFields(processName),
    [processName]
  );

  const conditionProfileId = useMemo(
    () => resolveChargeWorkConditionProfileId(processName),
    [processName]
  );

  const workerOptions = useMemo(() => (enabled ? getActiveWorkers() : []), [enabled]);

  const recipeOptions = useMemo(() => {
    if (!enabled) return [];
    return filterRecipesByProcess(getApprovedRecipesForSelection(), processName);
  }, [enabled, processName]);

  const isDirectRecipe = recipeSelectValue === RECIPE_DIRECT_INPUT;

  useEffect(() => {
    if (!enabled) return;
    const workers = getActiveWorkers();
    setWorker(resolveDefaultWorker(workers, getCurrentTitanUser()));
    setRecipeSelectValue("");
    setRecipeCustomText("");
    setConditions(buildEmptyChargeWorkConditions(processName));
    setError("");
  }, [enabled, processName]);

  const applyRecipeToConditions = (recipe) => {
    if (!recipe) {
      setConditions(buildEmptyChargeWorkConditions(processName));
      return;
    }
    const params = normalizeRecipeParameters(recipe);
    const next = buildEmptyChargeWorkConditions(processName);
    conditionFields.forEach((field) => {
      const value = params[field.key];
      if (value != null && String(value).trim()) {
        next[field.key] = String(value).trim();
      }
    });
    setConditions(next);
  };

  const handleRecipeSelectChange = (nextValue) => {
    setRecipeSelectValue(nextValue);
    setError("");

    if (nextValue === RECIPE_DIRECT_INPUT) {
      setRecipeCustomText("");
      setConditions(buildEmptyChargeWorkConditions(processName));
      return;
    }

    setRecipeCustomText("");
    const recipe = nextValue ? getRecipeById(nextValue) : null;
    applyRecipeToConditions(recipe);
  };

  const updateCondition = (key, value) => {
    setConditions((prev) => ({ ...prev, [key]: value }));
    setError("");
  };

  const validate = () => {
    if (!String(worker ?? "").trim()) {
      const message = "담당자를 선택하세요.";
      setError(message);
      return { ok: false, message };
    }

    const recipeId = !isDirectRecipe && recipeSelectValue ? recipeSelectValue : "";
    const recipeName = isDirectRecipe ? String(recipeCustomText ?? "").trim() : "";

    return {
      ok: true,
      payload: {
        chargeStartConfirmed: true,
        operator: String(worker).trim(),
        recipeId: recipeId || undefined,
        recipeName: recipeName || undefined,
        workConditions: conditions,
      },
    };
  };

  useImperativeHandle(
    ref,
    () => ({ validate }),
    [worker, recipeSelectValue, recipeCustomText, isDirectRecipe, conditions]
  );

  if (!enabled) return null;

  return (
    <div
      className={`charge-start-form${compact ? " charge-start-form--compact" : ""}`}
      aria-label="장입 시작 운전조건"
    >
      {error ? (
        <p className="charge-start-modal__error" role="alert">
          {error}
        </p>
      ) : null}

      {lotSummary ? (
        <p className="charge-start-modal__lot-summary">
          장입 대상 <strong>{lotSummary}</strong>
          {processName ? (
            <>
              {" "}
              · 공정 <strong>{processName}</strong>
            </>
          ) : null}
        </p>
      ) : null}

      <div className="charge-start-modal__section">
        <h4 className="charge-start-modal__subtitle">작업 정보</h4>
        <div className="master-register-modal__grid">
          <label className="master-register-modal__field">
            <span>담당자 *</span>
            <select
              className="titan-input"
              value={worker}
              onChange={(event) => {
                setWorker(event.target.value);
                setError("");
              }}
            >
              <option value="">작업자 선택</option>
              {workerOptions.map((row) => (
                <option key={row.id ?? row.name} value={row.name}>
                  {row.name}
                  {row.department ? ` · ${row.department}` : ""}
                </option>
              ))}
            </select>
          </label>
          <label className="master-register-modal__field span-2">
            <span>Recipe</span>
            <select
              className="titan-input"
              value={recipeSelectValue}
              onChange={(event) => handleRecipeSelectChange(event.target.value)}
            >
              <option value="">Recipe 선택 (선택)</option>
              {recipeOptions.map((recipe) => (
                <option key={recipe.id} value={recipe.id}>
                  {recipe.name} · {recipe.code} · {recipe.versionNo || "V1"}
                </option>
              ))}
              <option value={RECIPE_DIRECT_INPUT}>직접 입력</option>
            </select>
          </label>
          {isDirectRecipe ? (
            <label className="master-register-modal__field span-2">
              <span>Recipe 직접 입력</span>
              <input
                className="titan-input"
                type="text"
                value={recipeCustomText}
                onChange={(event) => {
                  setRecipeCustomText(event.target.value);
                  setError("");
                }}
                placeholder="Recipe 명칭 입력"
              />
            </label>
          ) : null}
        </div>
      </div>

      <div className="charge-start-modal__section">
        <h4 className="charge-start-modal__subtitle">
          운전조건
          <span className="charge-start-modal__profile">
            {conditionProfileId === "ion" ? "이온질화" : "가스계"}
          </span>
        </h4>
        <div className="charge-start-modal__conditions-grid">
          {conditionFields.map((field) => (
            <label key={field.key} className="master-register-modal__field">
              <span>
                {field.label}
                {field.unit ? ` (${field.unit})` : ""}
              </span>
              <input
                className="titan-input"
                type={field.inputType === "number" ? "number" : "text"}
                inputMode={field.inputType === "number" ? "decimal" : undefined}
                value={conditions[field.key] ?? ""}
                onChange={(event) => updateCondition(field.key, event.target.value)}
                placeholder={field.unit ? `예: ${field.unit}` : ""}
              />
            </label>
          ))}
        </div>
      </div>
    </div>
  );
});

export default ChargeStartConditionsForm;

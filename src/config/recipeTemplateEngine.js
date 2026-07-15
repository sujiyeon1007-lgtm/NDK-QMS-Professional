/**
 * Sprint 9 Phase 2 Revision — Recipe Template Engine (SSoT)
 *
 * Blueprint §5.3.0 — Recipe → Process → Recipe Template → Parameter
 *
 * Parameter는 UI/페이지에 하드코딩하지 않습니다.
 * Template 정의를 기반으로 Workspace 필드가 자동 생성됩니다.
 *
 * Code SSoT: `src/config/recipeTemplateEngine.js`
 */

/** @typedef {'active' | 'planned'} RecipeTemplateStatus */

/**
 * @typedef {object} RecipeTemplateParameter
 * @property {string} key
 * @property {string} label
 * @property {string} [unit]
 * @property {boolean} [required]
 */

/**
 * @typedef {object} RecipeTemplateSection
 * @property {string} id
 * @property {string} label
 * @property {RecipeTemplateParameter[]} parameters
 */

/**
 * @typedef {object} RecipeTemplateDefinition
 * @property {string} id
 * @property {string} label
 * @property {RecipeTemplateStatus} status
 * @property {string[]} processNames
 * @property {string[]} processIds
 * @property {RecipeTemplateSection[]} sections
 */

/** 이온질화 Template — PM 확정 · Active */
export const ION_NITRIDING_TEMPLATE = {
  id: "ion-nitriding",
  label: "Ion Nitriding Template (이온질화)",
  status: "active",
  processNames: ["이온질화"],
  processIds: ["h2", "HT-IN"],
  sections: [
    {
      id: "electrical",
      label: "방전 조건",
      parameters: [
        { key: "dischargeCurrent", label: "방전전류", unit: "A" },
        { key: "dischargeVoltage", label: "방전전압", unit: "V" },
      ],
    },
    {
      id: "process",
      label: "처리 조건",
      parameters: [
        { key: "processPressure", label: "처리압력", unit: "bar", required: true },
        { key: "treatmentTemp", label: "처리온도", unit: "℃", required: true },
        { key: "treatmentTime", label: "처리시간", unit: "min", required: true },
      ],
    },
    {
      id: "atmosphere",
      label: "가스 조건",
      parameters: [
        { key: "nitrogen", label: "질소", unit: "L/min" },
        { key: "hydrogen", label: "수소", unit: "L/min" },
        { key: "argon", label: "아르곤", unit: "L/min" },
        { key: "x2", label: "X2", unit: "" },
      ],
    },
  ],
};

/** 연질화 Template — PM 확정 · Active */
export const SOFT_NITRIDING_TEMPLATE = {
  id: "soft-nitriding",
  label: "Soft Nitriding Template (연질화)",
  status: "active",
  processNames: ["연질화"],
  processIds: ["h2b", "HT-SOFT"],
  sections: [
    {
      id: "process",
      label: "처리 조건",
      parameters: [
        { key: "treatmentTemp", label: "처리온도", unit: "℃", required: true },
        { key: "treatmentTime", label: "처리시간", unit: "min", required: true },
      ],
    },
    {
      id: "atmosphere",
      label: "가스 조건",
      parameters: [
        { key: "co2", label: "CO₂", unit: "%" },
        { key: "nitrogen", label: "질소", unit: "L/min" },
        { key: "ammonia", label: "암모니아", unit: "L/min" },
      ],
    },
  ],
};

/** 가스질화 Template — Blueprint 준비 · Planned (향후 Template 추가) */
export const GAS_NITRIDING_TEMPLATE = {
  id: "gas-nitriding",
  label: "Gas Nitriding Template (가스질화)",
  status: "planned",
  processNames: ["가스질화"],
  processIds: ["h1", "HT-GN"],
  sections: [
    {
      id: "process",
      label: "처리 조건 (Blueprint)",
      parameters: [
        { key: "treatmentTemp", label: "처리온도", unit: "℃", required: true },
        { key: "treatmentTime", label: "처리시간", unit: "min", required: true },
        { key: "endogas", label: "Endogas", unit: "%" },
        { key: "ammonia", label: "암모니아", unit: "L/min" },
      ],
    },
  ],
};

/** 산질화 Template — Blueprint 준비 · Planned (향후 Template 추가) */
export const SALT_BATH_NITRIDING_TEMPLATE = {
  id: "salt-bath-nitriding",
  label: "Salt Bath Nitriding Template (산질화)",
  status: "planned",
  processNames: ["염욕질화", "산질화"],
  processIds: ["h3", "HT-SB"],
  sections: [
    {
      id: "process",
      label: "처리 조건 (Blueprint)",
      parameters: [
        { key: "bathTemp", label: "욕조온도", unit: "℃", required: true },
        { key: "treatmentTime", label: "처리시간", unit: "min", required: true },
        { key: "saltType", label: "염욕 종류", unit: "" },
      ],
    },
  ],
};

/** 전체 Template Registry — Template 추가 = Registry 등록만 (화면 수정 ❌) */
export const RECIPE_TEMPLATE_REGISTRY = [
  ION_NITRIDING_TEMPLATE,
  SOFT_NITRIDING_TEMPLATE,
  GAS_NITRIDING_TEMPLATE,
  SALT_BATH_NITRIDING_TEMPLATE,
];

const LEGACY_PARAMETER_ALIASES = {
  holdTimeMin: "treatmentTime",
  totalCycleMin: "treatmentTime",
  pressure: "processPressure",
  atmosphere: "nitrogen",
};

function hasText(value) {
  return String(value ?? "").trim().length > 0;
}

function normKey(value) {
  return String(value ?? "").trim().toLowerCase();
}

export function getRecipeTemplateById(templateId) {
  if (!templateId) return null;
  return RECIPE_TEMPLATE_REGISTRY.find((tpl) => tpl.id === templateId) ?? null;
}

export function getActiveRecipeTemplates() {
  return RECIPE_TEMPLATE_REGISTRY.filter((tpl) => tpl.status === "active");
}

export function getPlannedRecipeTemplates() {
  return RECIPE_TEMPLATE_REGISTRY.filter((tpl) => tpl.status === "planned");
}

export function resolveRecipeTemplate(recipe) {
  if (!recipe) return null;
  const byId = getRecipeTemplateById(recipe.templateId);
  if (byId) return byId;

  const processName = normKey(recipe.processName);
  const processId = normKey(recipe.processId);
  const processCode = normKey(recipe.processCode);

  return (
    RECIPE_TEMPLATE_REGISTRY.find((tpl) => {
      const nameMatch = tpl.processNames.some((name) => normKey(name) === processName);
      const idMatch = tpl.processIds.some(
        (id) => normKey(id) === processId || normKey(id) === processCode
      );
      return nameMatch || idMatch;
    }) ?? null
  );
}

export function resolveRecipeTemplateId(recipe) {
  return resolveRecipeTemplate(recipe)?.id ?? "";
}

/** Legacy flat 필드 → parameters 객체 병합 (하위 호환) */
export function normalizeRecipeParameters(recipe) {
  const base =
    recipe?.parameters && typeof recipe.parameters === "object" ? { ...recipe.parameters } : {};

  Object.entries(LEGACY_PARAMETER_ALIASES).forEach(([legacyKey, paramKey]) => {
    if (!hasText(base[paramKey]) && hasText(recipe?.[legacyKey])) {
      base[paramKey] = String(recipe[legacyKey]).trim();
    }
  });

  if (!hasText(base.treatmentTemp) && hasText(recipe?.treatmentTemp)) {
    base.treatmentTemp = String(recipe.treatmentTemp).trim();
  }
  if (!hasText(base.treatmentTime) && hasText(recipe?.holdTimeMin)) {
    base.treatmentTime = String(recipe.holdTimeMin).trim();
  }
  if (!hasText(base.processPressure) && hasText(recipe?.pressure)) {
    base.processPressure = String(recipe.pressure).trim();
  }

  return base;
}

export function normalizeRecipeRecord(recipe) {
  if (!recipe) return recipe;
  const template = resolveRecipeTemplate(recipe);
  return {
    ...recipe,
    templateId: recipe.templateId || template?.id || "",
    parameters: normalizeRecipeParameters(recipe),
  };
}

export function getRequiredParameterKeys(template) {
  if (!template) return [];
  return template.sections.flatMap((section) =>
    section.parameters.filter((param) => param.required).map((param) => param.key)
  );
}

export function getMissingRequiredParameters(recipe, template = resolveRecipeTemplate(recipe)) {
  if (!template || template.status !== "active") {
    return getRequiredParameterKeys(template);
  }
  const params = normalizeRecipeParameters(recipe);
  return getRequiredParameterKeys(template).filter((key) => !hasText(params[key]));
}

export function getRecipeParameterValue(recipe, key) {
  const params = normalizeRecipeParameters(recipe);
  return params[key] ?? "";
}

export function formatRecipeParameterDisplay(value, unit) {
  if (!hasText(value)) return "—";
  const text = String(value).trim();
  return unit ? `${text} ${unit}` : text;
}

/**
 * Workspace 「공정 조건」탭 표시 모델 — Template 기반 자동 생성
 * @returns {{ template: RecipeTemplateDefinition|null, sections: Array, isPlanned: boolean, missingRequired: string[] }}
 */
export function buildRecipeTemplateView(recipe) {
  const template = resolveRecipeTemplate(recipe);
  if (!template) {
    return {
      template: null,
      templateLabel: "—",
      sections: [],
      isPlanned: false,
      missingRequired: [],
    };
  }

  const params = normalizeRecipeParameters(recipe);
  const missingRequired = getMissingRequiredParameters(recipe, template);

  const sections = template.sections.map((section) => ({
    id: section.id,
    label: section.label,
    fields: section.parameters.map((param) => ({
      key: param.key,
      label: param.label,
      unit: param.unit ?? "",
      required: Boolean(param.required),
      value: formatRecipeParameterDisplay(params[param.key], param.unit),
      rawValue: params[param.key] ?? "",
    })),
  }));

  return {
    template,
    templateLabel: template.label,
    sections,
    isPlanned: template.status === "planned",
    missingRequired,
  };
}

export function getRecipeRepresentativeSummary(recipe) {
  const params = normalizeRecipeParameters(recipe);
  const temp = params.treatmentTemp;
  const time = params.treatmentTime;
  return {
    treatmentTemp: hasText(temp) ? `${temp}℃` : "—",
    treatmentTime: hasText(time) ? `${time} min` : "—",
  };
}

/**
 * @typedef {object} ChargeWorkConditionField
 * @property {string} key — Recipe Template parameter key (workConditions / actualParameters)
 * @property {string} label
 * @property {string} [unit]
 * @property {boolean} [required]
 */

/** RC1 — 장입 시작 운전조건 · 이온질화 (Recipe Template key 정렬) */
export const CHARGE_WORK_CONDITION_ION_FIELDS = [
  { key: "treatmentTemp", label: "온도", unit: "℃" },
  { key: "treatmentTime", label: "시간", unit: "h" },
  { key: "processPressure", label: "압력", unit: "Pa/mbar" },
  { key: "dischargeVoltage", label: "방전전압", unit: "V" },
  { key: "dischargeCurrent", label: "전류", unit: "A" },
  { key: "hydrogen", label: "수소", unit: "H₂", inputType: "number" },
  { key: "ammonia", label: "암모니아", unit: "NH₃", inputType: "number" },
  { key: "argon", label: "아르곤", unit: "Ar", inputType: "number" },
  { key: "x2", label: "X GAS", unit: "", inputType: "number" },
];

/** RC1 — 장입 시작 운전조건 · 연질화 / 가스질화 (Recipe Template key 정렬) */
export const CHARGE_WORK_CONDITION_GAS_FIELDS = [
  { key: "treatmentTemp", label: "온도", unit: "℃" },
  { key: "treatmentTime", label: "시간", unit: "h" },
  { key: "ammonia", label: "암모니아", unit: "NH₃", inputType: "number" },
  { key: "nitrogen", label: "질소", unit: "N₂", inputType: "number" },
  { key: "co2", label: "CO₂", unit: "", inputType: "number" },
];

const CHARGE_WORK_CONDITION_PROCESS_GROUPS = {
  ion: ["이온질화"],
  gas: ["연질화", "가스질화", "가스연질화"],
};

/**
 * 설비 공정명 → Recipe Template (향후 Recipe Master 연동용)
 * @param {string} processName
 * @returns {RecipeTemplateDefinition|null}
 */
export function resolveRecipeTemplateByProcessName(processName) {
  const norm = normKey(processName);
  if (!norm) return null;
  return (
    RECIPE_TEMPLATE_REGISTRY.find((tpl) =>
      tpl.processNames.some((name) => normKey(name) === norm)
    ) ?? null
  );
}

/**
 * 장입 시작 운전조건 프로필 — ion | gas
 * @param {string} processName
 * @returns {"ion"|"gas"}
 */
export function resolveChargeWorkConditionProfileId(processName) {
  const norm = normKey(processName);
  if (CHARGE_WORK_CONDITION_PROCESS_GROUPS.ion.some((name) => normKey(name) === norm)) {
    return "ion";
  }
  if (CHARGE_WORK_CONDITION_PROCESS_GROUPS.gas.some((name) => normKey(name) === norm)) {
    return "gas";
  }
  const template = resolveRecipeTemplateByProcessName(processName);
  if (template?.id === ION_NITRIDING_TEMPLATE.id) return "ion";
  if (
    template?.id === SOFT_NITRIDING_TEMPLATE.id ||
    template?.id === GAS_NITRIDING_TEMPLATE.id
  ) {
    return "gas";
  }
  return "gas";
}

/**
 * 장입 시작 팝업 운전조건 필드 (공정별 자동 전환)
 * @param {string} processName — 설비 process (이온질화 · 가스질화 · 가스연질화 …)
 * @returns {ChargeWorkConditionField[]}
 */
export function getChargeWorkConditionFields(processName) {
  return resolveChargeWorkConditionProfileId(processName) === "ion"
    ? CHARGE_WORK_CONDITION_ION_FIELDS
    : CHARGE_WORK_CONDITION_GAS_FIELDS;
}

/** @returns {Record<string, string>} */
export function buildEmptyChargeWorkConditions(processName) {
  return Object.fromEntries(
    getChargeWorkConditionFields(processName).map((field) => [field.key, ""])
  );
}

export default {
  RECIPE_TEMPLATE_REGISTRY,
  ION_NITRIDING_TEMPLATE,
  SOFT_NITRIDING_TEMPLATE,
  GAS_NITRIDING_TEMPLATE,
  SALT_BATH_NITRIDING_TEMPLATE,
  resolveRecipeTemplate,
  resolveRecipeTemplateByProcessName,
  getChargeWorkConditionFields,
  buildEmptyChargeWorkConditions,
  buildRecipeTemplateView,
  normalizeRecipeRecord,
};

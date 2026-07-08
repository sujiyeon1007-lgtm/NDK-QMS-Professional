/**
 * Sprint 9 Phase 2 Revision — 열처리 Recipe Master (Template Engine 연동)
 *
 * Blueprint §3.3 · §5.3 · §5.3.0 · §8
 */

import { RECIPE_STATUS_LABELS } from "../config/recipeDetailSections";
import {
  buildRecipeTemplateView,
  getMissingRequiredParameters,
  getRecipeParameterValue,
  getRecipeRepresentativeSummary,
  normalizeRecipeRecord,
  resolveRecipeTemplate,
} from "../config/recipeTemplateEngine";
import { getMasterDataByCategory } from "./masterData";
import { getSessionProductionRecords } from "./productionRecords";
import { resolveRecordCurrentProcess } from "./workflowProcessStatus";
import { getRecordWorkflowState } from "./ndkWorkflow";
import { getAllMasterImportLogs } from "./masterExcelImportLog";

function hasText(value) {
  return String(value ?? "").trim().length > 0;
}

function pad2(value) {
  return String(value).padStart(2, "0");
}

function normKey(value) {
  return String(value ?? "").trim().toLowerCase();
}

function statusLabel(status) {
  return RECIPE_STATUS_LABELS[status] ?? status ?? "—";
}

export function activeRecipes() {
  return getMasterDataByCategory("recipes")
    .filter((row) => row.isDeleted !== true)
    .map((row) => normalizeRecipeRecord(row));
}

function recipeMaterialKey(recipe) {
  return normKey(recipe?.materialName || recipe?.materialId);
}

function recipeProcessKey(recipe) {
  return normKey(recipe?.processName || recipe?.processId);
}

function matchesMaterial(productMaterial, recipe) {
  const pm = normKey(productMaterial);
  const rm = recipeMaterialKey(recipe);
  if (!pm || !rm) return false;
  return pm === rm || pm.includes(rm) || rm.includes(pm);
}

function matchesProcess(productProcess, recipe) {
  const pp = normKey(productProcess);
  const rp = recipeProcessKey(recipe);
  if (!pp || !rp) return false;
  return pp === rp || pp.includes(rp) || rp.includes(pp);
}

function connectedEquipment(recipe) {
  const all = getMasterDataByCategory("equipment").filter((row) => row.active !== false);
  const ids = new Set((recipe?.equipmentIds ?? []).map(String));
  const names = new Set((recipe?.equipmentNames ?? []).map((n) => normKey(n)));
  return all.filter(
    (eq) =>
      ids.has(String(eq.id)) ||
      names.has(normKey(eq.name)) ||
      names.has(normKey(eq.code))
  );
}

function connectedProducts(recipe) {
  return getMasterDataByCategory("products")
    .filter(
      (p) =>
        p.active !== false &&
        matchesMaterial(p.material, recipe) &&
        (matchesProcess(p.process, recipe) || !hasText(p.process))
    )
    .sort((a, b) => String(a.name).localeCompare(String(b.name)));
}

function connectedLots(recipe) {
  const treatmentTemp = Number(getRecipeParameterValue(recipe, "treatmentTemp"));
  const holdTimeMin = Number(getRecipeParameterValue(recipe, "treatmentTime"));
  return getSessionProductionRecords()
    .filter((record) => {
      if (!hasText(record.lotNo)) return false;
      const ht = record.heatTreatment ?? record.process ?? "";
      return matchesProcess(ht, recipe) || matchesMaterial(record.material, recipe);
    })
    .map((record) => {
      const actualTemp = record.actualTreatmentTemp ?? record.treatmentTemp ?? "—";
      const actualTime = record.actualHoldTimeMin ?? record.holdTimeMin ?? "—";
      let deviation = "—";
      const tempNum = Number(actualTemp);
      const timeNum = Number(actualTime);
      if (!Number.isNaN(tempNum) && !Number.isNaN(treatmentTemp) && treatmentTemp > 0) {
        const diff = tempNum - treatmentTemp;
        deviation = diff === 0 ? "정상" : `${diff > 0 ? "+" : ""}${diff}℃`;
      } else if (!Number.isNaN(timeNum) && !Number.isNaN(holdTimeMin) && holdTimeMin > 0) {
        const diff = timeNum - holdTimeMin;
        deviation = diff === 0 ? "정상" : `${diff > 0 ? "+" : ""}${diff}min`;
      }
      return {
        id: record.id,
        lotNo: record.lotNo,
        partNo: record.partNo || "—",
        treatmentTemp: String(actualTemp),
        holdTimeMin: String(actualTime),
        deviation,
        status: getRecordWorkflowState(record) || resolveRecordCurrentProcess(record)?.label || "—",
      };
    })
    .sort((a, b) => String(b.lotNo).localeCompare(String(a.lotNo)))
    .slice(0, 20);
}

function recipeContext(recipe) {
  const normalized = normalizeRecipeRecord(recipe);
  const template = resolveRecipeTemplate(normalized);
  const equipment = connectedEquipment(normalized);
  const products = connectedProducts(normalized);
  const missingRequired = getMissingRequiredParameters(normalized, template);
  const hasRequiredParams = template?.status === "planned" ? true : missingRequired.length === 0;
  return {
    equipmentCount: equipment.length,
    productCount: products.length,
    hasRequiredParams,
    missingRequired,
    template,
    status: normalized?.status ?? "Draft",
  };
}

export function getRecipeHealth(recipe, ctx = {}) {
  const status = ctx.status ?? recipe?.status ?? "Draft";
  if (!ctx.hasRequiredParams || status === "Obsolete") {
    return { status: "error", label: "관리 필요", icon: "🔴" };
  }
  if (status === "Draft" || status === "Review" || !ctx.equipmentCount || !ctx.productCount) {
    return { status: "warn", label: "확인 필요", icon: "🟡" };
  }
  if (status === "Approved" && ctx.equipmentCount && ctx.hasRequiredParams && ctx.productCount) {
    return { status: "ok", label: "정상", icon: "🟢" };
  }
  return { status: "warn", label: "확인 필요", icon: "🟡" };
}

export function buildRecipeMasterSummary() {
  try {
    const all = activeRecipes();
    const approved = all.filter((row) => row.status === "Approved");
    const pending = all.filter((row) => row.status === "Draft" || row.status === "Review");
    let needsCare = 0;
    all.forEach((recipe) => {
      const ctx = recipeContext(recipe);
      if (getRecipeHealth(recipe, ctx).status === "error") needsCare += 1;
    });
    return [
      { id: "total", label: "전체 Recipe", value: all.length, unit: "건" },
      { id: "approved", label: "Approved", value: approved.length, unit: "건" },
      { id: "pending", label: "Draft · Review", value: pending.length, unit: "건" },
      {
        id: "needs-care",
        label: "관리 필요",
        value: needsCare,
        unit: "건",
        tone: needsCare > 0 ? "danger" : undefined,
      },
    ];
  } catch (error) {
    if (import.meta.env?.DEV) console.error("[buildRecipeMasterSummary]", error);
    return [
      { id: "total", label: "전체 Recipe", value: 0, unit: "건" },
      { id: "approved", label: "Approved", value: 0, unit: "건" },
      { id: "pending", label: "Draft · Review", value: 0, unit: "건" },
      { id: "needs-care", label: "관리 필요", value: 0, unit: "건" },
    ];
  }
}

export function buildRecipeListMeta() {
  const meta = new Map();
  try {
    activeRecipes().forEach((recipe) => {
      const ctx = recipeContext(recipe);
      const health = getRecipeHealth(recipe, ctx);
      meta.set(recipe.id, {
        productCount: ctx.productCount,
        healthStatus: health.status,
        healthLabel: health.label,
        healthIcon: health.icon,
        statusLabel: statusLabel(recipe.status),
      });
    });
  } catch (error) {
    if (import.meta.env?.DEV) console.error("[buildRecipeListMeta]", error);
  }
  return meta;
}

function buildRecentUpdates(recipe, limit = 12) {
  const rows = [];
  let logs = {};
  try {
    logs = getAllMasterImportLogs() ?? {};
  } catch {
    logs = {};
  }
  Object.values(logs)
    .filter((log) => log && (log.masterType === "recipes" || log.masterType === "recipe"))
    .forEach((log) => {
      const dt = log.datetime ? new Date(log.datetime) : null;
      const valid = dt && !Number.isNaN(dt.getTime());
      rows.push({
        id: log.id ?? `recipe-${log.datetime}`,
        sort: valid ? dt.getTime() : 0,
        date: valid
          ? `${dt.getFullYear()}-${pad2(dt.getMonth() + 1)}-${pad2(dt.getDate())}`
          : "—",
        time: valid ? `${pad2(dt.getHours())}:${pad2(dt.getMinutes())}` : "--:--",
        type: "Import",
        label: `Recipe Excel Import${log.fileName ? ` · ${log.fileName}` : ""}`,
        user: log.user || "시스템",
      });
    });

  if (recipe?.approvedDate && recipe?.status === "Approved") {
    rows.push({
      id: `appr-${recipe.id}`,
      sort: Date.parse(recipe.approvedDate) || 0,
      date: recipe.approvedDate,
      time: "--:--",
      type: "승인",
      label: `${recipe.versionNo || "V1"} Approved · ${recipe.reviewComment || ""}`.trim(),
      user: recipe.approvedByName || recipe.approvedBy || "—",
    });
  }

  rows.push({
    id: `reg-${recipe.id}`,
    sort: 0,
    date: "—",
    time: "--:--",
    type: "등록",
    label: `${recipe.name || recipe.code || "Recipe"} Master 등록`,
    user: "시스템",
  });

  return rows.sort((a, b) => b.sort - a.sort).slice(0, limit);
}

export function buildRecipeMasterDetail(recipe) {
  const empty = {
    summaryCard: {
      name: "—",
      code: "—",
      versionNo: "—",
      statusLabel: "—",
      productCount: 0,
      equipmentCount: 0,
      treatmentTemp: "—",
      treatmentTime: "—",
    },
    templateView: null,
    equipment: [],
    products: [],
    lots: [],
    memo: { workMemo: "—", cautionNote: "—" },
    approval: {},
    recentUpdates: [],
    health: { status: "error", label: "관리 필요", icon: "🔴" },
    counts: { equipment: 0, products: 0, lots: 0 },
  };
  if (!recipe) return empty;

  try {
    const normalized = normalizeRecipeRecord(recipe);
    const equipmentRows = connectedEquipment(normalized);
    const productRows = connectedProducts(normalized);
    const lotRows = connectedLots(normalized);
    const ctx = recipeContext(normalized);
    const templateView = buildRecipeTemplateView(normalized);
    const summary = getRecipeRepresentativeSummary(normalized);

    return {
      summaryCard: {
        name: normalized.name || "—",
        code: normalized.code || "—",
        versionNo: normalized.versionNo || "V1",
        statusLabel: statusLabel(normalized.status),
        productCount: productRows.length,
        equipmentCount: equipmentRows.length,
        treatmentTemp: summary.treatmentTemp,
        treatmentTime: summary.treatmentTime,
      },
      templateView,
      equipment: equipmentRows.map((eq) => ({
        id: eq.id,
        code: eq.code || "—",
        name: eq.name || "—",
        equipType: eq.equipType || "—",
        location: eq.location || "—",
      })),
      products: productRows.map((p) => ({
        id: p.id,
        partNo: p.partNo || "—",
        name: p.name || "—",
        company: p.company || "—",
        material: p.material || "—",
        status: p.active === false ? "미사용" : "사용",
      })),
      lots: lotRows,
      memo: {
        workMemo: normalized.workMemo || "—",
        cautionNote: normalized.cautionNote || "—",
      },
      approval: {
        versionNo: normalized.versionNo || "V1",
        statusLabel: statusLabel(normalized.status),
        approvedByName: normalized.approvedByName || "—",
        approvedDate: normalized.approvedDate || "—",
        reviewComment: normalized.reviewComment || "—",
      },
      recentUpdates: buildRecentUpdates(normalized),
      health: getRecipeHealth(normalized, ctx),
      counts: {
        equipment: equipmentRows.length,
        products: productRows.length,
        lots: lotRows.length,
      },
    };
  } catch (error) {
    if (import.meta.env?.DEV) console.error("[buildRecipeMasterDetail]", error);
    return empty;
  }
}

export default buildRecipeMasterDetail;

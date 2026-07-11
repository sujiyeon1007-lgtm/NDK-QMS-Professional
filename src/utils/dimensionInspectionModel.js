/**
 * Project TITAN - dimension inspection (before/after HT)
 */

import { evaluateMeasurement } from "./specJudgment";

function parseNumeric(value) {
  const text = String(value ?? "").trim();
  if (!text) return null;
  const parsed = Number(text.replace(/[^\d.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
}

function round3(value) {
  if (value == null || Number.isNaN(Number(value))) return null;
  return Number(Number(value).toFixed(3));
}

export function createDimensionInspectionRow({ id, item, spec, unit = "mm" } = {}) {
  return {
    id: id || `dim-ins-${Date.now()}`,
    item: item?.trim() || "",
    spec: spec?.trim() || "",
    beforeHt: "",
    beforeHtRaw: "",
    afterHt: "",
    afterHtRaw: "",
    deformation: null,
    deformationRaw: "",
    unit: unit || "mm",
    judgment: "\u2014",
    note: "",
  };
}

export function buildDimensionInspectionRowsFromSpec(spec) {
  if (!spec?.dimension?.enabled) return [];
  const unit = spec.dimension.unit || "mm";
  return (spec.dimension.items ?? [])
    .filter((item) => item.label && item.spec)
    .map((item, index) =>
      createDimensionInspectionRow({
        id: item.id || `dim-ins-${index}`,
        item: item.label,
        spec: item.spec,
        unit,
      })
    );
}

export function syncDimensionInspectionRow(row) {
  const beforeHt = parseNumeric(row.beforeHtRaw ?? row.beforeHt);
  const afterHt = parseNumeric(row.afterHtRaw ?? row.afterHt);
  const deformation =
    beforeHt != null && afterHt != null ? round3(afterHt - beforeHt) : null;
  const deformationDisplay = deformation != null ? String(deformation) : "";
  const judgment =
    afterHt != null && row.spec
      ? evaluateMeasurement(row.spec, afterHt)
      : row.judgment || "\u2014";
  return {
    ...row,
    beforeHt: beforeHt != null ? String(beforeHt) : row.beforeHt || "",
    afterHt: afterHt != null ? String(afterHt) : row.afterHt || "",
    deformation,
    deformationRaw: deformationDisplay,
    judgment,
  };
}

export function syncDimensionInspectionRows(rows = []) {
  return rows.map(syncDimensionInspectionRow);
}

export function updateDimensionInspectionRow(rows, rowId, patch) {
  return rows.map((row) =>
    row.id === rowId ? syncDimensionInspectionRow({ ...row, ...patch }) : row
  );
}

export function normalizeDimensionInspectionRows(rows) {
  if (!Array.isArray(rows)) return [];
  return syncDimensionInspectionRows(rows);
}


/**
 * Project TITAN V1.0 — 제품 단위 (확장 가능)
 * 기준정보 units 카테고리와 연동 · 미설정 시 기본 목록 사용
 */

import { getActiveMasterNames } from "./masterData";

export const DEFAULT_UNITS = ["EA", "LOT", "KG", "SET"];

/** 향후 확장 단위 (기준정보 등록 시 자동 반영) */
export const EXTENDED_UNITS = ["M", "MM", "BOX"];

export function getProductUnitOptions() {
  const fromMaster = getActiveMasterNames("units");
  return fromMaster.length > 0 ? fromMaster : DEFAULT_UNITS;
}

export function normalizeProductUnit(unit, fallback = "EA") {
  const trimmed = String(unit ?? "").trim().toUpperCase();
  if (!trimmed) return fallback;

  const options = getProductUnitOptions().map((value) => value.toUpperCase());
  if (options.includes(trimmed)) return trimmed;

  const defaults = DEFAULT_UNITS.map((value) => value.toUpperCase());
  if (defaults.includes(trimmed)) return trimmed;

  return fallback;
}

export function formatQtyWithUnit(qty, unit = "EA") {
  const value = Number(qty);
  const display = Number.isFinite(value) ? value.toLocaleString() : "0";
  return `${display} ${normalizeProductUnit(unit)}`;
}

/** 복수 품목·혼합 단위 합산 — "120 EA · 2 LOT" */
export function formatQtySummaryByUnit(items, getQty = (item) => item.qty, getUnit = (item) => item.unit) {
  if (!items?.length) return formatQtyWithUnit(0);

  const totals = new Map();
  items.forEach((item) => {
    const unit = normalizeProductUnit(getUnit(item));
    const qty = Number(getQty(item)) || 0;
    totals.set(unit, (totals.get(unit) || 0) + qty);
  });

  const parts = [...totals.entries()]
    .filter(([, qty]) => qty !== 0)
    .map(([unit, qty]) => formatQtyWithUnit(qty, unit));

  return parts.length ? parts.join(" · ") : formatQtyWithUnit(0);
}

/** "20 EA" / "120" 형태 입력 파싱 */
export function parseQtyWithUnit(input, fallbackUnit = "EA") {
  const trimmed = String(input ?? "").trim();
  if (!trimmed) {
    return { qty: 0, unit: normalizeProductUnit(fallbackUnit) };
  }

  const match = trimmed.match(/^([\d,]+(?:\.\d+)?)\s*([A-Za-z]+)?$/);
  if (!match) {
    const qty = Number(trimmed.replace(/,/g, ""));
    return {
      qty: Number.isFinite(qty) ? qty : 0,
      unit: normalizeProductUnit(fallbackUnit),
    };
  }

  const qty = Number(match[1].replace(/,/g, ""));
  const unit = match[2] ? normalizeProductUnit(match[2]) : normalizeProductUnit(fallbackUnit);

  return {
    qty: Number.isFinite(qty) ? qty : 0,
    unit,
  };
}

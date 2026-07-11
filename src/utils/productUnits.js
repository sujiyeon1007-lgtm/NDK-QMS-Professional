/**
 * Project TITAN RC1 — 제품 기본단위 (Product Master)
 */

export const PRODUCT_UNIT_OPTIONS = ["EA", "LOT", "KG", "M", "SET", "BOX", "기타"];
export const PRODUCT_UNIT_OTHER = "기타";

/** @deprecated use PRODUCT_UNIT_OPTIONS */
export const DEFAULT_UNITS = ["EA", "LOT", "KG", "SET"];
export const EXTENDED_UNITS = ["M", "BOX"];

export function isProductUnitOther(unit) {
  return String(unit ?? "").trim() === PRODUCT_UNIT_OTHER;
}

/** 저장용 단위 — 기타 선택 시 unitCustom 사용 */
export function resolveProductUnit(unit, unitCustom = "", fallback = "EA") {
  const raw = String(unit ?? "").trim();
  if (!raw) return fallback;

  if (isProductUnitOther(raw)) {
    const custom = String(unitCustom ?? "").trim().toUpperCase();
    return custom || fallback;
  }

  return normalizeProductUnit(raw, fallback);
}

/** 폼 로드 — 비표준 단위는 기타 + custom으로 분리 */
export function splitProductUnitForForm(unit) {
  const normalized = String(unit ?? "").trim().toUpperCase();
  if (!normalized) return { unit: "EA", unitCustom: "" };

  const preset = PRODUCT_UNIT_OPTIONS.slice(0, -1);
  if (preset.includes(normalized)) {
    return { unit: normalized, unitCustom: "" };
  }

  return { unit: PRODUCT_UNIT_OTHER, unitCustom: normalized };
}

export function getProductUnitOptions() {
  return [...PRODUCT_UNIT_OPTIONS];
}

export function normalizeProductUnit(unit, fallback = "EA") {
  const trimmed = String(unit ?? "").trim().toUpperCase();
  if (!trimmed) return fallback;

  const options = getProductUnitOptions()
    .filter((value) => value !== PRODUCT_UNIT_OTHER)
    .map((value) => value.toUpperCase());
  if (options.includes(trimmed)) return trimmed;

  if (trimmed.length >= 1 && trimmed.length <= 8) return trimmed;

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

  const match = trimmed.match(/^([\d,]+(?:\.\d+)?)\s*([A-Za-z가-힣]+)?$/);
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

/** 거래명세서 · 출고 — record 단위 해석 */
export function resolveRecordUnit(record, product = null) {
  const fromRecord = String(record?.unit ?? "").trim();
  if (fromRecord) return normalizeProductUnit(fromRecord);
  const fromProduct = String(product?.unit ?? "").trim();
  if (fromProduct) return normalizeProductUnit(fromProduct);
  return "EA";
}

/**
 * Project TITAN V1.0 — 검사 스펙 자동 합격/불합격 판정
 */

function parseNumber(value) {
  if (value == null || value === "") return null;
  const match = String(value).replace(/,/g, "").match(/-?\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : null;
}

export function evaluateMeasurement(spec, measured) {
  const specText = String(spec ?? "").trim();
  if (!specText || specText === "없음" || specText === "—") return "—";

  const measuredNum = parseNumber(measured);
  if (measuredNum == null) return "—";

  const rangeMatch = specText.match(/([\d.]+)\s*[~\-]\s*([\d.]+)/);
  if (rangeMatch) {
    const min = Number(rangeMatch[1]);
    const max = Number(rangeMatch[2]);
    return measuredNum >= min && measuredNum <= max ? "합격" : "불합격";
  }

  const toleranceMatch = specText.match(/([\d.]+)\s*±\s*([\d.]+)/);
  if (toleranceMatch) {
    const center = Number(toleranceMatch[1]);
    const tolerance = Number(toleranceMatch[2]);
    return measuredNum >= center - tolerance && measuredNum <= center + tolerance ? "합격" : "불합격";
  }

  const minMatch = specText.match(/([\d.]+).*?(?:이상|↑|min|MIN|Min)/i);
  if (minMatch) {
    return measuredNum >= Number(minMatch[1]) ? "합격" : "불합격";
  }

  const maxMatch = specText.match(/([\d.]+).*?(?:이하|↓|max|MAX|Max)/i);
  if (maxMatch) {
    return measuredNum <= Number(maxMatch[1]) ? "합격" : "불합격";
  }

  return "합격";
}

export function summarizeJudgments(rows = []) {
  const judged = rows.filter((row) => row.judgment && row.judgment !== "—");
  if (judged.length === 0) return "—";
  return judged.every((row) => row.judgment === "합격" || row.judgment === "양호") ? "합격" : "불합격";
}

export function buildHardnessResultRows(specification, measurements = []) {
  if (!specification?.hardness?.enabled) return [];
  const unit = specification.hardness.unit || "HV";

  return specification.hardness.items
    .filter((item) => !item.disabled && item.spec && item.spec !== "없음")
    .map((item) => {
      const existing = measurements.find((row) => row.key === item.key);
      const measured = existing?.measured ?? "";
      const judgment = existing?.judgment || evaluateMeasurement(item.spec, measured);
      return {
        key: item.key,
        item: item.label,
        spec: item.spec,
        measured: measured ? `${measured} ${unit}`.replace(/\s+/g, " ") : "",
        measuredRaw: measured,
        unit,
        note: "",
        judgment,
      };
    });
}

export function buildDimensionResultRows(specification, measurements = []) {
  if (!specification?.dimension?.enabled) return [];
  const unit = specification.dimension.unit || "mm";

  return specification.dimension.items
    .filter((item) => item.label && item.spec)
    .map((item) => {
      const existing = measurements.find((row) => row.id === item.id);
      const measured = existing?.measured ?? "";
      const judgment = existing?.judgment || evaluateMeasurement(item.spec, measured);
      return {
        id: item.id,
        item: item.label,
        spec: item.spec,
        measured: measured ? `${measured}` : "",
        measuredRaw: measured,
        unit,
        note: "",
        judgment,
      };
    });
}

const APPEARANCE_STANDARDS = {
  dent: "없어야 함",
  color: "없어야 함",
  stain: "없어야 함",
};

export function buildAppearanceResultRows(specification, measurements = []) {
  if (!specification?.appearance?.enabled) return [];

  return specification.appearance.items
    .filter((item) => item.enabled)
    .map((item) => {
      const existing = measurements.find((row) => row.key === item.key);
      const result = existing?.result ?? "양호";
      const judgment = existing?.judgment || (result === "양호" ? "합격" : "불합격");
      return {
        key: item.key,
        item: item.label,
        standard: APPEARANCE_STANDARDS[item.key] || "없어야 함",
        result,
        judgment,
      };
    });
}

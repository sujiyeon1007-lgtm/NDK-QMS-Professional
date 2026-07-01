/**
 * Project TITAN V1.0 — 경화깊이 동적 데이터 모델
 * 행 추가/삭제 · 자동 정렬 · CORE · 붙여넣기 · 템플릿
 */

export const HV_REFERENCE_LINE = 390;

export const HARDENING_DEPTH_TEMPLATES = {
  default: {
    id: "default",
    label: "기본 템플릿",
    depths: [
      "0.05",
      "0.10",
      "0.15",
      "0.20",
      "0.25",
      "0.30",
      "0.35",
      "0.40",
      "0.45",
      "0.50",
      "0.55",
      "0.60",
      "CORE",
    ],
  },
  f22: {
    id: "f22",
    label: "F22 템플릿",
    depths: ["0.10", "0.20", "0.30", "0.40", "0.50", "CORE"],
  },
  sacm645: {
    id: "sacm645",
    label: "SACM645 템플릿",
    depths: ["0.05", "0.10", "0.15", "0.20", "0.25", "0.30", "0.35", "0.40", "CORE"],
  },
};

/** @deprecated 고정 컬럼 — 레거시 마이그레이션용 */
export const LEGACY_HARDENING_DEPTH_COLUMNS = [
  "0.05",
  "0.10",
  "0.15",
  "0.20",
  "0.25",
  "0.30",
  "0.35",
  "0.40",
  "0.45",
  "0.50",
  "0.55",
  "0.60",
  "CORE",
];

export const LEGACY_DEFAULT_HARDENING_HV = [
  1078, 981, 923, 836, 705, 564, 435, 420, 406, 398, 357, 309, 297,
];

let rowIdCounter = 0;

export function createHardeningDepthRowId() {
  rowIdCounter += 1;
  return `hd-${Date.now()}-${rowIdCounter}`;
}

export function createHardeningDepthRow({ depth = "", hv = "", isCore = false } = {}) {
  const normalizedDepth = isCore ? "CORE" : String(depth ?? "").trim();
  return {
    id: createHardeningDepthRowId(),
    depth: normalizedDepth,
    hv: hv === "" || hv == null ? "" : Number(hv) || "",
    isCore: Boolean(isCore) || normalizedDepth.toUpperCase() === "CORE",
  };
}

export function parseDepthValue(depth) {
  const text = String(depth ?? "").trim();
  if (!text || text.toUpperCase() === "CORE") {
    return { depth: "CORE", isCore: true, depthNum: null };
  }
  const depthNum = Number(text);
  if (!Number.isFinite(depthNum)) {
    return { depth: text, isCore: false, depthNum: null };
  }
  return { depth: text, isCore: false, depthNum };
}

export function resolveRowDepthNum(row, numericDepths = []) {
  if (row.isCore || String(row.depth).toUpperCase() === "CORE") {
    const maxDepth = numericDepths.length ? Math.max(...numericDepths) : 0.6;
    return Number((maxDepth + 0.05).toFixed(2));
  }
  const parsed = parseDepthValue(row.depth);
  return parsed.depthNum;
}

export function sortHardeningDepthRows(rows = []) {
  const normalized = rows.map((row) => normalizeHardeningDepthRow(row));
  const coreRows = normalized.filter((row) => row.isCore);
  const numericRows = normalized
    .filter((row) => !row.isCore)
    .sort((a, b) => {
      const aNum = resolveRowDepthNum(a) ?? Number.MAX_VALUE;
      const bNum = resolveRowDepthNum(b) ?? Number.MAX_VALUE;
      return aNum - bNum;
    });

  if (coreRows.length === 0) return numericRows;

  const mergedCore = {
    ...coreRows[coreRows.length - 1],
    depth: "CORE",
    isCore: true,
    hv: coreRows[coreRows.length - 1].hv || coreRows.find((row) => row.hv !== "")?.hv || "",
  };

  return [...numericRows, mergedCore];
}

export function normalizeHardeningDepthRow(row) {
  if (!row) return createHardeningDepthRow();
  const isCore = Boolean(row.isCore) || String(row.depth).trim().toUpperCase() === "CORE";
  return {
    id: row.id || createHardeningDepthRowId(),
    depth: isCore ? "CORE" : String(row.depth ?? "").trim(),
    hv: row.hv === "" || row.hv == null ? "" : Number(row.hv) || "",
    isCore,
  };
}

export function normalizeHardeningDepthRows(rows) {
  if (!Array.isArray(rows) || rows.length === 0) return [];
  return sortHardeningDepthRows(rows.map(normalizeHardeningDepthRow));
}

export function rowsFromTemplate(templateId) {
  const template = HARDENING_DEPTH_TEMPLATES[templateId];
  if (!template) return [];
  return template.depths.map((depth) =>
    createHardeningDepthRow({
      depth: depth === "CORE" ? "CORE" : depth,
      isCore: depth === "CORE",
    })
  );
}

export function legacyArraysToRows(columns = LEGACY_HARDENING_DEPTH_COLUMNS, hvValues = []) {
  return columns.map((depth, index) =>
    createHardeningDepthRow({
      depth,
      hv: hvValues[index] ?? "",
      isCore: depth === "CORE",
    })
  );
}

export function migrateHardeningDepthRows(source) {
  if (Array.isArray(source?.hardeningDepthRows) && source.hardeningDepthRows.length > 0) {
    return normalizeHardeningDepthRows(source.hardeningDepthRows);
  }
  if (Array.isArray(source?.hardeningDepthHv) && source.hardeningDepthHv.length > 0) {
    return normalizeHardeningDepthRows(
      legacyArraysToRows(LEGACY_HARDENING_DEPTH_COLUMNS, source.hardeningDepthHv)
    );
  }
  return [];
}

export function parseHardeningDepthPaste(text) {
  const lines = String(text ?? "")
    .trim()
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const parsed = [];

  lines.forEach((line) => {
    const cells = line.split(/\t|,/);
    if (cells.length >= 2) {
      const depthRaw = cells[0].trim();
      const hvRaw = cells[1].trim();
      const isCore = depthRaw.toUpperCase() === "CORE";
      parsed.push(
        createHardeningDepthRow({
          depth: isCore ? "CORE" : depthRaw,
          hv: hvRaw,
          isCore,
        })
      );
      return;
    }

    const parts = line.split(/\s+/);
    if (parts.length >= 2) {
      const depthRaw = parts[0].trim();
      const hvRaw = parts.slice(1).join(" ").trim();
      const isCore = depthRaw.toUpperCase() === "CORE";
      parsed.push(
        createHardeningDepthRow({
          depth: isCore ? "CORE" : depthRaw,
          hv: hvRaw,
          isCore,
        })
      );
    }
  });

  return normalizeHardeningDepthRows(parsed);
}

export function addHardeningDepthRow(rows = [], patch = {}) {
  return sortHardeningDepthRows([...rows, createHardeningDepthRow(patch)]);
}

export function removeHardeningDepthRow(rows = [], rowId) {
  return sortHardeningDepthRows(rows.filter((row) => row.id !== rowId));
}

export function updateHardeningDepthRow(rows = [], rowId, patch) {
  const next = rows.map((row) => {
    if (row.id !== rowId) {
      if (patch.isCore) return { ...row, isCore: false, depth: row.isCore ? "" : row.depth };
      return row;
    }
    const merged = normalizeHardeningDepthRow({ ...row, ...patch });
    if (patch.isCore === true) {
      merged.depth = "CORE";
      merged.isCore = true;
    }
    return merged;
  });
  return sortHardeningDepthRows(next);
}

export function getHardeningDepthChartPoints(rows = []) {
  const normalized = normalizeHardeningDepthRows(rows);
  const numericDepths = normalized
    .filter((row) => !row.isCore)
    .map((row) => resolveRowDepthNum(row))
    .filter((value) => value != null);

  return normalized
    .map((row) => {
      const depthNum = resolveRowDepthNum(row, numericDepths);
      const hv = Number(row.hv) || 0;
      return {
        id: row.id,
        depth: row.isCore ? "CORE" : row.depth,
        depthNum,
        hv,
        isCore: row.isCore,
      };
    })
    .filter((point) => point.hv > 0 && point.depthNum != null);
}

export function calculateHardeningDepthMetricsFromRows(rows = [], threshold = HV_REFERENCE_LINE) {
  const points = getHardeningDepthChartPoints(rows).sort((a, b) => a.depthNum - b.depthNum);

  let effectiveDepthMm = null;
  for (let i = 1; i < points.length; i += 1) {
    const prev = points[i - 1];
    const curr = points[i];
    if (prev.isCore || curr.isCore) continue;
    if (prev.hv >= threshold && curr.hv <= threshold) {
      const ratio = (prev.hv - threshold) / (prev.hv - curr.hv || 1);
      effectiveDepthMm = prev.depthNum + (curr.depthNum - prev.depthNum) * ratio;
      break;
    }
  }

  let hardeningDepth390 = null;
  for (let i = points.length - 1; i >= 0; i -= 1) {
    if (points[i].isCore) continue;
    if (points[i].hv >= threshold) {
      hardeningDepth390 = points[i].depthNum;
      break;
    }
  }

  return {
    effectiveDepthMm: effectiveDepthMm != null ? Number(effectiveDepthMm.toFixed(2)) : null,
    hardeningDepth390: hardeningDepth390 != null ? Number(hardeningDepth390.toFixed(2)) : null,
  };
}

export function applyHardeningDepthRows(source, rows) {
  const normalized = normalizeHardeningDepthRows(rows);
  const metrics = calculateHardeningDepthMetricsFromRows(normalized);
  return {
    hardeningDepthRows: normalized,
    hardeningDepthHv: normalized.map((row) => (row.hv === "" ? 0 : Number(row.hv) || 0)),
    effectiveDepthMm: metrics.effectiveDepthMm,
    hardeningDepth390: metrics.hardeningDepth390,
  };
}

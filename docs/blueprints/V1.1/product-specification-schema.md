# Product Specification Schema (V1.1 PM Review)

**Status:** PM P0 — Product Master spec/judgment separation
**Code SSoT:** `src/utils/productSpecificationModel.js` | `src/utils/inspectionCriteriaModel.js`

---

## 1. Product record (SessionStorage / masterData)

```json
{
  "id": "string",
  "company": "string",
  "partNo": "string",
  "partName": "string",
  "drawingNo": "string",
  "material": "string",
  "process": "string",
  "note": "string",
  "documentLinks": [{ "documentId", "type", "title", "documentNo" }],
  "specification": {},
  "active": true,
  "createdAt": "ISO8601",
  "updatedAt": "ISO8601"
}
```

---

## 2. Field structure — 제품 스펙 vs 판정 기준 (분리)

Each inspection field stores **two concepts**:

| Concept | Purpose | Example |
|---------|---------|---------|
| **제품 스펙 (spec)** | Pass/fail range on certificate | `0.40 ~ 0.60 mm` |
| **판정 기준 (judgment)** | How system calculates/measures | `고정 HV 550`, `Core+50HV` |

### Structured example (per field)

```js
// 표면경도 — surfaceEntries (multiple units supported)
surfaceHardness: {
  spec: { min: "550", max: "700", unit: "HV" },
  judgment: { method: "range" }
}

// 유효경화깊이 — spec in item, judgment in heatTreatment
effectiveDepth: {
  spec: { min: "0.40", max: "0.60", unit: "mm" },
  judgment: { method: "corePlus", offset: 50 }  // via heatTreatment.effectiveDepthBasis
}

// 경화깊이 — spec + separate fixed HV judgment
caseDepth: {
  spec: { min: "0.40", max: "0.60", unit: "mm" },
  judgment: { method: "fixedHv", hv: 550 }
}

// 화합물층 — unit selector μm | mm
compoundLayer: {
  spec: { min: "5", max: "15", unit: "μm" },
  judgment: { method: "range" }
}
```

### Legacy read path

Flat `hardness.items[].spec` strings and `heatTreatment` fields still normalize on read via `normalizeInspectionCriteriaSpec()` + `syncStructuredHardnessItems()`.

---

## 3. specification object

```json
{
  "appearance": { "enabled": true, "items": [{ "key", "label", "enabled" }] },
  "hardness": {
    "enabled": true,
    "unit": "HV",
    "surfaceEntries": [{ "id", "value", "valueTo", "condition", "unit" }],
    "items": [
      {
        "key": "surface | caseDepth | effectiveDepth | compoundLayer",
        "label": "string",
        "disabled": false,
        "spec": "display string (제품 스펙 only)",
        "value": "min",
        "valueTo": "max",
        "specCondition": "범위 | 이상 | 이하",
        "judgmentMethod": "고정 HV (caseDepth only)",
        "judgmentHv": "550",
        "unit": "HV | mm | μm"
      }
    ]
  },
  "hardeningDepth": { "enabled": true },
  "heatTreatment": {
    "effectiveDepthBasis": "hv390 | specifiedHv | corePlus50",
    "specifiedHv": 390,
    "corePlusOffset": 50,
    "caseDepthThresholdHv": 390,
    "grindingAllowanceMm": 0.15,
    "certificateOutputMode": "all"
  },
  "certificatePolicy": { "issuePolicy": "always_issue | on_request | never_issue" }
}
```

**심부경도 (Core):** NOT in Master inspection items. Measured at inspection registration only (`report.coreHardnessHv`) for Core+offset calculation.

---

## 4. Inspection Master items

| Key | Label | Spec | Judgment |
|-----|-------|------|----------|
| surface | 표면경도 | range + unit | range per entry |
| caseDepth | 경화깊이 | mm range | **고정 HV** (calc threshold, separate from effective) |
| effectiveDepth | 유효경화깊이 | mm range | **heatTreatment basis** (hv390/specifiedHv/corePlus50) |
| compoundLayer | 화합물층 | range | range · unit **μm \| mm** |
| microstructure | 조직검사 | enabled | — |
| dimension | 치수검사 | custom rows | — |

**Excluded from inspection hardness rows:** `core`, `caseDepth`, `effectiveDepth` (`INSPECTION_HARDNESS_EXCLUDED_KEYS`)

---

## 5. Calculation flow (SSOT: heatTreatmentCalculationEngine.js)

```text
검사 등록: 거리(mm) + HV grid 입력
  ↓
심부경도 (Core) — optional input or CORE row
  ↓
유효경화깊이: resolveEffectiveDepthThreshold(heatTreatment, coreHv)
  → interpolateDepthAtThreshold() at effective threshold
  ↓
경화깊이: resolveCaseDepthThresholdHv(spec) — NOT effective basis
  → interpolateDepthAtThreshold() at fixed HV (default 390, product may set 550)
  ↓
합격/불합격: auto depth vs 제품 스펙 range (buildAutoDepthJudgmentRows)
```

---

## 6. Files

| Area | File |
|------|------|
| Schema | `productSpecificationModel.js`, `inspectionCriteriaModel.js` |
| Master UI | `ProductInspectionSpecEditor.jsx` |
| Calc engine | `heatTreatmentCalculationEngine.js` |
| Inspection register | `InspectionReportDocument.jsx`, `inspectionReportEditor.js` |
| Verify | `scripts/verify-depth-interpolation.cjs` |

---

## 7. Constraints

- RC1 sessionStorage only
- UI freeze on inspection pages — functional diff within 경도검사 section
- Legacy flat fields remain readable

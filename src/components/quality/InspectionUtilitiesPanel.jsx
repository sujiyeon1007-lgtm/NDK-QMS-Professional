import { useEffect, useMemo } from "react";
import CollapsePanel from "../../foundation/components/CollapsePanel";
import {
  convertAllHardnessUnits,
  formatHardnessConversionDisplay,
  formatHardnessMeasurementLine,
  HARDNESS_CONVERSION_NOTE,
  HARDNESS_UNITS_RC1,
} from "../../utils/hardnessUnitConversion";
import {
  calculateDepthAtThresholdFromRows,
  DEPTH_CALC_STATUS,
  DEPTH_FIELD_LABELS,
  formatDepthCalcAutoDisplay,
  formatDepthMm,
  getCaseDepthBasisLabel,
  getEffectiveDepthBasisLabel,
  interpolateDepthAtThreshold,
  resolveEffectiveDepthThreshold,
} from "../../utils/heatTreatmentCalculationEngine";
import { getHardeningDepthChartPoints } from "../../utils/hardeningDepthModel";
import { evaluateMeasurement } from "../../utils/specJudgment";
import { getHeatTreatmentConfig } from "../../utils/productSpecificationModel";

function JudgmentBadge({ value }) {
  if (!value || value === "—") {
    return <span className="ir-utilities__judgment ir-utilities__judgment--empty">—</span>;
  }
  const tone = value === "합격" || value === "양호" ? "pass" : "fail";
  return <span className={`ir-utilities__judgment ir-utilities__judgment--${tone}`}>{value}</span>;
}

function UtilityRow({ label, children }) {
  return (
    <div className="ir-utilities__row">
      <span className="ir-utilities__label">{label}</span>
      <span className="ir-utilities__value">{children}</span>
    </div>
  );
}

function resolvePrimaryHardnessMeasurement(hardnessRows = [], coreHardnessHv = null) {
  const surfaceRow = hardnessRows.find(
    (row) => row.key === "surface" && (row.measuredRaw ?? row.measured)
  );
  if (surfaceRow) {
    return {
      value: surfaceRow.measuredRaw ?? surfaceRow.measured,
      unit: surfaceRow.unit || "HV",
      label: surfaceRow.item || "표면경도",
    };
  }

  const firstMeasured = hardnessRows.find(
    (row) => !row.autoCalculated && (row.measuredRaw ?? row.measured) && row.unit
  );
  if (firstMeasured) {
    return {
      value: firstMeasured.measuredRaw ?? firstMeasured.measured,
      unit: firstMeasured.unit,
      label: firstMeasured.item || "경도",
    };
  }

  if (coreHardnessHv != null && String(coreHardnessHv).trim() !== "") {
    return {
      value: coreHardnessHv,
      unit: "HV",
      label: "심부경도 (Core)",
    };
  }

  return null;
}

export default function InspectionUtilitiesPanel({
  report,
  appliedSpecification,
  hardeningRows = [],
  coreHardnessHv = null,
  onCalculatedPreview,
}) {
  const hardnessRows = report?.hardnessRows || [];
  const heatCalcs = report?.heatTreatmentCalculations;
  const spec = appliedSpecification || report?.appliedSpecification;

  const hardnessMeasurement = useMemo(
    () => resolvePrimaryHardnessMeasurement(hardnessRows, coreHardnessHv ?? report?.coreHardnessHv),
    [hardnessRows, coreHardnessHv, report?.coreHardnessHv]
  );

  const hardnessConversions = useMemo(() => {
    if (!hardnessMeasurement) return null;
    return convertAllHardnessUnits(
      hardnessMeasurement.value,
      hardnessMeasurement.unit,
      HARDNESS_UNITS_RC1
    );
  }, [hardnessMeasurement]);

  const heatConfig = useMemo(() => getHeatTreatmentConfig(spec), [spec]);

  const coreHv = heatCalcs?.meta?.coreHv ?? null;
  const effectiveThreshold = heatCalcs?.meta?.effectiveThresholdHv ?? null;
  const caseThreshold = heatCalcs?.meta?.caseDepthThresholdHv ?? null;

  const corePlusPreview = useMemo(() => {
    if (heatConfig.effectiveDepthBasis !== "corePlus50") return null;
    const offset = heatConfig.corePlusOffset > 0 ? heatConfig.corePlusOffset : 50;
    const resolved = resolveEffectiveDepthThreshold(heatConfig, coreHv);
    return { coreHv, offset, threshold: resolved };
  }, [heatConfig, coreHv]);

  const interpolationPreview = useMemo(() => {
    const points = getHardeningDepthChartPoints(hardeningRows);
    if (!points.length || effectiveThreshold == null) return null;

    const result = interpolateDepthAtThreshold(points, effectiveThreshold, {
      decimalPlaces: heatCalcs?.meta?.depthDecimalPlaces ?? 2,
    });
    return { threshold: effectiveThreshold, result };
  }, [hardeningRows, effectiveThreshold, heatCalcs?.meta?.depthDecimalPlaces]);

  const caseInterpolationPreview = useMemo(() => {
    if (caseThreshold == null) return null;
    const result = calculateDepthAtThresholdFromRows(hardeningRows, caseThreshold, {
      decimalPlaces: heatCalcs?.meta?.depthDecimalPlaces ?? 2,
    });
    return { threshold: caseThreshold, result };
  }, [hardeningRows, caseThreshold, heatCalcs?.meta?.depthDecimalPlaces]);

  const judgmentRows = useMemo(() => {
    const rows = [];
    hardnessRows.forEach((row) => {
      if (!row.item || row.autoCalculated) return;
      const measured = row.measuredRaw ?? row.measured;
      if (!measured && row.judgment === "—") return;
      rows.push({
        key: row.key || row.item,
        label: row.item,
        spec: row.spec,
        measured: measured || "—",
        unit: row.unit || "",
        judgment: row.judgment || evaluateMeasurement(row.spec, measured),
      });
    });
    return rows;
  }, [hardnessRows]);

  const previewPayload = useMemo(
    () => ({
      hardnessConversions,
      corePlusPreview,
      interpolationPreview,
      caseInterpolationPreview,
      heatCalcs,
      judgmentRows,
    }),
    [
      hardnessConversions,
      corePlusPreview,
      interpolationPreview,
      caseInterpolationPreview,
      heatCalcs,
      judgmentRows,
    ]
  );

  useEffect(() => {
    onCalculatedPreview?.(previewPayload);
  }, [onCalculatedPreview, previewPayload]);

  const effectiveBasisLabel = spec ? getEffectiveDepthBasisLabel(spec) : "—";
  const caseBasisLabel = caseThreshold ? getCaseDepthBasisLabel(caseThreshold) : "—";

  return (
    <div className="ir-utilities">
      <CollapsePanel title="검사 계산 도구 (펼치기)" defaultOpen={false} className="ir-utilities__collapse">
        <div className="ir-utilities__sections">
          <section className="ir-utilities__section">
            <h4 className="ir-utilities__section-title">① 경도 자동 환산</h4>
            {hardnessMeasurement ? (
              <>
                <UtilityRow label="측정">
                  {formatHardnessMeasurementLine(hardnessMeasurement.value, hardnessMeasurement.unit)}
                  <span className="ir-utilities__hint"> ({hardnessMeasurement.label})</span>
                </UtilityRow>
                <UtilityRow label="자동 환산">
                  {formatHardnessConversionDisplay(
                    hardnessMeasurement.value,
                    hardnessMeasurement.unit,
                    HARDNESS_UNITS_RC1
                  ) || "—"}
                </UtilityRow>
                {spec?.hardness?.unit &&
                hardnessMeasurement.unit &&
                normalizeUnitSafe(spec.hardness.unit) !== normalizeUnitSafe(hardnessMeasurement.unit) ? (
                  <UtilityRow label="제품 스펙 단위">
                    {spec.hardness.unit}
                    {hardnessConversions?.conversions?.[normalizeUnitSafe(spec.hardness.unit)] != null
                      ? ` · 환산 ≈${hardnessConversions.conversions[normalizeUnitSafe(spec.hardness.unit)]} ${spec.hardness.unit}`
                      : ""}
                  </UtilityRow>
                ) : null}
                <p className="ir-utilities__note">{HARDNESS_CONVERSION_NOTE}</p>
              </>
            ) : (
              <p className="ir-utilities__empty">
                표면경도 또는 심부경도 측정값을 입력하면 환산값이 표시됩니다.
              </p>
            )}
          </section>

          <section className="ir-utilities__section">
            <h4 className="ir-utilities__section-title">② 직선보간 계산</h4>
            {interpolationPreview?.result ? (
              <>
                <UtilityRow label="유효경화 기준">
                  {effectiveBasisLabel} · {interpolationPreview.threshold}HV
                </UtilityRow>
                <UtilityRow label="보간 결과">
                  {interpolationPreview.result.depth != null
                    ? `${formatDepthMm(interpolationPreview.result.depth)} mm`
                    : interpolationPreview.result.message || "계산 불가"}
                  {interpolationPreview.result.status === DEPTH_CALC_STATUS.OK ? " (직선보간)" : ""}
                </UtilityRow>
              </>
            ) : (
              <p className="ir-utilities__empty">경화곡선 측정 데이터가 2점 이상 필요합니다.</p>
            )}
            {caseInterpolationPreview?.result ? (
              <UtilityRow label="경화깊이 보간">
                {caseBasisLabel} ·{" "}
                {caseInterpolationPreview.result.depth != null
                  ? `${formatDepthMm(caseInterpolationPreview.result.depth)} mm`
                  : caseInterpolationPreview.result.message || "계산 불가"}
              </UtilityRow>
            ) : null}
          </section>

          <section className="ir-utilities__section">
            <h4 className="ir-utilities__section-title">③ Core + 값 계산</h4>
            {corePlusPreview ? (
              <>
                <UtilityRow label="심부경도 (Core)">
                  {corePlusPreview.coreHv != null ? `${corePlusPreview.coreHv} HV` : "미입력"}
                </UtilityRow>
                <UtilityRow label="오프셋">+{corePlusPreview.offset} HV</UtilityRow>
                <UtilityRow label="유효경화 임계값">
                  {corePlusPreview.threshold != null
                    ? `${corePlusPreview.threshold} HV`
                    : "Core 측정값 필요"}
                </UtilityRow>
              </>
            ) : (
              <UtilityRow label="기준">
                {effectiveBasisLabel}
                {effectiveThreshold != null ? ` · ${effectiveThreshold} HV` : ""}
              </UtilityRow>
            )}
          </section>

          <section className="ir-utilities__section">
            <h4 className="ir-utilities__section-title">④ 유효경화깊이 / 경화깊이</h4>
            {heatCalcs ? (
              <>
                {["effectiveDepth", "caseDepth"].map((fieldKey) => {
                  const field = heatCalcs[fieldKey];
                  if (!field) return null;
                  return (
                    <UtilityRow key={fieldKey} label={DEPTH_FIELD_LABELS[fieldKey]}>
                      자동 {formatDepthCalcAutoDisplay(field, heatCalcs.meta?.depthDecimalPlaces)} mm
                      {field.final != null ? ` · 최종 ${formatDepthMm(field.final)} mm` : ""}
                    </UtilityRow>
                  );
                })}
              </>
            ) : (
              <p className="ir-utilities__empty">
                경화곡선 또는 경도검사 데이터가 연결되면 자동 계산됩니다.
              </p>
            )}
          </section>

          <section className="ir-utilities__section">
            <h4 className="ir-utilities__section-title">⑤ 판정 요약</h4>
            <p className="ir-utilities__empty">
              항목별 PASS/FAIL 판정은 상단 <strong>검사항목 결과</strong> 테이블에서 확인합니다.
              측정값 입력 후 자동 판정이 반영됩니다.
            </p>
            {report?.hardnessSummary ? (
              <UtilityRow label="경도검사 종합">
                <JudgmentBadge value={report.hardnessSummary} />
              </UtilityRow>
            ) : null}
            {report?.finalJudgment ? (
              <UtilityRow label="최종판정">
                <JudgmentBadge value={report.finalJudgment} />
              </UtilityRow>
            ) : null}
          </section>
        </div>
      </CollapsePanel>
    </div>
  );
}

function normalizeUnitSafe(unit) {
  return String(unit ?? "HV")
    .trim()
    .toUpperCase();
}

import { useState } from "react";
import { formatQtyWithUnit } from "../../utils/productUnits";
import { getHardeningChartPoints } from "../../utils/inspectionReportModel";
import { applyHardeningDepthRows } from "../../utils/hardeningDepthModel";
import { createDefaultSpecification } from "../../utils/productSpecificationModel";
import {
  getPreviousHardeningDepthRows,
  getInspectionScope,
  rebuildRowsFromSpecification,
  updateSpecificationSection,
} from "../../utils/inspectionReportEditor";
import HardeningDepthCurveChart from "./HardeningDepthCurveChart";
import HardeningDepthDataTable from "./HardeningDepthDataTable";
import {
  DEPTH_FIELD_KEYS,
  DEPTH_FIELD_LABELS,
  formatDepthMm,
  getEffectiveDepthBasisLabel,
} from "../../utils/heatTreatmentCalculationEngine";

function JudgmentBadge({ value, compact = false }) {
  if (!value || value === "—") return <span className="ir-judgment ir-judgment--empty">—</span>;
  const tone = value === "합격" || value === "양호" ? "pass" : "fail";
  return (
    <span className={`ir-judgment ir-judgment--${tone}${compact ? " ir-judgment--compact" : ""}`}>
      {value}
    </span>
  );
}

function SectionTitle({ number, title }) {
  return (
    <h3 className="ir-section-title">
      <span className="ir-section-title__num">{number}</span>
      {title}
    </h3>
  );
}

function CellInput({ value, onChange, type = "text", onBlur }) {
  return (
    <input
      type={type}
      className="ir-field-input"
      value={value ?? ""}
      onChange={(event) => onChange?.(event.target.value)}
      onBlur={onBlur}
    />
  );
}

function BasicCell({ editable, value, onChange, type = "text", onBlur }) {
  if (!editable) return value || "—";
  return (
    <CellInput
      value={value}
      onChange={onChange}
      type={type}
      onBlur={typeof onBlur === "function" ? onBlur : undefined}
    />
  );
}

/** 검사 리포트 본문 — Final Design v1.0 (screen · print · register 공통) */
export default function InspectionReportDocument({
  report,
  mode = "screen",
  editable = false,
  onBasicChange,
  onPartNoApply,
  onHardeningDepthChange,
  onHvChange,
  onHardnessChange,
  onDimensionChange,
  onAppearanceChange,
  onMicrostructureToggle,
  onMicrostructureJudgment,
  onMicroPhotoUpload,
  onOtherChange,
  onRemarksChange,
  onSpecificationChange,
  onHeatTreatmentCalcChange,
}) {
  if (!report) return null;

  const [chartOpen, setChartOpen] = useState(true);
  const scope = getInspectionScope(report.appliedSpecification);
  const chartPoints = getHardeningChartPoints(report);
  const heatCalcs = report.heatTreatmentCalculations;
  const effectiveThresholdHv =
    heatCalcs?.meta?.effectiveThresholdHv ?? report.appliedSpecification?.heatTreatment?.specifiedHv ?? 390;
  const depthBasisLabel = report.appliedSpecification
    ? getEffectiveDepthBasisLabel(report.appliedSpecification)
    : "390HV 기준";
  const tableClass = mode === "print" ? "ir-table ir-table--print" : "ir-table";
  const isPrint = mode === "print";
  const showChart = scope.hardeningDepth && (isPrint || chartOpen);
  const canLoadPrevious = Boolean(
    report.partNo?.trim() &&
      getPreviousHardeningDepthRows(report.partNo, report.logId, report.company)
  );

  const handleScopeToggle = (section, enabled) => {
    const baseSpec = report.appliedSpecification || createDefaultSpecification();
    const nextSpec = updateSpecificationSection(baseSpec, section, { enabled });
    const rebuilt = rebuildRowsFromSpecification(nextSpec);
    const scope = getInspectionScope(nextSpec);

    onSpecificationChange?.({
      appliedSpecification: nextSpec,
      specifications: rebuilt.specifications,
      appearanceRows: rebuilt.appearanceRows,
      hardnessRows: rebuilt.hardnessRows,
      dimensionRows: rebuilt.dimensionRows,
      otherRows: rebuilt.otherRows,
      hasMicrostructurePhoto: scope.microstructure ? report.hasMicrostructurePhoto : false,
      hardeningDepthRows:
        section === "hardeningDepth" && !enabled ? [] : report.hardeningDepthRows || [],
      hardeningDepthHv:
        section === "hardeningDepth" && !enabled ? [] : report.hardeningDepthHv || [],
    });
  };

  const scopeToolbar = editable ? (
    <div className="ir-scope-toolbar">
      <span className="ir-scope-toolbar__label">검사 항목</span>
      {[
        { key: "appearance", label: "외관검사" },
        { key: "hardness", label: "경도검사" },
        { key: "hardeningDepth", label: "경화곡선" },
        { key: "dimension", label: "치수검사" },
        { key: "microstructure", label: "조직검사" },
        { key: "other", label: "기타검사" },
      ].map((item) => (
        <label key={item.key} className="ir-scope-toolbar__item">
          <input
            type="checkbox"
            checked={scope[item.key]}
            onChange={(event) => handleScopeToggle(item.key, event.target.checked)}
          />
          {item.label}
        </label>
      ))}
    </div>
  ) : null;

  const microToggle = editable && scope.microstructure ? (
    <div className="ir-micro-toggle">
      <span>조직사진 유무</span>
      <label>
        <input
          type="radio"
          checked={report.hasMicrostructurePhoto}
          onChange={() => onMicrostructureToggle?.(true)}
        />
        있음
      </label>
      <label>
        <input
          type="radio"
          checked={!report.hasMicrostructurePhoto}
          onChange={() => onMicrostructureToggle?.(false)}
        />
        없음
      </label>
    </div>
  ) : null;

  const microPhotos = report.microstructurePhotos || [];

  return (
    <div className={`ir-document ir-document--${mode}`}>
      {scopeToolbar}
      <section className="ir-section ir-section--full">
        <SectionTitle number="①" title="기본정보" />
        <table className={tableClass}>
          <tbody>
            <tr>
              <th>업체명</th>
              <td>
                <BasicCell
                  editable={editable}
                  value={report.company}
                  onChange={(value) => onBasicChange?.("company", value)}
                />
              </td>
              <th>품명</th>
              <td>
                <BasicCell
                  editable={editable}
                  value={report.partName}
                  onChange={(value) => onBasicChange?.("partName", value)}
                />
              </td>
              <th>품번</th>
              <td>
                <BasicCell
                  editable={editable}
                  value={report.partNo}
                  onChange={(value) => onBasicChange?.("partNo", value)}
                  onBlur={(event) => onPartNoApply?.(event.target.value)}
                />
              </td>
            </tr>
            <tr>
              <th>도번</th>
              <td>
                <BasicCell
                  editable={editable}
                  value={report.drawingNo}
                  onChange={(value) => onBasicChange?.("drawingNo", value)}
                />
              </td>
              <th>LOT</th>
              <td>
                <BasicCell
                  editable={editable}
                  value={report.lotNo}
                  onChange={(value) => onBasicChange?.("lotNo", value)}
                />
              </td>
              <th>관리번호</th>
              <td>
                <BasicCell
                  editable={editable}
                  value={report.managementId}
                  onChange={(value) => onBasicChange?.("managementId", value)}
                />
              </td>
            </tr>
            <tr>
              <th>발주번호</th>
              <td>{report.purchaseOrderNo || "—"}</td>
              <th>업체 LOT</th>
              <td colSpan={3}>{report.customerLotNo || "—"}</td>
            </tr>
            <tr>
              <th>입고일</th>
              <td>{report.incomingDate || "—"}</td>
              <th>생산일</th>
              <td>{report.productionDate || "—"}</td>
              <th>입고수량</th>
              <td>{report.inboundQtyLabel || formatQtyWithUnit(report.qty, report.unit)}</td>
            </tr>
            <tr>
              <th>작업수량</th>
              <td>{report.workQtyLabel || formatQtyWithUnit(report.qty, report.unit)}</td>
              <td colSpan={4} />
            </tr>
            <tr>
              <th>재질</th>
              <td>
                <BasicCell
                  editable={editable}
                  value={report.material}
                  onChange={(value) => onBasicChange?.("material", value)}
                />
              </td>
              <th>열처리 공정</th>
              <td>
                <BasicCell
                  editable={editable}
                  value={report.process}
                  onChange={(value) => onBasicChange?.("process", value)}
                />
              </td>
              <th>수량</th>
              <td>
                {editable ? (
                  <span className="ir-qty-cell">
                    <CellInput
                      type="number"
                      value={report.qty}
                      onChange={(value) => onBasicChange?.("qty", Number(value) || 0)}
                    />
                    <CellInput
                      value={report.unit}
                      onChange={(value) => onBasicChange?.("unit", value)}
                    />
                  </span>
                ) : (
                  formatQtyWithUnit(report.qty, report.unit)
                )}
              </td>
            </tr>
            <tr>
              <th>검사일</th>
              <td>
                <BasicCell
                  editable={editable}
                  type="date"
                  value={report.inspectionDate}
                  onChange={(value) => onBasicChange?.("inspectionDate", value)}
                />
              </td>
              <th>검사자</th>
              <td>
                <BasicCell
                  editable={editable}
                  value={report.inspector}
                  onChange={(value) => onBasicChange?.("inspector", value)}
                />
              </td>
              <th>승인자</th>
              <td>
                <BasicCell
                  editable={editable}
                  value={report.approver}
                  onChange={(value) => onBasicChange?.("approver", value)}
                />
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      <div className="ir-grid ir-grid--top">
        <section className="ir-section">
          <SectionTitle number="②" title="검사 기준 (Specification)" />
          <table className={tableClass}>
            <thead>
              <tr>
                <th>항목</th>
                <th>기준</th>
                <th>단위</th>
                <th>비고</th>
              </tr>
            </thead>
            <tbody>
              {report.specifications.map((row) => (
                <tr key={row.item}>
                  <td>{row.item}</td>
                  <td>{row.spec}</td>
                  <td>{row.unit}</td>
                  <td>{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="ir-section">
          <SectionTitle number="③" title="검사 결과 (Result Summary)" />
          <table className={tableClass}>
            <thead>
              <tr>
                <th>구분</th>
                <th>결과</th>
                <th>비고</th>
              </tr>
            </thead>
            <tbody>
              {report.resultSummary.map((row) => (
                <tr key={row.category}>
                  <td>{row.category}</td>
                  <td>
                    <JudgmentBadge value={row.result} compact />
                  </td>
                  <td>{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>

      <section className="ir-section ir-section--full">
        {scope.hardeningDepth ? (
          <>
            <SectionTitle number="④" title="경화깊이 데이터 (HV) · 경도곡선" />
            <div className="ir-hv-split">
            <div className="ir-hv-split__data">
              <HardeningDepthDataTable
                rows={report.hardeningDepthRows || []}
                editable={editable}
                tableClass={tableClass}
                onChange={onHardeningDepthChange || onHvChange}
                canLoadPrevious={editable && canLoadPrevious}
                onLoadPrevious={() => {
                  const previous = getPreviousHardeningDepthRows(
                    report.partNo,
                    report.logId,
                    report.company
                  );
                  if (previous) onHardeningDepthChange?.(applyHardeningDepthRows({}, previous));
                }}
              />
            </div>
            <div className="ir-hv-split__chart">
              {!isPrint ? (
                <button
                  type="button"
                  className="ir-hv-chart-toggle"
                  onClick={() => setChartOpen((open) => !open)}
                >
                  {chartOpen ? "▲ 경도곡선 접기" : "▼ 경도곡선 보기"}
                </button>
              ) : null}
              {showChart ? (
                <HardeningDepthCurveChart
                  compact
                  points={chartPoints}
                  effectiveDepthMm={report.effectiveDepthMm}
                  hardeningDepth390={report.hardeningDepth390}
                  referenceLine={effectiveThresholdHv}
                  title={`${report.material !== "—" ? report.material : "경화"} 경도 경사 곡선`}
                />
              ) : null}
            </div>
          </div>
          </>
        ) : null}
      </section>

      <div className={`ir-grid ir-grid--middle${!scope.appearance && !scope.hardness ? " ir-grid--single" : ""}`}>
        {scope.appearance ? (
        <section className="ir-section">
          <SectionTitle number="⑥" title="외관검사" />
          <table className={tableClass}>
            <thead>
              <tr>
                <th>항목</th>
                <th>기준</th>
                <th>결과</th>
                <th>판정</th>
              </tr>
            </thead>
            <tbody>
              {report.appearanceRows.map((row, index) => (
                <tr key={row.item}>
                  <td>{row.item}</td>
                  <td>{row.standard || "없어야 함"}</td>
                  <td>
                    {editable ? (
                      <select
                        className="ir-field-select"
                        value={row.result || "양호"}
                        onChange={(event) => onAppearanceChange?.(index, event.target.value)}
                      >
                        <option value="양호">양호</option>
                        <option value="불량">불량</option>
                      </select>
                    ) : (
                      row.result
                    )}
                  </td>
                  <td>
                    <JudgmentBadge value={row.judgment} compact />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="ir-section-summary">
            외관검사 종합 판정: <JudgmentBadge value={report.appearanceSummary} compact />
          </p>
        </section>
        ) : null}

        {scope.hardness ? (
        <section className="ir-section">
          <SectionTitle number="⑦" title="경도검사 (측정값)" />
          {(scope.hardeningDepth || heatCalcs) && heatCalcs ? (
            <div className="ir-ht-calc">
              <p className="ir-ht-calc__basis">
                유효경화깊이 계산: {depthBasisLabel}
                {heatCalcs.meta?.coreHv != null ? ` · 심부 ${heatCalcs.meta.coreHv}HV` : ""}
              </p>
              <table className={`${tableClass} ir-ht-calc__table`}>
                <thead>
                  <tr>
                    <th>항목</th>
                    <th>자동 계산</th>
                    <th>최종 적용</th>
                    <th>단위</th>
                  </tr>
                </thead>
                <tbody>
                  {DEPTH_FIELD_KEYS.map((fieldKey) => {
                    const field = heatCalcs[fieldKey];
                    if (!field) return null;
                    return (
                      <tr key={fieldKey}>
                        <td>{DEPTH_FIELD_LABELS[fieldKey]}</td>
                        <td className="ir-ht-calc__auto">
                          {field.auto != null ? formatDepthMm(field.auto) : "—"}
                        </td>
                        <td>
                          {editable ? (
                            <CellInput
                              type="number"
                              step="0.01"
                              value={
                                field.edited != null
                                  ? field.edited
                                  : field.final != null
                                    ? field.final
                                    : ""
                              }
                              onChange={(value) => onHeatTreatmentCalcChange?.(fieldKey, value)}
                            />
                          ) : field.final != null ? (
                            formatDepthMm(field.final)
                          ) : (
                            "—"
                          )}
                        </td>
                        <td>mm</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {editable ? (
                <p className="ir-ht-calc__hint">
                  자동 계산값은 이력으로 저장됩니다. 최종 적용값을 검사자가 수정할 수 있습니다.
                </p>
              ) : null}
            </div>
          ) : null}
          <table className={tableClass}>
            <thead>
              <tr>
                <th>항목</th>
                <th>스펙</th>
                <th>측정값</th>
                <th>단위</th>
                <th>판정</th>
                <th>비고</th>
              </tr>
            </thead>
            <tbody>
              {report.hardnessRows.map((row, index) => (
                <tr key={row.item}>
                  <td>{row.item}</td>
                  <td>{row.spec}</td>
                  <td>
                    {editable ? (
                      <CellInput
                        value={row.measuredRaw ?? row.measured ?? ""}
                        onChange={(value) => onHardnessChange?.(index, "measured", value)}
                      />
                    ) : (
                      row.measured
                    )}
                  </td>
                  <td>{row.unit || "—"}</td>
                  <td>
                    <JudgmentBadge value={row.judgment} compact />
                  </td>
                  <td>
                    {editable ? (
                      <CellInput
                        value={row.note ?? ""}
                        onChange={(value) => onHardnessChange?.(index, "note", value)}
                      />
                    ) : (
                      row.note || "—"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="ir-section-summary">
            경도검사 종합 판정: <JudgmentBadge value={report.hardnessSummary} compact />
          </p>
        </section>
        ) : null}
      </div>

      <div className={`ir-grid ir-grid--middle${!scope.dimension && !scope.microstructure ? " ir-grid--single" : ""}`}>
        {scope.dimension ? (
        <section className="ir-section">
          <SectionTitle number="⑧" title="치수검사" />
          <table className={tableClass}>
            <thead>
              <tr>
                <th>항목</th>
                <th>스펙</th>
                <th>측정값</th>
                <th>단위</th>
                <th>판정</th>
              </tr>
            </thead>
            <tbody>
              {report.dimensionRows.map((row, index) => (
                <tr key={row.item}>
                  <td>{row.item}</td>
                  <td>{row.spec}</td>
                  <td>
                    {editable ? (
                      <CellInput
                        value={row.measuredRaw ?? row.measured ?? ""}
                        onChange={(value) => onDimensionChange?.(index, "measured", value)}
                      />
                    ) : (
                      row.measured
                    )}
                  </td>
                  <td>{row.unit || "mm"}</td>
                  <td>
                    <JudgmentBadge value={row.judgment} compact />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="ir-section-summary">
            치수검사 종합 판정: <JudgmentBadge value={report.dimensionSummary} compact />
          </p>
        </section>
        ) : null}

        {scope.microstructure ? (
          <section
            className={`ir-section${report.hasMicrostructurePhoto ? " ir-section--has-micro" : ""}`}
          >
            <SectionTitle number="⑨" title="조직검사 (선택)" />
            {microToggle}
            {report.hasMicrostructurePhoto ? (
              <>
                <div className="ir-micro-photos">
                  {["1000x", "500x", "200x"].map((mag, index) => (
                    <figure key={mag} className="ir-micro-photo">
                      {editable ? (
                        <label className="ir-micro-photo__upload">
                          {microPhotos[index] ? (
                            <img src={microPhotos[index]} alt={`${mag} 조직사진`} />
                          ) : (
                            <div className="ir-micro-photo__frame" aria-hidden="true" />
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            className="ir-micro-photo__file"
                            onChange={(event) => {
                              const file = event.target.files?.[0];
                              if (!file) return;
                              const reader = new FileReader();
                              reader.onload = () => onMicroPhotoUpload?.(index, reader.result);
                              reader.readAsDataURL(file);
                            }}
                          />
                        </label>
                      ) : microPhotos[index] ? (
                        <img src={microPhotos[index]} alt={`${mag} 조직사진`} className="ir-micro-photo__img" />
                      ) : (
                        <div className="ir-micro-photo__frame" aria-hidden="true" />
                      )}
                      <figcaption>{mag}</figcaption>
                    </figure>
                  ))}
                </div>
                <div className="ir-micro-judgment">
                  <span>조직판정</span>
                  <label>
                    <input
                      type="radio"
                      readOnly={!editable}
                      checked={report.microstructureJudgment === "이상없음"}
                      onChange={() => editable && onMicrostructureJudgment?.("이상없음")}
                    />
                    이상없음
                  </label>
                  <label>
                    <input
                      type="radio"
                      readOnly={!editable}
                      checked={report.microstructureJudgment === "조직이상"}
                      onChange={() => editable && onMicrostructureJudgment?.("조직이상")}
                    />
                    조직이상
                  </label>
                </div>
                <p className="ir-section-summary">
                  조직검사 판정: <JudgmentBadge value={report.microstructureSummary} compact />
                </p>
              </>
            ) : null}
          </section>
        ) : null}
      </div>

      <div className={`ir-grid ir-grid--bottom${!scope.other ? " ir-grid--single" : ""}`}>
        {scope.other ? (
        <section className="ir-section">
          <SectionTitle number="⑩" title="기타검사" />
          <table className={tableClass}>
            <thead>
              <tr>
                <th>항목</th>
                <th>결과</th>
                <th>비고</th>
              </tr>
            </thead>
            <tbody>
              {report.otherRows.map((row, index) => (
                <tr key={`${row.item}-${index}`}>
                  <td>
                    {editable ? (
                      <CellInput
                        value={row.item}
                        onChange={(value) => onOtherChange?.(index, "item", value)}
                      />
                    ) : (
                      row.item
                    )}
                  </td>
                  <td>
                    {editable ? (
                      <CellInput
                        value={row.result}
                        onChange={(value) => onOtherChange?.(index, "result", value)}
                      />
                    ) : (
                      row.result
                    )}
                  </td>
                  <td>
                    {editable ? (
                      <CellInput
                        value={row.note}
                        onChange={(value) => onOtherChange?.(index, "note", value)}
                      />
                    ) : (
                      row.note
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
        ) : null}

        <section className="ir-section">
          <SectionTitle number="⑪" title="비고" />
          {editable ? (
            <textarea
              className="ir-remarks ir-remarks--editable"
              value={report.remarks ?? ""}
              onChange={(event) => onRemarksChange?.(event.target.value)}
              rows={4}
            />
          ) : (
            <p className="ir-remarks">{report.remarks}</p>
          )}
          <div className="ir-final-inline">
            <span className="ir-final-inline__label">최종판정</span>
            <JudgmentBadge value={report.finalJudgment} compact />
          </div>
        </section>
      </div>
    </div>
  );
}

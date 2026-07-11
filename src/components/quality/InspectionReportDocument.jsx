import { useState } from "react";
import { Camera, LineChart, List } from "lucide-react";
import { formatQtyWithUnit } from "../../utils/productUnits";
import { getHardeningChartPoints } from "../../utils/inspectionReportModel";
import { applyHardeningDepthRows } from "../../utils/hardeningDepthModel";
import { buildDimensionInspectionRowsFromSpec } from "../../utils/dimensionInspectionModel";
import { createDefaultSpecification } from "../../utils/productSpecificationModel";
import {
  getPreviousHardeningDepthRows,
  getInspectionScope,
  rebuildRowsFromSpecification,
  updateSpecificationSection,
} from "../../utils/inspectionReportEditor";
import { buildMainInspectionResultRows } from "../../utils/inspectionScope";
import HardeningDepthCurveChart from "./HardeningDepthCurveChart";
import HardeningDepthDataTable from "./HardeningDepthDataTable";
import HardnessConversionHint from "./HardnessConversionHint";
import InspectionUtilitiesPanel from "./InspectionUtilitiesPanel";
import MicrostructurePhotoSlots from "../../pages/Settings/MicrostructurePhotoSlots";
import {
  DEPTH_FIELD_KEYS,
  DEPTH_FIELD_LABELS,
  formatDepthCalcAutoDisplay,
  formatDepthMm,
  getCaseDepthBasisLabel,
  getEffectiveDepthBasisLabel,
} from "../../utils/heatTreatmentCalculationEngine";
import { TitanMasterAutocomplete } from "../../foundation/components/TitanSearchAutocomplete";

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

function MasterAutocompleteCell({
  editable,
  field,
  value,
  companyFilter = "",
  onChange,
  onSelect,
  enableProductAutofill = false,
}) {
  if (!editable) return value || "—";
  return (
    <TitanMasterAutocomplete
      field={field}
      value={value ?? ""}
      onChange={onChange}
      onSelect={onSelect}
      companyFilter={companyFilter}
      enableProductAutofill={enableProductAutofill}
      className="ir-field-autocomplete"
    />
  );
}

function applyProductAutofillSelection(meta, onBasicChange, onPartNoApply) {
  if (!meta?.autofill || !onBasicChange) return false;
  const { autofill } = meta;
  if (autofill.company) onBasicChange("company", autofill.company);
  if (autofill.partName) onBasicChange("partName", autofill.partName);
  if (autofill.partNo) {
    onBasicChange("partNo", autofill.partNo);
    onPartNoApply?.(autofill.partNo);
  }
  if (autofill.drawingNo) onBasicChange("drawingNo", autofill.drawingNo);
  if (autofill.material) onBasicChange("material", autofill.material);
  return true;
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
  onDimensionInspectionChange,
  onAppearanceChange,
  onMicrostructureToggle,
  onMicrostructureJudgment,
  onMicroPhotoUpload,
  onMicroPhotosChange,
  onOtherChange,
  onRemarksChange,
  onSpecificationChange,
  onHeatTreatmentCalcChange,
  onCoreHardnessChange,
}) {
  if (!report) return null;

  const [chartOpen, setChartOpen] = useState(true);
  const [dimensionDetailOpen, setDimensionDetailOpen] = useState(false);
  const [registerTab, setRegisterTab] = useState("results");
  const scope = getInspectionScope(report.appliedSpecification);
  const mainResultRows =
    report.mainResultRows?.length > 0
      ? report.mainResultRows
      : buildMainInspectionResultRows(report, scope);
  const chartPoints = getHardeningChartPoints(report);
  const heatCalcs = report.heatTreatmentCalculations;
  const effectiveThresholdHv =
    heatCalcs?.meta?.effectiveThresholdHv ?? report.appliedSpecification?.heatTreatment?.specifiedHv ?? 390;
  const depthBasisLabel = report.appliedSpecification
    ? getEffectiveDepthBasisLabel(report.appliedSpecification)
    : "390HV 기준";
  const caseBasisLabel = heatCalcs?.meta?.caseDepthThresholdHv
    ? getCaseDepthBasisLabel(heatCalcs.meta.caseDepthThresholdHv)
    : "390HV 기준";
  const manualHardnessRows = (report.hardnessRows || []).filter((row) => !row.autoCalculated);
  const autoHardnessRows = (report.hardnessRows || []).filter((row) => row.autoCalculated);
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
      dimensionInspectionRows: scope.dimension
        ? buildDimensionInspectionRowsFromSpec(nextSpec)
        : [],
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
  const simplifiedRegister = editable && mode === "screen";

  const resolveHardnessRowIndex = (hardnessKey) => {
    const manualRows = (report.hardnessRows || []).filter((row) => !row.autoCalculated);
    return manualRows.findIndex((row) => row.key === hardnessKey);
  };

  const renderMainResultCell = (row) => {
    if (!editable) return row.result || "—";

    if (row.inputType === "hardness") {
      const index = resolveHardnessRowIndex(row.hardnessKey);
      const manualRow = (report.hardnessRows || []).filter((r) => !r.autoCalculated)[index];
      if (index < 0 || !manualRow) return row.result || "—";
      return (
        <div className="ir-hardness-measured-cell">
          <CellInput
            value={manualRow.measuredRaw ?? manualRow.measured ?? ""}
            onChange={(value) => onHardnessChange?.(index, "measured", value)}
          />
          <HardnessConversionHint
            value={manualRow.measuredRaw ?? manualRow.measured ?? ""}
            fromUnit={manualRow.unit || "HV"}
            spec={report.appliedSpecification}
            maxTargets={2}
          />
        </div>
      );
    }

    if (row.inputType === "appearance") {
      return (
        <select
          className="ir-field-select"
          value={row.resultRaw === "불량" ? "불량" : "양호"}
          onChange={(event) => {
            const value = event.target.value;
            (report.appearanceRows || []).forEach((_, index) => {
              onAppearanceChange?.(index, value);
            });
          }}
        >
          <option value="양호">양호</option>
          <option value="불량">불량</option>
        </select>
      );
    }

    if (row.inputType === "microstructure") {
      return (
        <span className={`ir-micro-attach${row.hasAttachment ? " ir-micro-attach--on" : ""}`}>
          {row.hasAttachment ? "첨부" : "—"}
        </span>
      );
    }

    if (row.inputType === "dimension") {
      return row.result || "—";
    }

    return row.result || "—";
  };

  const renderAutoCalcSummaryTable = () => {
    if (!heatCalcs || (!scope.hardeningDepth && !scope.hardness)) return null;

    return (
      <div className="ir-ht-calc ir-ht-calc--compact">
        <h4 className="ir-subsection-title">자동계산 요약</h4>
        <p className="ir-ht-calc__basis">
          유효경화깊이: {depthBasisLabel}
          {heatCalcs.meta?.coreHv != null ? ` · 심부 ${heatCalcs.meta.coreHv}HV` : ""}
          {" · "}경화깊이: {caseBasisLabel}
        </p>
        <table className={`${tableClass} ir-ht-calc__table`}>
          <thead>
            <tr>
              <th>항목</th>
              <th>자동계산</th>
              <th>최종적용</th>
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
                    {formatDepthCalcAutoDisplay(field, heatCalcs.meta?.depthDecimalPlaces)}
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
    );
  };

  const renderHardeningDepthBlock = ({ showChart = true, showTable = true, chartFirst = true } = {}) => {
    if (!scope.hardeningDepth) return null;

    const chartNode = showChart ? (
      <HardeningDepthCurveChart
        compact
        points={chartPoints}
        effectiveDepthMm={report.effectiveDepthMm}
        hardeningDepth390={report.hardeningDepth390}
        referenceLine={effectiveThresholdHv}
        title="경도곡선"
      />
    ) : null;

    const tableNode = showTable ? (
      <HardeningDepthDataTable
        rows={report.hardeningDepthRows || []}
        editable={editable}
        tableClass={tableClass}
        spec={report.appliedSpecification}
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
    ) : null;

    if (!chartNode && !tableNode) return null;

    return (
      <div className={`ir-hv-panel${chartFirst ? "" : " ir-hv-panel--table-first"}`}>
        {chartFirst ? (
          <>
            {chartNode}
            {tableNode}
          </>
        ) : (
          <>
            {tableNode}
            {chartNode}
          </>
        )}
      </div>
    );
  };

  const renderRegisterBasicGrid = () => (
    <section className="ir-section ir-section--compact ir-section--full">
      <h3 className="ir-section-title ir-section-title--plain">기본정보</h3>
      <div className="ir-basic-grid">
        <label className="ir-basic-grid__field">
          <span>관리번호</span>
          <BasicCell
            editable={editable}
            value={report.managementId}
            onChange={(value) => onBasicChange?.("managementId", value)}
          />
        </label>
        <label className="ir-basic-grid__field">
          <span>LOT</span>
          <BasicCell
            editable={editable}
            value={report.lotNo}
            onChange={(value) => onBasicChange?.("lotNo", value)}
          />
        </label>
        <label className="ir-basic-grid__field">
          <span>품명</span>
          <MasterAutocompleteCell
            editable={editable}
            field="partName"
            value={report.partName}
            companyFilter={report.company}
            enableProductAutofill={Boolean(report.company)}
            onChange={(value) => onBasicChange?.("partName", value)}
            onSelect={(value, meta) => {
              if (!applyProductAutofillSelection(meta, onBasicChange, onPartNoApply)) {
                onBasicChange?.("partName", value);
              }
            }}
          />
        </label>
        <label className="ir-basic-grid__field">
          <span>품번</span>
          <MasterAutocompleteCell
            editable={editable}
            field="partNo"
            value={report.partNo}
            companyFilter={report.company}
            enableProductAutofill={Boolean(report.company)}
            onChange={(value) => onBasicChange?.("partNo", value)}
            onSelect={(value, meta) => {
              if (!applyProductAutofillSelection(meta, onBasicChange, onPartNoApply)) {
                onBasicChange?.("partNo", value);
                onPartNoApply?.(value);
              }
            }}
          />
        </label>
        <label className="ir-basic-grid__field">
          <span>업체명</span>
          <MasterAutocompleteCell
            editable={editable}
            field="company"
            value={report.company}
            onChange={(value) => onBasicChange?.("company", value)}
            onSelect={(value) => onBasicChange?.("company", value)}
          />
        </label>
        <label className="ir-basic-grid__field">
          <span>검사일</span>
          <BasicCell
            editable={editable}
            type="date"
            value={report.inspectionDate}
            onChange={(value) => onBasicChange?.("inspectionDate", value)}
          />
        </label>
        <label className="ir-basic-grid__field">
          <span>작업수량</span>
          {report.workQtyLabel || formatQtyWithUnit(report.qty, report.unit)}
        </label>
        <label className="ir-basic-grid__field">
          <span>검사수량</span>
          {editable ? (
            <span className="ir-qty-cell">
              <CellInput
                type="number"
                value={report.qty}
                onChange={(value) => onBasicChange?.("qty", Number(value) || 0)}
              />
              <CellInput value={report.unit} onChange={(value) => onBasicChange?.("unit", value)} />
            </span>
          ) : (
            formatQtyWithUnit(report.qty, report.unit)
          )}
        </label>
        <label className="ir-basic-grid__field">
          <span>열처리 공정</span>
          <BasicCell
            editable={editable}
            value={report.process}
            onChange={(value) => onBasicChange?.("process", value)}
          />
        </label>
        <label className="ir-basic-grid__field">
          <span>검사자</span>
          <BasicCell
            editable={editable}
            value={report.inspector}
            onChange={(value) => onBasicChange?.("inspector", value)}
          />
        </label>
        <label className="ir-basic-grid__field">
          <span>승인자</span>
          <BasicCell
            editable={editable}
            value={report.approver}
            onChange={(value) => onBasicChange?.("approver", value)}
          />
        </label>
        <label className="ir-basic-grid__field ir-basic-grid__field--span2">
          <span>비고</span>
          {editable ? (
            <CellInput value={report.remarks ?? ""} onChange={(value) => onRemarksChange?.(value)} />
          ) : (
            report.remarks || "—"
          )}
        </label>
      </div>
    </section>
  );

  const renderRegisterTabNav = () => {
    const tabs = [
      { id: "results", label: "검사결과", icon: List },
      ...(scope.hardeningDepth
        ? [{ id: "depth", label: "경화깊이 데이터", icon: LineChart }]
        : []),
      ...(scope.microstructure ? [{ id: "micro", label: "조직사진", icon: Camera }] : []),
    ];

    return (
      <nav className="ir-tabs" aria-label="검사 리포트 탭">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              className={`ir-tabs__btn${registerTab === tab.id ? " ir-tabs__btn--active" : ""}`}
              onClick={() => setRegisterTab(tab.id)}
            >
              <Icon size={14} aria-hidden="true" />
              {tab.label}
            </button>
          );
        })}
      </nav>
    );
  };

  const renderRegisterCoreHardnessField = () => {
    if (!editable || !scope.hardeningDepth || !heatCalcs) return null;

    return (
      <label className="ir-core-hv-field">
        <span>심부경도 (Core) HV</span>
        <CellInput
          type="number"
          value={report.coreHardnessHv ?? ""}
          onChange={(value) => onCoreHardnessChange?.(value)}
          placeholder="검사 측정값"
        />
        <HardnessConversionHint
          value={report.coreHardnessHv}
          fromUnit="HV"
          spec={report.appliedSpecification}
          maxTargets={1}
        />
        <span className="ir-core-hv-field__hint">Core+값 유효경화깊이 계산에 사용 (판정 항목 아님)</span>
      </label>
    );
  };

  const renderRegisterDetailSection = () => (
    <section className="ir-register-detail">
      <h4 className="ir-subsection-title">측정 상세</h4>
      {renderRegisterCoreHardnessField()}
      {renderAutoCalcSummaryTable()}
      {renderHardeningDepthBlock({ showChart: true, showTable: true, chartFirst: false })}
      {scope.dimension ? renderDimensionDetailSection() : null}
      {scope.other ? (
        <div className="ir-other-inline">
          <h4 className="ir-subsection-title">기타검사</h4>
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
                    <CellInput
                      value={row.item}
                      onChange={(value) => onOtherChange?.(index, "item", value)}
                    />
                  </td>
                  <td>
                    <CellInput
                      value={row.result}
                      onChange={(value) => onOtherChange?.(index, "result", value)}
                    />
                  </td>
                  <td>
                    <CellInput
                      value={row.note}
                      onChange={(value) => onOtherChange?.(index, "note", value)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );

  const renderRegisterResultsTab = () => (
    <div className="ir-register-results">
      <div className="ir-register-results__main">
        <h4 className="ir-subsection-title">검사항목 결과</h4>
        <table className={tableClass}>
          <thead>
            <tr>
              <th>검사항목</th>
              <th>Spec</th>
              <th>기준</th>
              <th>결과</th>
              <th>판정</th>
            </tr>
          </thead>
          <tbody>
            {mainResultRows.map((row) => (
              <tr key={row.key}>
                <td>{row.item}</td>
                <td>{row.spec}</td>
                <td>{row.basis}</td>
                <td>{renderMainResultCell(row)}</td>
                <td>
                  <JudgmentBadge value={row.judgment} compact />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="ir-final-inline ir-final-inline--register">
          <span className="ir-final-inline__label">최종판정</span>
          <JudgmentBadge value={report.finalJudgment} compact />
        </div>
      </div>
      {renderRegisterDetailSection()}
    </div>
  );

  const renderRegisterDepthTab = () => (
    <section className="ir-section ir-section--compact ir-section--full">
      <h4 className="ir-subsection-title">경화깊이 데이터</h4>
      <div className="ir-hv-split ir-hv-split--register">
        <div className="ir-hv-split__data">
          <HardeningDepthDataTable
            rows={report.hardeningDepthRows || []}
            editable={editable}
            tableClass={tableClass}
            spec={report.appliedSpecification}
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
          <HardeningDepthCurveChart
            compact
            points={chartPoints}
            effectiveDepthMm={report.effectiveDepthMm}
            hardeningDepth390={report.hardeningDepth390}
            referenceLine={effectiveThresholdHv}
            title="경도곡선"
          />
        </div>
      </div>
      {renderAutoCalcSummaryTable()}
    </section>
  );

  const renderRegisterMicroTab = () => (
    <section className="ir-section ir-section--compact ir-section--full">
      <h4 className="ir-subsection-title">조직사진</h4>
      {microToggle}
      {report.hasMicrostructurePhoto ? (
        <>
          <MicrostructurePhotoSlots
            photos={report.microstructurePhotos || []}
            editable={editable}
            className="ir-micro-slots"
            onChange={onMicroPhotosChange}
          />
          <div className="ir-micro-judgment">
            <span>조직판정</span>
            <label>
              <input
                type="radio"
                checked={report.microstructureJudgment === "이상없음"}
                onChange={() => onMicrostructureJudgment?.("이상없음")}
              />
              이상없음
            </label>
            <label>
              <input
                type="radio"
                checked={report.microstructureJudgment === "조직이상"}
                onChange={() => onMicrostructureJudgment?.("조직이상")}
              />
              조직이상
            </label>
          </div>
        </>
      ) : (
        <p className="ir-section-empty">조직사진 유무를 &quot;있음&quot;으로 선택하면 첨부할 수 있습니다.</p>
      )}
    </section>
  );

  const renderDimensionDetailSection = () => {
    if (!scope.dimension || !simplifiedRegister) return null;

    return (
      <section className="ir-section ir-section--full ir-section--collapsible">
        <button
          type="button"
          className="ir-collapse-toggle"
          onClick={() => setDimensionDetailOpen((open) => !open)}
        >
          {dimensionDetailOpen ? "▲" : "▼"} 치수 상세 입력
        </button>
        {dimensionDetailOpen ? (
          <div className="ir-collapse-body">
            {(report.dimensionInspectionRows?.length ?? 0) > 0 ? (
              <table className={tableClass}>
                <thead>
                  <tr>
                    <th>항목</th>
                    <th>스펙</th>
                    <th>열처리 전</th>
                    <th>열처리 후</th>
                    <th>변형량</th>
                    <th>단위</th>
                    <th>판정</th>
                  </tr>
                </thead>
                <tbody>
                  {report.dimensionInspectionRows.map((row, index) => (
                    <tr key={row.id}>
                      <td>{row.item}</td>
                      <td>{row.spec}</td>
                      <td>
                        <CellInput
                          value={row.beforeHtRaw ?? row.beforeHt ?? ""}
                          onChange={(value) =>
                            onDimensionInspectionChange?.(index, "beforeHtRaw", value)
                          }
                        />
                      </td>
                      <td>
                        <CellInput
                          value={row.afterHtRaw ?? row.afterHt ?? ""}
                          onChange={(value) =>
                            onDimensionInspectionChange?.(index, "afterHtRaw", value)
                          }
                        />
                      </td>
                      <td>{row.deformationRaw || (row.deformation ?? "—")}</td>
                      <td>{row.unit || "mm"}</td>
                      <td>
                        <JudgmentBadge value={row.judgment} compact />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
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
                        <CellInput
                          value={row.measuredRaw ?? row.measured ?? ""}
                          onChange={(value) => onDimensionChange?.(index, "measured", value)}
                        />
                      </td>
                      <td>{row.unit || "mm"}</td>
                      <td>
                        <JudgmentBadge value={row.judgment} compact />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ) : null}
      </section>
    );
  };

  return (
    <div className={`ir-document ir-document--${mode}${simplifiedRegister ? " ir-document--register" : ""}`}>
      {scopeToolbar}
      {!simplifiedRegister ? (
      <section className="ir-section ir-section--full">
        <SectionTitle number="①" title="기본정보" />
        <table className={tableClass}>
          <tbody>
            <tr>
              <th>업체명</th>
              <td>
                <MasterAutocompleteCell
                  editable={editable}
                  field="company"
                  value={report.company}
                  onChange={(value) => onBasicChange?.("company", value)}
                  onSelect={(value) => onBasicChange?.("company", value)}
                />
              </td>
              <th>품명</th>
              <td>
                <MasterAutocompleteCell
                  editable={editable}
                  field="partName"
                  value={report.partName}
                  companyFilter={report.company}
                  enableProductAutofill={Boolean(report.company)}
                  onChange={(value) => onBasicChange?.("partName", value)}
                  onSelect={(value, meta) => {
                    if (!applyProductAutofillSelection(meta, onBasicChange, onPartNoApply)) {
                      onBasicChange?.("partName", value);
                    }
                  }}
                />
              </td>
              <th>품번</th>
              <td>
                <MasterAutocompleteCell
                  editable={editable}
                  field="partNo"
                  value={report.partNo}
                  companyFilter={report.company}
                  enableProductAutofill={Boolean(report.company)}
                  onChange={(value) => onBasicChange?.("partNo", value)}
                  onSelect={(value, meta) => {
                    if (!applyProductAutofillSelection(meta, onBasicChange, onPartNoApply)) {
                      onBasicChange?.("partNo", value);
                      onPartNoApply?.(value);
                    }
                  }}
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
      ) : null}

      {simplifiedRegister ? (
        <>
          {renderRegisterBasicGrid()}
          {renderRegisterTabNav()}
          {registerTab === "results" ? renderRegisterResultsTab() : null}
          {registerTab === "depth" && scope.hardeningDepth ? renderRegisterDepthTab() : null}
          {registerTab === "micro" && scope.microstructure ? renderRegisterMicroTab() : null}
          {editable ? (
            <InspectionUtilitiesPanel
              report={report}
              appliedSpecification={report.appliedSpecification}
              hardeningRows={report.hardeningDepthRows || []}
              coreHardnessHv={report.coreHardnessHv}
            />
          ) : null}
        </>
      ) : (
        <>
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
                spec={report.appliedSpecification}
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
                {" · "}경화깊이 계산: {caseBasisLabel}
              </p>
              {editable && scope.hardeningDepth ? (
                <label className="ir-core-hv-field">
                  <span>심부경도 (Core) HV</span>
                  <CellInput
                    type="number"
                    value={report.coreHardnessHv ?? ""}
                    onChange={(value) => onCoreHardnessChange?.(value)}
                    placeholder="검사 측정값"
                  />
                  <HardnessConversionHint
                    value={report.coreHardnessHv}
                    fromUnit="HV"
                    spec={report.appliedSpecification}
                    maxTargets={1}
                  />
                  <span className="ir-core-hv-field__hint">Core+값 유효경화깊이 계산에 사용 (판정 항목 아님)</span>
                </label>
              ) : null}
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
                          {formatDepthCalcAutoDisplay(
                            field,
                            heatCalcs.meta?.depthDecimalPlaces
                          )}
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
              {manualHardnessRows.map((row, index) => (
                <tr key={row.item}>
                  <td>{row.item}</td>
                  <td>{row.spec}</td>
                  <td>
                    {editable ? (
                      <div className="ir-hardness-measured-cell">
                        <CellInput
                          value={row.measuredRaw ?? row.measured ?? ""}
                          onChange={(value) => onHardnessChange?.(index, "measured", value)}
                        />
                        <HardnessConversionHint
                          value={row.measuredRaw ?? row.measured ?? ""}
                          fromUnit={row.unit || "HV"}
                          spec={report.appliedSpecification}
                          maxTargets={2}
                        />
                      </div>
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
              {autoHardnessRows.map((row) => (
                <tr key={`auto-${row.key}`} className="ir-hardness-row--auto">
                  <td>{row.item}</td>
                  <td>{row.spec}</td>
                  <td>{row.measured || "—"}</td>
                  <td>{row.unit || "mm"}</td>
                  <td>
                    <JudgmentBadge value={row.judgment} compact />
                  </td>
                  <td>{row.note || "자동 계산"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="ir-section-summary">
            경도검사 종합 판정: <JudgmentBadge value={report.hardnessSummary} compact />
          </p>
          {editable ? (
            <InspectionUtilitiesPanel
              report={report}
              appliedSpecification={report.appliedSpecification}
              hardeningRows={report.hardeningDepthRows || []}
              coreHardnessHv={report.coreHardnessHv}
            />
          ) : null}
        </section>
        ) : null}
      </div>

      <div className={`ir-grid ir-grid--middle${!scope.dimension && !scope.microstructure ? " ir-grid--single" : ""}`}>
        {scope.dimension ? (
        <section className="ir-section">
          <SectionTitle number="⑧" title="치수검사" />
          {(report.dimensionInspectionRows?.length ?? 0) > 0 ? (
            <table className={tableClass}>
              <thead>
                <tr>
                  <th>항목</th>
                  <th>스펙</th>
                  <th>열처리 전</th>
                  <th>열처리 후</th>
                  <th>변형량</th>
                  <th>단위</th>
                  <th>판정</th>
                </tr>
              </thead>
              <tbody>
                {report.dimensionInspectionRows.map((row, index) => (
                  <tr key={row.id}>
                    <td>{row.item}</td>
                    <td>{row.spec}</td>
                    <td>
                      {editable ? (
                        <CellInput
                          value={row.beforeHtRaw ?? row.beforeHt ?? ""}
                          onChange={(value) =>
                            onDimensionInspectionChange?.(index, "beforeHtRaw", value)
                          }
                        />
                      ) : (
                        row.beforeHt || "—"
                      )}
                    </td>
                    <td>
                      {editable ? (
                        <CellInput
                          value={row.afterHtRaw ?? row.afterHt ?? ""}
                          onChange={(value) =>
                            onDimensionInspectionChange?.(index, "afterHtRaw", value)
                          }
                        />
                      ) : (
                        row.afterHt || "—"
                      )}
                    </td>
                    <td>{row.deformationRaw || (row.deformation ?? "—")}</td>
                    <td>{row.unit || "mm"}</td>
                    <td>
                      <JudgmentBadge value={row.judgment} compact />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
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
          )}
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
        </>
      )}
    </div>
  );
}

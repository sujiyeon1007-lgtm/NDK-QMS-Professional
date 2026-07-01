import { HV_REFERENCE_LINE } from "../../utils/inspectionReportModel";

function getNiceAxisMax(value) {
  if (value <= 0) return 1200;
  const step = value <= 600 ? 200 : 400;
  return Math.ceil(value / step) * step;
}

/** Project TITAN — 경화깊이 경도 경사 곡선 (자동 생성) */
export default function HardeningDepthCurveChart({
  points = [],
  effectiveDepthMm = null,
  hardeningDepth390 = null,
  referenceLine = HV_REFERENCE_LINE,
  className = "",
  title = "경도 경사 곡선",
  compact = false,
}) {
  if (points.length === 0) {
    return <p className="ir-chart-empty">경화깊이 데이터를 입력하면 그래프가 생성됩니다.</p>;
  }

  const plotWidth = compact ? 360 : 520;
  const plotHeight = compact ? 150 : 220;
  const padding = compact
    ? { top: 18, right: 16, bottom: 28, left: 40 }
    : { top: 24, right: 24, bottom: 36, left: 52 };
  const innerWidth = plotWidth - padding.left - padding.right;
  const innerHeight = plotHeight - padding.top - padding.bottom;

  const maxDepth = Math.max(...points.map((point) => point.depthNum), 0.6);
  const maxHv = getNiceAxisMax(Math.max(...points.map((point) => point.hv), referenceLine));
  const yTicks = [0, maxHv * 0.25, maxHv * 0.5, maxHv * 0.75, maxHv];

  const mapped = points.map((point) => ({
    ...point,
    x: padding.left + (point.depthNum / maxDepth) * innerWidth,
    y: padding.top + innerHeight - (point.hv / maxHv) * innerHeight,
  }));

  const polyline = mapped.map((point) => `${point.x},${point.y}`).join(" ");
  const refY = padding.top + innerHeight - (referenceLine / maxHv) * innerHeight;
  const effectivePoint = mapped.find(
    (point) => effectiveDepthMm != null && Math.abs(point.depthNum - effectiveDepthMm) < 0.001
  );
  const effectiveX =
    effectivePoint?.x ??
    (effectiveDepthMm != null
      ? padding.left + (effectiveDepthMm / maxDepth) * innerWidth
      : null);

  return (
    <div
      className={`ir-hv-chart${compact ? " ir-hv-chart--compact" : ""} ${className}`.trim()}
      role="img"
      aria-label={title}
    >
      <h4 className="ir-hv-chart__title">{title}</h4>
      <svg viewBox={`0 0 ${plotWidth} ${plotHeight}`} className="ir-hv-chart__svg" preserveAspectRatio="xMidYMid meet">
        {yTicks.map((tick) => {
          const y = padding.top + innerHeight - (tick / maxHv) * innerHeight;
          return (
            <g key={tick}>
              <line
                x1={padding.left}
                x2={plotWidth - padding.right}
                y1={y}
                y2={y}
                className="ir-hv-chart__grid"
              />
              <text x={padding.left - 6} y={y + 3} className="ir-hv-chart__axis-y">
                {Math.round(tick)}
              </text>
            </g>
          );
        })}

        <line
          x1={padding.left}
          x2={plotWidth - padding.right}
          y1={refY}
          y2={refY}
          className="ir-hv-chart__ref-line"
        />
        <text x={plotWidth - padding.right - 2} y={refY - 4} className="ir-hv-chart__ref-label">
          {referenceLine}HV
        </text>

        {mapped.length > 1 ? <polyline points={polyline} className="ir-hv-chart__line" /> : null}
        {mapped.map((point) => (
          <circle key={`${point.depth}-${point.hv}`} cx={point.x} cy={point.y} r={compact ? 3 : 4} className="ir-hv-chart__dot" />
        ))}

        {effectiveX != null ? (
          <>
            <line
              x1={effectiveX}
              x2={effectiveX}
              y1={padding.top}
              y2={padding.top + innerHeight}
              className="ir-hv-chart__depth-line"
            />
            <text x={effectiveX + 2} y={padding.top + 12} className="ir-hv-chart__depth-label">
              {effectiveDepthMm}mm
            </text>
          </>
        ) : null}

        {mapped.map((point) => (
          <text
            key={`${point.depth}-x`}
            x={point.x}
            y={plotHeight - 8}
            textAnchor="middle"
            className="ir-hv-chart__axis-x"
          >
            {point.depth}
          </text>
        ))}
      </svg>

      <div className="ir-hv-chart__meta">
        {effectiveDepthMm != null ? <span>유효경화깊이: {effectiveDepthMm} mm</span> : null}
        {hardeningDepth390 != null ? <span>경화깊이(390HV): {hardeningDepth390} mm</span> : null}
      </div>
    </div>
  );
}

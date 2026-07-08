/**
 * Project TITAN Sprint 7 — 공유 Statistics 차트 컴포넌트 (Additive)
 *
 * StatisticsDashboard.jsx의 인라인 차트를 수정하지 않고, 생산통계 등
 * 후속 Analytics 화면에서 재사용하기 위한 공용 SVG 차트 모음.
 * 스타일은 StatisticsDashboard.css 클래스를 공유한다.
 */

export function Sparkline({ points }) {
  if (!points || points.length < 2) return null;
  const max = Math.max(...points, 1);
  const min = Math.min(...points, 0);
  const range = max - min || 1;
  const width = 96;
  const height = 28;
  const step = width / (points.length - 1);
  const path = points
    .map((value, index) => {
      const x = index * step;
      const y = height - ((value - min) / range) * height;
      return `${index === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg className="stat-dash-spark" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" aria-hidden="true">
      <path d={path} fill="none" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export function LineChart({ series, ariaLabel = "추이" }) {
  if (!series || !series.length) {
    return <p className="stat-dash-empty">데이터 준비 중</p>;
  }
  const values = series.map((item) => Number(item.value) || 0);
  const max = Math.max(...values, 1);
  const width = 640;
  const height = 185; /* Final Polish: trend 높이 축소 (240→185, ~23%) */
  const padX = 36;
  const padY = 22;
  const innerW = width - padX * 2;
  const innerH = height - padY * 2;
  const step = series.length > 1 ? innerW / (series.length - 1) : 0;
  const coords = series.map((item, index) => ({
    x: padX + index * step,
    y: padY + innerH - ((Number(item.value) || 0) / max) * innerH,
    label: item.label,
  }));
  const linePath = coords.map((c, i) => `${i === 0 ? "M" : "L"}${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(" ");
  const areaPath = `${linePath} L${coords[coords.length - 1].x.toFixed(1)},${(padY + innerH).toFixed(1)} L${coords[0].x.toFixed(1)},${(padY + innerH).toFixed(1)} Z`;
  const gridLines = [0, 0.25, 0.5, 0.75, 1];
  return (
    <svg className="stat-dash-line" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={ariaLabel}>
      {gridLines.map((g) => {
        const y = padY + innerH - g * innerH;
        return <line key={g} x1={padX} y1={y} x2={width - padX} y2={y} className="stat-dash-line__grid" />;
      })}
      <path d={areaPath} className="stat-dash-line__area" />
      <path d={linePath} className="stat-dash-line__stroke" fill="none" />
      {coords.map((c) => (
        <g key={c.label}>
          <circle cx={c.x} cy={c.y} r="3.5" className="stat-dash-line__dot" />
          <text x={c.x} y={height - 6} className="stat-dash-line__x">
            {c.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

export function Gauge({ value, ariaLabel = "달성률" }) {
  const pct = Math.max(0, Math.min(100, Number(value) || 0));
  const radius = 52;
  const circ = Math.PI * radius;
  const offset = circ - (pct / 100) * circ;
  return (
    <svg className="stat-dash-gauge" viewBox="0 0 140 80" role="img" aria-label={`${ariaLabel} ${pct}%`}>
      <path d="M18 74 A52 52 0 0 1 122 74" className="stat-dash-gauge__track" fill="none" />
      <path
        d="M18 74 A52 52 0 0 1 122 74"
        className="stat-dash-gauge__value"
        fill="none"
        strokeDasharray={circ}
        strokeDashoffset={offset}
      />
      <text x="70" y="66" className="stat-dash-gauge__label">
        {pct}%
      </text>
    </svg>
  );
}

/** 수평 랭킹 바 목록 */
export function BarRank({ rows, unit = "", max, numbered = true }) {
  const list = rows ?? [];
  if (!list.length) return <p className="stat-dash-empty">데이터 없음</p>;
  const peak = max ?? Math.max(...list.map((row) => Number(row.value) || 0), 1);
  return (
    <ol className="stat-dash-rank">
      {list.map((row, index) => (
        <li key={row.label} className="stat-dash-rank__row">
          {numbered ? <span className="stat-dash-rank__no">{index + 1}</span> : <span className="stat-dash-rank__no is-plain" aria-hidden="true" />}
          <span className="stat-dash-rank__label" title={row.label}>
            {row.label}
          </span>
          <span className="stat-dash-rank__bar" aria-hidden="true">
            <span style={{ width: `${((Number(row.value) || 0) / peak) * 100}%` }} />
          </span>
          <span className="stat-dash-rank__val">
            {Number(row.value ?? 0).toLocaleString("ko-KR")}
            {unit}
          </span>
        </li>
      ))}
    </ol>
  );
}

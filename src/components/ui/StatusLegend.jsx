const LEGEND_ITEMS = [
  { tone: "orange", label: "LOT 미지정", note: "입고 직후" },
  { tone: "blue", label: "작업지시 출력", note: "작업지시 완료" },
  { tone: "green", label: "LOT 완료", note: "LOT 배정 완료" },
  { tone: "purple", label: "성적서 완료", note: "성적서 발행" },
  { tone: "gray", label: "출고 완료", note: "출고 처리" },
];

export default function StatusLegend({ title = "상태 안내", className = "" }) {
  return (
    <aside className={`ndk-status-legend ${className}`.trim()} aria-label={title}>
      <h4>{title}</h4>
      <ul>
        {LEGEND_ITEMS.map(({ tone, label, note }) => (
          <li key={label}>
            <span className={`ndk-status-legend__dot ${tone}`} aria-hidden="true" />
            <span>
              {label}
              <span style={{ color: "#94a3b8", fontWeight: 600 }}> · {note}</span>
            </span>
          </li>
        ))}
      </ul>
    </aside>
  );
}

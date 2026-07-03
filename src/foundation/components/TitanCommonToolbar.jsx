/**
 * Project TITAN — Common Toolbar (Popup · Panel · Card)
 * 좌: 제목 · 우: Action 버튼 · 부모 100% · 줄바꿈 허용
 */
export default function TitanCommonToolbar({
  title,
  subtitle,
  titleContent,
  actions,
  className = "",
  ariaLabel = "작업 도구 모음",
}) {
  const hasTitle = Boolean(titleContent || title || subtitle);

  return (
    <div
      className={`titan-toolbar toolbar ${className}`.trim()}
      role="toolbar"
      aria-label={ariaLabel}
    >
      {hasTitle ? (
        <div className="titan-toolbar__title toolbar-title">
          {titleContent ?? (
            <>
              {title ? <h2>{title}</h2> : null}
              {subtitle ? <span>{subtitle}</span> : null}
            </>
          )}
        </div>
      ) : null}
      {actions ? (
        <div className="titan-toolbar__actions toolbar-actions">{actions}</div>
      ) : null}
    </div>
  );
}

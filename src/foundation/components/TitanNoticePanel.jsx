/**
 * Project TITAN — Notice Panel (Foundation)
 * @deprecated REV.4 — HOME 레거시 미리보기 · 품질 공지는 Document Management (`quality_notice`)
 * - 최근 N건 미리보기 · Accordion 확장
 */

import { useMemo, useState } from "react";

/**
 * @typedef {object} TitanNoticeItem
 * @property {string} id
 * @property {string} type
 * @property {string} typeLabel
 * @property {string} title
 * @property {string} [body]
 * @property {string} [date]
 * @property {string} [emoji]
 */

export default function TitanNoticePanel({
  title = "공지사항",
  notices = [],
  previewLimit = 3,
  className = "",
  headClassName = "",
  listClassName = "",
  headActions = null,
  hideHead = false,
  hideFooterToggle = false,
  expanded: expandedProp,
  onExpandedChange,
}) {
  const [expandedInternal, setExpandedInternal] = useState(false);
  const expanded = expandedProp ?? expandedInternal;

  const sortedNotices = useMemo(() => [...notices], [notices]);
  const visibleNotices = expanded ? sortedNotices : sortedNotices.slice(0, previewLimit);
  const hasMore = sortedNotices.length > previewLimit;

  const toggleExpanded = () => {
    const next = !expanded;
    if (expandedProp === undefined) {
      setExpandedInternal(next);
    }
    onExpandedChange?.(next);
  };

  return (
    <section
      className={`titan-notice-panel${expanded ? " titan-notice-panel--expanded" : ""} ${className}`.trim()}
      aria-label={title}
    >
      {hideHead && !headActions ? null : (
        <div className={`titan-notice-panel__head ${headClassName}`.trim()}>
          {hideHead ? null : <h3>{title}</h3>}
          {headActions}
        </div>
      )}

      <ul
        className={`titan-notice-list${expanded ? " titan-notice-list--expanded" : ""} ${listClassName}`.trim()}
      >
        {visibleNotices.map((notice) => (
          <li
            key={notice.id}
            className={`titan-notice-list__item titan-notice-list__item--${notice.type}`}
          >
            <div className="titan-notice-list__meta">
              <span className="titan-notice-list__type">[{notice.typeLabel}]</span>
              {notice.author ? (
                <span className="titan-notice-list__author">{notice.author}</span>
              ) : null}
              {notice.dateLabel || notice.date ? (
                <span className="titan-notice-list__date">{notice.dateLabel ?? notice.date}</span>
              ) : null}
            </div>
            <strong className="titan-notice-list__title">{notice.title}</strong>
            {expanded && notice.body ? (
              <p className="titan-notice-list__body">{notice.body}</p>
            ) : null}
          </li>
        ))}
      </ul>

      {hasMore && !hideFooterToggle ? (
        <button
          type="button"
          className="titan-notice-panel__toggle"
          onClick={toggleExpanded}
          aria-expanded={expanded}
        >
          {expanded ? "▲ 접기" : "▼ 더보기"}
        </button>
      ) : null}
    </section>
  );
}

/**
 * Project TITAN V1.0 — 공지사항 Panel (Foundation)
 *
 * HOME · 향후 공지 영역 공통
 * - 최근 N건 미리보기
 * - "+ 더보기" → 카드 아래 Accordion 확장 (페이지 이동 없음)
 * - "접기"로 축소
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
  onExpandedChange,
}) {
  const [expanded, setExpanded] = useState(false);

  const sortedNotices = useMemo(() => [...notices], [notices]);
  const visibleNotices = expanded ? sortedNotices : sortedNotices.slice(0, previewLimit);
  const hasMore = sortedNotices.length > previewLimit;

  const toggleExpanded = () => {
    setExpanded((prev) => {
      const next = !prev;
      onExpandedChange?.(next);
      return next;
    });
  };

  return (
    <section
      className={`titan-notice-panel${expanded ? " titan-notice-panel--expanded" : ""} ${className}`.trim()}
      aria-label={title}
    >
      <div className={`titan-notice-panel__head ${headClassName}`.trim()}>
        <h3>{title}</h3>
      </div>

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
              {notice.date ? <span className="titan-notice-list__date">{notice.date}</span> : null}
            </div>
            <strong className="titan-notice-list__title">{notice.title}</strong>
            {expanded && notice.body ? (
              <p className="titan-notice-list__body">{notice.body}</p>
            ) : null}
          </li>
        ))}
      </ul>

      {hasMore ? (
        <button
          type="button"
          className="titan-notice-panel__toggle"
          onClick={toggleExpanded}
          aria-expanded={expanded}
        >
          {expanded ? "▲ 접기" : "+ 더보기"}
        </button>
      ) : null}
    </section>
  );
}

import { TITAN_NOTICES } from "../../../config/titanNotices";

export default function TitanNoticeCard({ notices = TITAN_NOTICES, title = "공지사항" }) {
  return (
    <section className="titan-notice-card" aria-label={title}>
      <h4>{title}</h4>
      <ul>
        {notices.map((notice) => (
          <li key={notice.id}>
            <time dateTime={notice.date}>{notice.date}</time>
            <span>{notice.title}</span>
          </li>
        ))}
      </ul>
      <button type="button" className="titan-notice-card__all">
        전체 보기
      </button>
    </section>
  );
}

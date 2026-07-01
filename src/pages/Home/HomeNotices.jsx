import { useMemo } from "react";

import Card from "../../foundation/components/Card";
import PageTopBar from "../../foundation/layout/PageTopBar";
import { getHomeNotices } from "../../utils/homeNoticesSession";

import "./Home.css";

export default function HomeNotices() {
  const notices = useMemo(() => getHomeNotices(), []);

  return (
    <div className="home-page">
      <PageTopBar title="공지사항" description="전체 공지 목록입니다." />

      <Card className="home-panel home-panel--notice-full">
        <ul className="home-notice-list home-notice-list--full">
          {notices.map((notice) => (
            <li key={notice.id} className={`home-notice-list__item home-notice-list__item--${notice.type}`}>
              <span className="home-notice-list__type">[{notice.typeLabel}]</span>
              <strong>{notice.title}</strong>
              {notice.body ? <p className="home-notice-list__body">{notice.body}</p> : null}
              <span className="home-notice-list__date">{notice.date}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

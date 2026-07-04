/**
 * HOME — 공지사항 SessionStorage (HOME Final V1.1)
 * 모든 로그인 사용자 등록 가능 · 문서관리와 분리
 */

import { getAuthDisplayUser } from "./titanAuthSession";

const STORAGE_KEY = "project-titan-home-notices-v2";
const MIGRATION_FLAG = "project-titan-home-notices-v2-migrated";

function formatTime(date = new Date()) {
  return date.toTimeString().slice(0, 5);
}

function formatDate(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function normalizeNotice(record = {}) {
  const createdAt = record.createdAt || new Date().toISOString();
  const created = new Date(createdAt);
  return {
    id: record.id || `HN-${Date.now()}`,
    title: String(record.title ?? "").trim(),
    body: String(record.body ?? record.content ?? "").trim(),
    author: String(record.author ?? getNoticeAuthorDefault()).trim() || getNoticeAuthorDefault(),
    date: record.date || formatDate(created),
    time: record.time || formatTime(created),
    createdAt,
  };
}

function getNoticeAuthorDefault() {
  return getAuthDisplayUser().name || "사용자";
}

function migrateFromQualityNotices() {
  try {
    if (sessionStorage.getItem(MIGRATION_FLAG) === "1") return null;
    const raw = sessionStorage.getItem("project-titan-quality-notices-v1");
    if (!raw) {
      sessionStorage.setItem(MIGRATION_FLAG, "1");
      return null;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      sessionStorage.setItem(MIGRATION_FLAG, "1");
      return null;
    }
    const migrated = parsed
      .filter((item) => item.status === "active" || item.statusLabel === "공지중")
      .map((item, index) =>
        normalizeNotice({
          id: item.id ? `HN-MIG-${item.id}` : `HN-MIG-${index + 1}`,
          title: item.title,
          body: item.body,
          author: item.author,
          date: item.effectiveDate || item.createdDate,
          createdAt: item.updatedAt || item.createdAt,
        })
      );
    sessionStorage.setItem(MIGRATION_FLAG, "1");
    return migrated;
  } catch {
    sessionStorage.setItem(MIGRATION_FLAG, "1");
    return null;
  }
}

function getSeedNotices() {
  return [
    {
      id: "HN-001",
      title: "Project TITAN HOME 공지 안내",
      body: "공지사항은 HOME에서 등록·조회합니다. + 공지 등록 버튼으로 바로 등록할 수 있습니다.",
      author: "품질관리부",
      date: "2026-07-01",
      time: "09:00",
    },
    {
      id: "HN-002",
      title: "금일 업무현황 확인",
      body: "HOME 상단 금일 업무현황과 진행현황을 확인한 후 빠른 메뉴로 업무를 시작해 주세요.",
      author: "관리자",
      date: "2026-07-01",
      time: "08:30",
    },
  ].map(normalizeNotice);
}

function loadNotices() {
  try {
    const migrated = migrateFromQualityNotices();
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seed = getSeedNotices();
      if (migrated?.length) {
        const titles = new Set(migrated.map((item) => item.title));
        return [...migrated, ...seed.filter((item) => !titles.has(item.title))];
      }
      return seed;
    }
    const parsed = JSON.parse(raw);
    const stored = Array.isArray(parsed) && parsed.length > 0 ? parsed.map(normalizeNotice) : getSeedNotices();
    if (migrated?.length) {
      const ids = new Set(stored.map((item) => item.id));
      return [...migrated.filter((item) => !ids.has(item.id)), ...stored];
    }
    return stored;
  } catch {
    return getSeedNotices();
  }
}

function persist(notices) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(notices));
  } catch {
    /* quota */
  }
}

export function getHomeNotices() {
  return loadNotices()
    .slice()
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
}

export function mapHomeNoticeToPanelItem(notice) {
  const row = normalizeNotice(notice);
  return {
    id: row.id,
    type: "notice",
    typeLabel: "공지",
    title: row.title,
    body: row.body,
    author: row.author,
    date: row.date,
    time: row.time,
    dateLabel: `${row.date} ${row.time}`,
  };
}

export function addHomeNotice({ title, body, author }) {
  const trimmedTitle = String(title ?? "").trim();
  const trimmedBody = String(body ?? "").trim();
  if (!trimmedTitle) {
    return { ok: false, message: "제목을 입력해 주세요." };
  }

  const now = new Date();
  const notice = normalizeNotice({
    title: trimmedTitle,
    body: trimmedBody,
    author: author || getNoticeAuthorDefault(),
    date: formatDate(now),
    time: formatTime(now),
    createdAt: now.toISOString(),
  });

  const next = [notice, ...loadNotices()];
  persist(next);
  return { ok: true, notice };
}

export function getHomeNoticeAuthorDefault() {
  return getNoticeAuthorDefault();
}

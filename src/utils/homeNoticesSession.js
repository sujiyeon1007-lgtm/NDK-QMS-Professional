/**
 * HOME — 공지사항 SessionStorage
 */

const STORAGE_KEY = "project-titan-home-notices-v1";

export const HOME_NOTICE_TYPES = {
  notice: { value: "notice", label: "공지", emoji: "📢" },
  urgent: { value: "urgent", label: "긴급", emoji: "📌" },
  schedule: { value: "schedule", label: "일정", emoji: "📅" },
  general: { value: "general", label: "일반", emoji: "📄" },
};

function getSeedNotices() {
  return [
    {
      id: "NT-URG-001",
      type: "urgent",
      title: "출고 지연 LOT 확인 요청",
      body: "금일 출고 예정 3건 상태를 확인해 주세요.",
      date: "2026-06-30",
      createdAt: "2026-06-30T08:00:00.000Z",
    },
    {
      id: "NT-NOT-001",
      type: "notice",
      title: "품질관리부 주간 회의",
      body: "금주 금요일 14:00 회의실 A",
      date: "2026-06-30",
      createdAt: "2026-06-30T07:30:00.000Z",
    },
    {
      id: "NT-SCH-001",
      type: "schedule",
      title: "설비 점검 일정",
      body: "7월 2일 1호기 정기 점검",
      date: "2026-07-02",
      createdAt: "2026-06-29T16:00:00.000Z",
    },
    {
      id: "NT-GEN-001",
      type: "general",
      title: "성적서 양식 변경 안내",
      body: "V1.0 성적서 출력 양식이 적용되었습니다.",
      date: "2026-06-28",
      createdAt: "2026-06-28T10:00:00.000Z",
    },
  ];
}

function normalizeNotice(notice = {}) {
  const typeMeta = HOME_NOTICE_TYPES[notice.type] ?? HOME_NOTICE_TYPES.general;
  return {
    id: notice.id || `NT-${Date.now()}`,
    type: typeMeta.value,
    typeLabel: typeMeta.label,
    emoji: typeMeta.emoji,
    title: notice.title?.trim() ?? "",
    body: notice.body?.trim() ?? "",
    date: notice.date || new Date().toISOString().slice(0, 10),
    createdAt: notice.createdAt || new Date().toISOString(),
  };
}

function loadNotices() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return getSeedNotices().map(normalizeNotice);
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed.map(normalizeNotice) : getSeedNotices().map(normalizeNotice);
  } catch {
    return getSeedNotices().map(normalizeNotice);
  }
}

let notices = loadNotices();

function persistNotices() {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(notices));
  } catch {
    /* quota */
  }
}

const TYPE_ORDER = { urgent: 0, notice: 1, schedule: 2, general: 3 };

export function getHomeNotices() {
  return [...notices]
    .map(normalizeNotice)
    .sort((a, b) => {
      const typeCmp = (TYPE_ORDER[a.type] ?? 9) - (TYPE_ORDER[b.type] ?? 9);
      if (typeCmp !== 0) return typeCmp;
      return String(b.createdAt).localeCompare(String(a.createdAt));
    });
}

export function addHomeNotice(payload) {
  const notice = normalizeNotice(payload);
  notices = [notice, ...notices];
  persistNotices();
  return notice;
}

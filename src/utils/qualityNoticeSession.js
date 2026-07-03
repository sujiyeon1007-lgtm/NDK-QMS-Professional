/**
 * Document Management — 품질 공지 (Quality Notice) SessionStorage
 */

import {
  QUALITY_NOTICE_STATUS,
  resolveQualityDocumentType,
} from "../config/qualityDocumentManagement";

const STORAGE_KEY = "project-titan-quality-notices-v1";
const LEGACY_STORAGE_KEY = "project-titan-home-notices-v1";
const MIGRATION_FLAG_KEY = "project-titan-quality-notices-migrated-v1";

export const QUALITY_NOTICE_DOCUMENT_TYPE = "quality_notice";

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

function resolveStatusMeta(statusValue) {
  const raw = String(statusValue ?? "active").trim();
  return (
    QUALITY_NOTICE_STATUS.find((item) => item.value === raw || item.label === raw) ??
    QUALITY_NOTICE_STATUS[0]
  );
}

function normalizeAttachment(entry = {}) {
  if (typeof entry === "string") {
    return { id: `ATT-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, name: entry.trim() };
  }
  return {
    id: entry.id || `ATT-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: String(entry.name ?? entry.fileName ?? "").trim(),
  };
}

export function normalizeQualityNotice(record = {}) {
  const typeMeta = resolveQualityDocumentType(record.documentType ?? QUALITY_NOTICE_DOCUMENT_TYPE);
  const statusMeta = resolveStatusMeta(record.status);
  const attachments = Array.isArray(record.attachments)
    ? record.attachments.map(normalizeAttachment).filter((item) => item.name)
    : [];

  const relatedDocuments = Array.isArray(record.relatedDocuments)
    ? record.relatedDocuments.map((item) => String(item).trim()).filter(Boolean)
    : String(record.relatedDocuments ?? "")
        .split(/[,，]/)
        .map((item) => item.trim())
        .filter(Boolean);

  return {
    id: record.id || `QN-${Date.now()}`,
    documentType: typeMeta.value,
    documentTypeLabel: typeMeta.label,
    title: String(record.title ?? "").trim(),
    body: String(record.body ?? record.content ?? "").trim(),
    author: String(record.author ?? "관리자").trim() || "관리자",
    createdDate: record.createdDate || record.date || todayIsoDate(),
    effectiveDate: record.effectiveDate || record.createdDate || record.date || todayIsoDate(),
    attachments,
    relatedPartNo: String(record.relatedPartNo ?? "").trim(),
    relatedMaterial: String(record.relatedMaterial ?? "").trim(),
    relatedDocuments,
    status: statusMeta.value,
    statusLabel: statusMeta.label,
    updatedAt: record.updatedAt || record.createdAt || new Date().toISOString(),
  };
}

function getSeedQualityNotices() {
  return [
    {
      id: "QN-001",
      title: "품질관리부 주간 회의",
      body: "금주 금요일 14:00 회의실 A · 검사일지 작성 기준 공유",
      author: "품질관리부",
      createdDate: "2026-06-30",
      effectiveDate: "2026-06-30",
      status: "active",
    },
    {
      id: "QN-002",
      title: "성적서 양식 변경 안내",
      body: "V1.0 성적서 출력 양식이 적용되었습니다. Sprint 3 출력물 기준을 확인해 주세요.",
      author: "품질관리부",
      createdDate: "2026-06-28",
      effectiveDate: "2026-07-01",
      status: "active",
    },
    {
      id: "QN-003",
      title: "출고 지연 LOT 확인 요청",
      body: "금일 출고 예정 3건 상태를 확인해 주세요.",
      author: "품질관리부",
      createdDate: "2026-06-30",
      effectiveDate: "2026-06-30",
      status: "closed",
    },
  ].map(normalizeQualityNotice);
}

function migrateLegacyHomeNotices() {
  try {
    if (sessionStorage.getItem(MIGRATION_FLAG_KEY) === "1") return null;
    const raw = sessionStorage.getItem(LEGACY_STORAGE_KEY);
    if (!raw) {
      sessionStorage.setItem(MIGRATION_FLAG_KEY, "1");
      return null;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      sessionStorage.setItem(MIGRATION_FLAG_KEY, "1");
      return null;
    }
    const migrated = parsed.map((item, index) =>
      normalizeQualityNotice({
        id: item.id ? `QN-LEG-${item.id}` : `QN-LEG-${index + 1}`,
        title: item.title,
        body: item.body,
        author: "관리자",
        createdDate: item.date,
        effectiveDate: item.date,
        status: "active",
      })
    );
    sessionStorage.setItem(MIGRATION_FLAG_KEY, "1");
    return migrated;
  } catch {
    sessionStorage.setItem(MIGRATION_FLAG_KEY, "1");
    return null;
  }
}

function loadQualityNotices() {
  try {
    const migrated = migrateLegacyHomeNotices();
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seed = getSeedQualityNotices();
      if (migrated?.length) {
        const merged = [...migrated, ...seed.filter((s) => !migrated.some((m) => m.title === s.title))];
        return merged.map(normalizeQualityNotice);
      }
      return seed;
    }
    const parsed = JSON.parse(raw);
    const stored = Array.isArray(parsed) && parsed.length > 0 ? parsed.map(normalizeQualityNotice) : getSeedQualityNotices();
    if (migrated?.length) {
      const ids = new Set(stored.map((item) => item.id));
      const extras = migrated.filter((item) => !ids.has(item.id));
      return [...extras, ...stored];
    }
    return stored;
  } catch {
    return getSeedQualityNotices();
  }
}

let qualityNotices = loadQualityNotices();

function persistQualityNotices() {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(qualityNotices));
  } catch {
    /* quota */
  }
}

export function getQualityNotices() {
  qualityNotices = loadQualityNotices();
  return [...qualityNotices]
    .map(normalizeQualityNotice)
    .sort((a, b) => String(b.effectiveDate).localeCompare(String(a.effectiveDate)));
}

export function getQualityNoticeById(id) {
  return getQualityNotices().find((item) => item.id === id) ?? null;
}

export function getActiveQualityNoticesForHome(limit = 10) {
  return getQualityNotices()
    .filter((item) => item.status === "active")
    .slice(0, limit);
}

export function upsertQualityNotice(payload) {
  const next = normalizeQualityNotice({
    ...payload,
    updatedAt: new Date().toISOString(),
  });

  if (!next.title) {
    return { ok: false, message: "제목을 입력해 주세요." };
  }

  qualityNotices = loadQualityNotices();
  const index = qualityNotices.findIndex((item) => item.id === next.id);
  if (index >= 0) {
    qualityNotices[index] = next;
  } else {
    qualityNotices = [next, ...qualityNotices];
  }
  persistQualityNotices();
  return { ok: true, notice: next };
}

export function deleteQualityNotice(id) {
  qualityNotices = loadQualityNotices().filter((item) => item.id !== id);
  persistQualityNotices();
  return { ok: true };
}

export function createEmptyQualityNoticeForm(notice = null) {
  const base = notice ? normalizeQualityNotice(notice) : normalizeQualityNotice({});
  return {
    id: base.id,
    documentType: base.documentType,
    title: base.title,
    body: base.body,
    author: base.author,
    createdDate: base.createdDate,
    effectiveDate: base.effectiveDate,
    attachmentNames: base.attachments.map((item) => item.name).join(", "),
    relatedPartNo: base.relatedPartNo,
    relatedMaterial: base.relatedMaterial,
    relatedDocuments: base.relatedDocuments.join(", "),
    status: base.status,
  };
}

export function buildQualityNoticeFromForm(form) {
  return normalizeQualityNotice({
    id: form.id || undefined,
    documentType: QUALITY_NOTICE_DOCUMENT_TYPE,
    title: form.title,
    body: form.body,
    author: form.author,
    createdDate: form.createdDate,
    effectiveDate: form.effectiveDate,
    attachments: String(form.attachmentNames ?? "")
      .split(/[,，]/)
      .map((name) => name.trim())
      .filter(Boolean)
      .map((name) => ({ name })),
    relatedPartNo: form.relatedPartNo,
    relatedMaterial: form.relatedMaterial,
    relatedDocuments: String(form.relatedDocuments ?? "")
      .split(/[,，]/)
      .map((item) => item.trim())
      .filter(Boolean),
    status: form.status,
  });
}

/** HOME TitanNoticePanel 호환 shape */
export function mapQualityNoticeToHomePanelItem(notice) {
  const row = normalizeQualityNotice(notice);
  return {
    id: row.id,
    type: "quality_notice",
    typeLabel: "품질 공지",
    emoji: "📢",
    title: row.title,
    body: row.body,
    date: row.effectiveDate,
    createdAt: row.updatedAt,
  };
}

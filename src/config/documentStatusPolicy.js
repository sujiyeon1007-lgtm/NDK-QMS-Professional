/**
 * Project TITAN (PQMS) — 문서 Status 공식 정책 (프로젝트 전체 공통)
 * @see src/config/documentManagementWorkflow.js
 */

/** @typedef {"current" | "revision_required" | "pending_approval" | "unregistered" | "obsolete"} DocumentStatusId */

export const DOCUMENT_STATUS_POLICY_VERSION = "V1.0";

/** 공식 Status 5종 — 색상 · 이모지 · 명칭 프로젝트 전체 통일 */
export const DOCUMENT_STATUS_DEFINITIONS = {
  current: {
    id: "current",
    label: "최신",
    emoji: "🟢",
    tone: "green",
    cssClass: "titan-document-status--current",
    description: "현재 Revision과 동일한 최신 문서",
  },
  revision_required: {
    id: "revision_required",
    label: "개정 필요",
    emoji: "🟡",
    tone: "amber",
    cssClass: "titan-document-status--revision-required",
    description: "Revision 변경 · 최신 문서 미등록",
  },
  pending_approval: {
    id: "pending_approval",
    label: "승인 대기",
    emoji: "🔵",
    tone: "blue",
    cssClass: "titan-document-status--pending-approval",
    description: "등록됨 · 승인 전",
  },
  unregistered: {
    id: "unregistered",
    label: "미등록",
    emoji: "⚫",
    tone: "gray",
    cssClass: "titan-document-status--unregistered",
    description: "문서 미등록",
  },
  obsolete: {
    id: "obsolete",
    label: "폐기",
    emoji: "🔴",
    tone: "red",
    cssClass: "titan-document-status--obsolete",
    description: "업무 미사용 · 이력 유지",
  },
};

/** 자동 상태 전환 Workflow */
export const DOCUMENT_STATUS_AUTO_FLOW = [
  "Revision 변경 → 개정 필요",
  "문서 등록 → 승인 대기",
  "승인 → 최신",
  "폐기 → 폐기 상태",
];

export function getDocumentStatusDefinition(statusId) {
  return DOCUMENT_STATUS_DEFINITIONS[statusId] ?? DOCUMENT_STATUS_DEFINITIONS.unregistered;
}

export function formatDocumentStatusLabel(statusId, { withEmoji = true } = {}) {
  const def = getDocumentStatusDefinition(statusId);
  return withEmoji ? `${def.emoji} ${def.label}` : def.label;
}

/**
 * Registry approvalStatus → 공식 Document Status
 * @param {{ registered?: boolean, approvalStatus?: string, isObsolete?: boolean, hasStaleRevision?: boolean }} input
 * @returns {DocumentStatusId}
 */
export function resolveDocumentStatusId({
  registered = false,
  approvalStatus = "",
  isObsolete = false,
  hasStaleRevision = false,
} = {}) {
  if (!registered) return "unregistered";
  if (isObsolete || approvalStatus === "폐기" || approvalStatus === "종료") return "obsolete";
  if (hasStaleRevision || approvalStatus === "이력") return "revision_required";
  if (approvalStatus === "등록" || approvalStatus === "승인 대기") return "pending_approval";
  if (approvalStatus === "현행" || approvalStatus === "공지중") return "current";
  return "pending_approval";
}

export function resolveRegisteredLabel(statusId) {
  return statusId === "unregistered" ? "미등록" : "등록";
}

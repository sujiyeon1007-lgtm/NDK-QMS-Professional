/**
 * Project TITAN V1.3 — 문서관리 권한
 *
 * 일반: 조회 · PDF 보기 · 다운로드
 * 품질 담당: 등록 · 수정 · 삭제 · Revision
 * 관리자: 전체
 */

import { getAuthSession } from "./titanAuthSession";
import { hasFeaturePermission, isProgramAdministrator } from "./titanAuthDataSession";

export function getDocumentManagementActionPermissions(userId = getAuthSession()?.userId) {
  if (!userId) {
    return {
      canView: false,
      canPdf: false,
      canDownload: false,
      canRegister: false,
      canEdit: false,
      canDelete: false,
      canRevision: false,
      canPin: false,
    };
  }

  if (isProgramAdministrator(userId)) {
    return {
      canView: true,
      canPdf: true,
      canDownload: true,
      canRegister: true,
      canEdit: true,
      canDelete: true,
      canRevision: true,
      canPin: true,
    };
  }

  const canView = hasFeaturePermission(userId, "view");
  const canPdf = hasFeaturePermission(userId, "pdf") || canView;
  const canRegister = hasFeaturePermission(userId, "register");
  const canEdit = hasFeaturePermission(userId, "edit");
  const canDelete = hasFeaturePermission(userId, "delete") || canEdit;
  const canRevision =
    hasFeaturePermission(userId, "approve") || (canEdit && canRegister);

  return {
    canView,
    canPdf,
    canDownload: canPdf,
    canRegister,
    canEdit,
    canDelete,
    canRevision,
    canPin: false,
  };
}

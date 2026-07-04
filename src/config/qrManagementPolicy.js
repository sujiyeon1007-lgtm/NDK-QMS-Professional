/**
 * Project TITAN V1.3 — QR관리 정책 (Phase 1)
 */

export const QR_MANAGEMENT_MENU_LABEL = "QR관리";
export const QR_MANAGEMENT_FUTURE_LABEL = "QR / NFC 관리";

export const QR_MANAGEMENT_TABS = [
  { id: "inout", label: "입출고 QR", path: "/qr-management/inout" },
  { id: "equipment", label: "설비 QR", path: "/qr-management/equipment" },
];

export const QR_CREATE_PERMISSION_KEY = "qrCreate";

export const QR_MANAGEMENT_PAGE_META = {
  kicker: "Smart Access",
  title: QR_MANAGEMENT_MENU_LABEL,
  description: "입출고·설비 QR 생성 · 출력 · 재출력 · 상세조회 (V1.3 Phase 1)",
};

/** NDK PQMS — page chrome metadata (menuConfig re-export + legacy keys) */

import { buildPageMetaFromConfig, TITAN_MENU_CATALOG } from "./menuConfig";

/** Menu Freeze V1.0 — menuConfig 기준 Page Meta */
export const PAGE_META = buildPageMetaFromConfig();

/** legacy alias keys (호환) */
PAGE_META.incoming = TITAN_MENU_CATALOG.inboundStatus.pageMeta;
PAGE_META.shipment = TITAN_MENU_CATALOG.outboundStatus.pageMeta;
PAGE_META.inspectionLog = TITAN_MENU_CATALOG.quality.pageMeta;
PAGE_META.dailyWork = TITAN_MENU_CATALOG.workDaily.pageMeta;
PAGE_META.settings = TITAN_MENU_CATALOG.masterData.pageMeta;

/** @deprecated Presentation 이전 화면 — 라우트 리다이렉트 유지 */
PAGE_META.productionPlan = {
  kicker: "생산관리",
  title: "생산작업계획",
  description: "입고 제품을 선택하여 작업 리스트·LOT를 생성하고 출력합니다.",
};
PAGE_META.certificate = {
  kicker: "품질관리",
  title: "성적서",
  description: "성적서 엑셀·PDF 파일을 등록하고 관리합니다.",
};
PAGE_META.productionResults = {
  kicker: "경영분석",
  title: "생산실적관리",
  description: "생산일보 등록 데이터 기준 실적을 조회합니다.",
};
PAGE_META.statistics = {
  kicker: "경영분석",
  title: "통계 대시보드",
  description: "기간별 입고·출고·LOT·성적서 실적을 분석합니다.",
};
PAGE_META.workJournal = {
  kicker: "업무 현황",
  title: "업무일지",
  description: "금일·주간·월간 업무 기록을 조회·등록합니다.",
};
PAGE_META.workSchedule = {
  kicker: "업무 현황",
  title: "업무현황",
  description: "앞으로 해야 할 개인 업무 일정을 계획하고 관리합니다.",
};
PAGE_META.lotLookup = {
  kicker: "QR Lookup",
  title: "LOT 조회",
  description: "QR 스캔 또는 LOT 번호로 제품·작업 상태를 조회합니다.",
};

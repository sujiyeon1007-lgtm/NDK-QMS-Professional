/**

 * Project TITAN V1.1 — 업무 프로세스 중심 (QMS + Smart Factory Lite)

 *

 * 철학: 기존 Paper Workflow 유지 + Smart Workflow 추가 (대체 ❌)

 * Smart Access: One Time Input → One Scan → One Workflow

 * MES 구축 전 TITAN에서 생산상태 관리 · MES 연동 후 데이터 수신 구조 목표

 *

 * @see docs/TITAN_V12_SMART_ACCESS_PLATFORM.md — V1.2 Smart Access Platform
 * @see docs/TITAN_OFFICIAL_ARCHITECTURE.md — Official Architecture (Primary SSoT)

 * @see src/config/titanOfficialArchitecture.js

 * @see src/config/smartAccessArchitecture.js — QR/NFC Route Registry · Hybrid Modes

 * @see docs/SMART_ACCESS_ARCHITECTURE.md

 * @see src/utils/smartProducibleWorkList.js

 * @see src/utils/equipmentQr.js

 */



export {

  PROJECT_PHILOSOPHY,

  PAPER_WORKFLOW_CHAIN,

  SMART_WORKFLOW_CHAIN,

  ONE_TIME_INPUT_DATA_FLOW,

  MES_READY_ARCHITECTURE,

  OFFICIAL_EQUIPMENT_QR_CODES,

  EQUIPMENT_QR_RULES,

  QR_TARGETS_OFFICIAL,

} from "./titanOfficialArchitecture";



export {

  SMART_ACCESS_PHILOSOPHY,

  SMART_ACCESS_MODES,

  SMART_ACCESS_TARGETS,

  SMART_ACCESS_ID_REGISTRY,

  SMART_ACCESS_ID_SCHEME,

  QR_PRINT_CENTER,

  NFC_ACCESS_POLICY,

  buildSmartAccessPath,

  resolveSmartAccessPathFromId,

  parseSmartAccessId,

  getSmartAccessArchitectureSummary,

} from "./smartAccessArchitecture";



/** Smart 생산 가능 목록 출처 */

export const SMART_PRODUCIBLE_SOURCES = {

  todayInbound: {

    id: "todayInbound",

    label: "금일 입고",

    chipVariant: "complete",

    emoji: "🟢",

  },

  existingStock: {

    id: "existingStock",

    label: "기존 재고",

    chipVariant: "progress",

    emoji: "🔵",

  },

};



/** Paper 출력 유지 목록 */

export const PAPER_PRINT_OUTPUTS = [

  "입고리스트 (열처리 작업 요청)",

  "출고리스트",

  "거래명세서",

  "생산일보",

];



/** Smart 진입 — 작업일보 deep link query keys */

export const SMART_WORK_DAILY_QUERY = {

  equipment: "equipment",

  qr: "qr",

  mode: "smart",

};



/** MES 연동 방향 — aligned with Official Architecture MES Ready */

export const MES_INTEGRATION_DIRECTION = {

  beforeMes: "SessionStorage → TITAN → 생산상태 (Presentation)",

  afterMes: "MES → SQLite/API → TITAN → 품질관리",

  replacesMes: false,

  uiPolicy: "UI·Workflow 불변 — Repository/Data Source만 교체",

};



export function getTitanV11WorkflowSummary() {

  return {

    officialArchitecture: "docs/TITAN_OFFICIAL_ARCHITECTURE.md",

    philosophy: "기존 업무를 없애지 않고 더 편하게 — Paper + Smart + NFC(Future) Hybrid",

    smartAccess: "One Time Input → One Scan → One Workflow",

    smartAccessIdScheme: "NDK:// (canonical) · NDK| (legacy alias)",

    paperWorkflow: "입고 → 입고리스트 출력 → 생산 → 검사 → 성적서 → 출고 → 통계",

    smartWorkflow:

      "QR/NFC → 설비/위치 인식 → 공정 → 생산 가능 목록 → LOT → 생산중 → 생산완료 → 검사대기 → 검사 → 성적서 → 출고",

    productMasterUsage: "제품관리 공정·재질·도번 → 생산 화면 자동 필터",

    smartAccessDoc: "docs/SMART_ACCESS_ARCHITECTURE.md",

  };

}



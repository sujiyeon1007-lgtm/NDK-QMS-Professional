/**

 * MES 연동 사전 검증 (PoC) — REV.5 REAL

 * 연동 구현 ❌ · 가능 여부 확인 ✅ · Repository 마이그레이션 ON HOLD

 *

 * Cursor Rule: .cursor/rules/project-titan-mes-integration-poc.mdc

 */



/** @typedef {"success" | "fail" | "noPermission" | "timeout" | "blocked"} MesPocDataTestStatus */

/** @typedef {"complete" | "inProgress" | "waiting"} MesPocChecklistStatus */



/** @typedef {{ id: string, label: string, description: string, verifyHint?: string, mesFieldHints?: string[], titanTarget?: string, autoPassFromAnalysis?: boolean }} MesPocAnalysisCheck */



/** @typedef {{ id: string, priority: number, label: string, description: string, verifyHint: string, mesFieldHints?: string[], titanTarget?: string, syncFromDataTest?: string }} MesPocChecklistDefinition */



export const MES_POC_VERSION = "REV.5";



/** V1.1 분기 경로 */

export const MES_INTEGRATION_PATHS = {

  ORACLE: "v1.1-mes-oracle",

  CSV: "v1.1-csv-import",

  PENDING: "pending-poc",

};



/** MES Oracle 환경 (BonCfgII.ini 분석 — 비밀번호 저장 금지) */

export const MES_ORACLE_ENVIRONMENT = {

  host: "1.222.39.174",

  port: 1521,

  service: "ORCL",

  user: "NDK_MES",

  connectionString: "1.222.39.174:1521:ORCL",

  source: "MES BonCfgII.ini [DB SERVER] — 현장 DBA·VPN 확인",

  /** 클라이언트 분석으로 자동 통과 (PoC UI 체크마크) */

  analysisChecks: [

    {

      id: "oracle-server-identified",

      label: "Oracle 서버 식별",

      description: "BonCfgII.ini [DB SERVER] — 1.222.39.174:1521:ORCL 확인",

      autoPassFromAnalysis: true,

    },

    {

      id: "mes-stack-confirmed",

      label: "MES Stack 확인",

      description: "Delphi · TWOWIN · Oracle · FastReport",

      autoPassFromAnalysis: true,

    },

    {

      id: "mes-schema-user",

      label: "MES DB 사용자",

      description: "DBID=NDK_MES (스키마/계정 — DBA 읽기 전용 발급 권장)",

      autoPassFromAnalysis: true,

    },

    {

      id: "management-no-policy",

      label: "관리번호 정책",

      description: "MES 자동생성 (예: DL260702-016) · TITAN은 조회만",

      autoPassFromAnalysis: true,

    },

  ],

};



/** MES 클라이언트 분석 참조 (비밀번호·계정 저장 금지) */

export const MES_POC_REFERENCE = {

  stack: "Delphi · TWOWIN · Oracle · FastReport",

  connectionHint: `${MES_ORACLE_ENVIRONMENT.connectionString} (${MES_ORACLE_ENVIRONMENT.user})`,

  schemaHint: "NDK_MES (MES 클라이언트 DBID)",

  sampleExports: [

    "제품마스터 관리.xls",

    "제품입고관리.xls",

    "현재고 조회.xls",

    "업체별입출고현황.xls",

  ],

  mesGeneratesManagementNo: true,

  managementNoExample: "DL260702-016",

  managementNoField: "mesManagementNo",

  titanPolicy: "TITAN은 관리번호 생성하지 않음 · MES 번호 조회 사용",

  probeScript: "scripts/mes-poc/oracle-probe.sql",

  securityPrinciples: [

    "INSERT / UPDATE / DELETE 금지",

    "SELECT 읽기 전용만",

    "운영 DB 보호 — DBA 승인 계정 사용",

    "비밀번호는 TITAN 코드·Git·SessionStorage에 저장하지 않음",

  ],

};



/** 읽기 전용 데이터 테스트 (우선순위 순) */

export const MES_POC_READ_ONLY_DATA_TESTS = [

  {

    id: "product-master",

    priority: 1,

    label: "제품 Master 조회",

    description: "품번·품명·재질·Spec 등 제품 Master SELECT",

    verifyHint: "MES 제품마스터 · Export `제품마스터 관리.xls` 대조",

    mesFieldHints: ["MASVNO", "MASVNM", "MASSIZ", "MASCOLM", "MASSPCM"],

    titanTarget: "기준정보 — 제품 (MES sync)",

  },

  {

    id: "customer",

    priority: 2,

    label: "거래처 조회",

    description: "거래처 코드·명칭 SELECT",

    verifyHint: "MES 거래처 Master · VNDCOD/VNDKNM",

    mesFieldHints: ["VNDCOD", "VNDKNM"],

    titanTarget: "기준정보 — 업체 (MES sync)",

  },

  {

    id: "inbound",

    priority: 3,

    label: "입고 데이터 조회",

    description: "입고일·수량·LOT·관리번호 SELECT",

    verifyHint: "MES `제품입고관리.xls` · SADDAT/SADQTY/SADLOT",

    mesFieldHints: ["SADDAT", "SADQTY", "SADQKG", "SADVLO", "SADLOT"],

    titanTarget: "입고관리 — MES 입고 불러오기",

  },

  {

    id: "outbound",

    priority: 4,

    label: "출고 데이터 조회",

    description: "출고일·수량·거래처 SELECT",

    verifyHint: "MES 출고/명세서 화면 · 업체별입출고현황.xls",

    mesFieldHints: ["출고일", "출고수량", "VNDKNM"],

    titanTarget: "출고관리 — MES 출고 연동",

  },

  {

    id: "inventory",

    priority: 5,

    label: "재고 조회",

    description: "현재고·LOT·창고 SELECT",

    verifyHint: "MES `현재고 조회.xls` Export",

    mesFieldHints: ["재고수량", "LOT", "창고"],

    titanTarget: "재고 — MES SoT 조회",

  },

  {

    id: "csv-export",

    priority: 6,

    label: "CSV Export 가능 여부",

    description: "MES Excel/CSV Export (Fallback 경로)",

    verifyHint: "Temp/Export xls · xlsx · TITAN masterExcelImport 연동 형식",

    titanTarget: "CSV Import (V1.1 Fallback)",

  },

  {

    id: "api",

    priority: 7,

    label: "API 제공 여부",

    description: "REST/WebService/API 제공 계획·현황",

    verifyHint: "과제 개발사·NDK IT — API 명세·인증·일정 (없으면 보류)",

    titanTarget: "MesApiRepository (V1.1 선택)",

  },

];



/** PoC 체크리스트 (자동 동기화 규칙 포함) */

export const MES_POC_CHECKLIST = [

  {

    id: "env-analysis",

    priority: 1,

    label: "MES 환경 분석",

    description: "BonCfgII.ini · Stack · Oracle 연결정보 분석 완료",

    autoFromAnalysis: true,

  },

  {

    id: "oracle-connect",

    priority: 2,

    label: "Oracle 접속 검증",

    description: "공장망/VPN에서 sqlplus·SQL Developer 접속",

    syncFromDataTest: null,

    syncFromConnection: true,

  },

  {

    id: "product-master",

    priority: 3,

    label: "제품 Master 조회",

    description: "제품 Master SELECT PoC",

    syncFromDataTest: "product-master",

  },

  {

    id: "customer",

    priority: 4,

    label: "거래처 조회",

    description: "거래처 Master SELECT PoC",

    syncFromDataTest: "customer",

  },

  {

    id: "inbound",

    priority: 5,

    label: "입고 데이터 조회",

    description: "입고 트랜잭션 SELECT PoC",

    syncFromDataTest: "inbound",

  },

  {

    id: "outbound-inventory",

    priority: 6,

    label: "출고·재고 조회",

    description: "출고·재고 SELECT PoC",

    syncFromDataTest: ["outbound", "inventory"],

  },

  {

    id: "csv-fallback",

    priority: 7,

    label: "CSV Fallback 경로",

    description: "MES Export → TITAN Import 가능 여부",

    syncFromDataTest: "csv-export",

  },

  {

    id: "api-check",

    priority: 8,

    label: "API 제공 확인",

    description: "MES API/WebService 제공 여부",

    syncFromDataTest: "api",

  },

  {

    id: "repository-sim",

    priority: 9,

    label: "Repository 시뮬레이션",

    description: "UI → getRepositories() → Session/Oracle 구조 확인",

    syncFromSimulation: "repositorySimulation",

  },

  {

    id: "quality-intake",

    priority: 10,

    label: "품질접수 시뮬레이션",

    description: "MES 관리번호 → TITAN 품질접수 Demo (저장 없음)",

    syncFromSimulation: "qualityIntakeDemo",

  },

];



/** PoC 완료 레벨 (1–7) */

export const MES_POC_COMPLETION_LEVELS = [

  {

    level: 1,

    label: "Level 1 — MES 환경 분석",

    description: "BonCfgII.ini 분석 · Oracle 연결정보 · Stack 확인",

    requiredChecklistIds: ["env-analysis"],

  },

  {

    level: 2,

    label: "Level 2 — Oracle 접속",

    description: "현장/VPN에서 Oracle 읽기 전용 접속 검증",

    requiredChecklistIds: ["env-analysis", "oracle-connect"],

  },

  {

    level: 3,

    label: "Level 3 — Master 데이터",

    description: "제품·거래처 Master SELECT 성공",

    requiredChecklistIds: ["env-analysis", "oracle-connect", "product-master", "customer"],

  },

  {

    level: 4,

    label: "Level 4 — 입출고·재고",

    description: "입고·출고·재고 SELECT 성공",

    requiredChecklistIds: ["inbound", "outbound-inventory"],

  },

  {

    level: 5,

    label: "Level 5 — Fallback 경로",

    description: "CSV Export 또는 API 경로 확인",

    requiredChecklistIds: ["csv-fallback", "api-check"],

    anyOf: true,

  },

  {

    level: 6,

    label: "Level 6 — TITAN 연동 시뮬",

    description: "Repository·품질접수 Demo 완료",

    requiredChecklistIds: ["repository-sim", "quality-intake"],

  },

  {

    level: 7,

    label: "Level 7 — V1.1 연동 준비",

    description: "Oracle 직접 연동 또는 CSV Fallback 확정 · PM 승인",

    requiredChecklistIds: ["env-analysis", "oracle-connect", "product-master", "customer", "inbound"],

    readinessMin: 80,

  },

];



/** 샘플 미리보기 (분석·Demo — max 10 rows) */

export const MES_SAMPLE_PREVIEW = {

  columns: [

    { key: "mesManagementNo", label: "관리번호" },

    { key: "company", label: "업체명" },

    { key: "partName", label: "품명" },

    { key: "partNo", label: "품번" },

    { key: "material", label: "재질" },

    { key: "qty", label: "수량" },

    { key: "lotNo", label: "LOT.NO" },

    { key: "inboundDate", label: "입고일" },

  ],

  rows: [

    {

      mesManagementNo: "DL260702-016",

      company: "서암기계공업",

      partName: "GEAR SECTOR",

      partNo: "A60055216",

      material: "SCM415",

      qty: "120 EA",

      lotNo: "L260702-016",

      inboundDate: "2026-07-02",

    },

    {

      mesManagementNo: "DL260702-015",

      company: "서암기계공업",

      partName: "SHAFT",

      partNo: "A20030374",

      material: "SNCM439",

      qty: "80 EA",

      lotNo: "L260702-015",

      inboundDate: "2026-07-02",

    },

    {

      mesManagementNo: "DL260701-014",

      company: "태양정밀",

      partName: "CUP",

      partNo: "A20030435",

      material: "S45C",

      qty: "200 EA",

      lotNo: "L260701-014",

      inboundDate: "2026-07-01",

    },

    {

      mesManagementNo: "DL260701-013",

      company: "서암기계공업",

      partName: "PINION",

      partNo: "A60055203",

      material: "SCM440",

      qty: "60 EA",

      lotNo: "L260701-013",

      inboundDate: "2026-07-01",

    },

    {

      mesManagementNo: "DL260630-012",

      company: "BW",

      partName: "HOUSING",

      partNo: "CP-414549",

      material: "SCM415",

      qty: "45 EA",

      lotNo: "L260630-012",

      inboundDate: "2026-06-30",

    },

  ],

};



/** 데이터 테스트 상태 라벨 */

export const MES_POC_DATA_TEST_STATUS_LABELS = {

  success: "성공",

  fail: "실패",

  noPermission: "권한없음",

  timeout: "시간초과",

  blocked: "보류",

};



/** 체크리스트 상태 라벨 */

export const MES_POC_CHECKLIST_STATUS_LABELS = {

  complete: "완료",

  inProgress: "진행중",

  waiting: "대기",

};



/** @deprecated — 하위 호환 */

export const MES_POC_CHECKS = MES_POC_READ_ONLY_DATA_TESTS.map((test) => ({

  id: test.id,

  priority: test.priority,

  label: test.label,

  description: test.description,

  verifyHint: test.verifyHint,

  mesFieldHints: test.mesFieldHints,

  titanTarget: test.titanTarget,

}));



/** @deprecated — 하위 호환 */

export const MES_POC_STATUS_LABELS = {

  pending: "보류",

  pass: "성공",

  fail: "실패",

  blocked: "보류",

};



/** Oracle 직접 연동 판정에 필요한 데이터 테스트 */

export const MES_POC_ORACLE_CRITICAL_IDS = [

  "product-master",

  "customer",

  "inbound",

];



/** 레거시 ID → 데이터 테스트 상태 매핑 */

export function mapLegacyStatusToDataTest(legacyStatus) {

  switch (legacyStatus) {

    case "pass":

      return "success";

    case "fail":

      return "fail";

    case "blocked":

      return "blocked";

    default:

      return "blocked";

  }

}



/** 데이터 테스트 상태 → 체크리스트 상태 */

export function mapDataTestToChecklist(dataStatus) {

  switch (dataStatus) {

    case "success":

      return "complete";

    case "fail":

    case "noPermission":

      return "inProgress";

    default:

      return "waiting";

  }

}



/**

 * @param {Record<string, MesPocDataTestStatus>} dataTestStatusById

 */

export function resolveMesIntegrationRecommendation(dataTestStatusById = {}) {

  const get = (id) => dataTestStatusById[id] ?? "blocked";



  const oracleConnectPass =

    get("product-master") === "success" &&

    get("customer") === "success" &&

    get("inbound") === "success";



  if (oracleConnectPass) {

    return {

      path: MES_INTEGRATION_PATHS.ORACLE,

      label: "V1.1 — MES Oracle 연동 진행",

      summary: "Oracle Master·입고 조회 PoC 성공",

    };

  }



  const anyCriticalFail = MES_POC_ORACLE_CRITICAL_IDS.some(

    (id) => get(id) === "fail" || get(id) === "noPermission"

  );

  const csvPass = get("csv-export") === "success";



  if (anyCriticalFail && csvPass) {

    return {

      path: MES_INTEGRATION_PATHS.CSV,

      label: "V1.1 — CSV Import 구조 유지",

      summary: "Oracle/MES 직접 조회 실패 · MES Export(CSV) 경로 사용",

    };

  }



  if (anyCriticalFail && get("csv-export") === "fail") {

    return {

      path: MES_INTEGRATION_PATHS.PENDING,

      label: "PoC 추가 검증 필요",

      summary: "Oracle·CSV 모두 미확정 — 현장 DBA·MES 담당 협의",

    };

  }



  return {

    path: MES_INTEGRATION_PATHS.PENDING,

    label: "PoC 검증 진행 중",

    summary: "우선순위 항목 검증을 완료하세요",

  };

}



/**

 * @param {{ checklistStatusById?: Record<string, MesPocChecklistStatus>, dataTestStatusById?: Record<string, MesPocDataTestStatus>, connectionTestResult?: { status?: string } }} state

 */

export function syncChecklistFromState(state = {}) {

  const { checklistStatusById = {}, dataTestStatusById = {}, connectionTestResult = {} } = state;

  const next = { ...checklistStatusById };



  /** Level 1 — 분석 자동 완료 */

  next["env-analysis"] = "complete";



  /** Oracle 접속 — connection test 또는 inbound/product 성공 시 */

  const connOk =

    connectionTestResult.status === "success" ||

    connectionTestResult.status === "validated" ||

    connectionTestResult.status === "external-success";

  const oracleDataOk = ["product-master", "customer", "inbound"].some(

    (id) => dataTestStatusById[id] === "success"

  );

  if (connOk || oracleDataOk) {

    next["oracle-connect"] = connOk ? "complete" : "inProgress";

  } else if (!next["oracle-connect"]) {

    next["oracle-connect"] = "waiting";

  }



  for (const item of MES_POC_CHECKLIST) {

    if (item.autoFromAnalysis) continue;

    if (item.syncFromConnection) continue;



    if (item.syncFromDataTest) {

      const testIds = Array.isArray(item.syncFromDataTest)

        ? item.syncFromDataTest

        : [item.syncFromDataTest];

      const statuses = testIds.map((id) => dataTestStatusById[id] ?? "blocked");

      if (statuses.every((s) => s === "success")) {

        next[item.id] = "complete";

      } else if (statuses.some((s) => s === "success" || s === "fail" || s === "noPermission")) {

        next[item.id] = "inProgress";

      } else {

        next[item.id] = next[item.id] ?? "waiting";

      }

    }

  }



  return next;

}



/**

 * @param {{ checklistStatusById?: Record<string, MesPocChecklistStatus>, dataTestStatusById?: Record<string, MesPocDataTestStatus>, connectionTestResult?: { status?: string }, qualityIntakeDemo?: object, repositorySimulation?: object }} state

 */

export function calculateIntegrationReadiness(state = {}) {

  const checklist = syncChecklistFromState(state);

  const dataTests = state.dataTestStatusById ?? {};



  if (state.qualityIntakeDemo?.simulatedAt) {

    checklist["quality-intake"] = "complete";

  }

  if (state.repositorySimulation?.lastRunAt) {

    checklist["repository-sim"] = "complete";

  }



  const checklistComplete = MES_POC_CHECKLIST.filter(

    (item) => checklist[item.id] === "complete"

  ).length;

  const checklistTotal = MES_POC_CHECKLIST.length;



  const dataSuccess = MES_POC_READ_ONLY_DATA_TESTS.filter(

    (test) => dataTests[test.id] === "success"

  ).length;

  const dataTotal = MES_POC_READ_ONLY_DATA_TESTS.length;



  const checklistPercent = Math.round((checklistComplete / checklistTotal) * 100);

  const dataPercent = Math.round((dataSuccess / dataTotal) * 100);

  const percent = Math.round(checklistPercent * 0.6 + dataPercent * 0.4);



  const levels = MES_POC_COMPLETION_LEVELS.map((levelDef) => {

    const required = levelDef.requiredChecklistIds ?? [];

    let achieved = false;



    if (levelDef.anyOf) {

      achieved = required.some((id) => checklist[id] === "complete");

    } else if (levelDef.readinessMin) {

      achieved =

        percent >= levelDef.readinessMin &&

        required.every((id) => checklist[id] === "complete");

    } else {

      achieved = required.every((id) => checklist[id] === "complete");

    }



    return { ...levelDef, achieved };

  });



  const currentLevel =

    [...levels].reverse().find((level) => level.achieved)?.level ?? 0;



  return {

    percent,

    checklistPercent,

    dataPercent,

    checklistComplete,

    checklistTotal,

    dataSuccess,

    dataTotal,

    levels,

    currentLevel,

    checklistStatusById: checklist,

  };

}



/**

 * @param {object} state

 */

export function buildMesPocReport(state = {}) {

  const readiness = calculateIntegrationReadiness(state);

  const dataTests = state.dataTestStatusById ?? {};

  const recommendation = resolveMesIntegrationRecommendation(dataTests);

  const conn = state.connection ?? MES_ORACLE_ENVIRONMENT;



  const lines = [

    "=== Project TITAN MES Integration PoC Report ===",

    `Version: ${MES_POC_VERSION}`,

    `Generated: ${new Date().toISOString().slice(0, 19).replace("T", " ")}`,

    "",

    "--- Oracle Environment (analyzed) ---",

    `Host: ${conn.host ?? MES_ORACLE_ENVIRONMENT.host}`,

    `Port: ${conn.port ?? MES_ORACLE_ENVIRONMENT.port}`,

    `Service: ${conn.service ?? MES_ORACLE_ENVIRONMENT.service}`,

    `User: ${conn.user ?? MES_ORACLE_ENVIRONMENT.user}`,

    "",

    "--- Integration Readiness ---",

    `Overall: ${readiness.percent}%`,

    `Checklist: ${readiness.checklistComplete}/${readiness.checklistTotal}`,

    `Data Tests: ${readiness.dataSuccess}/${readiness.dataTotal}`,

    `Current Level: ${readiness.currentLevel} / 7`,

    "",

    "--- Data Tests ---",

    ...MES_POC_READ_ONLY_DATA_TESTS.map((test) => {

      const status = dataTests[test.id] ?? "blocked";

      return `[${MES_POC_DATA_TEST_STATUS_LABELS[status] ?? status}] ${test.label}`;

    }),

    "",

    "--- Checklist ---",

    ...MES_POC_CHECKLIST.map((item) => {

      const status = readiness.checklistStatusById[item.id] ?? "waiting";

      return `[${MES_POC_CHECKLIST_STATUS_LABELS[status] ?? status}] ${item.label}`;

    }),

    "",

    "--- V1.1 Recommendation ---",

    `${recommendation.label}: ${recommendation.summary}`,

    "",

    "--- Real PoC (REV.5) ---",

    `Electron Bridge: ${state.realPoc?.bridgeAvailable ? "available" : "browser-only"}`,

    `Repository Backend: ${state.realPoc?.repositoryBackend ?? "session"}`,

    ...(state.realPoc?.queryResults
      ? Object.entries(state.realPoc.queryResults).map(([id, qr]) =>
          `[${qr.status ?? "—"}] ${id}: ${qr.rowCount ?? 0} rows (${qr.queryTimeMs ?? 0}ms)`
        )
      : []),

    "",

    "--- Security ---",

    ...MES_POC_REFERENCE.securityPrinciples.map((p) => `• ${p}`),

    "",

    "Repository migration: ON HOLD until PoC complete.",

  ];



  return lines.join("\n");

}



/**
 * Project TITAN (PQMS) — 거래처 Master · 거래처 약칭 정책
 *
 * @see src/utils/companyAbbreviation.js
 * @see src/config/masterFirstArchitecture.js
 */

/** 거래처 Master 필드 (Architecture · STEP 1+) */
export const COMPANY_MASTER_FIELDS = [
  { key: "name", label: "업체명", userInput: true, required: true },
  { key: "code", label: "거래처코드", userInput: false, required: false, note: "약칭과 동일 자동 적용" },
  {
    key: "abbreviation",
    label: "거래처 약칭",
    auto: true,
    userInput: false,
    adminEditableOnce: true,
    required: true,
  },
  { key: "manager", label: "담당자", userInput: true },
  { key: "phone", label: "연락처", userInput: true },
  { key: "email", label: "이메일", userInput: true },
  { key: "address", label: "주소", userInput: true },
  { key: "bizNo", label: "사업자등록번호", userInput: true },
  { key: "defaultRequirements", label: "기본 요구사항", userInput: true, future: true },
  { key: "inspectionStandard", label: "검사 기준", userInput: true, future: true },
  { key: "certificateForm", label: "성적서 양식", userInput: true, future: true },
  { key: "statementForm", label: "거래명세서 양식", userInput: true, future: true },
  { key: "active", label: "사용 여부", userInput: true },
  { key: "note", label: "비고", userInput: true },
];

/** 거래처 약칭 — 공통 식별 코드 사용처 */
export const COMPANY_ABBREVIATION_USAGE = [
  "관리번호",
  "LOT",
  "출력물",
  "QR",
  "검색",
  "통계",
];

export const COMPANY_ABBREVIATION_POLICY = {
  generation: "업체명 분석 → 자동 생성 · 사용자 직접 입력 ❌",
  adminOverride:
    "동일 약칭 충돌 또는 부적합 시 관리자가 거래처 Master에서 1회 수정 · 이후 고정(abbreviationLocked)",
  designPrinciple: "자동 생성 + 최초 1회 수정 가능 — 반복 입력 최소화",
};

/** PM 예시 (검증 · Override 참고) */
export const COMPANY_ABBREVIATION_EXAMPLES = [
  { name: "서암열처리", abbreviation: "SE" },
  { name: "두산에너빌리티", abbreviation: "DS" },
  { name: "GE", abbreviation: "GE" },
  { name: "현대로템", abbreviation: "HR" },
];

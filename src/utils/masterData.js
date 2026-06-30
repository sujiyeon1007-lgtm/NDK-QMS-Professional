/**
 * 기준정보 Mock (UI · Sprint 10)
 * 향후 SQLite master 테이블로 연동 · 영구 CRUD는 후속 Sprint
 */

export const MASTER_CATEGORIES = [
  { key: "companies", label: "업체", desc: "입고·생산·성적서 공통 업체" },
  { key: "productCategory", label: "품목", desc: "품목·제품 분류" },
  { key: "workers", label: "작업자", desc: "생산·검사 담당 작업자" },
  { key: "materials", label: "재질", desc: "제품 재질 코드" },
  { key: "heatTreatment", label: "열처리 공정", desc: "가스질화 · 침탄 등" },
  { key: "status", label: "상태 코드", desc: "Workflow 상태 코드" },
  { key: "equipment", label: "설비", desc: "열처리 설비 (생산부)" },
  { key: "units", label: "단위", desc: "입고·출고·거래명세서 공통 단위 (EA · LOT · KG · SET 등)" },
  { key: "other", label: "기타 기준정보", desc: "QR · 관리번호 규칙 등" },
];

/** Sidebar · Settings 좌측 nav에 표시하는 기준정보 분류 (V1.0) */
export const MASTER_DATA_NAV_KEYS = [
  "companies",
  "productCategory",
  "workers",
  "equipment",
  "status",
];

export function getMasterNavCategories() {
  return MASTER_CATEGORIES.filter((item) => MASTER_DATA_NAV_KEYS.includes(item.key));
}

export const STATUS_GROUPS = ["입고", "생산", "성적서", "출고", "기타"];

export const MASTER_DATA = {
  companies: [
    { id: "c1", code: "DH", name: "대한정밀", note: "", active: true },
    { id: "c2", code: "SE", name: "삼성부품", note: "", active: true },
    { id: "c3", code: "WS", name: "우성기계", note: "", active: true },
    { id: "c4", code: "HA", name: "한국금속", note: "", active: true },
    { id: "c5", code: "SH", name: "신화산업", note: "", active: true },
    { id: "c6", code: "SW", name: "성우정밀", note: "긴급 대응", active: true },
  ],
  materials: [
    { id: "m1", code: "SCM440", name: "SCM440", note: "", active: true },
    { id: "m2", code: "S45C", name: "S45C", note: "", active: true },
    { id: "m3", code: "SNCM220", name: "SNCM220", note: "", active: true },
    { id: "m4", code: "SUJ2", name: "SUJ2", note: "", active: true },
  ],
  equipment: [
    { id: "e1", code: "ION-01", name: "ION-01", note: "이온질화", active: true },
    { id: "e2", code: "ION-02", name: "ION-02", note: "", active: true },
    { id: "e3", code: "ION-03", name: "ION-03", note: "", active: true },
    { id: "e4", code: "GAS-01", name: "GAS-01", note: "가스질화", active: true },
    { id: "e5", code: "GAS-02", name: "GAS-02", note: "가스질화", active: true },
  ],
  heatTreatment: [
    { id: "h1", code: "HT-GN", name: "가스질화", note: "", active: true },
    { id: "h2", code: "HT-IN", name: "이온질화", note: "", active: true },
    { id: "h2b", code: "HT-SOFT", name: "연질화", note: "", active: true },
    { id: "h3", code: "HT-SB", name: "염욕질화", note: "", active: true },
    { id: "h4", code: "HT-CP", name: "침탄", note: "", active: true },
    { id: "h5", code: "HT-HF", name: "고주파", note: "", active: true },
  ],
  status: [
    { id: "s1", code: "IN-DONE", name: "입고완료", group: "입고", active: true },
    { id: "s2", code: "PR-DONE", name: "생산완료", group: "생산", active: true },
    { id: "s3", code: "CT-ISSUE", name: "성적서 발행완료", group: "성적서", active: true },
    { id: "s4", code: "SH-WAIT", name: "출고대기", group: "출고", active: true },
    { id: "s5", code: "SH-DONE", name: "출고완료", group: "출고", active: true },
  ],
  productCategory: [
    { id: "p1", code: "FORGE", name: "단조품", note: "", active: true },
    { id: "p2", code: "MACH", name: "기계부품", note: "", active: true },
    { id: "p3", code: "AUTO", name: "자동차부품", note: "", active: true },
    { id: "p4", code: "GEAR", name: "기어류", note: "", active: true },
  ],
  workers: [
    { id: "w1", code: "OP01", name: "김작업", note: "생산부", active: true },
    { id: "w2", code: "OP02", name: "이작업", note: "생산부", active: true },
    { id: "w3", code: "QC01", name: "박검사", note: "품질부", active: true },
    { id: "w4", code: "QC02", name: "최검사", note: "품질부", active: true },
  ],
  units: [
    { id: "u1", code: "EA", name: "EA", note: "개", active: true },
    { id: "u2", code: "LOT", name: "LOT", note: "로트", active: true },
    { id: "u3", code: "KG", name: "KG", note: "킬로그램", active: true },
    { id: "u4", code: "SET", name: "SET", note: "세트", active: true },
  ],
  other: [
    { id: "o1", code: "QR-FMT", name: "QR 포맷", note: "LOT 번호만 저장 · NDK|LOT|{lotNo} 표시용", active: true },
    { id: "o2", code: "MGMT-FMT", name: "관리번호 규칙", note: "업체코드_YYYYMMDD_순번", active: true },
  ],
};

/** @type {Record<string, Array<{ id: string, code: string, name: string, note?: string, group?: string, active: boolean }>>} */
let sessionMasterData = Object.fromEntries(
  Object.entries(MASTER_DATA).map(([key, rows]) => [key, rows.map((row) => ({ ...row }))])
);

export function getMasterCategories() {
  return MASTER_CATEGORIES;
}

export function getMasterCategoryMeta(categoryKey) {
  return MASTER_CATEGORIES.find((c) => c.key === categoryKey) ?? null;
}

export function getMasterDataByCategory(categoryKey) {
  return sessionMasterData[categoryKey] ?? [];
}

export function searchMasterData(categoryKey, keyword) {
  const rows = getMasterDataByCategory(categoryKey);
  if (!keyword?.trim()) return rows;
  const q = keyword.trim().toLowerCase();
  return rows.filter(
    (row) =>
      row.code.toLowerCase().includes(q) ||
      row.name.toLowerCase().includes(q) ||
      row.note?.toLowerCase().includes(q) ||
      row.group?.toLowerCase().includes(q)
  );
}

export function getActiveMasterNames(categoryKey) {
  return getMasterDataByCategory(categoryKey)
    .filter((row) => row.active)
    .map((row) => row.name);
}

export function getCompanyCodeMap() {
  return Object.fromEntries(
    getMasterDataByCategory("companies")
      .filter((row) => row.active)
      .map((row) => [row.name, row.code])
  );
}

function nextMasterRowId(categoryKey) {
  const prefix = categoryKey.slice(0, 1);
  const rows = getMasterDataByCategory(categoryKey);
  const maxNum = rows.reduce((max, row) => {
    const match = row.id.match(/(\d+)$/);
    return match ? Math.max(max, Number(match[1])) : max;
  }, 0);
  return `${prefix}${maxNum + 1}`;
}

export function validateMasterRow(categoryKey, row, mode, existingId) {
  const code = row.code?.trim() ?? "";
  const name = row.name?.trim() ?? "";

  if (!code) {
    return { ok: false, message: "코드를 입력하세요." };
  }
  if (!name) {
    return { ok: false, message: "명칭을 입력하세요." };
  }

  const rows = getMasterDataByCategory(categoryKey);
  const codeDup = rows.some(
    (item) => item.code.toLowerCase() === code.toLowerCase() && item.id !== existingId
  );
  if (codeDup) {
    return { ok: false, message: "이미 사용 중인 코드입니다." };
  }

  if (categoryKey === "status" && !row.group?.trim()) {
    return { ok: false, message: "상태 코드는 구분을 선택하세요." };
  }

  if (mode === "edit" && !existingId) {
    return { ok: false, message: "수정 대상을 선택하세요." };
  }

  return { ok: true, code, name };
}

export function stageMasterAdd(categoryKey, payload) {
  const validation = validateMasterRow(categoryKey, payload, "add");
  if (!validation.ok) {
    return { ok: false, message: validation.message };
  }

  const newRow = {
    id: nextMasterRowId(categoryKey),
    code: validation.code,
    name: validation.name,
    note: payload.note?.trim() ?? "",
    group: categoryKey === "status" ? payload.group?.trim() ?? "" : undefined,
    active: payload.active !== false,
  };

  sessionMasterData[categoryKey] = [...getMasterDataByCategory(categoryKey), newRow];
  console.log("[UI] 기준정보 추가 (세션 UI · SQLite 미연동)", { category: categoryKey, row: newRow });
  return { ok: true, row: newRow };
}

export function stageMasterUpdate(categoryKey, rowId, payload) {
  const validation = validateMasterRow(categoryKey, payload, "edit", rowId);
  if (!validation.ok) {
    return { ok: false, message: validation.message };
  }

  const rows = getMasterDataByCategory(categoryKey);
  const index = rows.findIndex((row) => row.id === rowId);
  if (index < 0) {
    return { ok: false, message: "수정 대상을 찾을 수 없습니다." };
  }

  const updated = {
    ...rows[index],
    code: validation.code,
    name: validation.name,
    note: payload.note?.trim() ?? "",
    group: categoryKey === "status" ? payload.group?.trim() ?? "" : rows[index].group,
    active: payload.active !== false,
  };

  sessionMasterData[categoryKey] = rows.map((row, i) => (i === index ? updated : row));
  console.log("[UI] 기준정보 수정 (세션 UI · SQLite 미연동)", {
    category: categoryKey,
    rowId,
    row: updated,
  });
  return { ok: true, row: updated };
}

export function stageMasterDelete(categoryKey, rowId) {
  const rows = getMasterDataByCategory(categoryKey);
  const target = rows.find((row) => row.id === rowId);
  if (!target) {
    return { ok: false, message: "삭제 대상을 찾을 수 없습니다." };
  }

  sessionMasterData[categoryKey] = rows.filter((row) => row.id !== rowId);
  console.log("[UI] 기준정보 삭제 (세션 UI · SQLite 미연동)", {
    category: categoryKey,
    row: target,
  });
  return { ok: true, row: target };
}

export const MASTER_FIELD_LINKS = {
  companies: { label: "업체명", screens: ["입고관리", "생산작업계획", "성적서관리"] },
  materials: { label: "재질", screens: ["입고관리", "생산일보"] },
  heatTreatment: { label: "열처리 공정", screens: ["입고관리", "생산작업계획"] },
  productCategory: { label: "품목", screens: ["입고관리", "통계 대시보드"] },
  workers: { label: "작업자", screens: ["생산일보", "검사일지"] },
  status: { label: "상태 코드", screens: ["HOME", "이력조회", "출고관리"] },
  equipment: { label: "설비", screens: ["생산일보", "열처리 작업 리스트"] },
  units: { label: "단위", screens: ["입고관리", "출고관리", "거래명세서", "이력조회"] },
  other: { label: "기타", screens: ["QR", "관리번호"] },
};

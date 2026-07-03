import { getMasterDataByCategory } from "./masterData";

function normalizeCompanyKey(company) {
  return String(company ?? "").trim().toLowerCase();
}

export function companyProducts(company) {
  const companyKey = normalizeCompanyKey(company);
  if (!companyKey) return [];
  return getMasterDataByCategory("products").filter(
    (row) =>
      row.active !== false &&
      String(row.company ?? "").trim().toLowerCase() === companyKey
  );
}

/** 업체 범위 내 품명 목록 (Cascade 1단계) */
export function getCompanyProductNameOptions(company, searchQuery = "") {
  const names = [
    ...new Set(companyProducts(company).map((row) => row.name).filter(Boolean)),
  ].sort((a, b) => a.localeCompare(b, "ko"));
  const q = String(searchQuery ?? "").trim().toLowerCase();
  if (!q) return names;
  return names.filter((name) => name.toLowerCase().includes(q));
}

/** 업체 범위 내 전체 품번 목록 (품번 우선 선택) */
export function getCompanyAllPartNoOptions(company, searchQuery = "") {
  const partNos = [
    ...new Set(companyProducts(company).map((row) => row.partNo).filter(Boolean)),
  ].sort((a, b) => a.localeCompare(b, "ko"));
  const q = String(searchQuery ?? "").trim().toLowerCase();
  if (!q) return partNos;
  return partNos.filter((partNo) => partNo.toLowerCase().includes(q));
}

/** 품번만으로 Product Master 행 조회 (품명 자동 채움) */
export function findCompanyProductByPartNo(company, partNo) {
  const partKey = String(partNo ?? "").trim().toLowerCase();
  if (!partKey) return null;
  const matches = companyProducts(company).filter(
    (row) => String(row.partNo ?? "").trim().toLowerCase() === partKey
  );
  return matches[0] ?? null;
}

/** 선택 품명의 품번 목록 (Cascade 2단계) */
export function getCompanyPartNoOptions(company, partName, searchQuery = "") {
  if (!partName) return getCompanyAllPartNoOptions(company, searchQuery);
  const partKey = String(partName).trim().toLowerCase();
  const partNos = [
    ...new Set(
      companyProducts(company)
        .filter((row) => String(row.name ?? "").trim().toLowerCase() === partKey)
        .map((row) => row.partNo)
        .filter(Boolean)
    ),
  ].sort((a, b) => a.localeCompare(b, "ko"));
  const q = String(searchQuery ?? "").trim().toLowerCase();
  if (!q) return partNos;
  return partNos.filter((partNo) => partNo.toLowerCase().includes(q));
}

/** 선택 품명·품번의 도번 목록 (Cascade 3단계) */
export function getCompanyDrawingNoOptions(company, partName, partNo) {
  if (!partName || !partNo) return [];
  const nameKey = String(partName).trim().toLowerCase();
  const partKey = String(partNo).trim().toLowerCase();
  return [
    ...new Set(
      companyProducts(company)
        .filter(
          (row) =>
            String(row.name ?? "").trim().toLowerCase() === nameKey &&
            String(row.partNo ?? "").trim().toLowerCase() === partKey
        )
        .map((row) => row.drawingNo)
        .filter(Boolean)
    ),
  ].sort((a, b) => a.localeCompare(b, "ko"));
}

/** 품명만으로 Product Master 행 조회 (품번 자동 — 동일 품명 복수 시 품번 정렬 1건) */
export function findCompanyProductByPartName(company, partName) {
  const nameKey = String(partName ?? "").trim().toLowerCase();
  if (!nameKey) return null;
  const matches = companyProducts(company)
    .filter((row) => String(row.name ?? "").trim().toLowerCase() === nameKey)
    .sort((a, b) => String(a.partNo ?? "").localeCompare(String(b.partNo ?? ""), "ko"));
  return matches[0] ?? null;
}

/** 업체 · 품명 · 품번 · 도번으로 Product Master 행 조회 */
export function findCompanyProduct(company, partName, partNo, drawingNo = "") {
  const nameKey = String(partName ?? "").trim().toLowerCase();
  const partKey = String(partNo ?? "").trim().toLowerCase();
  const drawingKey = String(drawingNo ?? "").trim().toLowerCase();
  if (!nameKey || !partKey) return null;

  const matches = companyProducts(company).filter(
    (row) =>
      String(row.name ?? "").trim().toLowerCase() === nameKey &&
      String(row.partNo ?? "").trim().toLowerCase() === partKey
  );
  if (!matches.length) return null;
  if (drawingKey) {
    return (
      matches.find((row) => String(row.drawingNo ?? "").trim().toLowerCase() === drawingKey) ??
      matches[0]
    );
  }
  return matches[0];
}

/** 업체 범위 내 품번·품명 부분 일치 검색 */
export function searchCompanyProducts(company, query, limit = 8) {
  const rows = companyProducts(company);
  const q = String(query ?? "").trim().toLowerCase();
  if (!q) return rows.slice(0, limit);
  return rows
    .filter(
      (row) =>
        row.partNo?.toLowerCase().includes(q) || row.name?.toLowerCase().includes(q)
    )
    .slice(0, limit);
}

/** 업체 범위 내 품번 또는 품명 정확 일치 */
export function findExactCompanyProduct(company, query) {
  const q = String(query ?? "").trim().toLowerCase();
  if (!q) return null;
  return (
    companyProducts(company).find(
      (row) => row.partNo?.toLowerCase() === q || row.name?.toLowerCase() === q
    ) ?? null
  );
}

/** 등록 모달 자동입력 필드 */
export function mapProductToFormAutofill(product) {
  if (!product) return null;
  return {
    partNo: product.partNo ?? "",
    partName: product.name ?? "",
    material: product.material ?? "",
    spec: product.spec ?? "",
    unitPrice:
      product.unitPrice != null && product.unitPrice !== ""
        ? String(product.unitPrice)
        : "",
    drawingNo: product.drawingNo ?? "",
    process: product.process ?? "",
    unit: product.unit ?? "EA",
  };
}

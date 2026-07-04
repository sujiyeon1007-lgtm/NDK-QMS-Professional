/** 우리회사 담당자 — 거래처별 NDK 내부 담당 직원 */

export const COMPANY_NDK_ASSIGNEE_FIELDS = [
  { key: "name", label: "이름" },
  { key: "department", label: "부서" },
  { key: "position", label: "직급" },
  { key: "phone", label: "연락처" },
  { key: "email", label: "이메일" },
];

export const COMPANY_NDK_ASSIGNEE_TABLE_COLUMNS = [
  { key: "name", label: "이름" },
  { key: "department", label: "부서" },
  { key: "position", label: "직급" },
  { key: "phone", label: "연락처" },
  { key: "email", label: "이메일" },
];

export function createEmptyCompanyNdkAssignee(id = "") {
  return {
    id: id || `ndk-${Date.now()}`,
    name: "",
    department: "",
    position: "",
    phone: "",
    email: "",
  };
}

export function normalizeCompanyNdkAssignees(row = {}) {
  const assignees = Array.isArray(row.ndkAssignees)
    ? row.ndkAssignees.map((item, index) => ({
        ...createEmptyCompanyNdkAssignee(item.id || `ndk-${row.id ?? "new"}-${index + 1}`),
        ...item,
        name: String(item.name ?? "").trim(),
        department: String(item.department ?? "").trim(),
        position: String(item.position ?? "").trim(),
        phone: String(item.phone ?? "").trim(),
        email: String(item.email ?? "").trim(),
      }))
    : [];

  return {
    ...row,
    ndkAssignees: assignees.filter((item) =>
      [item.name, item.department, item.position, item.phone, item.email].some(
        (value) => String(value ?? "").trim()
      )
    ),
  };
}

/** 목록 표시 — 우리회사 담당자 (1명 또는 N명 요약) */
export function getCompanyNdkAssigneeLabel(company) {
  if (!company) return "—";
  const names = (Array.isArray(company.ndkAssignees) ? company.ndkAssignees : [])
    .map((item) => item?.name?.trim())
    .filter(Boolean);
  if (names.length === 0) return "—";
  if (names.length === 1) return names[0];
  return `${names[0]} 외 ${names.length - 1}명`;
}

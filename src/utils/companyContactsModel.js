/** 거래처 담당자 — 업체 소속 연락처 (직원정보와 분리) */

export const COMPANY_CONTACT_FIELDS = [
  { key: "name", label: "성명" },
  { key: "position", label: "직책" },
  { key: "department", label: "부서" },
  { key: "mobile", label: "휴대폰" },
  { key: "email", label: "이메일" },
  { key: "directPhone", label: "직통번호" },
];

export function createEmptyCompanyContact(id = "") {
  return {
    id: id || `ct-${Date.now()}`,
    name: "",
    department: "",
    position: "",
    mobile: "",
    email: "",
    directPhone: "",
    isPrimary: false,
  };
}

export function getPrimaryCompanyContact(company) {
  const contacts = Array.isArray(company?.contacts) ? company.contacts : [];
  return contacts.find((row) => row.isPrimary) ?? contacts[0] ?? null;
}

export function getPrimaryCompanyContactName(company) {
  return getPrimaryCompanyContact(company)?.name?.trim() || company?.manager?.trim() || "—";
}

export function normalizeCompanyContacts(row = {}) {
  let contacts = Array.isArray(row.contacts)
    ? row.contacts.map((contact, index) => ({
        ...createEmptyCompanyContact(contact.id || `ct-${row.id ?? "new"}-${index + 1}`),
        ...contact,
        name: String(contact.name ?? "").trim(),
        department: String(contact.department ?? "").trim(),
        position: String(contact.position ?? "").trim(),
        mobile: String(contact.mobile ?? "").trim(),
        email: String(contact.email ?? "").trim(),
        directPhone: String(contact.directPhone ?? "").trim(),
      }))
    : [];

  if (contacts.length === 0 && row.manager?.trim()) {
    contacts = [
      {
        ...createEmptyCompanyContact(`ct-${row.id ?? "legacy"}-1`),
        name: row.manager.trim(),
        department: row.managerDepartment?.trim() ?? "",
        position: row.managerPosition?.trim() ?? "",
        mobile: row.mobile?.trim() ?? row.managerPhone?.trim() ?? "",
        email: row.contactEmail?.trim() ?? "",
        directPhone: row.directPhone?.trim() ?? "",
        isPrimary: true,
      },
    ];
  }

  if (contacts.length > 0 && !contacts.some((contact) => contact.isPrimary)) {
    contacts[0] = { ...contacts[0], isPrimary: true };
  }

  const primary = getPrimaryCompanyContact({ contacts });

  return {
    ...row,
    contacts,
    manager: primary?.name ?? row.manager ?? "",
  };
}

export function sanitizeCompanyContactsPayload(contacts = []) {
  return contacts
    .map((contact, index) =>
      normalizeCompanyContacts({ id: `tmp-${index}`, contacts: [contact] }).contacts[0]
    )
    .filter((contact) => contact.name);
}

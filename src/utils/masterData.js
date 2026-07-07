/**
 * Project TITAN V1.0 — 기준정보 Master Data
 * SessionStorage 영속 · SQLite 연동 준비 CRUD 구조
 */

import { canDeleteProduct } from "./productUsage";
import {
  canDeleteCompany,
  canDeleteEquipment,
  canDeleteWorker,
} from "./masterUsage";
import { SEOAM_DEMO_PRODUCTS } from "../data/seoamDemoProducts";
import {
  buildCompanyAbbreviation,
  getCompanyAbbreviation,
  shouldAutoUpdateAbbreviation,
} from "./companyAbbreviation";
import { normalizeCompanyNdkAssignees, getCompanyNdkAssigneeLabel } from "./companyNdkAssigneesModel";
import {
  initMasterDataStoresFromSession,
  readMasterCategoryFromStore,
  resolveMasterStoreCategory,
  syncAllMasterStoresFromSession,
} from "../foundation/data/master/masterDataSync";
import { MASTER_STORE_CATEGORIES } from "../foundation/data/master/masterConstants";
import { notifyWorkflowDataRefresh } from "./titanWorkflowRefresh";

const STORAGE_KEY = "project-titan-master-data-v3";

const INTEGRATED_MASTER_KEYS = new Set(MASTER_STORE_CATEGORIES);

export const MASTER_CATEGORIES = [
  { key: "companies", label: "업체", desc: "입고·생산·성적서 공통 업체" },
  { key: "products", label: "제품", desc: "제품 마스터 · 품번·재질·공정 · 기본단가 기준" },
  { key: "workers", label: "작업자", desc: "생산일보 · 검사 · 성적서 공통 작업자 Master" },
  { key: "employees", label: "직원", desc: "NDK 내부 직원 · 권한 · 재직 상태 (거래처 담당자 ❌)" },
  { key: "materials", label: "재질", desc: "제품 재질 코드" },
  { key: "heatTreatment", label: "공정", desc: "열처리 · 가공 공정" },
  { key: "equipment", label: "설비", desc: "열처리 설비" },
  { key: "inspectionCriteria", label: "검사기준", desc: "제품별 검사기준 · 도면 (별도 Session)" },
  { key: "customCodes", label: "사용자정의코드", desc: "상태 · 단위 · 부서 등 공통 코드" },
  { key: "productCategory", label: "품목분류", desc: "품목·제품 분류 (레거시)" },
  { key: "status", label: "상태 코드", desc: "Workflow 상태 (customCodes 연동)" },
  { key: "units", label: "단위", desc: "입출고 단위 (customCodes 연동)" },
  { key: "other", label: "기타", desc: "QR · 관리번호 규칙" },
];

export const STATUS_GROUPS = ["입고", "생산", "성적서", "출고", "기타"];

const CODE_GROUP_ALIASES = {
  status: "상태",
  units: "단위",
};

export const EMPLOYMENT_STATUSES = ["재직", "휴직", "퇴사"];

export const EMPLOYEE_ROLES = ["관리자", "품질", "생산", "영업", "조회 전용"];

const CATEGORY_ALIASES = {
  items: "products",
};

function resolveCategoryKey(categoryKey) {
  return CATEGORY_ALIASES[categoryKey] ?? categoryKey;
}

export const MASTER_DATA = {
  companies: [
    {
      id: "c1",
      code: "SE",
      name: "서암기계공업",
      ceoName: "김대표",
      bizNo: "",
      phone: "031-000-0000",
      fax: "031-000-0009",
      email: "contact@seoam.co.kr",
      homepage: "https://www.seoam.co.kr",
      tradeStartDate: "2018-03-01",
      address: "",
      note: "Excel Import",
      active: true,
      ndkAssignees: [
        {
          id: "ndk-c1-1",
          name: "이영업",
          department: "영업부",
          position: "대리",
          phone: "010-9000-0001",
          email: "sales@ndk.co.kr",
        },
      ],
      contacts: [
        {
          id: "ct-c1-1",
          name: "김품질",
          department: "품질",
          position: "대리",
          mobile: "010-1111-0001",
          email: "kim.qc@seoam.co.kr",
          directPhone: "031-000-0001",
        },
        {
          id: "ct-c1-2",
          name: "이구매",
          department: "구매",
          position: "과장",
          mobile: "010-1111-0002",
          email: "lee.buy@seoam.co.kr",
          directPhone: "",
        },
      ],
    },
    {
      id: "c2",
      code: "HW",
      name: "현대위아",
      ceoName: "정대표",
      bizNo: "",
      phone: "",
      fax: "",
      email: "",
      address: "",
      note: "",
      active: true,
      ndkAssignees: [],
      contacts: [
        {
          id: "ct-c2-1",
          name: "박과장",
          department: "품질",
          position: "과장",
          mobile: "010-2222-0001",
          email: "park@wia.co.kr",
          directPhone: "",
        },
      ],
    },
    {
      id: "c3",
      code: "DS",
      abbreviation: "DS",
      name: "두산에너빌리티",
      bizNo: "",
      phone: "",
      email: "",
      address: "",
      note: "",
      active: true,
      contacts: [],
    },
    {
      id: "c4",
      code: "SN",
      name: "SNT다이내믹스",
      bizNo: "",
      phone: "",
      email: "",
      address: "",
      note: "",
      active: true,
      contacts: [],
    },
    {
      id: "c5",
      code: "HF",
      name: "한화에어로스페이스",
      bizNo: "",
      phone: "",
      email: "",
      address: "",
      note: "",
      active: true,
      contacts: [],
    },
    {
      id: "c6",
      code: "GE",
      name: "GE",
      bizNo: "",
      phone: "",
      email: "",
      address: "",
      note: "",
      active: true,
      contacts: [],
    },
    {
      id: "c7",
      code: "MJ",
      name: "(주)모전기공",
      ceoName: "손대표",
      bizNo: "314-88-00265",
      phone: "051-971-1551",
      fax: "051-971-1552",
      email: "",
      address: "부산광역시 강서구 과학산단2로43번길 38(지사동)",
      note: "",
      active: true,
      ndkAssignees: [
        {
          id: "ndk-c7-1",
          name: "박품질",
          department: "품질부",
          position: "과장",
          phone: "010-3333-0001",
          email: "qc@ndk.co.kr",
        },
      ],
      contacts: [
        {
          id: "ct-c7-1",
          name: "손두현",
          department: "영업",
          position: "대표",
          mobile: "",
          email: "",
          directPhone: "051-971-1551",
        },
      ],
    },
  ],
  products: [...SEOAM_DEMO_PRODUCTS],
  workers: [
    { id: "w1", code: "W001", name: "김작업", department: "생산부", note: "", active: true },
    { id: "w2", code: "W002", name: "한생산", department: "생산부", note: "", active: true },
    { id: "w3", code: "W003", name: "이검사", department: "품질부", note: "", active: true },
    { id: "w4", code: "W004", name: "박품질", department: "품질부", note: "", active: true },
    { id: "w5", code: "W005", name: "최열처리", department: "생산부", note: "야간조", active: true },
  ],
  employees: [
    {
      id: "em1",
      code: "E001",
      name: "김작업",
      department: "생산부",
      position: "주임",
      phone: "010-1111-2222",
      email: "kim.work@ndk.co.kr",
      hireDate: "2018-03-15",
      employmentStatus: "재직",
      role: "생산",
      note: "",
      active: true,
    },
    {
      id: "em2",
      code: "E002",
      name: "이검사",
      department: "품질부",
      position: "대리",
      phone: "010-2222-3333",
      email: "lee.qc@ndk.co.kr",
      hireDate: "2019-07-01",
      employmentStatus: "재직",
      role: "품질",
      note: "",
      active: true,
    },
    {
      id: "em3",
      code: "E003",
      name: "박영업",
      department: "영업부",
      position: "과장",
      phone: "010-3333-4444",
      email: "park.sales@ndk.co.kr",
      hireDate: "2015-01-10",
      employmentStatus: "재직",
      role: "영업",
      note: "",
      active: true,
    },
    {
      id: "em4",
      code: "E004",
      name: "최관리",
      department: "경영지원",
      position: "부장",
      phone: "010-4444-5555",
      email: "choi.admin@ndk.co.kr",
      hireDate: "2010-05-20",
      employmentStatus: "재직",
      role: "관리자",
      note: "",
      active: true,
    },
    {
      id: "em5",
      code: "E005",
      name: "정조회",
      department: "경영지원",
      position: "사원",
      phone: "010-5555-6666",
      email: "jung.view@ndk.co.kr",
      hireDate: "2022-11-01",
      employmentStatus: "재직",
      role: "조회 전용",
      note: "",
      active: true,
    },
    {
      id: "em6",
      code: "E006",
      name: "한생산",
      department: "생산부",
      position: "사원",
      phone: "010-6666-7777",
      email: "han.prod@ndk.co.kr",
      hireDate: "2023-04-01",
      employmentStatus: "휴직",
      role: "생산",
      note: "육아휴직",
      active: false,
    },
  ],
  materials: [
    { id: "m1", code: "SCM440", name: "SCM440", spec: "합금강", note: "", active: true },
    { id: "m2", code: "SCM415", name: "SCM415", spec: "합금강", note: "", active: true },
    { id: "m3", code: "S45C", name: "S45C", spec: "탄소강", note: "", active: true },
    { id: "m4", code: "SNCM220", name: "SNCM220", spec: "니켈합금강", note: "", active: true },
    { id: "m5", code: "SACM645", name: "SACM645", spec: "니켈합금강", note: "", active: true },
    { id: "m6", code: "SUJ2", name: "SUJ2", spec: "베어링강", note: "", active: true },
    { id: "m7", code: "SUS304", name: "SUS304", spec: "스테인리스", note: "", active: true },
    { id: "m8", code: "SNCM439", name: "SNCM439", spec: "니켈합금강", note: "", active: true },
    { id: "m9", code: "SCM440H", name: "SCM440H", spec: "합금강", note: "", active: true },
    { id: "m10", code: "SM45C", name: "SM45C", spec: "탄소강", note: "", active: true },
    { id: "m11", code: "34CrAlMo7", name: "34CrAlMo7", spec: "합금강", note: "", active: true },
    { id: "m12", code: "SACM1", name: "SACM1", spec: "니켈합금강", note: "", active: true },
  ],
  equipment: [
    { id: "e1", code: "3S-1", name: "3S-1", equipType: "이온질화", location: "1공장", inspectionCycle: "월 1회", note: "", active: true },
    { id: "e2", code: "3S-2", name: "3S-2", equipType: "이온질화", location: "1공장", inspectionCycle: "월 1회", note: "", active: true },
    { id: "e3", code: "3S-3", name: "3S-3", equipType: "이온질화", location: "1공장", inspectionCycle: "월 1회", note: "", active: true },
    { id: "e4", code: "3S-4", name: "3S-4", equipType: "이온질화", location: "1공장", inspectionCycle: "월 1회", note: "", active: true },
    { id: "e5", code: "10S-01", name: "10S-01", equipType: "이온질화", location: "1공장", inspectionCycle: "월 1회", note: "", active: true },
    { id: "e6", code: "10S-02", name: "10S-02", equipType: "이온질화", location: "1공장", inspectionCycle: "월 1회", note: "", active: true },
    { id: "e7", code: "10S-03", name: "10S-03", equipType: "이온질화", location: "1공장", inspectionCycle: "월 1회", note: "", active: true },
    { id: "e8", code: "10S-04", name: "10S-04", equipType: "이온질화", location: "1공장", inspectionCycle: "월 1회", note: "", active: true },
    { id: "e9", code: "10S-05", name: "10S-05", equipType: "이온질화", location: "1공장", inspectionCycle: "월 1회", note: "", active: true },
    { id: "e10", code: "10S-06", name: "10S-06", equipType: "이온질화", location: "1공장", inspectionCycle: "월 1회", note: "", active: true },
    { id: "e11", code: "10S-07", name: "10S-07", equipType: "이온질화", location: "1공장", inspectionCycle: "월 1회", note: "", active: true },
    { id: "e12", code: "10S-08", name: "10S-08", equipType: "이온질화", location: "1공장", inspectionCycle: "월 1회", note: "", active: true },
    { id: "e13", code: "10S-09", name: "10S-09", equipType: "이온질화", location: "1공장", inspectionCycle: "월 1회", note: "", active: true },
    { id: "e14", code: "10S-10", name: "10S-10", equipType: "이온질화", location: "1공장", inspectionCycle: "월 1회", note: "", active: true },
    { id: "e15", code: "61", name: "61", equipType: "연질화", location: "2공장", inspectionCycle: "월 1회", note: "", active: true },
    { id: "e16", code: "62", name: "62", equipType: "연질화", location: "2공장", inspectionCycle: "월 1회", note: "", active: true },
    { id: "e17", code: "63", name: "63", equipType: "연질화", location: "2공장", inspectionCycle: "월 1회", note: "", active: true },
    { id: "e18", code: "64", name: "64", equipType: "연질화", location: "2공장", inspectionCycle: "월 1회", note: "", active: true },
    { id: "e19", code: "65", name: "65", equipType: "연질화", location: "2공장", inspectionCycle: "월 1회", note: "", active: true },
    { id: "e20", code: "66", name: "66", equipType: "연질화", location: "2공장", inspectionCycle: "월 1회", note: "", active: true },
    { id: "e21", code: "67", name: "67", equipType: "연질화", location: "2공장", inspectionCycle: "월 1회", note: "", active: true },
  ],
  heatTreatment: [
    { id: "h1", code: "HT-GN", name: "가스질화", description: "가스 질화 열처리", active: true },
    { id: "h2", code: "HT-IN", name: "이온질화", description: "이온 질화 열처리", active: true },
    { id: "h2b", code: "HT-SOFT", name: "연질화", description: "연질화 열처리", active: true },
    { id: "h3", code: "HT-SB", name: "염욕질화", description: "염욕 질화", active: true },
    { id: "h4", code: "HT-CP", name: "침탄", description: "침탄 열처리", active: true },
    { id: "h5", code: "HT-HF", name: "고주파", description: "고주파 열처리", active: true },
  ],
  inspectionCriteria: [],
  customCodes: [
    { id: "s1", code: "IN-DONE", name: "입고완료", group: "상태", note: "", active: true },
    { id: "s2", code: "PR-DONE", name: "생산완료", group: "상태", note: "", active: true },
    { id: "s3", code: "CT-ISSUE", name: "성적서 발행완료", group: "상태", note: "", active: true },
    { id: "s4", code: "SH-WAIT", name: "출고대기", group: "상태", note: "", active: true },
    { id: "s5", code: "SH-DONE", name: "출고완료", group: "상태", note: "", active: true },
    { id: "u1", code: "EA", name: "EA", group: "단위", note: "개", active: true },
    { id: "u2", code: "LOT", name: "LOT", group: "단위", note: "로트", active: true },
    { id: "u3", code: "KG", name: "KG", group: "단위", note: "킬로그램", active: true },
    { id: "u4", code: "SET", name: "SET", group: "단위", note: "세트", active: true },
    { id: "cc1", code: "URG-Y", name: "긴급", group: "긴급", note: "", active: true },
    { id: "cc2", code: "URG-N", name: "일반", group: "긴급", note: "", active: true },
    { id: "cc3", code: "PRI-H", name: "높음", group: "우선순위", note: "", active: true },
    { id: "cc4", code: "PRI-M", name: "보통", group: "우선순위", note: "", active: true },
    { id: "cc5", code: "DEPT-PR", name: "생산부", group: "부서", note: "", active: true },
    { id: "cc6", code: "DEPT-QC", name: "품질부", group: "부서", note: "", active: true },
    { id: "cc7", code: "DEPT-SL", name: "영업부", group: "부서", note: "", active: true },
  ],
  productCategory: [
    { id: "p1", code: "FORGE", name: "단조품", note: "", active: true },
    { id: "p2", code: "MACH", name: "기계부품", note: "", active: true },
    { id: "p3", code: "AUTO", name: "자동차부품", note: "", active: true },
    { id: "p4", code: "GEAR", name: "기어류", note: "", active: true },
  ],
  status: [],
  units: [],
  other: [
    { id: "o1", code: "QR-FMT", name: "QR 포맷", note: "LOT 번호만 저장", active: true },
    { id: "o2", code: "MGMT-FMT", name: "관리번호 규칙", note: "업체코드_YYYYMMDD_순번", active: true },
  ],
};

function cloneMasterData(source) {
  return Object.fromEntries(
    Object.entries(source).map(([key, rows]) => [key, rows.map((row) => ({ ...row }))])
  );
}

function migrateLegacyProducts(rows = []) {
  return rows.map((row) => ({
    ...row,
    company: row.company ?? "",
    drawingNo:
      row.drawingNo?.trim() ||
      row.internalDrawingNo?.trim() ||
      row.customerDrawingNo?.trim() ||
      "",
    description: row.description ?? "",
  }));
}

function migrateWorkerMaster(rows = []) {
  return rows.map((row) => ({
    id: row.id,
    code: row.code ?? "",
    name: row.name ?? "",
    department: row.department ?? "",
    note: row.note ?? "",
    active: row.active !== false,
  }));
}

function migrateLegacyWorkers(rows = []) {
  return rows
    .filter((row) => row.isCompanyContact !== true && row.contactType !== "company")
    .map((row) => ({
      ...row,
      isInternal: row.isInternal !== false,
      email: row.email ?? "",
      hireDate: row.hireDate ?? "",
      employmentStatus: row.employmentStatus ?? (row.active === false ? "퇴사" : "재직"),
      role: row.role ?? "",
      active: row.employmentStatus ? row.employmentStatus === "재직" : row.active !== false,
    }));
}

function createCompanyContactId(companyId, index = 1) {
  return `ct-${companyId}-${index}`;
}

function normalizeCompanyContact(contact, companyId, index = 0) {
  const fallbackId = createCompanyContactId(companyId, index + 1);
  return {
    id: contact?.id ?? fallbackId,
    name: contact?.name?.trim() ?? "",
    department: contact?.department?.trim() ?? "",
    position: contact?.position?.trim() ?? "",
    mobile: contact?.mobile?.trim() ?? "",
    email: contact?.email?.trim() ?? "",
    directPhone: contact?.directPhone?.trim() ?? "",
  };
}

function migrateCompanyContacts(row) {
  if (Array.isArray(row.contacts) && row.contacts.length > 0) {
    return row.contacts.map((contact, index) => normalizeCompanyContact(contact, row.id, index));
  }

  const legacyName = row.manager?.trim();
  if (!legacyName) return [];

  return [
    normalizeCompanyContact(
      {
        id: createCompanyContactId(row.id, 1),
        name: legacyName,
        mobile: row.mobile ?? "",
        email: row.email ?? "",
        directPhone: row.phone ?? "",
      },
      row.id,
      0
    ),
  ];
}

export function getCompanyPrimaryContactName(company) {
  if (!company) return "";
  const contacts = Array.isArray(company.contacts) ? company.contacts : [];
  const primary = contacts.find((contact) => contact.name?.trim()) ?? contacts[0];
  return primary?.name?.trim() || company.manager?.trim() || "";
}

function syncLegacyManagerFields(normalized, contacts) {
  const primary = contacts.find((contact) => contact.name?.trim()) ?? contacts[0];
  if (primary) {
    normalized.manager = primary.name;
  }
  return normalized;
}

function syncCompanyContacts(normalized, rawPayload, existingRow = null) {
  const existingContacts = Array.isArray(existingRow?.contacts) ? existingRow.contacts : [];
  let contacts = Array.isArray(rawPayload?.contacts)
    ? rawPayload.contacts.map((contact, index) => normalizeCompanyContact(contact, existingRow?.id ?? normalized.id ?? "new", index))
    : [...existingContacts.map((contact, index) => normalizeCompanyContact(contact, existingRow?.id ?? normalized.id ?? "new", index))];

  const manager = rawPayload?.manager?.trim();
  if (manager) {
    if (contacts.length === 0) {
      contacts = [
        normalizeCompanyContact(
          {
            name: manager,
            mobile: rawPayload?.mobile,
            email: rawPayload?.email,
            directPhone: rawPayload?.phone,
          },
          existingRow?.id ?? normalized.id ?? "new",
          0
        ),
      ];
    } else if (!Array.isArray(rawPayload?.contacts)) {
      contacts[0] = {
        ...contacts[0],
        name: manager,
        mobile: rawPayload?.mobile?.trim() ?? contacts[0].mobile,
        email: rawPayload?.email?.trim() ?? contacts[0].email,
        directPhone: rawPayload?.phone?.trim() ?? contacts[0].directPhone,
      };
    }
  }

  normalized.contacts = contacts.filter((contact) =>
    [contact.name, contact.department, contact.position, contact.mobile, contact.email, contact.directPhone].some(
      (value) => String(value ?? "").trim()
    )
  );
  return syncLegacyManagerFields(normalized, normalized.contacts);
}

function migrateCompanyMaster(rows = []) {
  return rows.map((row, index) => {
    const others = rows.filter((_, i) => i !== index);
    const abbreviation = row.abbreviation?.trim()
      ? getCompanyAbbreviation(row)
      : row.abbreviationLocked && row.code?.trim()
        ? row.code.trim().toUpperCase()
        : buildCompanyAbbreviation(row.name, others);

    const contacts = migrateCompanyContacts(row);
    const migrated = normalizeCompanyNdkAssignees({
      ...row,
      abbreviation,
      code: row.code?.trim() || abbreviation,
      abbreviationLocked: Boolean(row.abbreviationLocked),
      abbreviationManual: Boolean(row.abbreviationManual),
      ceoName: row.ceoName?.trim() ?? "",
      fax: row.fax?.trim() ?? "",
      homepage: row.homepage?.trim() ?? "",
      tradeStartDate: row.tradeStartDate?.trim() ?? "",
      defaultRequirements: row.defaultRequirements ?? "",
      inspectionStandard: row.inspectionStandard ?? "",
      certificateForm: row.certificateForm ?? "",
      statementForm: row.statementForm ?? "",
      contacts,
      ndkAssignees: Array.isArray(row.ndkAssignees) ? row.ndkAssignees : [],
    });
    return syncLegacyManagerFields(migrated, contacts);
  });
}

function loadMasterDataFromStorage() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const data = cloneMasterData(MASTER_DATA);
      data.companies = migrateCompanyMaster(data.companies);
      return data;
    }
    const parsed = JSON.parse(raw);
    const merged = cloneMasterData(MASTER_DATA);
    Object.keys(merged).forEach((key) => {
      if (Array.isArray(parsed[key])) {
        merged[key] = parsed[key];
      }
    });
    if (Array.isArray(parsed.items) && (!parsed.products || parsed.products.length === 0)) {
      merged.products = migrateLegacyProducts(parsed.items);
    } else if (Array.isArray(merged.products)) {
      merged.products = migrateLegacyProducts(merged.products);
    }
    if (Array.isArray(parsed.workers)) {
      merged.workers = migrateWorkerMaster(parsed.workers);
    } else if (Array.isArray(merged.workers)) {
      merged.workers = migrateWorkerMaster(merged.workers);
    }
    if (Array.isArray(parsed.employees)) {
      merged.employees = migrateLegacyWorkers(parsed.employees);
    } else if (Array.isArray(merged.employees)) {
      merged.employees = migrateLegacyWorkers(merged.employees);
    }
    if (Array.isArray(parsed.equipment)) {
      const hasNdkLotEquipment = parsed.equipment.some((row) => {
        const value = String(row.code ?? row.name ?? "").trim();
        return /^(\d+S-\d+|10S-\d{2}|6[1-7])$/.test(value);
      });
      merged.equipment = hasNdkLotEquipment ? parsed.equipment : cloneMasterData(MASTER_DATA).equipment;
    }
    if (Array.isArray(merged.companies)) {
      merged.companies = migrateCompanyMaster(merged.companies);
    } else {
      merged.companies = migrateCompanyMaster(merged.companies ?? []);
    }
    delete merged.items;
    return merged;
  } catch {
    const data = cloneMasterData(MASTER_DATA);
    data.companies = migrateCompanyMaster(data.companies);
    return data;
  }
}

/** @type {typeof MASTER_DATA} */
let sessionMasterData = loadMasterDataFromStorage();

function syncMasterStoresAfterPersist(changedCategory = null) {
  syncAllMasterStoresFromSession(sessionMasterData);
  notifyWorkflowDataRefresh({
    source: "master-data",
    category: changedCategory ? resolveMasterStoreCategory(changedCategory) : "all",
  });
}

initMasterDataStoresFromSession(sessionMasterData);

function persistMasterData(changedCategory = null) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(sessionMasterData));
  } catch {
    /* ignore quota errors in UI mode */
  }
  syncMasterStoresAfterPersist(changedCategory);
}

function resolveStorageCategory(categoryKey) {
  const resolved = resolveCategoryKey(categoryKey);
  if (resolved === "products" && categoryKey === "items") return "products";
  if (CODE_GROUP_ALIASES[resolved]) return "customCodes";
  return resolved;
}

function filterByCodeGroup(rows, groupLabel) {
  return rows.filter((row) => row.group === groupLabel);
}

export function getMasterCategories() {
  return MASTER_CATEGORIES;
}

export function getMasterCategoryMeta(categoryKey) {
  return MASTER_CATEGORIES.find((c) => c.key === categoryKey) ?? null;
}

export function getMasterDataByCategory(categoryKey) {
  const resolvedKey = resolveCategoryKey(categoryKey);
  if (CODE_GROUP_ALIASES[resolvedKey]) {
    return filterByCodeGroup(sessionMasterData.customCodes ?? [], CODE_GROUP_ALIASES[resolvedKey]);
  }
  if (INTEGRATED_MASTER_KEYS.has(resolvedKey)) {
    const storeRows = readMasterCategoryFromStore(resolvedKey);
    if (storeRows.length > 0) {
      return storeRows;
    }
  }
  return sessionMasterData[resolvedKey] ?? [];
}

export function searchMasterData(categoryKey, keyword) {
  const rows = getMasterDataByCategory(categoryKey);
  if (!keyword?.trim()) return rows;
  const q = keyword.trim().toLowerCase();
  return rows.filter((row) =>
    Object.entries(row).some(([key, value]) => {
      if ((key === "contacts" || key === "ndkAssignees") && Array.isArray(value)) {
        return value.some((contact) =>
          Object.values(contact).some((part) =>
            String(part ?? "")
              .toLowerCase()
              .includes(q)
          )
        );
      }
      return String(value ?? "")
        .toLowerCase()
        .includes(q);
    })
  );
}

export function getActiveMasterNames(categoryKey) {
  const resolvedKey = resolveCategoryKey(categoryKey);
  return getMasterDataByCategory(categoryKey)
    .filter((row) => {
      if (resolvedKey === "employees") {
        const status = row.employmentStatus ?? (row.active === false ? "퇴사" : "재직");
        return status === "재직";
      }
      return row.active !== false;
    })
    .map((row) => row.name);
}

/** 생산일보 · 검사 · 성적서 — 사용 중인 작업자 Master */
export function getActiveWorkers() {
  return getMasterDataByCategory("workers").filter((row) => row.active !== false);
}

/** 생산일보 — 사용 중인 설비 Master */
export function getActiveEquipment() {
  return getMasterDataByCategory("equipment").filter((row) => row.active !== false);
}

/** 열처리 공정별 설비 (이온질화 · 연질화) */
export function getActiveEquipmentByHeatTreatment(heatTreatment = "") {
  const process = String(heatTreatment ?? "").trim();
  const rows = getActiveEquipment();
  if (!process) return rows;
  return rows.filter((row) => row.equipType === process);
}

export function getActiveWorkerNames() {
  return getActiveWorkers().map((row) => row.name).filter(Boolean);
}

export function getCompanyCodeMap() {
  return Object.fromEntries(
    getMasterDataByCategory("companies")
      .filter((row) => row.active !== false)
      .map((row) => [row.name, getCompanyAbbreviation(row)])
  );
}

function enrichCompanyRecord(normalized, rawPayload, mode, existingId) {
  const rows = getMasterDataByCategory("companies").filter((row) => row.id !== existingId);
  const current =
    existingId != null
      ? getMasterDataByCategory("companies").find((row) => row.id === existingId)
      : null;

  const manualAbbrev = String(rawPayload?.abbreviation ?? "").trim().toUpperCase();
  const manualLock = Boolean(rawPayload?.abbreviationManual || rawPayload?.abbreviationLocked);

  if (mode === "edit" && current && (manualLock || current.abbreviationLocked)) {
    normalized.abbreviation = manualAbbrev || getCompanyAbbreviation(current);
    normalized.abbreviationLocked = true;
    normalized.abbreviationManual = true;
  } else if (mode === "edit" && current && !shouldAutoUpdateAbbreviation(current, rawPayload)) {
    normalized.abbreviation = getCompanyAbbreviation(current);
    normalized.abbreviationLocked = Boolean(current.abbreviationLocked);
    normalized.abbreviationManual = Boolean(current.abbreviationManual);
  } else {
    normalized.abbreviation = buildCompanyAbbreviation(normalized.name, rows, {
      manualAbbreviation: manualLock ? manualAbbrev : "",
    });
    normalized.abbreviationLocked = manualLock;
    normalized.abbreviationManual = manualLock;
  }

  if (!normalized.code) {
    normalized.code = normalized.abbreviation;
  }

  normalized.defaultRequirements = rawPayload?.defaultRequirements?.trim() ?? normalized.defaultRequirements ?? "";
  normalized.inspectionStandard = rawPayload?.inspectionStandard?.trim() ?? normalized.inspectionStandard ?? "";
  normalized.certificateForm = rawPayload?.certificateForm?.trim() ?? normalized.certificateForm ?? "";
  normalized.statementForm = rawPayload?.statementForm?.trim() ?? normalized.statementForm ?? "";

  return normalized;
}

function nextMasterRowId(categoryKey) {
  const prefix = categoryKey.slice(0, 2);
  const rows = getMasterDataByCategory(categoryKey);
  const maxNum = rows.reduce((max, row) => {
    const match = row.id.match(/(\d+)$/);
    return match ? Math.max(max, Number(match[1])) : max;
  }, 0);
  return `${prefix}${maxNum + 1}`;
}

function normalizePayload(categoryKey, payload) {
  const base = {
    code: payload.code?.trim() ?? "",
    name: payload.name?.trim() ?? "",
    note: payload.note?.trim() ?? "",
    active: payload.active !== false,
  };

  if (categoryKey === "companies") {
    const normalized = {
      ...base,
      abbreviation: payload.abbreviation?.trim().toUpperCase() ?? "",
      abbreviationLocked: Boolean(payload.abbreviationLocked),
      abbreviationManual: Boolean(payload.abbreviationManual),
      ceoName: payload.ceoName?.trim() ?? "",
      bizNo: payload.bizNo?.trim() ?? "",
      manager: payload.manager?.trim() ?? "",
      phone: payload.phone?.trim() ?? "",
      fax: payload.fax?.trim() ?? "",
      mobile: payload.mobile?.trim() ?? "",
      email: payload.email?.trim() ?? "",
      address: payload.address?.trim() ?? "",
      defaultRequirements: payload.defaultRequirements?.trim() ?? "",
      inspectionStandard: payload.inspectionStandard?.trim() ?? "",
      certificateForm: payload.certificateForm?.trim() ?? "",
      statementForm: payload.statementForm?.trim() ?? "",
      contacts: [],
      ndkAssignees: Array.isArray(payload.ndkAssignees) ? payload.ndkAssignees : [],
    };
    return normalizeCompanyNdkAssignees(syncCompanyContacts(normalized, payload));
  }
  if (categoryKey === "products" || categoryKey === "items") {
    const unitPriceRaw = payload.unitPrice;
    const unitPrice =
      unitPriceRaw === "" || unitPriceRaw == null
        ? null
        : Number(String(unitPriceRaw).replace(/,/g, "")) || null;
    return {
      ...base,
      company: payload.company?.trim() ?? "",
      partNo: payload.partNo?.trim() ?? "",
      drawingNo: payload.drawingNo?.trim() ?? "",
      material: payload.material?.trim() ?? "",
      spec: payload.spec?.trim() ?? "",
      unitPrice,
      unit: payload.unit?.trim() ?? "EA",
      process: payload.process?.trim() ?? "",
      description: payload.description?.trim() ?? "",
    };
  }
  if (categoryKey === "materials") {
    const description = payload.description?.trim() ?? payload.spec?.trim() ?? "";
    return { ...base, spec: description };
  }
  if (categoryKey === "heatTreatment") {
    return {
      ...base,
      description: payload.description?.trim() ?? payload.note?.trim() ?? "",
    };
  }
  if (categoryKey === "equipment") {
    return {
      ...base,
      equipType: payload.equipType?.trim() ?? "",
      location: payload.location?.trim() ?? "",
    };
  }
  if (categoryKey === "employees" || categoryKey === "workers") {
    const employmentStatus = payload.employmentStatus?.trim() || "재직";
    if (categoryKey === "workers") {
      return {
        ...base,
        department: payload.department?.trim() ?? "",
      };
    }
    return {
      ...base,
      department: payload.department?.trim() ?? "",
      position: payload.position?.trim() ?? "",
      phone: payload.phone?.trim() ?? "",
      email: payload.email?.trim() ?? "",
      hireDate: payload.hireDate?.trim() ?? "",
      employmentStatus,
      role: payload.role?.trim() ?? "",
      isInternal: true,
      active: employmentStatus === "재직",
    };
  }
  if (categoryKey === "inspectionCriteria") {
    return {
      ...base,
      targetType: payload.targetType?.trim() ?? "",
      standardValue: payload.standardValue?.trim() ?? "",
      unit: payload.unit?.trim() ?? "",
    };
  }
  if (categoryKey === "customCodes") {
    return { ...base, group: payload.group?.trim() ?? "" };
  }

  return {
    ...base,
    group: payload.group?.trim() ?? undefined,
  };
}

export function validateMasterRow(categoryKey, row, mode, existingId) {
  const resolvedKey = resolveCategoryKey(categoryKey);
  let normalized = normalizePayload(resolvedKey, row);
  const storageKey = resolveStorageCategory(resolvedKey);

  if (resolvedKey === "companies") {
    normalized = enrichCompanyRecord(normalized, row, mode, existingId);
    const existingRow =
      existingId != null
        ? getMasterDataByCategory("companies").find((item) => item.id === existingId)
        : null;
    normalized = syncCompanyContacts(normalized, row, existingRow);
  }

  if (resolvedKey !== "companies" && !normalized.code) {
    return {
      ok: false,
      message:
        resolvedKey === "employees"
          ? "사번을 입력하세요."
          : resolvedKey === "workers"
            ? "작업자 코드를 입력하세요."
            : "코드를 입력하세요.",
    };
  }

  if (resolvedKey === "companies" && !normalized.abbreviation) {
    return { ok: false, message: "거래처 약칭을 생성할 수 없습니다. 업체명을 확인하세요." };
  }

  if (!normalized.name) {
    return {
      ok: false,
      message:
        resolvedKey === "employees"
          ? "성명을 입력하세요."
          : resolvedKey === "workers"
            ? "작업자명을 입력하세요."
            : "명칭을 입력하세요.",
    };
  }

  const rows = getMasterDataByCategory(resolvedKey);
  const codeDup = rows.some(
    (item) => item.code.toLowerCase() === normalized.code.toLowerCase() && item.id !== existingId
  );
  if (codeDup) {
    return {
      ok: false,
      message: resolvedKey === "employees" ? "이미 사용 중인 사번입니다." : "이미 사용 중인 거래처코드입니다.",
    };
  }

  if (resolvedKey === "companies") {
    const abbrevDup = rows.some(
      (item) =>
        getCompanyAbbreviation(item).toLowerCase() === normalized.abbreviation.toLowerCase() &&
        item.id !== existingId
    );
    if (abbrevDup) {
      return { ok: false, message: "이미 사용 중인 거래처 약칭입니다. 관리자 설정에서 수정하세요." };
    }
  }

  if (resolvedKey === "products" && normalized.partNo && normalized.company) {
    const partDup = rows.some(
      (item) =>
        String(item.company ?? "").trim().toLowerCase() === normalized.company.toLowerCase() &&
        item.partNo?.toLowerCase() === normalized.partNo.toLowerCase() &&
        item.id !== existingId
    );
    if (partDup) {
      return { ok: false, message: "이미 등록된 업체·품번 제품입니다." };
    }
  }

  if (storageKey === "customCodes" && !normalized.group) {
    return { ok: false, message: "코드 분류를 선택하세요." };
  }

  if (mode === "edit" && !existingId) {
    return { ok: false, message: "수정 대상을 선택하세요." };
  }

  return { ok: true, normalized, storageKey, categoryKey: resolvedKey };
}

export function stageMasterAdd(categoryKey, payload, { skipValidation = false } = {}) {
  const resolvedKey = resolveCategoryKey(categoryKey);
  const validation = skipValidation
    ? {
        ok: true,
        normalized: normalizePayload(resolvedKey, payload),
        storageKey: resolveStorageCategory(resolvedKey),
        categoryKey: resolvedKey,
      }
    : validateMasterRow(resolvedKey, payload, "add");
  if (!validation.ok) {
    return { ok: false, message: validation.message };
  }

  const newRow = {
    id: payload.id ?? nextMasterRowId(validation.categoryKey),
    ...validation.normalized,
  };

  const storageKey = validation.storageKey;
  sessionMasterData[storageKey] = [...(sessionMasterData[storageKey] ?? []), newRow];
  persistMasterData(resolvedKey);
  return { ok: true, row: newRow };
}

export function stageMasterUpdate(categoryKey, rowId, payload) {
  const resolvedKey = resolveCategoryKey(categoryKey);
  const validation = validateMasterRow(resolvedKey, payload, "edit", rowId);
  if (!validation.ok) {
    return { ok: false, message: validation.message };
  }

  const storageKey = validation.storageKey;
  const rows = sessionMasterData[storageKey] ?? [];
  const index = rows.findIndex((row) => row.id === rowId);
  if (index < 0) {
    return { ok: false, message: "수정 대상을 찾을 수 없습니다." };
  }

  const updated = { ...rows[index], ...validation.normalized };
  sessionMasterData[storageKey] = rows.map((row, i) => (i === index ? updated : row));
  persistMasterData(resolvedKey);
  return { ok: true, row: updated };
}

export function stageMasterDelete(categoryKey, rowId) {
  const storageKey = resolveStorageCategory(categoryKey);
  const rows = sessionMasterData[storageKey] ?? [];
  const target = rows.find((row) => row.id === rowId);
  if (!target) {
    return { ok: false, message: "삭제 대상을 찾을 수 없습니다." };
  }

  if (resolveCategoryKey(categoryKey) === "products" && target.partNo) {
    const guard = canDeleteProduct(target.partNo);
    if (!guard.ok) {
      return { ok: false, message: guard.message };
    }
  }

  if (resolveCategoryKey(categoryKey) === "companies") {
    const guard = canDeleteCompany(target.name);
    if (!guard.ok) {
      return { ok: false, message: guard.message };
    }
  }

  if (resolveCategoryKey(categoryKey) === "equipment") {
    const guard = canDeleteEquipment(target.code, target.name);
    if (!guard.ok) {
      return { ok: false, message: guard.message };
    }
  }

  if (resolveCategoryKey(categoryKey) === "workers") {
    const guard = canDeleteWorker(target.name);
    if (!guard.ok) {
      return { ok: false, message: guard.message };
    }
    const updated = { ...target, active: false };
    sessionMasterData[storageKey] = rows.map((row) => (row.id === rowId ? updated : row));
    persistMasterData("workers");
    return { ok: true, row: updated, soft: true };
  }

  sessionMasterData[storageKey] = rows.filter((row) => row.id !== rowId);
  persistMasterData(categoryKey);
  return { ok: true, row: target };
}

export function formatMasterRowForDisplay(row) {
  if (!row) return row;
  const employmentStatus =
    row.employmentStatus ?? (row.active === false ? "퇴사" : row.department ? "재직" : undefined);
  const abbreviation = getCompanyAbbreviation(row);
  const primaryContactName = getCompanyPrimaryContactName(row);
  const ceoName = row.ceoName?.trim() || "—";
  const ndkAssigneeLabel = getCompanyNdkAssigneeLabel(row);
  const phoneLabel = row.phone?.trim() || "—";
  const emailLabel = row.email?.trim() || "—";
  return {
    ...row,
    abbreviation: row.abbreviation ?? abbreviation,
    ceoName,
    ndkAssigneeLabel,
    phoneLabel,
    emailLabel,
    primaryContactName,
    manager: primaryContactName || row.manager || "",
    activeLabel: row.active === false ? "미사용" : "사용",
    abbreviationLockedLabel: row.abbreviationLocked ? "고정 (관리자 수정)" : "자동 생성",
    employmentStatusLabel: employmentStatus ?? "—",
    description: row.description ?? row.note ?? "",
    unitPriceLabel:
      row.unitPrice != null && row.unitPrice !== ""
        ? Number(row.unitPrice).toLocaleString()
        : "—",
  };
}

export function findMasterRowByName(categoryKey, name) {
  const q = String(name ?? "").trim().toLowerCase();
  if (!q) return null;
  return (
    getMasterDataByCategory(categoryKey).find(
      (row) =>
        row.active !== false &&
        (row.name.toLowerCase() === q ||
          row.name.toLowerCase().includes(q) ||
          row.code?.toLowerCase() === q)
    ) ?? null
  );
}

export function findProductByPartNo(partNo) {
  const q = String(partNo ?? "").trim().toLowerCase();
  if (!q) return null;
  return (
    getMasterDataByCategory("products").find(
      (row) => row.active !== false && row.partNo?.toLowerCase() === q
    ) ?? null
  );
}

/** 관리번호(제품코드) 기준 제품 조회 */
export function findProductByCode(code) {
  const q = String(code ?? "").trim().toLowerCase();
  if (!q) return null;
  return (
    getMasterDataByCategory("products").find((row) => row.code?.toLowerCase() === q) ?? null
  );
}

/** 업체 + 품번 기준 제품 조회 (입고 자동완성) */
export function findProductByCompanyAndPartNo(company, partNo) {
  const partKey = String(partNo ?? "").trim().toLowerCase();
  if (!partKey) return null;
  const companyKey = String(company ?? "").trim().toLowerCase();
  const rows = getMasterDataByCategory("products").filter((row) => row.active !== false);
  if (companyKey) {
    const scoped = rows.find(
      (row) =>
        row.partNo?.toLowerCase() === partKey &&
        String(row.company ?? "").trim().toLowerCase() === companyKey
    );
    if (scoped) return scoped;
  }
  return rows.find((row) => row.partNo?.toLowerCase() === partKey) ?? null;
}

/** 업체코드_YYYYMMDD_순번 — ProductMaster Excel Import */
export function generateProductManagementCode(companyName, existingCodes = null) {
  const codeMap = getCompanyCodeMap();
  const companyCode =
    codeMap[companyName] ??
    buildCompanyAbbreviation(companyName, getMasterDataByCategory("companies"));
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const prefix = `${companyCode}_${datePart}_`;
  const codes =
    existingCodes ??
    getMasterDataByCategory("products").map((row) => String(row.code ?? ""));
  const maxSeq = codes.reduce((max, code) => {
    if (!code.startsWith(prefix)) return max;
    const seq = Number(code.slice(prefix.length));
    return Number.isFinite(seq) ? Math.max(max, seq) : max;
  }, 0);
  return `${prefix}${String(maxSeq + 1).padStart(3, "0")}`;
}

export function findCompanyByCode(code) {
  const q = String(code ?? "").trim().toLowerCase();
  if (!q) return null;
  return (
    getMasterDataByCategory("companies").find(
      (row) =>
        row.code?.toLowerCase() === q || getCompanyAbbreviation(row).toLowerCase() === q
    ) ?? null
  );
}

export function findMaterialByCode(code) {
  const q = String(code ?? "").trim().toLowerCase();
  if (!q) return null;
  return getMasterDataByCategory("materials").find((row) => row.code?.toLowerCase() === q) ?? null;
}

export function findProcessByCode(code) {
  const q = String(code ?? "").trim().toLowerCase();
  if (!q) return null;
  return getMasterDataByCategory("heatTreatment").find((row) => row.code?.toLowerCase() === q) ?? null;
}

/** Import Undo — revert last batch per master type */
export function revertMasterImport(categoryKey, undoSnapshot) {
  if (!undoSnapshot) return { ok: false, message: "Undo 대상이 없습니다." };
  const storageKey = resolveStorageCategory(categoryKey);
  const rows = [...(sessionMasterData[storageKey] ?? [])];

  (undoSnapshot.updatedRecords ?? []).forEach(({ id, previousData }) => {
    const index = rows.findIndex((row) => row.id === id);
    if (index >= 0 && previousData) {
      rows[index] = { ...previousData };
    }
  });

  const createdIds = new Set(undoSnapshot.createdIds ?? []);
  sessionMasterData[storageKey] = rows.filter((row) => !createdIds.has(row.id));
  persistMasterData(categoryKey);
  return { ok: true };
}

const PRODUCT_COMPARE_FIELDS = [
  { key: "name", label: "품명" },
  { key: "company", label: "업체명" },
  { key: "material", label: "재질" },
  { key: "spec", label: "규격" },
  { key: "unitPrice", label: "기본단가" },
  { key: "note", label: "비고" },
];

/** Excel Import — 기존 ProductMaster와 변경 항목 비교 */
export function compareProductMasterChanges(existing, incoming) {
  if (!existing || !incoming) return [];
  return PRODUCT_COMPARE_FIELDS.filter(({ key }) => {
    const left = existing[key];
    const right = incoming[key];
    if (key === "unitPrice") {
      return Number(left ?? 0) !== Number(right ?? 0);
    }
    return String(left ?? "").trim() !== String(right ?? "").trim();
  }).map(({ key, label }) => ({
    key,
    label,
    from: existing[key],
    to: incoming[key],
  }));
}

export function compareCompanyMasterChanges(existing, incoming) {
  const fields = [
    { key: "name", label: "업체명" },
    { key: "manager", label: "담당자" },
    { key: "phone", label: "전화번호" },
    { key: "mobile", label: "휴대전화" },
    { key: "email", label: "이메일" },
    { key: "address", label: "주소" },
    { key: "note", label: "비고" },
  ];
  return fields
    .filter(({ key }) => String(existing[key] ?? "").trim() !== String(incoming[key] ?? "").trim())
    .map(({ key, label }) => ({ key, label, from: existing[key], to: incoming[key] }));
}

export function compareMaterialMasterChanges(existing, incoming) {
  const fields = [
    { key: "name", label: "재질명" },
    { key: "spec", label: "설명" },
    { key: "note", label: "비고" },
  ];
  return fields
    .filter(({ key }) => String(existing[key] ?? "").trim() !== String(incoming[key] ?? "").trim())
    .map(({ key, label }) => ({ key, label, from: existing[key], to: incoming[key] }));
}

export function compareProcessMasterChanges(existing, incoming) {
  const fields = [
    { key: "name", label: "공정명" },
    { key: "description", label: "설명" },
    { key: "note", label: "비고" },
  ];
  return fields
    .filter(({ key }) => String(existing[key] ?? "").trim() !== String(incoming[key] ?? "").trim())
    .map(({ key, label }) => ({ key, label, from: existing[key], to: incoming[key] }));
}

/** 품번 · 품명 · 도번 기준 제품 조회 (자동완성 · 자동입력) */
export function resolveProductByQuery(query, { includeInactive = false } = {}) {
  const q = String(query ?? "").trim().toLowerCase();
  if (!q) return null;

  const rows = getMasterDataByCategory("products").filter(
    (row) => includeInactive || row.active !== false
  );

  const exact = rows.find(
    (row) =>
      row.partNo?.toLowerCase() === q ||
      row.name?.toLowerCase() === q ||
      row.drawingNo?.toLowerCase() === q ||
      row.code?.toLowerCase() === q
  );
  if (exact) return exact;

  const partNoPrefix = rows.find((row) => row.partNo?.toLowerCase().startsWith(q));
  if (partNoPrefix) return partNoPrefix;

  const drawingPrefix = rows.find((row) => row.drawingNo?.toLowerCase().includes(q));
  if (drawingPrefix) return drawingPrefix;

  const nameMatch = rows.find((row) => row.name?.toLowerCase().includes(q));
  if (nameMatch) return nameMatch;

  return (
    rows.find((row) =>
      [row.code, row.partNo, row.name, row.drawingNo].some((value) =>
        String(value ?? "")
          .toLowerCase()
          .includes(q)
      )
    ) ?? null
  );
}

/** 품번 기준 제품 마스터 자동입력 필드 */
export function getProductAutofillByPartNo(partNo, company = "") {
  const product =
    findProductByCompanyAndPartNo(company, partNo) ??
    resolveProductByQuery(partNo) ??
    findProductByPartNo(partNo);
  if (!product) return null;
  return {
    partNo: product.partNo ?? "",
    partName: product.name ?? "",
    name: product.name ?? "",
    company: product.company ?? "",
    drawingNo: product.drawingNo ?? "",
    material: product.material ?? "",
    spec: product.spec ?? "",
    unitPrice: product.unitPrice ?? null,
    process: product.process ?? "",
    unit: product.unit ?? "EA",
  };
}

/** @deprecated use findProductByPartNo */
export function findItemByPartNo(partNo) {
  return findProductByPartNo(partNo);
}

export function getMasterSuggestions(categoryKey, query, limit = 8) {
  const q = String(query ?? "").trim().toLowerCase();
  const resolvedKey = resolveCategoryKey(categoryKey);
  const rows = getMasterDataByCategory(categoryKey).filter((row) => {
    if (resolvedKey === "employees") {
      const status = row.employmentStatus ?? (row.active === false ? "퇴사" : "재직");
      return status === "재직";
    }
    return row.active !== false;
  });
  if (!q) return rows.slice(0, limit);
  return rows
    .filter((row) =>
      [row.code, row.name, row.partNo, row.drawingNo, row.manager, row.department, row.email, row.role]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q))
    )
    .slice(0, limit);
}

export const MASTER_FIELD_LINKS = {
  companies: { label: "업체명", screens: ["입고관리", "생산작업계획", "성적서관리"] },
  products: { label: "제품", screens: ["입고관리", "생산관리", "출고관리", "검사기준관리", "거래명세서"] },
  materials: { label: "재질", screens: ["입고관리", "생산일보"] },
  heatTreatment: { label: "공정", screens: ["입고관리", "생산작업계획"] },
  workers: { label: "작업자", screens: ["생산일보", "검사일지", "성적서관리"] },
  employees: {
    label: "직원",
    screens: ["생산일보", "검사일지", "출고관리", "부서별 업무", "통계자료"],
  },
  equipment: { label: "설비", screens: ["생산일보", "열처리 작업 리스트"] },
  customCodes: { label: "공통코드", screens: ["전체 메뉴"] },
  units: { label: "단위", screens: ["입고관리", "출고관리", "거래명세서"] },
  status: { label: "상태 코드", screens: ["HOME", "출고관리"] },
};

export const MASTER_DATA_NAV_KEYS = [
  "companies",
  "products",
  "materials",
  "heatTreatment",
  "equipment",
  "workers",
  "employees",
  "customCodes",
];

export function getMasterNavCategories() {
  return MASTER_CATEGORIES.filter((item) => MASTER_DATA_NAV_KEYS.includes(item.key));
}

/**
 * Project TITAN — CompanyStore SSOT (Sprint 11 · Company Master Workspace)
 *
 * TITAN 전체가 참조하는 Company Master — 성적서 · 거래명세서 · QR · TDE 공통 Source of Truth.
 * Environment settings와 분리 · 단일 회사 프로필(Object).
 */

import { TITAN_DATA_STORAGE_KEYS } from "../titanDataStorageKeys";
import { createJsonObjectStore } from "../storeFactory";

/** Sprint 11 Company Master 구조 */
function buildCompanyProfileSeed() {
  return {
    companyMaster: {
      companyName: "주식회사 NDK",
      englishName: "",
      businessNumber: "000-00-00000",
      corporateNumber: "",
      representative: "대표이사",
      businessType: "",
      businessItem: "",
      address: "",
      phone: "",
      fax: "",
      email: "",
      website: "",
      updatedAt: null,
    },
    businessSites: [
      {
        id: "SITE-HQ",
        name: "본사",
        type: "headquarters",
        address: "",
        phone: "",
        status: "active",
      },
      {
        id: "SITE-F1",
        name: "제1공장",
        type: "factory",
        address: "",
        phone: "",
        status: "active",
      },
    ],
    organization: {
      placeholder: true,
      note: "조직도 Tree Editor — 향후 Sprint 확장",
    },
    departments: [
      { id: "DEPT-Q", code: "Q", name: "품질", status: "active" },
      { id: "DEPT-P", code: "P", name: "생산", status: "active" },
      { id: "DEPT-S", code: "S", name: "영업", status: "active" },
      { id: "DEPT-A", code: "A", name: "경리", status: "active" },
      { id: "DEPT-F", code: "F", name: "회계", status: "active" },
    ],
    employees: [],
    positions: [
      { id: "POS-01", code: "STAFF", name: "사원", rank: 1, status: "active" },
      { id: "POS-02", code: "ASSOC", name: "주임", rank: 2, status: "active" },
      { id: "POS-03", code: "ASST", name: "대리", rank: 3, status: "active" },
      { id: "POS-04", code: "MGR", name: "과장", rank: 4, status: "active" },
      { id: "POS-05", code: "SMGR", name: "차장", rank: 5, status: "active" },
      { id: "POS-06", code: "GM", name: "부장", rank: 6, status: "active" },
      { id: "POS-07", code: "DIR", name: "이사", rank: 7, status: "active" },
      { id: "POS-08", code: "CEO", name: "대표", rank: 8, status: "active" },
    ],
    branding: {
      logo: "",
      stamp: "",
      signature: "",
      brandTheme: {
        primaryColor: "",
        accentColor: "",
      },
    },
    documentFooter: {
      companyName: "주식회사 NDK",
      address: "",
      phone: "",
      email: "",
      copyright: "Copyright © NDK. All rights reserved.",
      updatedAt: null,
    },
    certification: [],
    /** @deprecated Blueprint alias — businessSites와 동기화 */
    businessLocation: [],
    meta: {
      lastUpdatedAt: null,
      lastUpdatedBy: "",
    },
  };
}

const objectStore = createJsonObjectStore({
  storageKey: TITAN_DATA_STORAGE_KEYS.company,
  getSeed: buildCompanyProfileSeed,
});

export const companyStore = {
  storageKey: objectStore.storageKey,
  get: () => objectStore.read(),
  update: (patch) => objectStore.update(patch),
  replace: (value) => objectStore.replace(value),
  seedIfEmpty: () => objectStore.seedIfEmpty(),
  clear: () => objectStore.clear(),
};

export default companyStore;

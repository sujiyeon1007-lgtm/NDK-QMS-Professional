/**
 * Project TITAN V2.0 — CompanyStore SSOT
 *
 * Blueprint ⑨ 회사정보 (Company Master Workspace)
 * 모든 출력물·시스템이 공통 참조하는 회사 정보의 단일 관리 영역(SSoT).
 * 단일 회사 프로필(Object) — companyMaster · branding · certification · businessLocation.
 */

import { TITAN_DATA_STORAGE_KEYS } from "../titanDataStorageKeys";
import { createJsonObjectStore } from "../storeFactory";

/** Blueprint ⑨ Company Master 구조 — 중립 Scaffold (Demo 데이터는 별도 Seed 단계) */
function buildCompanyProfileSeed() {
  return {
    companyMaster: {
      companyName: "",
      businessNumber: "",
      representative: "",
      address: "",
      phone: "",
      fax: "",
      email: "",
    },
    branding: {
      logo: "",
      stamp: "",
      brandTheme: {
        primaryColor: "",
        accentColor: "",
      },
    },
    certification: [],
    businessLocation: [],
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

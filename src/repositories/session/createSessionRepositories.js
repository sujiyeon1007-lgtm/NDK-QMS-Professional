import { getMasterDataByCategory } from "../../utils/masterData";
import {
  getSessionProductionRecords,
  isIncomingRegistered,
} from "../../utils/productionRecords";
import { getInspectionLogs } from "../../utils/inspectionLogSession";
import { getCertificateFileEntries } from "../../utils/certificateSession";

function resolveMesManagementNo(record) {
  return record?.mesManagementNo?.trim() || record?.id?.trim() || "";
}

/** @returns {import("./repositoryTypes").CustomerRepository} */
export function createSessionCustomerRepository() {
  return {
    listActive() {
      return getMasterDataByCategory("companies").filter((row) => row.active !== false);
    },
    findByCode(code) {
      const key = String(code ?? "").trim();
      return getMasterDataByCategory("companies").find(
        (row) => row.code === key || row.name === key
      );
    },
  };
}

/** @returns {import("./repositoryTypes").ProductRepository} */
export function createSessionProductRepository() {
  return {
    listActive() {
      return getMasterDataByCategory("products").filter((row) => row.active !== false);
    },
    findByPartNo(partNo, company = "") {
      const partKey = String(partNo ?? "").trim();
      const companyKey = String(company ?? "").trim();
      return getMasterDataByCategory("products").find((row) => {
        if (row.partNo !== partKey) return false;
        if (!companyKey) return true;
        return row.company === companyKey;
      });
    },
  };
}

/** @returns {import("./repositoryTypes").IncomingRepository} */
export function createSessionIncomingRepository() {
  return {
    listInbound() {
      return getSessionProductionRecords().filter((record) => isIncomingRegistered(record));
    },
    findByMesManagementNo(mesManagementNo) {
      const key = String(mesManagementNo ?? "").trim();
      return getSessionProductionRecords().find(
        (record) => resolveMesManagementNo(record) === key
      );
    },
  };
}

/** @returns {import("./repositoryTypes").InspectionRepository} */
export function createSessionInspectionRepository() {
  return {
    findByMesManagementNo(mesManagementNo) {
      const key = String(mesManagementNo ?? "").trim();
      return getInspectionLogs().find(
        (log) => resolveMesManagementNo(log) === key || log.managementId === key
      );
    },
    save(payload) {
      void payload;
      throw new Error("InspectionRepository.save — V1.0는 inspectionLogSession API 사용");
    },
  };
}

/** @returns {import("./repositoryTypes").CertificateRepository} */
export function createSessionCertificateRepository() {
  return {
    listByMesManagementNo(mesManagementNo) {
      const key = String(mesManagementNo ?? "").trim();
      return getCertificateFileEntries().filter(
        (entry) => resolveMesManagementNo(entry) === key || entry.managementId === key
      );
    },
    save(payload) {
      void payload;
      throw new Error("CertificateRepository.save — V1.0는 certificateSession API 사용");
    },
  };
}

/** @returns {import("./repositoryTypes").TitanRepositories} */
export function createSessionRepositories() {
  return {
    customers: createSessionCustomerRepository(),
    products: createSessionProductRepository(),
    incoming: createSessionIncomingRepository(),
    inspections: createSessionInspectionRepository(),
    certificates: createSessionCertificateRepository(),
  };
}

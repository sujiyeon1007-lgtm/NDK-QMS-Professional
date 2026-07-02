import {
  isMesOracleBridgeAvailable,
  runReadOnlyQuery as bridgeRunQuery,
} from "../../services/mesOracleBridge";
import { getInspectionLogs } from "../../utils/inspectionLogSession";
import { getCertificateFileEntries } from "../../utils/certificateSession";

function resolveMesManagementNo(record) {
  return record?.mesManagementNo?.trim() || record?.id?.trim() || "";
}

/** @type {Map<string, object[]>} */
const queryCache = new Map();

function cacheKey(queryId) {
  return queryId;
}

async function fetchQueryRows(queryId) {
  if (!isMesOracleBridgeAvailable()) {
    return [];
  }
  const cached = queryCache.get(cacheKey(queryId));
  if (cached) return cached;

  const result = await bridgeRunQuery(queryId);
  if (result.ok && Array.isArray(result.rows)) {
    queryCache.set(cacheKey(queryId), result.rows);
    return result.rows;
  }
  return [];
}

function mapProductRow(row, index) {
  return {
    ...row,
    partNo: row.MASVNO ?? row.partNo ?? row.PART_NO ?? "",
    partName: row.MASVNM ?? row.partName ?? row.PART_NAME ?? "",
    material: row.MASCOLM ?? row.material ?? row.MATERIAL ?? "",
    active: true,
    _oracleIndex: index,
  };
}

function mapCustomerRow(row, index) {
  const code = row.VNDCOD ?? row.code ?? row.CODE ?? "";
  const name = row.VNDKNM ?? row.name ?? row.NAME ?? "";
  return {
    ...row,
    code,
    name,
    active: true,
    _oracleIndex: index,
  };
}

function mapInboundRow(row, index) {
  return {
    ...row,
    mesManagementNo:
      row.SADVLO ?? row.mesManagementNo ?? row.MANAGEMENT_NO ?? row.managementNo ?? `ROW-${index + 1}`,
    company: row.VNDKNM ?? row.company ?? row.COMPANY ?? "",
    partName: row.MASVNM ?? row.partName ?? "",
    partNo: row.MASVNO ?? row.partNo ?? "",
    material: row.MASCOLM ?? row.material ?? "",
    qty: row.SADQTY ?? row.qty ?? "",
    lotNo: row.SADLOT ?? row.lotNo ?? "",
    inboundDate: row.SADDAT ?? row.inboundDate ?? "",
    id: row.SADVLO ?? row.mesManagementNo ?? `oracle-inbound-${index}`,
    _oracleIndex: index,
  };
}

/** @returns {import("../repositoryTypes").CustomerRepository} */
export function createOracleCustomerRepository() {
  return {
    async listActive() {
      const rows = await fetchQueryRows("customer-master");
      return rows.map(mapCustomerRow);
    },
    async findByCode(code) {
      const rows = await this.listActive();
      const key = String(code ?? "").trim();
      return rows.find((row) => row.code === key || row.name === key);
    },
  };
}

/** @returns {import("../repositoryTypes").ProductRepository} */
export function createOracleProductRepository() {
  return {
    async listActive() {
      const rows = await fetchQueryRows("product-master");
      return rows.map(mapProductRow);
    },
    async findByPartNo(partNo, company = "") {
      const rows = await this.listActive();
      const partKey = String(partNo ?? "").trim();
      const companyKey = String(company ?? "").trim();
      return rows.find((row) => {
        if (row.partNo !== partKey) return false;
        if (!companyKey) return true;
        return row.company === companyKey;
      });
    },
  };
}

/** @returns {import("../repositoryTypes").IncomingRepository} */
export function createOracleIncomingRepository() {
  return {
    async listInbound() {
      const rows = await fetchQueryRows("inbound");
      return rows.map(mapInboundRow);
    },
    async findByMesManagementNo(mesManagementNo) {
      const rows = await this.listInbound();
      const key = String(mesManagementNo ?? "").trim();
      return rows.find((record) => resolveMesManagementNo(record) === key);
    },
  };
}

/** @returns {import("../repositoryTypes").InspectionRepository} */
export function createOracleInspectionRepository() {
  return {
    findByMesManagementNo(mesManagementNo) {
      const key = String(mesManagementNo ?? "").trim();
      return getInspectionLogs().find(
        (log) => resolveMesManagementNo(log) === key || log.managementId === key
      );
    },
    save(payload) {
      void payload;
      throw new Error("InspectionRepository.save — PoC Oracle backend는 품질 저장 미지원");
    },
  };
}

/** @returns {import("../repositoryTypes").CertificateRepository} */
export function createOracleCertificateRepository() {
  return {
    listByMesManagementNo(mesManagementNo) {
      const key = String(mesManagementNo ?? "").trim();
      return getCertificateFileEntries().filter(
        (entry) => resolveMesManagementNo(entry) === key || entry.managementId === key
      );
    },
    save(payload) {
      void payload;
      throw new Error("CertificateRepository.save — PoC Oracle backend는 품질 저장 미지원");
    },
  };
}

/** @returns {import("../repositoryTypes").TitanRepositories} */
export function createOracleRepositories() {
  return {
    customers: createOracleCustomerRepository(),
    products: createOracleProductRepository(),
    incoming: createOracleIncomingRepository(),
    inspections: createOracleInspectionRepository(),
    certificates: createOracleCertificateRepository(),
  };
}

export function clearOracleRepositoryCache() {
  queryCache.clear();
}

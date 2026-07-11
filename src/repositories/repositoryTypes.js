/**
 * @typedef {object} CustomerRepository
 * @property {() => object[]} listActive
 * @property {(mesManagementNo: string) => object | undefined} findByCode
 */

/**
 * @typedef {object} ProductRepository
 * @property {() => object[]} listActive
 * @property {(partNo: string, company?: string) => object | undefined} findByPartNo
 */

/**
 * @typedef {object} IncomingRepository
 * @property {() => object[]} listInbound
 * @property {(mesManagementNo: string) => object | undefined} findByMesManagementNo
 */

/**
 * @typedef {object} InspectionRepository
 * @property {(mesManagementNo: string) => object | undefined} findByMesManagementNo
 * @property {(payload: object) => object} save
 */

/**
 * @typedef {object} CertificateRepository
 * @property {(mesManagementNo: string) => object[]} listByMesManagementNo
 * @property {(payload: object) => object} save
 */

/**
 * @typedef {"master" | "operations" | "all"} DataResetScope
 */

/**
 * @typedef {object} DataResetResult
 * @property {boolean} ok
 * @property {DataResetScope} scope
 * @property {string[]} clearedKeys
 * @property {string[]} [clearedCategories]
 * @property {string} message
 */

/**
 * @typedef {object} DataResetRepository
 * @property {() => { master: Record<string, number>, operations: { productionRecords: number, inspections: number, certificates: number } }} getSummary
 * @property {() => { ok: boolean, recordCount: number, message: string }} loadDemo
 * @property {(scope: DataResetScope) => DataResetResult} reset
 */

/**
 * @typedef {object} TitanRepositories
 * @property {CustomerRepository} customers
 * @property {ProductRepository} products
 * @property {IncomingRepository} incoming
 * @property {InspectionRepository} inspections
 * @property {CertificateRepository} certificates
 * @property {DataResetRepository} dataReset
 */

export {};

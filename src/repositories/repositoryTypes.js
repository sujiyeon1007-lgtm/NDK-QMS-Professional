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
 * @typedef {object} TitanRepositories
 * @property {CustomerRepository} customers
 * @property {ProductRepository} products
 * @property {IncomingRepository} incoming
 * @property {InspectionRepository} inspections
 * @property {CertificateRepository} certificates
 */

export {};

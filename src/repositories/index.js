import { REPOSITORY_BACKEND } from "../config/repositoryArchitecture";

import { createSessionRepositories } from "./session/createSessionRepositories";

import {

  createOracleRepositories,

  clearOracleRepositoryCache,

} from "./oracle/createOracleRepositories";

import { createSqliteRepositories } from "./sqlite/createSqliteRepositories.js";

/** @type {import("./repositoryTypes").TitanRepositories | null} */

let cachedRepositories = null;



/** @type {"session" | "oracle" | "sqlite"} */

let activeBackend = "session";



/**

 * @param {"session" | "oracle" | "sqlite"} backend

 */

export function setRepositoryBackend(backend) {

  if (backend !== "session" && backend !== "oracle" && backend !== "sqlite") {

    throw new Error(`Unknown repository backend: ${backend}`);

  }

  if (activeBackend !== backend) {

    activeBackend = backend;

    cachedRepositories = null;

    if (backend === "session") {

      clearOracleRepositoryCache();

    }

  }

}



export function getActiveRepositoryBackend() {

  return activeBackend;

}



/**

 * V1.0: SessionStorage · REV.5 PoC: Oracle (Electron read-only)

 * @returns {import("./repositoryTypes").TitanRepositories}

 */

export function getRepositories() {

  if (!cachedRepositories) {

    if (activeBackend === "oracle") {
      cachedRepositories = createOracleRepositories();
    } else if (activeBackend === "sqlite") {
      cachedRepositories = createSqliteRepositories();
    } else {
      cachedRepositories = createSessionRepositories();
    }

  }

  return cachedRepositories;

}



export function getRepositoryBackendLabel() {
  if (activeBackend === "oracle") {
    return REPOSITORY_BACKEND.MES_ORACLE;
  }
  if (activeBackend === "sqlite") {
    return REPOSITORY_BACKEND.STANDALONE_V1_1;
  }
  return REPOSITORY_BACKEND.STANDALONE_V1_0;
}



export function resetRepositoriesForDemo() {

  cachedRepositories = null;

  clearOracleRepositoryCache();

}



export {

  createSessionCustomerRepository,

  createSessionProductRepository,

  createSessionIncomingRepository,

  createSessionInspectionRepository,

  createSessionCertificateRepository,

  createSessionRepositories,

} from "./session/createSessionRepositories";



export {

  createOracleCustomerRepository,

  createOracleProductRepository,

  createOracleIncomingRepository,

  createOracleInspectionRepository,

  createOracleCertificateRepository,

  createOracleRepositories,

  clearOracleRepositoryCache,

} from "./oracle/createOracleRepositories";

export { createSqliteRepositories } from "./sqlite/createSqliteRepositories.js";

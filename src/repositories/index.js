import { REPOSITORY_BACKEND } from "../config/repositoryArchitecture";

import { createSessionRepositories } from "./session/createSessionRepositories";

import {

  createOracleRepositories,

  clearOracleRepositoryCache,

} from "./oracle/createOracleRepositories";



/** @type {import("./repositoryTypes").TitanRepositories | null} */

let cachedRepositories = null;



/** @type {"session" | "oracle"} */

let activeBackend = "session";



/**

 * @param {"session" | "oracle"} backend

 */

export function setRepositoryBackend(backend) {

  if (backend !== "session" && backend !== "oracle") {

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

    cachedRepositories =

      activeBackend === "oracle" ? createOracleRepositories() : createSessionRepositories();

  }

  return cachedRepositories;

}



export function getRepositoryBackendLabel() {
  if (activeBackend === "oracle") {
    return REPOSITORY_BACKEND.MES_ORACLE;
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


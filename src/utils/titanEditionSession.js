/**

 * Project TITAN — Edition 선택 SessionStorage

 * V1.0: Quality Edition auto-lock · Session Repository only

 */



import {

  MES_REPOSITORY_ADAPTER,

  REPOSITORY_ADAPTER,

  TITAN_EDITION,

  TITAN_EDITION_DEFINITIONS,

  resolveRepositoryBackendForEdition,

} from "../config/titanEditionArchitecture";

import {

  V1_0_EDITION_LOCK,

  V1_0_SHOW_EDITION_BOOT_MODAL,

  isV1EditionLocked,

} from "../config/titanV1DevelopmentDirection";

import { setRepositoryBackend } from "../repositories";



const STORAGE_KEY = "project-titan-edition-v1";



function defaultEditionState() {

  return {

    editionId: V1_0_EDITION_LOCK,

    mesAdapter: MES_REPOSITORY_ADAPTER.ORACLE,

    selectedAt: "",

    note: "",

  };

}



function readEditionState() {

  try {

    const raw = globalThis.sessionStorage?.getItem(STORAGE_KEY);

    if (!raw) return defaultEditionState();

    return { ...defaultEditionState(), ...JSON.parse(raw) };

  } catch {

    return defaultEditionState();

  }

}



function writeEditionState(state) {

  globalThis.sessionStorage?.setItem(STORAGE_KEY, JSON.stringify(state));

}



function applyRepositoryForState(state) {

  const backend = resolveRepositoryBackendForEdition(state.editionId, state.mesAdapter);

  if (backend === REPOSITORY_ADAPTER.SESSION || backend === REPOSITORY_ADAPTER.ORACLE) {

    setRepositoryBackend(backend);

  } else {

    setRepositoryBackend(REPOSITORY_ADAPTER.SESSION);

  }

}



/** V1.0 Edition lock — force edition + session repository */
export function ensureV1EditionLock() {
  if (!isV1EditionLocked()) return readEditionState();

  const next = {
    editionId: V1_0_EDITION_LOCK,
    mesAdapter: MES_REPOSITORY_ADAPTER.ORACLE,
    selectedAt: new Date().toISOString(),
    note: "V1.0 Standalone Edition auto-lock",
  };

  writeEditionState(next);
  setRepositoryBackend(REPOSITORY_ADAPTER.SESSION);

  return next;
}

/** @deprecated use ensureV1EditionLock */
export const ensureV1QualityEditionLock = ensureV1EditionLock;



export function getTitanEditionState() {

  if (isV1EditionLocked()) {

    return ensureV1EditionLock();

  }

  return readEditionState();

}



export function isTitanEditionSelected() {

  if (isV1EditionLocked() && !V1_0_SHOW_EDITION_BOOT_MODAL) {

    return true;

  }

  try {

    return Boolean(globalThis.sessionStorage?.getItem(STORAGE_KEY));

  } catch {

    return false;

  }

}



/**

 * @param {string} editionId

 * @param {{ mesAdapter?: string, note?: string }} [options]

 */

export function setTitanEdition(editionId, options = {}) {

  if (isV1EditionLocked() && editionId !== V1_0_EDITION_LOCK) {

    return {

      ok: false,

      message: "V1.0은 Standalone Edition(독립 실행형 QMS)만 사용 가능합니다. (MES Connected는 V1.1)",

    };

  }



  const definition = TITAN_EDITION_DEFINITIONS[editionId];

  if (!definition) {

    return { ok: false, message: "알 수 없는 Edition입니다." };

  }

  if (definition.future || definition.selectable === false || definition.onHold) {

    return { ok: false, message: "현재 V1.0에서 제공되지 않는 Edition입니다. (MES PoC 이후)" };

  }



  const mesAdapter =

    editionId === TITAN_EDITION.MES_CONNECTED

      ? options.mesAdapter ?? MES_REPOSITORY_ADAPTER.ORACLE

      : MES_REPOSITORY_ADAPTER.ORACLE;



  const next = {

    editionId,

    mesAdapter,

    selectedAt: new Date().toISOString(),

    note: options.note?.trim() ?? "",

  };



  writeEditionState(next);

  applyRepositoryForState(next);



  return {

    ok: true,

    state: next,

    definition,

    repositoryBackend: resolveRepositoryBackendForEdition(editionId, mesAdapter),

  };

}



/** 앱 부팅 시 Repository 동기화 */

export function syncRepositoryWithEdition() {

  if (isV1EditionLocked()) {

    ensureV1QualityEditionLock();

    return;

  }

  applyRepositoryForState(readEditionState());

}



export function getTitanEditionDisplayLabel() {

  const state = getTitanEditionState();

  const def =

    TITAN_EDITION_DEFINITIONS[state.editionId] ??

    TITAN_EDITION_DEFINITIONS[V1_0_EDITION_LOCK];

  const subtitle = def.subtitle ? ` (${def.subtitle})` : "";

  if (state.editionId === TITAN_EDITION.MES_CONNECTED) {

    return `${def.labelKo}${subtitle} · ${state.mesAdapter.toUpperCase()}`;

  }

  return `${def.labelKo}${subtitle}`;

}


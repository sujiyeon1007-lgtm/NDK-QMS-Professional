/**
 * Project TITAN — Operation Mode SessionStorage
 * Persists Welcome Screen selection · gates main app to Standalone mode
 */

import {
  OPERATION_MODE,
  getOperationModeDefinition,
  isStandaloneOperationMode,
} from "../config/operationMode";
import { OPERATION_MODE_WELCOME_ENABLED } from "../config/titanV1DevelopmentDirection";
import { ensureV1EditionLock, syncRepositoryWithEdition } from "./titanEditionSession";

const STORAGE_KEY = "project-titan-operation-mode-v1";

function defaultState() {
  return {
    modeId: "",
    appUnlocked: false,
    selectedAt: "",
    note: "",
  };
}

function readState() {
  try {
    const raw = globalThis.sessionStorage?.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    return { ...defaultState(), ...JSON.parse(raw) };
  } catch {
    return defaultState();
  }
}

function writeState(state) {
  globalThis.sessionStorage?.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function getOperationModeState() {
  return readState();
}

export function getActiveOperationModeId() {
  return readState().modeId || "";
}

/** Main app routes require Standalone mode selection */
export function hasStandaloneAppAccess() {
  if (!OPERATION_MODE_WELCOME_ENABLED) return true;
  const state = readState();
  return state.appUnlocked === true && isStandaloneOperationMode(state.modeId);
}

/** @deprecated alias */
export function isOperationModeSelected() {
  return Boolean(getActiveOperationModeId());
}

/**
 * Activate Standalone mode — unlocks app · syncs edition/repository
 * @param {{ note?: string }} [options]
 */
export function activateStandaloneMode(options = {}) {
  const definition = getOperationModeDefinition(OPERATION_MODE.STANDALONE);
  if (!definition) {
    return { ok: false, message: "Standalone Mode를 찾을 수 없습니다." };
  }

  const next = {
    modeId: OPERATION_MODE.STANDALONE,
    appUnlocked: true,
    selectedAt: new Date().toISOString(),
    note: options.note?.trim() ?? "Presentation Standalone · SessionStorage Demo",
  };

  writeState(next);
  ensureV1EditionLock();
  syncRepositoryWithEdition();

  return { ok: true, state: next, definition };
}

/**
 * Record preview interaction (Hybrid / Future) — does not unlock app
 * @param {string} modeId
 */
export function recordPreviewModeSelection(modeId) {
  const definition = getOperationModeDefinition(modeId);
  if (!definition) {
    return { ok: false, message: "알 수 없는 운영 모드입니다." };
  }

  const next = {
    modeId,
    appUnlocked: false,
    selectedAt: new Date().toISOString(),
    note: `${definition.labelKo} preview`,
  };

  writeState(next);
  return { ok: true, state: next, definition };
}

export function clearOperationMode() {
  try {
    globalThis.sessionStorage?.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function getOperationModeDisplayLabel() {
  const state = readState();
  const def = getOperationModeDefinition(state.modeId);
  if (!def) return "";
  if (state.appUnlocked && isStandaloneOperationMode(state.modeId)) {
    return `${def.labelKo} · ${def.badge}`;
  }
  return def.labelKo;
}

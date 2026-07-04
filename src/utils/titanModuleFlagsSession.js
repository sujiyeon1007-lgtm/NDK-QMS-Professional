/**
 * Project TITAN — Module flags SessionStorage
 * @see src/config/titanV12ModuleExpansion.js
 */

import {
  MODULE_MANAGEMENT,
  TITAN_MODULE_REGISTRY,
  createDefaultModuleFlags,
} from "../config/titanV12ModuleExpansion";

const STORAGE_KEY = MODULE_MANAGEMENT.storageKey;
export const TITAN_MODULE_FLAGS_CHANGED = "titan-module-flags-changed";

export function getModuleFlags() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultModuleFlags();
    const parsed = JSON.parse(raw);
    const defaults = createDefaultModuleFlags();
    return { ...defaults, ...parsed };
  } catch {
    return createDefaultModuleFlags();
  }
}

export function saveModuleFlags(flags) {
  const defaults = createDefaultModuleFlags();
  const merged = { ...defaults, ...flags };
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  window.dispatchEvent(new CustomEvent(TITAN_MODULE_FLAGS_CHANGED, { detail: merged }));
  return merged;
}

export function setModuleFlag(moduleId, enabled) {
  const mod = TITAN_MODULE_REGISTRY[moduleId];
  if (!mod) return getModuleFlags();
  if (!mod.toggleable && enabled === false) return getModuleFlags();
  return saveModuleFlags({ ...getModuleFlags(), [moduleId]: Boolean(enabled) });
}

export function resetModuleFlags() {
  return saveModuleFlags(createDefaultModuleFlags());
}

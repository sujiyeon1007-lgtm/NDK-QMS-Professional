import { useCallback, useEffect, useState } from "react";

import { isModuleEnabled as checkModuleEnabled } from "../config/titanV12ModuleExpansion";
import {
  getModuleFlags,
  setModuleFlag,
  saveModuleFlags,
  TITAN_MODULE_FLAGS_CHANGED,
} from "../utils/titanModuleFlagsSession";

export function useTitanModuleFlags() {
  const [flags, setFlags] = useState(() => getModuleFlags());

  useEffect(() => {
    const sync = () => setFlags(getModuleFlags());
    window.addEventListener(TITAN_MODULE_FLAGS_CHANGED, sync);
    return () => window.removeEventListener(TITAN_MODULE_FLAGS_CHANGED, sync);
  }, []);

  const isModuleEnabled = useCallback(
    (moduleId) => checkModuleEnabled(moduleId, flags),
    [flags]
  );

  const updateModuleFlag = useCallback((moduleId, enabled) => {
    setModuleFlag(moduleId, enabled);
  }, []);

  const replaceFlags = useCallback((nextFlags) => {
    saveModuleFlags(nextFlags);
  }, []);

  return { flags, isModuleEnabled, updateModuleFlag, replaceFlags };
}

import { useCallback, useEffect, useState } from "react";

import { TITAN_LOGIN_STORAGE } from "../config/titanLoginSystem";
import {
  getAuthSession,
  isAuthenticated as checkAuthenticated,
} from "../utils/titanAuthSession";

export function useTitanAuth() {
  const [session, setSession] = useState(() => getAuthSession());
  const [authenticated, setAuthenticated] = useState(() => checkAuthenticated());

  useEffect(() => {
    const sync = () => {
      setSession(getAuthSession());
      setAuthenticated(checkAuthenticated());
    };
    window.addEventListener(TITAN_LOGIN_STORAGE.authChanged, sync);
    return () => window.removeEventListener(TITAN_LOGIN_STORAGE.authChanged, sync);
  }, []);

  const refresh = useCallback(() => {
    setSession(getAuthSession());
    setAuthenticated(checkAuthenticated());
  }, []);

  return { session, authenticated, refresh };
}

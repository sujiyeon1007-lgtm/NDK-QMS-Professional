import { createContext, useCallback, useContext, useMemo, useState } from "react";

const SectionPageActionsContext = createContext(null);

export function SectionPageActionsProvider({ children, toolbarTabCount = 0 }) {
  const [actions, setActionsState] = useState(null);
  const setActions = useCallback((node) => {
    setActionsState(node);
  }, []);

  const value = useMemo(
    () => ({ actions, setActions, toolbarTabCount }),
    [actions, setActions, toolbarTabCount]
  );

  return (
    <SectionPageActionsContext.Provider value={value}>{children}</SectionPageActionsContext.Provider>
  );
}

export function useSectionPageActionsContext() {
  return useContext(SectionPageActionsContext);
}

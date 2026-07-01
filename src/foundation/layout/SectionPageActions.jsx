import { useLayoutEffect } from "react";
import { useSectionPageActionsContext } from "./SectionPageActionsContext";

/**
 * Registers action buttons in TitanMenuToolbar (Header 아래 · Tab 우측).
 * Render at the top of each section page body; outputs nothing in the page flow.
 */
export default function SectionPageActions({ children }) {
  const ctx = useSectionPageActionsContext();

  useLayoutEffect(() => {
    if (!ctx) return undefined;
    ctx.setActions(children);
    return () => ctx.setActions(null);
  }, [ctx, children]);

  return null;
}

import { useLayoutEffect } from "react";
import { useSectionPageActionsContext } from "./SectionPageActionsContext";

/**
 * Tab Toolbar가 있을 때만 Header 아래 Toolbar에 등록.
 * Tab이 없으면 페이지 본문 상단에 인라인 작업 버튼으로 표시.
 */
export default function SectionPageActions({ children }) {
  const ctx = useSectionPageActionsContext();
  const useToolbar = (ctx?.toolbarTabCount ?? 0) > 1;

  useLayoutEffect(() => {
    if (!ctx) return undefined;
    if (!useToolbar) {
      ctx.setActions(null);
      return undefined;
    }
    ctx.setActions(children);
    return () => ctx.setActions(null);
  }, [ctx, children, useToolbar]);

  if (useToolbar) return null;

  return (
    <div className="titan-section-page__inline-actions" role="toolbar" aria-label="화면 기능">
      {children}
    </div>
  );
}

import { useState } from "react";

import Card from "./Card";

/**
 * Project TITAN V1.0 — 접이식 검색 패널 (기본 접힘)
 * HOME 통합검색 및 동일 패턴 메뉴에서 재사용
 */
export default function TitanCollapsibleSearchPanel({
  closedLabel = "▼ 통합검색",
  openLabel = "▲ 통합검색",
  defaultOpen = false,
  open: controlledOpen,
  onOpenChange,
  children,
  className = "",
  ariaLabel = "통합검색",
}) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;

  const setOpen = (next) => {
    if (!isControlled) {
      setInternalOpen(next);
    }
    onOpenChange?.(next);
  };

  return (
    <Card
      className={`titan-collapsible-search${isOpen ? " is-open" : ""} ${className}`.trim()}
      aria-label={ariaLabel}
    >
      <button
        type="button"
        className="titan-collapsible-search__toggle"
        onClick={() => setOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        {isOpen ? openLabel : closedLabel}
      </button>
      {isOpen ? <div className="titan-collapsible-search__body">{children}</div> : null}
    </Card>
  );
}

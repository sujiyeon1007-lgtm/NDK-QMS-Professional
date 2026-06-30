import { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function CollapsePanel({
  title,
  children,
  className = "",
  defaultOpen = true,
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={`titan-collapse ${className}`.trim()}>
      <button
        type="button"
        className="titan-collapse__head"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <strong>{title}</strong>
        <ChevronDown size={16} className={`titan-collapse__icon${open ? " open" : ""}`} />
      </button>
      {open ? <div className="titan-collapse__body">{children}</div> : null}
    </div>
  );
}

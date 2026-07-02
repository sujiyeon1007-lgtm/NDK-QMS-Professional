import { useEffect } from "react";
import { createPortal } from "react-dom";
import { FileText, X } from "lucide-react";
import { PrimaryButton, SecondaryButton } from "../../foundation/components/Button";
import "./OutboundStatementPromptDialog.css";

function OutboundStatementPromptDialog({ open, result, onConfirm, onCancel }) {
  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.classList.add("outbound-statement-prompt-open");
    document.body.style.overflow = "hidden";

    const handleKey = (event) => {
      if (event.key === "Escape") onCancel?.();
    };

    window.addEventListener("keydown", handleKey);

    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.classList.remove("outbound-statement-prompt-open");
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onCancel]);

  if (!open || !result) return null;

  const { record, shipQty, stockAfter } = result;

  return createPortal(
    <div className="outbound-statement-prompt-overlay" role="presentation" onClick={onCancel}>
      <div
        className="outbound-statement-prompt-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="outbound-statement-prompt-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="outbound-statement-prompt-header">
          <FileText size={22} aria-hidden="true" />
          <div>
            <h2 id="outbound-statement-prompt-title">출고 등록 완료</h2>
            <p>{record?.id ?? ""}</p>
          </div>
          <button type="button" className="outbound-statement-prompt-close" onClick={onCancel} aria-label="닫기">
            <X size={18} />
          </button>
        </header>

        <div className="outbound-statement-prompt-body">
          <p>
            <strong>{record?.company}</strong> · {record?.partName}
          </p>
          <p>
            출고수량 <strong>{shipQty} EA</strong>
            {typeof stockAfter === "number" ? (
              <>
                {" "}
                · 잔여 재고 <strong>{stockAfter} EA</strong>
              </>
            ) : null}
          </p>
          <p className="outbound-statement-prompt-question">거래명세서를 출력하시겠습니까?</p>
        </div>

        <footer className="outbound-statement-prompt-footer">
          <SecondaryButton type="button" onClick={onCancel}>
            아니오
          </SecondaryButton>
          <PrimaryButton type="button" onClick={onConfirm}>
            예 · 거래명세서 출력
          </PrimaryButton>
        </footer>
      </div>
    </div>,
    document.body
  );
}

export default OutboundStatementPromptDialog;

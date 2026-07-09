import { useEffect } from "react";
import { createPortal } from "react-dom";
import { ArrowRight, FileText, X } from "lucide-react";
import { PrimaryButton, SecondaryButton } from "../../foundation/components/Button";
import "./OutboundStatementPromptDialog.css";
import "../../foundation/components/OperationsWorkflowNextDialog.css";

function OutboundStatementPromptDialog({
  open,
  result,
  onCompleteOnly,
  onIssueAfterComplete,
  onCancelRegistration,
  onClose,
}) {
  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.classList.add("outbound-statement-prompt-open");
    document.body.style.overflow = "hidden";

    const handleKey = (event) => {
      if (event.key === "Escape") onClose?.();
    };

    window.addEventListener("keydown", handleKey);

    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.classList.remove("outbound-statement-prompt-open");
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open || !result) return null;

  const { record, shipQty, stockAfter } = result;

  return createPortal(
    <div className="outbound-statement-prompt-overlay" role="presentation" onClick={onClose}>
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
            <h2 id="outbound-statement-prompt-title">출고 등록 확인</h2>
            <p>{record?.id ?? ""}</p>
          </div>
          <button type="button" className="outbound-statement-prompt-close" onClick={onClose} aria-label="닫기">
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
          <p className="outbound-statement-prompt-question">출고 정보가 확인되었습니다.</p>
          <p className="outbound-statement-prompt-subquestion">거래명세서 발행 여부를 선택하세요. 출고와 거래명세서는 독립적으로 관리됩니다.</p>
        </div>

        <footer className="outbound-statement-prompt-footer">
          <SecondaryButton type="button" onClick={onCancelRegistration}>
            아니요 (취소)
          </SecondaryButton>
          <SecondaryButton type="button" onClick={onCompleteOnly}>
            <span className="outbound-statement-prompt-action">
              출고만 등록
              <small>(거래명세서 보류)</small>
            </span>
          </SecondaryButton>
          <PrimaryButton type="button" onClick={onIssueAfterComplete}>
            거래명세서 발행 후 출고 완료
          </PrimaryButton>
        </footer>
      </div>
    </div>,
    document.body
  );
}

export function OperationsWorkflowNextDialog({ open, step, onNavigate, onStay, onClose }) {
  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.classList.add("operations-workflow-next-open");
    document.body.style.overflow = "hidden";

    const handleKey = (event) => {
      if (event.key === "Escape") onClose?.();
    };

    window.addEventListener("keydown", handleKey);

    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.classList.remove("operations-workflow-next-open");
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open || !step) return null;

  const { title, message, hint, nextLabel, nextPath, stayLabel } = step;

  return createPortal(
    <div className="operations-workflow-next-overlay" role="presentation" onClick={onClose}>
      <div
        className="operations-workflow-next-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="operations-workflow-next-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="operations-workflow-next-header">
          <ArrowRight size={22} aria-hidden="true" />
          <div>
            <h2 id="operations-workflow-next-title">{title}</h2>
            <p>{message}</p>
          </div>
          <button type="button" className="operations-workflow-next-close" onClick={onClose} aria-label={"\uB2EB\uAE30"}>
            <X size={18} />
          </button>
        </header>

        <div className="operations-workflow-next-body">{hint ? <p>{hint}</p> : null}</div>

        <footer className="operations-workflow-next-footer">
          <SecondaryButton type="button" onClick={onStay}>
            {stayLabel}
          </SecondaryButton>
          <PrimaryButton type="button" onClick={() => onNavigate?.(nextPath)}>
            {nextLabel}
          </PrimaryButton>
        </footer>
      </div>
    </div>,
    document.body
  );
}

export default OutboundStatementPromptDialog;

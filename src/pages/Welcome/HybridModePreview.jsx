import { useEffect } from "react";
import { PrimaryButton, SecondaryButton } from "../../foundation/components/Button";
import { HYBRID_MODE_WORKFLOW } from "../../config/operationMode";
import "./ModePreviewShared.css";
import "./HybridModePreview.css";

export default function HybridModePreview({ open, onClose }) {
  useEffect(() => {
    if (!open) return undefined;
    document.body.classList.add("titan-mode-preview-open");
    return () => document.body.classList.remove("titan-mode-preview-open");
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="titan-mode-preview"
      role="dialog"
      aria-modal="true"
      aria-labelledby="hybrid-mode-preview-title"
      onClick={onClose}
    >
      <div
        className="titan-mode-preview__panel titan-mode-preview__panel--hybrid"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="titan-mode-preview__header">
          <span className="titan-mode-preview__eyebrow">🟡 Hybrid Mode · Preview</span>
          <h2 id="hybrid-mode-preview-title">MES + TITAN 협업 Workflow</h2>
          <p className="titan-mode-preview__lead">
            MES가 운영 SoT · Project TITAN이 품질 SoT — Oracle 연동 없이 협업 흐름만 미리보기합니다.
          </p>
        </header>

        <div className="titan-hybrid-workflow" aria-label="Hybrid Mode Workflow">
          {HYBRID_MODE_WORKFLOW.map((step, index) => (
            <div key={step.id} className="titan-hybrid-workflow__item">
              <div
                className={`titan-hybrid-workflow__node titan-hybrid-workflow__node--${step.role}`}
              >
                <span className="titan-hybrid-workflow__step">{step.step}</span>
                <strong>{step.label}</strong>
                <small>{step.description}</small>
              </div>
              {index < HYBRID_MODE_WORKFLOW.length - 1 ? (
                <div className="titan-hybrid-workflow__connector" aria-hidden="true">
                  <span />
                </div>
              ) : null}
            </div>
          ))}
        </div>

        <div className="titan-mode-preview__legend">
          <span className="titan-mode-preview__legend-item titan-mode-preview__legend-item--mes">
            MES 영역
          </span>
          <span className="titan-mode-preview__legend-item titan-mode-preview__legend-item--titan">
            TITAN QMS
          </span>
        </div>

        <p className="titan-mode-preview__note">
          Preview Only — Oracle · Repository · Realtime 연동은 Future Mode(Version 1 Gate)에서 제공 예정
        </p>

        <footer className="titan-mode-preview__footer">
          <SecondaryButton type="button" onClick={onClose}>
            닫기
          </SecondaryButton>
          <PrimaryButton type="button" onClick={onClose}>
            Standalone Mode에서 시작
          </PrimaryButton>
        </footer>
      </div>
    </div>
  );
}

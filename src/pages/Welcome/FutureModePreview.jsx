import { useEffect } from "react";
import { SecondaryButton } from "../../foundation/components/Button";
import { FUTURE_MODE_VISION } from "../../config/operationMode";
import "./ModePreviewShared.css";
import "./FutureModePreview.css";

export default function FutureModePreview({ open, onClose }) {
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
      aria-labelledby="future-mode-preview-title"
      onClick={onClose}
    >
      <div
        className="titan-mode-preview__panel titan-mode-preview__panel--future"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="titan-mode-preview__header">
          <span className="titan-mode-preview__eyebrow">🔵 Future Mode · ON HOLD</span>
          <h2 id="future-mode-preview-title">MES 완전 연동 · Coming Soon</h2>
          <p className="titan-mode-preview__lead">
            Version 1 Gate — Oracle Repository · Realtime MES 연동 · 정부 사업 방향 확정 후 개발합니다.
          </p>
        </header>

        <div className="titan-future-vision">
          <div className="titan-future-vision__badge">Coming Soon</div>
          <ul className="titan-future-vision__list">
            {FUTURE_MODE_VISION.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <p className="titan-mode-preview__note">
          현재 개발: Standalone Mode (Presentation Version · SessionStorage Demo)
        </p>

        <footer className="titan-mode-preview__footer">
          <SecondaryButton type="button" onClick={onClose}>
            닫기
          </SecondaryButton>
        </footer>
      </div>
    </div>
  );
}

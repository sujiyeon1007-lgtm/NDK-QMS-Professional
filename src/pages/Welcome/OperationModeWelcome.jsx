import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PrimaryButton, SecondaryButton } from "../../foundation/components/Button";
import {
  OPERATION_MODE,
  OPERATION_MODES,
  OPERATION_MODE_WELCOME,
} from "../../config/operationMode";
import {
  activateStandaloneMode,
  hasStandaloneAppAccess,
  recordPreviewModeSelection,
} from "../../utils/operationModeSession";
import HybridModePreview from "./HybridModePreview";
import FutureModePreview from "./FutureModePreview";
import "./ModePreviewShared.css";
import "./OperationModeWelcome.css";

function accentVar(tokenKey) {
  const map = {
    success: "var(--titan-success)",
    warning: "var(--titan-warning)",
    primary: "var(--titan-primary)",
  };
  return map[tokenKey] ?? "var(--titan-border)";
}

export default function OperationModeWelcome() {
  const navigate = useNavigate();
  const [hybridOpen, setHybridOpen] = useState(false);
  const [futureOpen, setFutureOpen] = useState(false);
  const standaloneActive = hasStandaloneAppAccess();

  const handleStandaloneStart = () => {
    const result = activateStandaloneMode();
    if (!result.ok) return;
    navigate("/home", { replace: true });
  };

  const handleHybridPreview = () => {
    recordPreviewModeSelection(OPERATION_MODE.HYBRID);
    setHybridOpen(true);
  };

  const handleFuturePreview = () => {
    recordPreviewModeSelection(OPERATION_MODE.FUTURE);
    setFutureOpen(true);
  };

  const handleModeAction = (mode) => {
    if (mode.id === OPERATION_MODE.STANDALONE) {
      handleStandaloneStart();
      return;
    }
    if (mode.id === OPERATION_MODE.HYBRID) {
      handleHybridPreview();
      return;
    }
    if (mode.id === OPERATION_MODE.FUTURE) {
      handleFuturePreview();
    }
  };

  return (
    <div className="titan-welcome">
      <div className="titan-welcome__shell">
        <header className="titan-welcome__hero">
          <p className="titan-welcome__brand">{OPERATION_MODE_WELCOME.title}</p>
          <h1 className="titan-welcome__title">{OPERATION_MODE_WELCOME.subtitle}</h1>
          <p className="titan-welcome__version">{OPERATION_MODE_WELCOME.versionLabel}</p>
        </header>

        <section className="titan-welcome__section" aria-labelledby="operation-mode-heading">
          <h2 id="operation-mode-heading" className="titan-welcome__section-title">
            {OPERATION_MODE_WELCOME.sectionTitle}
          </h2>

          <div className="titan-welcome__cards">
            {OPERATION_MODES.map((mode) => {
              const accentColor = accentVar(mode.accentToken);
              const isStandalone = mode.id === OPERATION_MODE.STANDALONE;
              const ButtonComponent = isStandalone ? PrimaryButton : SecondaryButton;

              return (
                <article
                  key={mode.id}
                  className={`titan-welcome__card titan-welcome__card--${mode.accent}${
                    isStandalone && standaloneActive ? " titan-welcome__card--active" : ""
                  }`}
                  style={{ "--mode-accent": accentColor }}
                >
                  <div className="titan-welcome__card-head">
                    <span className="titan-welcome__emoji" aria-hidden="true">
                      {mode.emoji}
                    </span>
                    <div>
                      <h3>{mode.labelKo}</h3>
                      <p className="titan-welcome__badge">{mode.badge}</p>
                    </div>
                  </div>

                  <p className="titan-welcome__desc">{mode.description}</p>

                  {mode.features?.length ? (
                    <ul className="titan-welcome__features">
                      {mode.features.slice(0, 4).map((feature) => (
                        <li key={feature}>{feature}</li>
                      ))}
                    </ul>
                  ) : null}

                  <div className="titan-welcome__card-action">
                    <ButtonComponent type="button" onClick={() => handleModeAction(mode)}>
                      {mode.actionLabel}
                    </ButtonComponent>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <footer className="titan-welcome__footer">{OPERATION_MODE_WELCOME.footer}</footer>
      </div>

      <HybridModePreview open={hybridOpen} onClose={() => setHybridOpen(false)} />
      <FutureModePreview open={futureOpen} onClose={() => setFutureOpen(false)} />
    </div>
  );
}

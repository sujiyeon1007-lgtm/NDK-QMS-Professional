import { Link, useLocation } from "react-router-dom";
import {
  getWorkflowNavigationContext,
  resolveWorkflowNavigationStepId,
} from "../../config/workflowNavigation";
import "./TitanWorkflowNavigation.css";

const LABEL_CURRENT = "\uD604\uC7AC \uC5C5\uBB34";
const LABEL_PREVIOUS = "\uC774\uC804 \uC5C5\uBB34";
const LABEL_NEXT = "\uB2E4\uC74C \uC5C5\uBB34";
const LABEL_ARIA = "\uC5C5\uBB34 \uD750\uB984 \uBC14\uB85C\uAC00\uAE30";

/** RC2 Workflow Navigation Bar - register pages only. */
export default function TitanWorkflowNavigation({ stepId: stepIdProp, className = "" }) {
  const { pathname } = useLocation();
  const stepId = stepIdProp ?? resolveWorkflowNavigationStepId(pathname);
  const context = stepId ? getWorkflowNavigationContext(stepId) : null;

  if (!context) return null;

  const { current, prev, next } = context;

  return (
    <nav
      className={`titan-workflow-nav${className ? ` ${className}` : ""}`}
      aria-label={LABEL_ARIA}
    >
      <div className="titan-workflow-nav__section">
        <span className="titan-workflow-nav__section-label">{LABEL_CURRENT}</span>
        <span className="titan-workflow-nav__current-step">
          <span className="titan-workflow-nav__current-dot" aria-hidden="true">
            {"\u25CF "}
          </span>
          {current.label}
        </span>
      </div>

      <span className="titan-workflow-nav__divider" aria-hidden="true" />

      <div className="titan-workflow-nav__section">
        <span className="titan-workflow-nav__section-label">{LABEL_PREVIOUS}</span>
        {prev.length ? (
          <span className="titan-workflow-nav__links">
            {prev.map((step) => (
              <Link key={step.id} to={step.path} className="titan-workflow-nav__link">
                <span className="titan-workflow-nav__link-icon" aria-hidden="true">
                  {"\u25C0 "}
                </span>
                {step.label}
              </Link>
            ))}
          </span>
        ) : (
          <span className="titan-workflow-nav__empty">{"\u2014"}</span>
        )}
      </div>

      <span className="titan-workflow-nav__divider" aria-hidden="true" />

      <div className="titan-workflow-nav__section">
        <span className="titan-workflow-nav__section-label">{LABEL_NEXT}</span>
        {next.length ? (
          <span className="titan-workflow-nav__links">
            {next.map((step) => (
              <Link key={step.id} to={step.path} className="titan-workflow-nav__link">
                <span className="titan-workflow-nav__link-icon" aria-hidden="true">
                  {"\u25B6 "}
                </span>
                {step.label}
              </Link>
            ))}
          </span>
        ) : (
          <span className="titan-workflow-nav__empty">{"\u2014"}</span>
        )}
      </div>
    </nav>
  );
}

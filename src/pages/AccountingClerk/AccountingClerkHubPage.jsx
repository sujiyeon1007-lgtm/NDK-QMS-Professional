import { Link } from "react-router-dom";

import { ACCOUNTING_CLERK_LAUNCHER_ITEMS } from "../../config/accountingClerkLauncher";
import {
  ACCOUNTING_CLERK_PHILOSOPHY,
  ACCOUNTING_CLERK_WORKFLOW_STEPS,
} from "../../config/accountingClerkPolicy";

import "../../foundation/styles/titan-hub-page.css";
import "./AccountingClerk.css";

export default function AccountingClerkHubPage() {
  return (
    <div className="titan-hub-page">
      <p className="titan-hub-page__intro">
        {ACCOUNTING_CLERK_PHILOSOPHY.headline} {ACCOUNTING_CLERK_PHILOSOPHY.body}{" "}
        {ACCOUNTING_CLERK_PHILOSOPHY.taxInvoiceNotice}
      </p>

      <section className="accounting-clerk-hub__workflow" aria-label="경리관리 Workflow">
        <h2 className="accounting-clerk-hub__workflow-title">Workflow</h2>
        <div className="accounting-clerk-hub__workflow-steps">
          {ACCOUNTING_CLERK_WORKFLOW_STEPS.map((step, index) => (
            <span key={step.id} className="accounting-clerk-hub__workflow-step">
              {index > 0 ? (
                <span className="accounting-clerk-hub__workflow-arrow" aria-hidden="true">
                  →{" "}
                </span>
              ) : null}
              <span
                className={
                  step.external ? "accounting-clerk-hub__workflow-step--external" : undefined
                }
              >
                {step.label}
                {step.external ? " (홈택스)" : ""}
              </span>
            </span>
          ))}
        </div>
      </section>

      <div className="titan-hub-page__cards">
        {ACCOUNTING_CLERK_LAUNCHER_ITEMS.map((item) => {
          const Icon = item.icon;
          const badgeClass =
            item.status === "active"
              ? "titan-hub-card__badge titan-hub-card__badge--active"
              : "titan-hub-card__badge titan-hub-card__badge--planned";
          return (
            <Link key={item.id} to={item.path} className="titan-hub-card">
              <Icon size={22} aria-hidden="true" />
              <span className="titan-hub-card__label">{item.label}</span>
              <span className={badgeClass}>{item.statusLabel}</span>
              <span className="titan-hub-card__desc">{item.description}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

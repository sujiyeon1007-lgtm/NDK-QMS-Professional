import { FileText } from "lucide-react";

import "./DocumentManagementPage.css";

/**
 * RC1 — common document workspace shell (Archive layout pattern).
 * Header · search slot · toolbar · table frame · RC1 empty state.
 */
export default function DocumentWorkspaceShell({
  title,
  description,
  rc1Note = "RC1 · 문서 등록 기능 확장 예정",
  icon: Icon = FileText,
  searchPanel = null,
  toolbar = null,
  children,
  empty = false,
  emptyMessage = "등록된 문서가 없습니다.",
  className = "",
}) {
  return (
    <div className={`document-workspace-shell qms-document-page ${className}`.trim()}>
      <header className="document-workspace-shell__header incoming-document-archive__toolbar">
        <div>
          <h2>
            <Icon size={18} aria-hidden="true" />
            {title}
          </h2>
          {description ? <p>{description}</p> : null}
        </div>
        {toolbar}
      </header>

      {rc1Note ? (
        <p className="document-workspace-shell__rc1-note qms-document-page__workflow-note">{rc1Note}</p>
      ) : null}

      {searchPanel}

      <div className="document-workspace-shell__body qms-document-page__list quality-page__list">
        {empty ? (
          <div className="document-workspace-shell__empty titan-page-placeholder">
            <div className="titan-page-placeholder__card">
              <span className="titan-page-placeholder__badge">RC1</span>
              <p>{emptyMessage}</p>
            </div>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}

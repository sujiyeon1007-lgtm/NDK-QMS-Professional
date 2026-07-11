import TitanStandardDetailPopup from "../../foundation/components/detailPopup/TitanStandardDetailPopup";
import { TitanMasterDetailFooter } from "../../foundation/components/FoundationActionBar";

import "./CompanyManagement.css";

function renderDetailFieldValue(row, field) {
  if (field.render === "active") {
    return row.activeLabel ?? (row.active === false ? "미사용" : "사용");
  }
  const value = row?.[field.key];
  if (value == null || String(value).trim() === "") return "—";
  return String(value);
}

/** 재질 · 공정 · 설비 · 작업자 Row 더블클릭 상세 Popup */
export default function MasterEntityDetailModal({
  open,
  row,
  onClose,
  onEdit,
  onDelete,
  onNavigate,
  screen,
  pageTitle,
  categoryLabel,
  navigationRows = [],
}) {
  if (!row || !screen) return null;

  const title = row.name || row.code || pageTitle || screen.title;
  const statusLabel = row.activeLabel ?? (row.active === false ? "미사용" : "사용");
  const tabs = [{ id: "detail", label: "상세정보" }];
  const summary = {
    company: pageTitle || screen.title,
    partName: title,
    partNo: row.code || row.id || "-",
    lotNo: row.id || "-",
    currentProcess: "기준정보",
    statusLabel,
    statusVariant: row.active === false ? "danger" : "done",
  };

  return (
    <TitanStandardDetailPopup
      open={open}
      onClose={onClose}
      tabs={tabs}
      summary={summary}
      ariaLabel={`${pageTitle} 상세정보`}
      footer={
        <TitanMasterDetailFooter
          categoryLabel={categoryLabel ?? pageTitle}
          rows={navigationRows}
          currentRowId={row.id}
          onNavigate={onNavigate}
          onEdit={onEdit}
          onDelete={onDelete}
          onClose={onClose}
        />
      }
      renderTabContent={() => (
        <div className="company-detail-modal">
          <section className="company-detail-section" aria-label={`${pageTitle} 정보`}>
            <h3 className="company-detail-section__title">① {pageTitle} 정보</h3>
            <dl className="company-detail-section__grid">
              {(screen.detailFields ?? []).map((field) => (
                <div key={field.key}>
                  <dt>{field.label}</dt>
                  <dd>{renderDetailFieldValue(row, field)}</dd>
                </div>
              ))}
            </dl>
          </section>
        </div>
      )}
    />
  );
}

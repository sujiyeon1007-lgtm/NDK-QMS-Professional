import { SecondaryButton } from "../../foundation/components/Button";
import TitanWorkspaceModal from "../../foundation/components/TitanWorkspaceModal";

import "./CompanyManagement.css";

function renderDetailFieldValue(row, field) {
  if (field.render === "active") {
    return row.activeLabel ?? (row.active === false ? "미사용" : "사용");
  }
  const value = row?.[field.key];
  if (value == null || String(value).trim() === "") return "—";
  return String(value);
}

/** 재질 · 공정 · 설비 · 작업자 Row 클릭 상세 Popup */
export default function MasterEntityDetailModal({ open, row, onClose, screen, pageTitle }) {
  if (!row || !screen) return null;

  const title = row.name || row.code || pageTitle || screen.title;
  const kicker = row.code && row.name && row.code !== row.name ? row.code : pageTitle || screen.title;

  return (
    <TitanWorkspaceModal
      open={open}
      onClose={onClose}
      size="standard"
      title={title}
      kicker={kicker}
      footer={
        <SecondaryButton type="button" onClick={onClose}>
          닫기
        </SecondaryButton>
      }
    >
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
    </TitanWorkspaceModal>
  );
}

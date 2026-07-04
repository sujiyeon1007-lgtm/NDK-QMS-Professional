import { SecondaryButton } from "../../foundation/components/Button";
import TitanWorkspaceModal from "../../foundation/components/TitanWorkspaceModal";
import {
  PRODUCT_DETAIL_FIELDS,
  PRODUCT_PROFILE_FIELDS,
} from "../../config/productDetailSections";

import "./CompanyManagement.css";

function renderDetailFieldValue(row, field) {
  if (field.render === "active") {
    return row.activeLabel ?? (row.active === false ? "미사용" : "사용");
  }
  const value = row?.[field.key];
  if (value == null || String(value).trim() === "") return "—";
  return String(value);
}

function ProductDetailSection({ title, children }) {
  return (
    <section className="company-detail-section" aria-label={title}>
      <h3 className="company-detail-section__title">{title}</h3>
      {children}
    </section>
  );
}

/** 제품 Row 클릭 — 제품 정보 Popup */
export default function ProductDetailModal({ open, product, onClose }) {
  if (!product) return null;

  const title = product.name || product.partNo || "제품";
  const kicker =
    [product.company, product.partNo].filter(Boolean).join(" | ") || "제품 Master";

  return (
    <TitanWorkspaceModal
      open={open}
      onClose={onClose}
      title={title}
      kicker={kicker}
      footer={
        <SecondaryButton type="button" onClick={onClose}>
          닫기
        </SecondaryButton>
      }
    >
      <div className="company-detail-modal product-detail-modal">
        <ProductDetailSection title="① 제품 정보">
          <dl className="company-detail-section__grid product-detail-modal__grid">
            {PRODUCT_PROFILE_FIELDS.map((field) => (
              <div key={field.key}>
                <dt>{field.label}</dt>
                <dd>{renderDetailFieldValue(product, field)}</dd>
              </div>
            ))}
          </dl>
        </ProductDetailSection>

        <ProductDetailSection title="② 추가 정보">
          <dl className="company-detail-section__grid product-detail-modal__grid product-detail-modal__grid--extra">
            {PRODUCT_DETAIL_FIELDS.map((field) => (
              <div key={field.key}>
                <dt>{field.label}</dt>
                <dd>{renderDetailFieldValue(product, field)}</dd>
              </div>
            ))}
          </dl>
        </ProductDetailSection>
      </div>
    </TitanWorkspaceModal>
  );
}

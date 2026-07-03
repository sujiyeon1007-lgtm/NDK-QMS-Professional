import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Package } from "lucide-react";

import { PrimaryButton, SecondaryButton } from "../../foundation/components/Button";
import TitanCommonToolbar from "../../foundation/components/TitanCommonToolbar";
import TitanWorkspaceModal from "../../foundation/components/TitanWorkspaceModal";
import {
  COMPANY_PROFILE_FIELDS,
  COMPANY_ROLE_CONTACT_FIELDS,
} from "../../config/companyDetailSections";
import { getCompanyTradeSummary } from "../../utils/companyTradeSummary";

import "./CompanyManagement.css";

function renderDetailFieldValue(row, field) {
  if (field.future) return "—";
  if (field.render === "active") {
    return row.activeLabel ?? (row.active === false ? "미사용" : "사용");
  }
  const value = row?.[field.key];
  if (value == null || String(value).trim() === "") return "—";
  return String(value);
}

function CompanyDetailSection({ title, children }) {
  return (
    <section className="company-detail-section" aria-label={title}>
      <h3 className="company-detail-section__title">{title}</h3>
      {children}
    </section>
  );
}

/** 거래처 Row 클릭 — 거래처 · 담당자 · 거래 이력 Popup */
export default function CompanyDetailModal({ open, company, onClose }) {
  const navigate = useNavigate();
  const tradeSummary = useMemo(() => getCompanyTradeSummary(company?.name), [company?.name]);

  if (!company) return null;

  const companyCode = company.code || company.abbreviation || "—";

  const handleOpenProductList = () => {
    onClose();
    navigate("/settings/products", { state: { companyFilter: company.name } });
  };

  return (
    <TitanWorkspaceModal
      open={open}
      onClose={onClose}
      title={company.name}
      kicker={`거래처코드 : ${companyCode}`}
      toolbar={
        <TitanCommonToolbar
          title={company.name}
          subtitle={`거래처코드 ${companyCode}`}
          actions={
            <PrimaryButton type="button" onClick={handleOpenProductList}>
              <Package size={14} aria-hidden="true" />
              제품 관리
            </PrimaryButton>
          }
        />
      }
      footer={
        <SecondaryButton type="button" onClick={onClose}>
          닫기
        </SecondaryButton>
      }
    >
      <div className="company-detail-modal">
        <CompanyDetailSection title="① 거래처 정보">
          <dl className="company-detail-section__grid">
            {COMPANY_PROFILE_FIELDS.map((field) => (
              <div key={field.key}>
                <dt>{field.label}</dt>
                <dd>{renderDetailFieldValue(company, field)}</dd>
              </div>
            ))}
          </dl>
        </CompanyDetailSection>

        <CompanyDetailSection title="② 담당자 정보">
          <dl className="company-detail-section__grid">
            {COMPANY_ROLE_CONTACT_FIELDS.map((field) => (
              <div key={field.key}>
                <dt>{field.label}</dt>
                <dd>{renderDetailFieldValue(company, field)}</dd>
              </div>
            ))}
          </dl>
        </CompanyDetailSection>

        <CompanyDetailSection title="③ 거래 이력">
          <dl className="company-detail-section__trade-grid">
            <div className="company-detail-section__trade-card">
              <dt>입고 건수</dt>
              <dd>{tradeSummary.inboundCount.toLocaleString("ko-KR")}건</dd>
            </div>
            <div className="company-detail-section__trade-card">
              <dt>출고 건수</dt>
              <dd>{tradeSummary.outboundCount.toLocaleString("ko-KR")}건</dd>
            </div>
            <div className="company-detail-section__trade-card">
              <dt>최근 거래일</dt>
              <dd>{tradeSummary.lastTradeDate}</dd>
            </div>
          </dl>
        </CompanyDetailSection>
      </div>
    </TitanWorkspaceModal>
  );
}

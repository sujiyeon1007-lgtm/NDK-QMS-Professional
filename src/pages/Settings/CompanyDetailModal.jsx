import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Package } from "lucide-react";

import { PrimaryButton, SecondaryButton } from "../../foundation/components/Button";
import TitanCommonToolbar from "../../foundation/components/TitanCommonToolbar";
import TitanDataTable from "../../foundation/components/DataTable";
import TitanWorkspaceModal from "../../foundation/components/TitanWorkspaceModal";
import {
  COMPANY_CONTACT_TABLE_COLUMNS,
  COMPANY_DETAIL_TABS,
  COMPANY_PROFILE_FIELDS,
  COMPANY_TRADE_SUMMARY_FIELDS,
} from "../../config/companyDetailSections";
import { COMPANY_NDK_ASSIGNEE_TABLE_COLUMNS } from "../../utils/companyNdkAssigneesModel";
import { getCompanyAbbreviation } from "../../utils/companyAbbreviation";
import { getCompanyTradeSummary } from "../../utils/companyTradeSummary";

import "./CompanyManagement.css";

function renderDetailFieldValue(row, field) {
  if (field.future) return "—";
  if (field.render === "active") {
    return row.activeLabel ?? (row.active === false ? "미사용" : "사용");
  }
  if (field.render === "code") {
    const code = row.code || getCompanyAbbreviation(row);
    return code || "—";
  }
  const value = row?.[field.key];
  if (value == null || String(value).trim() === "") return "—";
  return String(value);
}

function renderTradeSummaryValue(summary, field) {
  if (field.render === "count") {
    const count = summary?.[field.key] ?? 0;
    return `${Number(count).toLocaleString("ko-KR")}건`;
  }
  const value = summary?.[field.key];
  if (value == null || String(value).trim() === "") return "—";
  return String(value);
}

function renderPersonCell(person, key) {
  const value = person?.[key];
  if (value == null || String(value).trim() === "") return "—";
  return String(value);
}

function CompanyDetailTabBar({ activeTab, onTabChange }) {
  return (
    <nav className="company-detail-tabs" aria-label="거래처 상세">
      {COMPANY_DETAIL_TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={`company-detail-tabs__btn${activeTab === tab.id ? " is-active" : ""}${
            tab.future ? " is-future" : ""
          }`}
          onClick={() => onTabChange(tab.id)}
          aria-selected={activeTab === tab.id}
        >
          {tab.label}
          {tab.future ? <span className="company-detail-tabs__future">향후</span> : null}
        </button>
      ))}
    </nav>
  );
}

/** 거래처 Row 클릭 — 탭형 상세 Popup */
export default function CompanyDetailModal({ open, company, onClose }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");

  const tradeSummary = useMemo(
    () => getCompanyTradeSummary(company?.name, company),
    [company]
  );

  const contactRows = useMemo(() => {
    const contacts = Array.isArray(company?.contacts) ? company.contacts : [];
    return contacts.filter((contact) => contact?.name?.trim());
  }, [company?.contacts]);

  const ndkAssigneeRows = useMemo(() => {
    const assignees = Array.isArray(company?.ndkAssignees) ? company.ndkAssignees : [];
    return assignees.filter((item) => item?.name?.trim());
  }, [company?.ndkAssignees]);

  const contactTableColumns = useMemo(
    () =>
      COMPANY_CONTACT_TABLE_COLUMNS.map((col) => ({
        key: col.key,
        label: col.label,
        render: (row) => renderPersonCell(row, col.key),
      })),
    []
  );

  const ndkAssigneeTableColumns = useMemo(
    () =>
      COMPANY_NDK_ASSIGNEE_TABLE_COLUMNS.map((col) => ({
        key: col.key,
        label: col.label,
        render: (row) => renderPersonCell(row, col.key),
      })),
    []
  );

  if (!company) return null;

  const companyCode = company.code || getCompanyAbbreviation(company) || "—";

  const handleOpenProductList = () => {
    onClose();
    navigate("/settings/products", { state: { companyFilter: company.name } });
  };

  const handleClose = () => {
    setActiveTab("profile");
    onClose();
  };

  return (
    <TitanWorkspaceModal
      open={open}
      onClose={handleClose}
      size="standard"
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
        <SecondaryButton type="button" onClick={handleClose}>
          닫기
        </SecondaryButton>
      }
    >
      <div className="company-detail-modal">
        <CompanyDetailTabBar activeTab={activeTab} onTabChange={setActiveTab} />

        {activeTab === "profile" ? (
          <section className="company-detail-section" aria-label="기본정보">
            <dl className="company-detail-section__grid company-detail-section__grid--profile">
              {COMPANY_PROFILE_FIELDS.map((field) => (
                <div
                  key={field.key}
                  className={field.span === 2 ? "company-detail-section__grid-span-2" : undefined}
                >
                  <dt>{field.label}</dt>
                  <dd>{renderDetailFieldValue(company, field)}</dd>
                </div>
              ))}
            </dl>
          </section>
        ) : null}

        {activeTab === "contacts" ? (
          <section className="company-detail-section" aria-label="거래처 담당자">
            {contactRows.length > 0 ? (
              <div className="company-detail-section__contacts-table master-data-grid">
                <TitanDataTable
                  className="inbound-page__table company-detail-section__contacts-table-inner"
                  columns={contactTableColumns}
                  rows={contactRows}
                  emptyMessage="등록된 담당자가 없습니다."
                />
              </div>
            ) : (
              <p className="company-detail-section__empty">등록된 거래처 담당자가 없습니다.</p>
            )}
          </section>
        ) : null}

        {activeTab === "ndkAssignees" ? (
          <section className="company-detail-section" aria-label="우리회사 담당자">
            {ndkAssigneeRows.length > 0 ? (
              <div className="company-detail-section__contacts-table master-data-grid">
                <TitanDataTable
                  className="inbound-page__table company-detail-section__contacts-table-inner"
                  columns={ndkAssigneeTableColumns}
                  rows={ndkAssigneeRows}
                  emptyMessage="등록된 담당자가 없습니다."
                />
              </div>
            ) : (
              <p className="company-detail-section__empty">등록된 우리회사 담당자가 없습니다.</p>
            )}
          </section>
        ) : null}

        {activeTab === "trade" ? (
          <section className="company-detail-section" aria-label="거래이력">
            <dl className="company-detail-section__grid company-detail-section__grid--trade">
              {COMPANY_TRADE_SUMMARY_FIELDS.map((field) => (
                <div
                  key={field.key}
                  className={field.span === 2 ? "company-detail-section__grid-span-2" : undefined}
                >
                  <dt>{field.label}</dt>
                  <dd>{renderTradeSummaryValue(tradeSummary, field)}</dd>
                </div>
              ))}
            </dl>
          </section>
        ) : null}

        {activeTab === "products" ? (
          <section className="company-detail-section" aria-label="품목정보">
            <p className="company-detail-section__empty company-detail-section__empty--future">
              품목정보 탭은 향후 버전에서 제공됩니다. 현재는 상단 「제품 관리」 버튼으로 연결된
              제품 목록을 이용해 주세요.
            </p>
          </section>
        ) : null}
      </div>
    </TitanWorkspaceModal>
  );
}

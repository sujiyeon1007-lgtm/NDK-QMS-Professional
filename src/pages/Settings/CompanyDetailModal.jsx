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
  COMPANY_QUALITY_COLUMNS,
  COMPANY_RELATED_LOT_COLUMNS,
  COMPANY_RELATED_PRODUCT_COLUMNS,
  COMPANY_SHIPMENT_COLUMNS,
  COMPANY_TRADE_SUMMARY_FIELDS,
} from "../../config/companyDetailSections";
import { COMPANY_NDK_ASSIGNEE_TABLE_COLUMNS } from "../../utils/companyNdkAssigneesModel";
import { getCompanyAbbreviation } from "../../utils/companyAbbreviation";
import { buildCompanyMasterDetail } from "../../utils/companyMasterDetail";

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

function renderCell(row, key) {
  const value = row?.[key];
  if (value == null || String(value).trim() === "") return "—";
  return String(value);
}

function buildColumns(columns) {
  return columns.map((col) => ({
    key: col.key,
    label: col.label,
    render:
      col.render === "active"
        ? (row) => (
            <span className={`status-badge ${row.activeLabel === "미사용" ? "미사용" : "사용"}`}>
              {row.activeLabel ?? "사용"}
            </span>
          )
        : col.render === "judgment"
          ? (row) => (
              <span className={`company-quality-badge is-${judgmentTone(row.judgment)}`}>
                {row.judgment}
              </span>
            )
          : (row) => renderCell(row, col.key),
  }));
}

function judgmentTone(judgment) {
  if (judgment === "합격") return "pass";
  if (judgment === "불합격") return "fail";
  return "hold";
}

function CompanyDetailTabBar({ activeTab, onTabChange, counts }) {
  return (
    <nav className="company-detail-tabs" aria-label="거래처 상세">
      {COMPANY_DETAIL_TABS.map((tab) => {
        const count = counts?.[tab.id];
        return (
          <button
            key={tab.id}
            type="button"
            className={`company-detail-tabs__btn${activeTab === tab.id ? " is-active" : ""}`}
            onClick={() => onTabChange(tab.id)}
            aria-selected={activeTab === tab.id}
          >
            {tab.label}
            {typeof count === "number" ? (
              <span className="company-detail-tabs__count">{count}</span>
            ) : null}
          </button>
        );
      })}
    </nav>
  );
}

function DetailTable({ columns, rows, emptyMessage }) {
  if (!rows.length) {
    return <p className="company-detail-section__empty">{emptyMessage}</p>;
  }
  return (
    <div className="company-detail-section__contacts-table master-data-grid">
      <TitanDataTable
        className="inbound-page__table company-detail-section__contacts-table-inner"
        columns={buildColumns(columns)}
        rows={rows}
        emptyMessage={emptyMessage}
      />
    </div>
  );
}

/** 거래처 Row 더블클릭 — ERP Master 상세 Popup (Sprint 8 · Blueprint V1.0) */
export default function CompanyDetailModal({ open, company, onClose }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");

  const detail = useMemo(() => buildCompanyMasterDetail(company), [company]);

  const contactRows = useMemo(() => {
    const contacts = Array.isArray(company?.contacts) ? company.contacts : [];
    return contacts.filter((contact) => contact?.name?.trim());
  }, [company?.contacts]);

  const ndkAssigneeRows = useMemo(() => {
    const assignees = Array.isArray(company?.ndkAssignees) ? company.ndkAssignees : [];
    return assignees.filter((item) => item?.name?.trim());
  }, [company?.ndkAssignees]);

  if (!company) return null;

  const companyCode = company.code || getCompanyAbbreviation(company) || "—";
  const tabCounts = {
    products: detail.counts.products,
    lots: detail.counts.lots,
    shipments: detail.counts.shipments,
    quality: detail.counts.quality,
  };

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
        <CompanyDetailTabBar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          counts={tabCounts}
        />

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

        {activeTab === "people" ? (
          <section className="company-detail-section" aria-label="담당자">
            <h4 className="company-detail-section__subtitle">거래처 담당자</h4>
            <DetailTable
              columns={COMPANY_CONTACT_TABLE_COLUMNS}
              rows={contactRows}
              emptyMessage="등록된 거래처 담당자가 없습니다."
            />
            <h4 className="company-detail-section__subtitle">우리회사 담당자</h4>
            <DetailTable
              columns={COMPANY_NDK_ASSIGNEE_TABLE_COLUMNS}
              rows={ndkAssigneeRows}
              emptyMessage="등록된 우리회사 담당자가 없습니다."
            />
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
                  <dd>{renderTradeSummaryValue(detail.tradeSummary, field)}</dd>
                </div>
              ))}
            </dl>
          </section>
        ) : null}

        {activeTab === "products" ? (
          <section className="company-detail-section" aria-label="관련 제품">
            <DetailTable
              columns={COMPANY_RELATED_PRODUCT_COLUMNS}
              rows={detail.products}
              emptyMessage="이 거래처로 등록된 제품이 없습니다."
            />
          </section>
        ) : null}

        {activeTab === "lots" ? (
          <section className="company-detail-section" aria-label="관련 LOT">
            <DetailTable
              columns={COMPANY_RELATED_LOT_COLUMNS}
              rows={detail.lots}
              emptyMessage="생성된 LOT 이력이 없습니다."
            />
          </section>
        ) : null}

        {activeTab === "shipments" ? (
          <section className="company-detail-section" aria-label="최근 출고">
            <DetailTable
              columns={COMPANY_SHIPMENT_COLUMNS}
              rows={detail.shipments}
              emptyMessage="출고 이력이 없습니다."
            />
          </section>
        ) : null}

        {activeTab === "quality" ? (
          <section className="company-detail-section" aria-label="최근 품질">
            <DetailTable
              columns={COMPANY_QUALITY_COLUMNS}
              rows={detail.quality}
              emptyMessage="검사(품질) 이력이 없습니다."
            />
          </section>
        ) : null}

        {activeTab === "updates" ? (
          <section className="company-detail-section" aria-label="최근 수정">
            {detail.recentUpdates.length ? (
              <ul className="company-detail-updates">
                {detail.recentUpdates.map((row) => (
                  <li key={row.id} className="company-detail-updates__row">
                    <span className="company-detail-updates__date">{row.date}</span>
                    <span className="company-detail-updates__time">{row.time}</span>
                    <span className="company-detail-updates__dot" aria-hidden="true" />
                    <span className="company-detail-updates__body">
                      <span className="company-detail-updates__label">{row.label}</span>
                      <span className="company-detail-updates__user">{row.user}</span>
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="company-detail-section__empty">
                수정 이력이 기록되면 표시됩니다. (Excel Import · 데이터 변경 이력)
              </p>
            )}
          </section>
        ) : null}
      </div>
    </TitanWorkspaceModal>
  );
}

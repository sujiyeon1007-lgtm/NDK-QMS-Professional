import { useMemo, useState } from "react";

import { SecondaryButton } from "../../foundation/components/Button";
import TitanCommonToolbar from "../../foundation/components/TitanCommonToolbar";
import TitanDataTable from "../../foundation/components/DataTable";
import TitanWorkspaceModal from "../../foundation/components/TitanWorkspaceModal";
import FoundationAttachment from "../../foundation/components/FoundationAttachment";
import {
  PRODUCT_CERTIFICATE_COLUMNS,
  PRODUCT_CERTIFICATE_SUMMARY_FIELDS,
  PRODUCT_DETAIL_TABS,
  PRODUCT_LOT_COLUMNS,
  PRODUCT_MASTER_PROFILE_FIELDS,
  PRODUCT_MATERIAL_FIELDS,
  PRODUCT_PROCESS_FIELDS,
  PRODUCT_PRODUCTION_COLUMNS,
  PRODUCT_PRODUCTION_SUMMARY_FIELDS,
  PRODUCT_QUALITY_COLUMNS,
  PRODUCT_QUALITY_SUMMARY_FIELDS,
  PRODUCT_SHIPMENT_COLUMNS,
} from "../../config/productDetailSections";
import { buildProductMasterDetail } from "../../utils/productMasterDetail";
import {
  normalizeFoundationAttachments,
  readFoundationAttachmentSession,
  writeFoundationAttachmentSession,
} from "../../utils/foundationAttachmentEngine";
import ProductSpecificationTab from "./ProductSpecificationTab";

import "./CompanyManagement.css";
import "./ProductManagement.css";

const PRODUCT_MASTER_ATTACHMENT_STORAGE_KEY = "project-titan-product-master-attachments-v1";

function resolveProductAttachmentOwnerKey(product = {}) {
  return [product.id, product.partNo, product.company, product.name].filter(Boolean).join("::") || "product";
}

function renderProfileValue(row, field) {
  if (field.render === "active") {
    return row.activeLabel ?? (row.active === false ? "미사용" : "사용");
  }
  const value = row?.[field.key];
  if (value == null || String(value).trim() === "") return "—";
  return String(value);
}

function renderSummaryValue(summary, field) {
  const value = summary?.[field.key];
  if (field.render === "count") {
    return `${Number(value ?? 0).toLocaleString("ko-KR")}건`;
  }
  if (value == null || String(value).trim() === "") return "—";
  return String(value);
}

function renderCell(row, key) {
  const value = row?.[key];
  if (value == null || String(value).trim() === "") return "—";
  return String(value);
}

function judgmentTone(judgment) {
  if (judgment === "합격") return "pass";
  if (judgment === "불합격") return "fail";
  return "hold";
}

function buildColumns(columns) {
  return columns.map((col) => ({
    key: col.key,
    label: col.label,
    render:
      col.render === "judgment"
        ? (row) => (
            <span className={`company-quality-badge is-${judgmentTone(row.judgment)}`}>
              {row.judgment}
            </span>
          )
        : (row) => renderCell(row, col.key),
  }));
}

function FieldGrid({ fields, source, variant }) {
  return (
    <dl className={`company-detail-section__grid company-detail-section__grid--${variant}`}>
      {fields.map((field) => (
        <div
          key={field.key}
          className={field.span === 2 ? "company-detail-section__grid-span-2" : undefined}
        >
          <dt>{field.label}</dt>
          <dd>{renderSummaryValue(source, field)}</dd>
        </div>
      ))}
    </dl>
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

function ProductDetailTabBar({ activeTab, onTabChange, counts }) {
  return (
    <nav className="company-detail-tabs" aria-label="제품 상세">
      {PRODUCT_DETAIL_TABS.map((tab) => {
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

/** 제품 Row 더블클릭 — ERP/MES Master 상세 Popup (Sprint 8 · Blueprint V1.0 · 9탭) */
export default function ProductDetailModal({ open, product, onClose }) {
  const [activeTab, setActiveTab] = useState("profile");
  const [attachmentVersion, setAttachmentVersion] = useState(0);

  const detail = useMemo(() => buildProductMasterDetail(product), [product]);

  if (!product) return null;

  const title = product.name || product.partNo || "제품";
  const kicker =
    [product.company, product.partNo].filter(Boolean).join(" | ") || "제품 Master";
  const health = detail.health ?? { status: "error", label: "관리 필요", icon: "🔴" };
  const attachmentOwnerKey = resolveProductAttachmentOwnerKey(product);
  const attachments = readFoundationAttachmentSession(PRODUCT_MASTER_ATTACHMENT_STORAGE_KEY, attachmentOwnerKey);

  const tabCounts = {
    production: detail.counts.production,
    quality: detail.counts.quality,
    certificate: detail.counts.certificate,
    lots: detail.counts.lots,
    shipments: detail.counts.shipments,
  };

  const handleAttachmentUpload = (files) => {
    writeFoundationAttachmentSession(
      PRODUCT_MASTER_ATTACHMENT_STORAGE_KEY,
      attachmentOwnerKey,
      [...attachments, ...normalizeFoundationAttachments(files)]
    );
    setAttachmentVersion((value) => value + 1);
  };

  const handleAttachmentDelete = (attachmentId) => {
    writeFoundationAttachmentSession(
      PRODUCT_MASTER_ATTACHMENT_STORAGE_KEY,
      attachmentOwnerKey,
      attachments.filter((attachment) => attachment.id !== attachmentId)
    );
    setAttachmentVersion((value) => value + 1);
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
      title={title}
      kicker={kicker}
      toolbar={
        <TitanCommonToolbar
          title={title}
          subtitle={kicker}
          actions={
            <span
              className={`product-health-badge is-${health.status}`}
              aria-label={`Product Health: ${health.label}`}
            >
              <span aria-hidden="true">{health.icon}</span>
              {health.label}
            </span>
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
        <ProductDetailTabBar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          counts={tabCounts}
        />

        {activeTab === "profile" ? (
          <section className="company-detail-section" aria-label="기본정보">
            <dl className="company-detail-section__grid company-detail-section__grid--profile">
              {PRODUCT_MASTER_PROFILE_FIELDS.map((field) => (
                <div key={field.key}>
                  <dt>{field.label}</dt>
                  <dd>{renderProfileValue(product, field)}</dd>
                </div>
              ))}
            </dl>
          </section>
        ) : null}

        {activeTab === "material" ? (
          <section className="company-detail-section" aria-label="재질">
            <FieldGrid fields={PRODUCT_MATERIAL_FIELDS} source={detail.material} variant="trade" />
          </section>
        ) : null}

        {activeTab === "process" ? (
          <section className="company-detail-section" aria-label="공정">
            <FieldGrid fields={PRODUCT_PROCESS_FIELDS} source={detail.process} variant="trade" />
          </section>
        ) : null}

        {activeTab === "spec" ? <ProductSpecificationTab product={product} /> : null}

        {activeTab === "production" ? (
          <section className="company-detail-section" aria-label="생산">
            <FieldGrid
              fields={PRODUCT_PRODUCTION_SUMMARY_FIELDS}
              source={detail.production.summary}
              variant="trade"
            />
            <h4 className="company-detail-section__subtitle">생산 LOT 이력</h4>
            <DetailTable
              columns={PRODUCT_PRODUCTION_COLUMNS}
              rows={detail.production.rows}
              emptyMessage="생산 이력이 없습니다."
            />
          </section>
        ) : null}

        {activeTab === "quality" ? (
          <section className="company-detail-section" aria-label="품질">
            <FieldGrid
              fields={PRODUCT_QUALITY_SUMMARY_FIELDS}
              source={detail.quality.summary}
              variant="trade"
            />
            <h4 className="company-detail-section__subtitle">검사 이력</h4>
            <DetailTable
              columns={PRODUCT_QUALITY_COLUMNS}
              rows={detail.quality.rows}
              emptyMessage="검사(품질) 이력이 없습니다."
            />
          </section>
        ) : null}

        {activeTab === "certificate" ? (
          <section className="company-detail-section" aria-label="성적서">
            <FieldGrid
              fields={PRODUCT_CERTIFICATE_SUMMARY_FIELDS}
              source={detail.certificate.summary}
              variant="trade"
            />
            <h4 className="company-detail-section__subtitle">성적서 발행 이력 (조회 전용)</h4>
            <DetailTable
              columns={PRODUCT_CERTIFICATE_COLUMNS}
              rows={detail.certificate.rows}
              emptyMessage="발행된 성적서가 없습니다."
            />
          </section>
        ) : null}

        {activeTab === "lots" ? (
          <section className="company-detail-section" aria-label="LOT">
            <DetailTable
              columns={PRODUCT_LOT_COLUMNS}
              rows={detail.lots}
              emptyMessage="생성된 LOT 이 없습니다."
            />
          </section>
        ) : null}

        {activeTab === "shipments" ? (
          <section className="company-detail-section" aria-label="출고">
            <DetailTable
              columns={PRODUCT_SHIPMENT_COLUMNS}
              rows={detail.shipments}
              emptyMessage="출고 이력이 없습니다."
            />
          </section>
        ) : null}

        {activeTab === "attachments" ? (
          <section className="company-detail-section" aria-label="첨부파일">
            <FoundationAttachment
              attachments={attachments}
              onUpload={handleAttachmentUpload}
              onDelete={handleAttachmentDelete}
            />
          </section>
        ) : null}

        {activeTab === "updates" ? (
          <section className="company-detail-section" aria-label="최근 수정">
            {detail.recentUpdates.length ? (
              <ul className="company-detail-updates">
                {detail.recentUpdates.map((row) => (
                  <li key={row.id} className="company-detail-updates__row company-detail-updates__row--typed">
                    <span className="company-detail-updates__date">{row.date}</span>
                    <span className="company-detail-updates__time">{row.time}</span>
                    <span className={`company-detail-updates__type is-${typeTone(row.type)}`}>
                      {row.type}
                    </span>
                    <span className="company-detail-updates__body">
                      <span className="company-detail-updates__label">{row.label}</span>
                      <span className="company-detail-updates__user">{row.user}</span>
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="company-detail-section__empty">
                수정 이력이 기록되면 표시됩니다. (등록 · 수정 · Import · Sync)
              </p>
            )}
          </section>
        ) : null}
      </div>
    </TitanWorkspaceModal>
  );
}

function typeTone(type) {
  if (type === "등록") return "reg";
  if (type === "Import") return "import";
  if (type === "Sync") return "sync";
  return "edit";
}

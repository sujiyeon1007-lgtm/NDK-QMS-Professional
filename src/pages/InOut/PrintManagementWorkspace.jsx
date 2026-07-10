import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ExternalLink, FileText, Printer } from "lucide-react";

import StatusChip from "../../foundation/components/StatusChip";
import { SecondaryButton } from "../../foundation/components/Button";
import TitanDataTable from "../../foundation/components/DataTable";
import TitanTableFooter from "../../foundation/components/TitanTableFooter";
import TitanKpiBarSlot from "../../foundation/components/TitanKpiBarSlot";
import TitanWorkflowStatusChipBar from "../../foundation/components/TitanWorkflowStatusChipBar";
import { useListPagination } from "../../foundation/hooks/useListPagination";
import { buildMetricChipItems } from "../../utils/kpiMetricChipItems";
import InOutListPrintPreviewModal from "../../components/print/InOutListPrintPreviewModal";
import TitanPrintPreviewModal from "../../components/print/TitanPrintPreviewModal";
import TransactionStatementPrintDocument from "../../components/print/TransactionStatementPrintDocument";
import CertificatePrint from "../../components/print/CertificatePrint";
import { TITAN_PRINT_DOCUMENT_TYPES } from "../../config/titanPrintDocuments";
import {
  DOCUMENT_ENGINE_CATEGORY_IDS,
  DOCUMENT_PREVIEW_KIND,
  getDocumentCategorySummaries,
} from "../../utils/titanDocumentEngine";
import { buildInOutListPrintProps } from "../../utils/inOutListPrintRows";
import { buildTransactionStatementPrintProps } from "../../utils/titanPrintPreviewHelpers";
import { getStockQty } from "../../utils/inventory";
import { exportTitanPdf, printTitanDocument } from "../../utils/titanPrintExport";
import "./InboundManagement.css";
import "../Inventory/InventoryStatus.css";

const KPI_TONE_BY_CATEGORY = {
  [DOCUMENT_ENGINE_CATEGORY_IDS.INBOUND_LIST]: "incoming",
  [DOCUMENT_ENGINE_CATEGORY_IDS.OUTBOUND_LIST]: "production",
  [DOCUMENT_ENGINE_CATEGORY_IDS.CERTIFICATE]: "certificate",
  [DOCUMENT_ENGINE_CATEGORY_IDS.TRANSACTION_STATEMENT]: "complete",
  [DOCUMENT_ENGINE_CATEGORY_IDS.OTHER_DOCUMENT]: "hold",
};

export default function PrintManagementWorkspace() {
  const navigate = useNavigate();
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeCategoryId, setActiveCategoryId] = useState(
    DOCUMENT_ENGINE_CATEGORY_IDS.INBOUND_LIST
  );
  const [inOutPreview, setInOutPreview] = useState(null);
  const [statementRecord, setStatementRecord] = useState(null);
  const [certificateRecord, setCertificateRecord] = useState(null);
  const [statementBusy, setStatementBusy] = useState(false);
  const [certificateBusy, setCertificateBusy] = useState(false);

  const summaries = useMemo(() => {
    void refreshKey;
    return getDocumentCategorySummaries();
  }, [refreshKey]);

  const activeCategory =
    summaries.find((category) => category.id === activeCategoryId) ?? summaries[0];

  const kpiItems = useMemo(() => {
    const cards = summaries.map((category) => ({
      id: category.id,
      label: `${category.docCode} ${category.label}`,
      value: category.count,
      unit: "건",
      tone: KPI_TONE_BY_CATEGORY[category.id] ?? "incoming",
      icon: FileText,
    }));
    return buildMetricChipItems(cards);
  }, [summaries]);

  const rows = activeCategory?.documents ?? [];

  const {
    page,
    pageSize,
    totalCount,
    totalPages,
    pagedItems: pagedRows,
    setPage,
    setPageSize,
  } = useListPagination(rows);

  const openInOutPreview = (documentType, record, listNoPrefix) => {
    const printProps = buildInOutListPrintProps([record], {
      listNoPrefix,
      records: [record],
      resolveQty: listNoPrefix === "OUT" ? (item) => getStockQty(item) : undefined,
    });
    setInOutPreview({ documentType, printProps });
  };

  const handlePrintDocument = (row) => {
    const previewKind = activeCategory?.previewKind;
    if (previewKind === DOCUMENT_PREVIEW_KIND.IN_OUT_LIST) {
      if (activeCategory.id === DOCUMENT_ENGINE_CATEGORY_IDS.INBOUND_LIST) {
        openInOutPreview(TITAN_PRINT_DOCUMENT_TYPES.INBOUND_LIST, row.record, "HTL");
      } else {
        openInOutPreview(TITAN_PRINT_DOCUMENT_TYPES.OUTBOUND_LIST, row.record, "OUT");
      }
      return;
    }
    if (previewKind === DOCUMENT_PREVIEW_KIND.STATEMENT) {
      setStatementRecord(row.record);
      return;
    }
    if (previewKind === DOCUMENT_PREVIEW_KIND.CERTIFICATE) {
      setCertificateRecord(row.record);
      return;
    }
    if (previewKind === DOCUMENT_PREVIEW_KIND.NAVIGATE && activeCategory?.navigateTo) {
      navigate(activeCategory.navigateTo);
    }
  };

  const statementPrintProps = useMemo(
    () => (statementRecord ? buildTransactionStatementPrintProps(statementRecord) : null),
    [statementRecord]
  );

  const handleStatementPrint = async (documentEl) => {
    setStatementBusy(true);
    try {
      await printTitanDocument(documentEl);
    } finally {
      setStatementBusy(false);
    }
  };

  const handleStatementPdf = async (documentEl) => {
    setStatementBusy(true);
    try {
      await exportTitanPdf(
        documentEl,
        `transaction-statement-${statementPrintProps?.record?.id ?? "document"}.pdf`
      );
    } finally {
      setStatementBusy(false);
    }
  };

  const handleCertificatePrint = async (documentEl) => {
    setCertificateBusy(true);
    try {
      await printTitanDocument(documentEl);
      setRefreshKey((key) => key + 1);
    } finally {
      setCertificateBusy(false);
    }
  };

  const handleCertificatePdf = async (documentEl) => {
    setCertificateBusy(true);
    try {
      const docId = certificateRecord?.id ?? certificateRecord?.managementId ?? "certificate";
      await exportTitanPdf(documentEl, `certificate-${docId}.pdf`);
      setRefreshKey((key) => key + 1);
    } finally {
      setCertificateBusy(false);
    }
  };

  const isNavigateCategory = activeCategory?.previewKind === DOCUMENT_PREVIEW_KIND.NAVIGATE;

  const columns = useMemo(
    () => [
      { key: "docCode", label: "문서", widthPercent: 8, render: () => activeCategory?.docCode ?? "—" },
      { key: "docNo", label: "문서번호/상태", widthPercent: 12, render: (row) => row.docNo },
      { key: "managementId", label: "관리번호", widthPercent: 13, render: (row) => row.managementId },
      { key: "company", label: "업체명", widthPercent: 13, render: (row) => row.company },
      { key: "partName", label: "품명", widthPercent: 15, render: (row) => row.partName },
      { key: "partNo", label: "품번", widthPercent: 12, render: (row) => row.partNo },
      { key: "lotNo", label: "LOT.NO", widthPercent: 10, render: (row) => row.lotNo },
      { key: "date", label: "일자", widthPercent: 9, render: (row) => row.date },
      {
        key: "status",
        label: "상태",
        widthPercent: 8,
        render: (row) => <StatusChip variant="wait">{row.statusLabel}</StatusChip>,
      },
      {
        key: "actions",
        label: "출력",
        widthPercent: 10,
        render: (row) => (
          <SecondaryButton type="button" onClick={() => handlePrintDocument(row)}>
            {isNavigateCategory ? (
              <>
                <ExternalLink size={14} aria-hidden="true" />
                발행 화면
              </>
            ) : (
              <>
                <Printer size={14} aria-hidden="true" />
                출력
              </>
            )}
          </SecondaryButton>
        ),
      },
    ],
    [activeCategory, isNavigateCategory]
  );

  return (
    <div className="inventory-status-page inbound-page">
      <TitanKpiBarSlot ariaLabel="출력관리 문서 현황" className="inbound-page__kpi">
        <TitanWorkflowStatusChipBar items={kpiItems} ariaLabel="출력관리 문서 현황" />
      </TitanKpiBarSlot>

      <div className="inventory-status-page__view-modes" role="tablist" aria-label="문서 종류">
        {summaries.map((category) => (
          <button
            key={category.id}
            type="button"
            role="tab"
            aria-selected={activeCategoryId === category.id}
            className={`inventory-status-page__view-mode${
              activeCategoryId === category.id ? " is-active" : ""
            }`}
            onClick={() => {
              setActiveCategoryId(category.id);
              setPage(1);
            }}
          >
            {category.label} ({category.count})
          </button>
        ))}
      </div>

      <div className="inventory-status-page__list quality-page__list">
        <TitanDataTable
          columns={columns}
          rows={pagedRows}
          rowKey="id"
          emptyMessage={
            isNavigateCategory
              ? `${activeCategory?.label} 문서가 없습니다. (발행 화면에서 등록)`
              : "출력 대상 문서가 없습니다."
          }
        />
        <TitanTableFooter
          totalCount={totalCount}
          page={page}
          totalPages={totalPages}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      </div>

      <InOutListPrintPreviewModal
        open={Boolean(inOutPreview)}
        onClose={() => setInOutPreview(null)}
        documentType={inOutPreview?.documentType}
        printProps={inOutPreview?.printProps}
        onAfterPrint={() => setRefreshKey((key) => key + 1)}
      />

      <TitanPrintPreviewModal
        open={Boolean(statementPrintProps)}
        onClose={() => setStatementRecord(null)}
        title="거래명세서 출력 미리보기"
        onPrint={handleStatementPrint}
        onPdf={handleStatementPdf}
        busy={statementBusy}
      >
        {statementPrintProps ? <TransactionStatementPrintDocument {...statementPrintProps} /> : null}
      </TitanPrintPreviewModal>

      <TitanPrintPreviewModal
        open={Boolean(certificateRecord)}
        onClose={() => setCertificateRecord(null)}
        title="검사성적서 출력 미리보기"
        onPrint={handleCertificatePrint}
        onPdf={handleCertificatePdf}
        excelEnabled={false}
        busy={certificateBusy}
      >
        {certificateRecord ? <CertificatePrint record={certificateRecord} /> : null}
      </TitanPrintPreviewModal>
    </div>
  );
}

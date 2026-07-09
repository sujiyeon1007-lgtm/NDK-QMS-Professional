import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronLeft, Plus, Star } from "lucide-react";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";

import TitanWorkspaceModal from "../../foundation/components/TitanWorkspaceModal";
import TitanListInteractionHint from "../../foundation/components/TitanListInteractionHint";
import TitanDataTable from "../../foundation/components/DataTable";
import TitanTableFooter from "../../foundation/components/TitanTableFooter";
import Input from "../../foundation/components/Input";
import StatusChip from "../../foundation/components/StatusChip";
import { PrimaryButton, SecondaryButton } from "../../foundation/components/Button";
import { FoundationAttachmentBadge } from "../../foundation/components/FoundationAttachment";
import { useListPagination } from "../../foundation/hooks/useListPagination";
import {
  DOCUMENT_CATEGORY_TABS,
  createEmptyDocumentPopupSearch,
  resolveDocumentTabScope,
} from "../../config/documentManagementV13";
import {
  buildDocumentProductSummaryListColumns,
  buildDocumentRegistryListColumns,
} from "../../config/standardProductList";
import {
  buildCompanyProductDocumentSummaryRows,
  filterCompanyPopupDocuments,
  getCompanyDocumentRegistryRows,
  getProductDocumentsForTab,
  matchesProductDocumentSummarySearch,
  pickPreferredProductDocument,
} from "../../utils/companyDocumentManagement";
import { appendDocumentChangeLog } from "../../utils/documentChangeLogSession";
import { getDocumentManagementActionPermissions } from "../../utils/documentManagementPermissions";
import { addRecentDocument } from "../../utils/documentRecentSession";
import { getAuthSession } from "../../utils/titanAuthSession";
import { openRowDetailPopup } from "../../foundation/utils/openRowDetailPopup";
import { getDocumentFoundationAttachmentCount } from "../../utils/documentFoundationAttachments";
import DocumentRegisterModal from "./DocumentRegisterModal";
import DocumentDetailPopup from "./DocumentDetailPopup";
import "./DocumentCompanyPopup.css";

export default function DocumentCompanyPopup({
  open,
  companyRow,
  onClose,
  onRefresh,
  onOpenDocumentDetail,
  openRegisterOnOpen = false,
  onRegisterOpenConsumed,
}) {
  const userId = getAuthSession()?.userId;
  const [categoryTab, setCategoryTab] = useState(0);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [search, setSearch] = useState(createEmptyDocumentPopupSearch);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeProductId, setActiveProductId] = useState(null);
  const [activeListRowId, setActiveListRowId] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [uiTick, setUiTick] = useState(0);
  const permissions = useMemo(() => getDocumentManagementActionPermissions(), [open, uiTick]);

  const companyName = companyRow?.company ?? "";
  const activeTabConfig = DOCUMENT_CATEGORY_TABS[categoryTab] ?? DOCUMENT_CATEGORY_TABS[0];
  const filterId = activeTabConfig?.id ?? "all";
  const isProductTab = resolveDocumentTabScope(filterId) === "product";
  const showProductList = isProductTab && !selectedProduct;
  const showProductDocuments = isProductTab && Boolean(selectedProduct);

  const sourceRows = useMemo(
    () => getCompanyDocumentRegistryRows(companyName),
    [companyName, open, onRefresh, uiTick]
  );

  const productSummaryRows = useMemo(() => {
    if (!showProductList) return [];
    return buildCompanyProductDocumentSummaryRows(companyName, sourceRows, filterId).filter((row) =>
      matchesProductDocumentSummarySearch(row, search.query)
    );
  }, [showProductList, companyName, sourceRows, filterId, search.query]);

  const companyDocumentRows = useMemo(() => {
    if (isProductTab) return [];
    return filterCompanyPopupDocuments(sourceRows, {
      filterId,
      folderId: "all",
      search,
      favoritesOnly,
      userId,
    });
  }, [isProductTab, sourceRows, filterId, search, favoritesOnly, userId]);

  const productDocumentRows = useMemo(() => {
    if (!showProductDocuments || !selectedProduct?.product) return [];
    return filterCompanyPopupDocuments(
      getProductDocumentsForTab(sourceRows, selectedProduct.product, filterId),
      {
        filterId,
        folderId: "all",
        search,
        favoritesOnly,
        userId,
      }
    );
  }, [
    showProductDocuments,
    selectedProduct,
    sourceRows,
    filterId,
    search,
    favoritesOnly,
    userId,
  ]);

  const listRows = showProductList
    ? productSummaryRows
    : showProductDocuments
      ? productDocumentRows
      : companyDocumentRows;

  const {
    page,
    setPage,
    pageSize,
    setPageSize,
    totalPages,
    totalCount,
    pagedItems: pagedRows,
  } = useListPagination(listRows);

  useEffect(() => {
    if (!open) {
      setSelectedDocument(null);
      setSelectedProduct(null);
      setActiveProductId(null);
      setActiveListRowId(null);
      return;
    }
    setCategoryTab(0);
    setSelectedProduct(null);
    setActiveProductId(null);
    setActiveListRowId(null);
    setSearch(createEmptyDocumentPopupSearch);
    setFavoritesOnly(false);
    setSelectedDocument(null);
  }, [open, companyName]);

  useEffect(() => {
    if (!open || !openRegisterOnOpen || !permissions.canRegister) return;
    setRegisterOpen(true);
    onRegisterOpenConsumed?.();
  }, [onRegisterOpenConsumed, open, openRegisterOnOpen, permissions.canRegister]);

  useEffect(() => {
    setSelectedProduct(null);
    setActiveProductId(null);
    setActiveListRowId(null);
    setSelectedDocument(null);
    setPage(1);
    // setPage from useListPagination is recreated each render — tab change only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryTab]);

  const bumpUi = useCallback(() => setUiTick((value) => value + 1), []);

  const openDocumentDetailPopup = useCallback(
    (documentRow) => {
      if (!documentRow?.id) return;
      addRecentDocument(
        {
          documentId: documentRow.id,
          title: documentRow.title,
          company: documentRow.company,
          documentNo: documentRow.documentNo,
        },
        userId
      );
      appendDocumentChangeLog(documentRow.id, "문서 열람", documentRow.title);
      bumpUi();
      if (typeof onOpenDocumentDetail === "function") {
        onOpenDocumentDetail({
          row: documentRow,
          companyName,
          sourceRows,
        });
        return;
      }
      openRowDetailPopup(documentRow, {
        setActiveId: setActiveListRowId,
        setDetailPopupRow: setSelectedDocument,
        getRowId: (row) => row.id,
      });
    },
    [bumpUi, companyName, onOpenDocumentDetail, sourceRows, userId]
  );

  const resolveSummaryDocuments = useCallback(
    (summaryRow) => {
      if (!summaryRow?.product) return summaryRow?.documents ?? [];
      return getProductDocumentsForTab(sourceRows, summaryRow.product, filterId);
    },
    [sourceRows, filterId]
  );

  const openProductDocumentDetail = useCallback(
    (summaryRow) => {
      if (!summaryRow?.product) return false;
      const documents = resolveSummaryDocuments(summaryRow);
      const target = pickPreferredProductDocument(documents, filterId);
      if (!target) return false;
      openDocumentDetailPopup(target);
      return true;
    },
    [resolveSummaryDocuments, filterId, openDocumentDetailPopup]
  );

  const handleProductDoubleClick = useCallback(
    (row) => {
      if (!row?.product) return;
      if (openProductDocumentDetail(row)) return;
      setSelectedProduct({ ...row, documents: resolveSummaryDocuments(row) });
      setActiveProductId(row.id);
      setPage(1);
    },
    [openProductDocumentDetail, resolveSummaryDocuments, setPage]
  );

  const handleListRowClick = useCallback(
    (row) => {
      if (!row?.id) return;
      if (showProductList) {
        setActiveProductId(row.id);
        return;
      }
      setActiveListRowId(row.id);
    },
    [showProductList]
  );

  const handleListRowDoubleClick = useCallback(
    (row) => {
      if (showProductList) {
        handleProductDoubleClick(row);
        return;
      }
      if (!row?.id) return;
      openDocumentDetailPopup(row);
    },
    [showProductList, handleProductDoubleClick, openDocumentDetailPopup]
  );

  const handleSaved = () => {
    setRegisterOpen(false);
    bumpUi();
    onRefresh?.();
  };

  const renderStatusChip = useCallback(
    (row) => (
      <StatusChip variant={row.statusVariant === "complete" ? "complete" : "wait"}>
        {row.statusLabel || row.approvalStatus || "등록"}
      </StatusChip>
    ),
    []
  );

  const renderAttachmentBadge = useCallback(
    (row) => (
      <FoundationAttachmentBadge
        count={getDocumentFoundationAttachmentCount(row)}
        showUnit={false}
        onClick={(event) => {
          event.stopPropagation();
          openDocumentDetailPopup(row);
        }}
      />
    ),
    [openDocumentDetailPopup]
  );

  const documentColumns = useMemo(
    () =>
      buildDocumentRegistryListColumns({
        renderStatus: renderStatusChip,
        renderAttachments: renderAttachmentBadge,
      }),
    [renderAttachmentBadge, renderStatusChip]
  );

  const productColumns = useMemo(
    () => buildDocumentProductSummaryListColumns({ renderStatus: renderStatusChip }),
    [renderStatusChip]
  );

  const columns = showProductList ? productColumns : documentColumns;

  const emptyMessage = showProductList
    ? "등록된 품목이 없습니다."
    : favoritesOnly
      ? "즐겨찾기 문서가 없습니다."
      : showProductDocuments
        ? "등록된 문서가 없습니다. 등록 버튼으로 문서를 추가하세요."
        : "등록된 문서가 없습니다.";

  const searchPlaceholder = showProductList
    ? "품명 · 품번 · 재질 · 규격 검색"
    : "문서명 · 문서번호 · Rev · 등록자";

  return (
    <>
      <TitanWorkspaceModal
        open={open}
        onClose={onClose}
        kicker={companyName}
        title="문서관리"
        titleId="document-company-popup-title"
        size="document"
        toolbar={
          <div className="document-company-popup__toolbar">
            <div className="document-company-popup__header-actions">
              {showProductDocuments ? (
                <SecondaryButton type="button" onClick={() => setSelectedProduct(null)}>
                  <ChevronLeft size={12} aria-hidden="true" />
                  품목 목록
                </SecondaryButton>
              ) : null}
              {permissions.canRegister ? (
                <PrimaryButton type="button" onClick={() => setRegisterOpen(true)}>
                  <Plus size={12} aria-hidden="true" />
                  + 등록
                </PrimaryButton>
              ) : null}
              {!isProductTab ? (
                <button
                  type="button"
                  className={`document-company-popup__filter document-company-popup__filter--favorite${favoritesOnly ? " is-active" : ""}`}
                  onClick={() => {
                    setFavoritesOnly((value) => !value);
                    setPage(1);
                  }}
                >
                  <Star size={12} aria-hidden="true" />
                  즐겨찾기
                </button>
              ) : null}
            </div>
          </div>
        }
        search={
          <div className="document-company-popup__search">
            <TitanListInteractionHint />
            {showProductDocuments ? (
              <p className="document-company-popup__product-context" role="status">
                품목: <strong>{selectedProduct.partName}</strong> ({selectedProduct.partNo})
              </p>
            ) : null}
            <label className="document-company-popup__search-field document-company-popup__search-field--wide">
              <span>{showProductList ? "품목 검색" : "문서 검색"}</span>
              <Input
                value={search.query}
                onChange={(event) => {
                  setSearch({ query: event.target.value });
                  setPage(1);
                }}
                placeholder={searchPlaceholder}
              />
            </label>
          </div>
        }
        table={
          <div className="document-company-popup__list-only">
            <div className="document-company-popup__category-tabs">
              <Tabs
                value={categoryTab}
                onChange={(_, value) => {
                  setCategoryTab(value);
                }}
                variant="scrollable"
                scrollButtons="auto"
                aria-label="문서 종류"
                className="titan-detail-popup__tabs document-company-popup__tabs"
              >
                {DOCUMENT_CATEGORY_TABS.map((tab, index) => (
                  <Tab key={tab.id} value={index} label={tab.label} />
                ))}
              </Tabs>
            </div>

            <TitanDataTable
              className="document-company-popup__table"
              columns={columns}
              rows={pagedRows}
              getRowId={(row) => row.id}
              activeRowId={
                showProductList
                  ? activeProductId
                  : selectedDocument?.id ?? activeListRowId
              }
              onRowClick={handleListRowClick}
              onRowDoubleClick={handleListRowDoubleClick}
              emptyMessage={emptyMessage}
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
        }
      />

      <DocumentDetailPopup
        open={Boolean(selectedDocument)}
        onClose={() => setSelectedDocument(null)}
        companyName={companyName}
        row={selectedDocument}
        sourceRows={sourceRows}
        onRefresh={onRefresh}
        onSelectRow={(row) => {
          setSelectedDocument(row);
          setActiveListRowId(row.id);
          appendDocumentChangeLog(row.id, "문서 열람", row.title);
        }}
      />

      <DocumentRegisterModal
        open={registerOpen}
        onClose={() => setRegisterOpen(false)}
        onSaved={handleSaved}
        companyName={companyName}
        mode="register"
        initialRow={null}
        productContext={showProductDocuments ? selectedProduct?.product : null}
        documentTabId={filterId}
      />
    </>
  );
}

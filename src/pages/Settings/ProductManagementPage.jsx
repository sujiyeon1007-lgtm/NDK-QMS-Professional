import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Boxes, CheckCircle2, Factory, Pencil, Plus, ShieldAlert, Trash2, X } from "lucide-react";

import { PrimaryButton, SecondaryButton } from "../../foundation/components/Button";
import TitanDataTable from "../../foundation/components/DataTable";
import TitanTableFooter from "../../foundation/components/TitanTableFooter";
import { useListPagination } from "../../foundation/hooks/useListPagination";
import { PRODUCT_MASTER_LIST_COLUMNS } from "../../config/productDetailSections";
import { getMasterDataScreen } from "../../config/masterDataScreens";
import {
  formatMasterRowForDisplay,
  getMasterDataByCategory,
  searchMasterData,
  stageMasterAdd,
  stageMasterDelete,
  stageMasterUpdate,
} from "../../utils/masterData";
import {
  buildProductListMeta,
  buildProductMasterSummary,
} from "../../utils/productMasterDetail";
import { QRService } from "../../utils/qrEngineRegistryService";
import TitanListInteractionHint from "../../foundation/components/TitanListInteractionHint";
import ProductDetailModal from "./ProductDetailModal";
import MasterDataRegisterModal from "./MasterDataRegisterModal";
import MasterDataDeleteDialog from "./MasterDataDeleteDialog";

import "../InOut/InboundManagement.css";
import "./CompanyManagement.css";
import "./ProductManagement.css";
import "./MasterDataSprint8Polish.css";

const PRODUCT_SELECTION_KEY = "titan-master-selected-product-id";

const PRODUCT_KPI_ICON = {
  total: Boxes,
  active: CheckCircle2,
  producible: Factory,
  "needs-care": ShieldAlert,
};

function renderActiveLabel(row) {
  return row.activeLabel ?? (row.active === false ? "미사용" : "사용");
}

/** 기준정보관리 — 제품관리 (제품 리스트 전용) */
export default function ProductManagementPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const screen = getMasterDataScreen("products");
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedProductId, setSelectedProductId] = useState(
    () => sessionStorage.getItem(PRODUCT_SELECTION_KEY) ?? ""
  );
  const [searchKeyword, setSearchKeyword] = useState("");
  const [companyFilter, setCompanyFilter] = useState("");
  const [registerOpen, setRegisterOpen] = useState(false);
  const [registerMode, setRegisterMode] = useState("add");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [detailProduct, setDetailProduct] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const allProducts = useMemo(() => {
    return getMasterDataByCategory("products").map((row) => formatMasterRowForDisplay(row));
  }, [refreshKey]);

  const summaryKpis = useMemo(() => buildProductMasterSummary(), [refreshKey]);
  const listMeta = useMemo(() => buildProductListMeta(), [refreshKey]);

  const filteredProducts = useMemo(() => {
    let rows = allProducts;
    const company = companyFilter.trim();
    if (company) {
      rows = rows.filter((row) => row.company === company);
    }
    const keyword = searchKeyword.trim();
    if (!keyword) return rows;
    const matchedIds = new Set(searchMasterData("products", keyword).map((row) => row.id));
    return rows.filter((row) => matchedIds.has(row.id));
  }, [allProducts, companyFilter, searchKeyword]);

  const {
    page,
    pageSize,
    totalCount,
    totalPages,
    pagedItems: pagedProducts,
    setPage,
    setPageSize,
  } = useListPagination(filteredProducts);

  const selectedProduct = useMemo(
    () => allProducts.find((row) => row.id === selectedProductId) ?? null,
    [allProducts, selectedProductId]
  );

  useEffect(() => {
    setPage(1);
  }, [searchKeyword, companyFilter, setPage]);

  useEffect(() => {
    const stateFilter = location.state?.companyFilter?.trim();
    const queryFilter = searchParams.get("company")?.trim();
    const nextFilter = stateFilter || queryFilter || "";
    if (!nextFilter) return;

    setCompanyFilter(nextFilter);
    if (stateFilter) {
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.pathname, location.state, navigate, searchParams]);

  useEffect(() => {
    if (!selectedProductId) return;
    const exists = allProducts.some((row) => row.id === selectedProductId);
    if (!exists) {
      setSelectedProductId("");
      sessionStorage.removeItem(PRODUCT_SELECTION_KEY);
    }
  }, [allProducts, selectedProductId]);

  useEffect(() => {
    if (!selectedProductId) return;
    sessionStorage.setItem(PRODUCT_SELECTION_KEY, selectedProductId);
  }, [selectedProductId]);

  useEffect(() => {
    if (!detailOpen || !detailProduct?.id) return;
    const latest = allProducts.find((row) => row.id === detailProduct.id);
    if (latest) setDetailProduct(latest);
  }, [allProducts, detailProduct?.id, detailOpen]);

  const tableColumns = useMemo(
    () =>
      PRODUCT_MASTER_LIST_COLUMNS.map((col) => ({
        key: col.key,
        label: col.label,
        widthPercent: col.widthPercent,
        render:
          col.render === "active"
            ? (row) => (
                <span className={`status-badge ${row.active === false ? "미사용" : "사용"}`}>
                  {renderActiveLabel(row)}
                </span>
              )
            : col.render === "meta"
              ? (row) => (
                  <span className="product-master-meta-cell">
                    {listMeta.get(row.id)?.[col.key] ?? "—"}
                  </span>
                )
              : (row) => {
                  const value = row?.[col.key];
                  return value == null || String(value).trim() === "" ? "—" : String(value);
                },
      })),
    [listMeta]
  );

  const openDetail = (row) => {
    setSelectedProductId(row.id);
    setDetailProduct(row);
    setDetailOpen(true);
  };

  const openRegister = (mode, row = null) => {
    setRegisterMode(mode);
    setRegisterOpen(true);
    if (mode === "edit" && row) setSelectedProductId(row.id);
  };

  const handleSave = (form) => {
    const result =
      registerMode === "edit" && selectedProduct
        ? stageMasterUpdate("products", selectedProduct.id, form)
        : stageMasterAdd("products", form);

    if (!result.ok) return;
    QRService.createIfNotExists("products", result.row);
    setRefreshKey((key) => key + 1);
    setRegisterOpen(false);
    if (result.row?.id) {
      setSelectedProductId(result.row.id);
      if (detailOpen) {
        setDetailProduct(formatMasterRowForDisplay(result.row));
      }
    }
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    const result = stageMasterDelete("products", deleteTarget.id);
    if (!result.ok) return;
    setDeleteTarget(null);
    if (selectedProductId === deleteTarget.id) {
      setSelectedProductId("");
      sessionStorage.removeItem(PRODUCT_SELECTION_KEY);
    }
    if (detailProduct?.id === deleteTarget.id) {
      setDetailOpen(false);
      setDetailProduct(null);
    }
    setRefreshKey((key) => key + 1);
  };

  return (
    <>
      <div className="company-management-page">
        <section className="company-master-kpis" aria-label="제품 현황 요약">
          {summaryKpis.map((kpi) => {
            const Icon = PRODUCT_KPI_ICON[kpi.id] ?? Boxes;
            return (
              <div
                key={kpi.id}
                className={`company-master-kpi${kpi.tone === "danger" ? " is-danger" : ""}`}
              >
                <div className="company-master-kpi__head">
                  <span className="company-master-kpi__icon">
                    <Icon size={18} aria-hidden="true" />
                  </span>
                  <span className="company-master-kpi__label">{kpi.label}</span>
                </div>
                <div className="company-master-kpi__value">
                  {Number(kpi.value ?? 0).toLocaleString("ko-KR")}
                  <em>{kpi.unit}</em>
                </div>
              </div>
            );
          })}
        </section>

        <TitanListInteractionHint />

        <div className="company-management-page__search">
          {companyFilter ? (
            <div className="company-management-page__filter-chip" aria-live="polite">
              <span>
                거래처 <strong>{companyFilter}</strong>
              </span>
              <button
                type="button"
                className="company-management-page__filter-clear"
                onClick={() => setCompanyFilter("")}
                aria-label="거래처 필터 해제"
              >
                <X size={14} aria-hidden="true" />
              </button>
            </div>
          ) : null}
          <input
            type="search"
            value={searchKeyword}
            onChange={(event) => setSearchKeyword(event.target.value)}
            placeholder="품명 · 품번 · 거래처 · 재질 · 공정 · 상태 검색"
            aria-label="제품 검색"
          />
        </div>

        <div className="company-management-page__table-wrap company-management-page__table-wrap--compact">
          <TitanDataTable
            className="inbound-page__table company-management-page__table--compact company-management-page__table--product"
            columns={tableColumns}
            rows={pagedProducts}
            activeRowId={selectedProductId}
            onRowClick={(row) => setSelectedProductId(row.id)}
            onRowDoubleClick={(row) => openDetail(row)}
            emptyMessage="등록된 제품이 없습니다."
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

        <div className="company-management-page__actions">
          <PrimaryButton type="button" onClick={() => openRegister("add")}>
            <Plus size={14} aria-hidden="true" />
            등록
          </PrimaryButton>
          <SecondaryButton
            type="button"
            onClick={() => openRegister("edit", selectedProduct)}
            disabled={!selectedProduct}
          >
            <Pencil size={14} aria-hidden="true" />
            수정
          </SecondaryButton>
          <SecondaryButton
            type="button"
            onClick={() => setDeleteTarget(selectedProduct)}
            disabled={!selectedProduct}
          >
            <Trash2 size={14} aria-hidden="true" />
            삭제
          </SecondaryButton>
        </div>

        <footer className="product-master-status" aria-live="polite">
          {selectedProduct ? (
            <>
              <span className="product-master-status__title">선택 제품</span>
              <span className="product-master-status__name">
                {selectedProduct.name || "—"}
              </span>
              <span className="product-master-status__item">
                품번 <strong>{selectedProduct.partNo || "—"}</strong>
              </span>
              <span className="product-master-status__item">
                거래처 <strong>{selectedProduct.company || "—"}</strong>
              </span>
              <span className="product-master-status__item">
                재질 <strong>{selectedProduct.material || "—"}</strong>
              </span>
              <span className="product-master-status__item product-master-status__health-group">
                Health
                <span
                  className={`product-master-status__health is-${
                    listMeta.get(selectedProduct.id)?.healthStatus ?? "error"
                  }`}
                >
                  <span aria-hidden="true">
                    {listMeta.get(selectedProduct.id)?.healthIcon ?? "🔴"}
                  </span>{" "}
                  {listMeta.get(selectedProduct.id)?.healthLabel ?? "관리 필요"}
                </span>
              </span>
            </>
          ) : (
            <span className="product-master-status__empty">
              목록에서 제품을 선택하면 요약이 표시됩니다.
            </span>
          )}
        </footer>
      </div>

      <ProductDetailModal
        open={detailOpen}
        product={detailProduct}
        onClose={() => setDetailOpen(false)}
      />

      <MasterDataRegisterModal
        open={registerOpen}
        onClose={() => setRegisterOpen(false)}
        onSave={handleSave}
        screen={screen}
        mode={registerMode}
        initialRow={registerMode === "edit" ? selectedProduct : null}
      />

      {deleteTarget ? (
        <MasterDataDeleteDialog
          row={deleteTarget}
          categoryLabel={screen?.title ?? "제품"}
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
        />
      ) : null}
    </>
  );
}

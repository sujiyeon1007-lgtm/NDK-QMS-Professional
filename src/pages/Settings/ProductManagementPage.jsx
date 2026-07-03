import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Pencil, Plus, Trash2, X } from "lucide-react";

import { PrimaryButton, SecondaryButton } from "../../foundation/components/Button";
import TitanDataTable from "../../foundation/components/DataTable";
import TitanTableFooter from "../../foundation/components/TitanTableFooter";
import { useListPagination } from "../../foundation/hooks/useListPagination";
import { PRODUCT_LIST_COLUMNS } from "../../config/productDetailSections";
import { getMasterDataScreen } from "../../config/masterDataScreens";
import {
  formatMasterRowForDisplay,
  getMasterDataByCategory,
  searchMasterData,
  stageMasterAdd,
  stageMasterDelete,
  stageMasterUpdate,
} from "../../utils/masterData";
import ProductDetailModal from "./ProductDetailModal";
import MasterDataBackLink from "./MasterDataBackLink";
import MasterDataRegisterModal from "./MasterDataRegisterModal";
import MasterDataDeleteDialog from "./MasterDataDeleteDialog";

import "../InOut/InboundManagement.css";
import "./CompanyManagement.css";

const PRODUCT_SELECTION_KEY = "titan-master-selected-product-id";

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
      PRODUCT_LIST_COLUMNS.map((col) => ({
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
            : undefined,
      })),
    []
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
        <MasterDataBackLink />

        <div className="company-management-page__head">
          <div>
            <h2>제품관리</h2>
            <p className="company-management-page__intro">
              제품 목록을 관리합니다. 제품을 클릭하면 상세 Popup에서 거래처 · 재질 · 규격 · 단가
              정보를 확인할 수 있습니다.
            </p>
          </div>
        </div>

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
            placeholder="품번 · 품명 · 업체 · 재질 검색"
            aria-label="제품 검색"
          />
        </div>

        <div className="company-management-page__table-wrap">
          <TitanDataTable
            className="inbound-page__table"
            columns={tableColumns}
            rows={pagedProducts}
            activeRowId={selectedProductId}
            onRowClick={openDetail}
            onRowDoubleClick={(row) => openRegister("edit", row)}
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

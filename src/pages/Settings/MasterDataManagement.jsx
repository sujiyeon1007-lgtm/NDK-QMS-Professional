import { useEffect, useMemo, useState } from "react";

import { useParams } from "react-router-dom";

import { Database, Download, FileSpreadsheet, Pencil, Plus, Trash2 } from "lucide-react";

import { PrimaryButton, SecondaryButton } from "../../foundation/components/Button";

import TitanSearchPanel from "../../foundation/components/TitanSearchPanel";

import TitanDataTable from "../../foundation/components/DataTable";

import TitanTableFooter from "../../foundation/components/TitanTableFooter";

import TitanDetailPanel from "../../foundation/components/TitanDetailPanel";

import TitanKpiBarSlot from "../../foundation/components/TitanKpiBarSlot";
import TitanWorkflowStatusChipBar from "../../foundation/components/TitanWorkflowStatusChipBar";
import { buildMetricChipItems } from "../../utils/kpiMetricChipItems";

import { EMPTY_BASIC_SEARCH } from "../../config/listSearchStandard";

import { useTitanListSearch } from "../../foundation/hooks/useTitanListSearch";

import { useListPagination } from "../../foundation/hooks/useListPagination";

import {

  formatMasterRowForDisplay,

  getMasterDataByCategory,

  searchMasterData,

  stageMasterAdd,

  stageMasterDelete,

  stageMasterUpdate,

} from "../../utils/masterData";

import { getMasterDataScreen, resolveMasterDataTab } from "../../config/masterDataScreens";

import { deleteProductDrawingRecord, logProductChange } from "../../utils/productDrawingSession";

import { getProductUsageStats, canDeleteProduct } from "../../utils/productUsage";
import { setTitanErrorContext, clearTitanErrorContext } from "../../utils/titanErrorContext";

import MasterDataRegisterModal from "./MasterDataRegisterModal";

import MasterExcelImportModal from "./MasterExcelImportModal";

import { isMasterExcelTab, resolveMasterExcelType } from "../../config/masterExcelImport";
import { exportMasterExcel } from "../../utils/masterExcelImport";

import MasterDataDeleteDialog from "./MasterDataDeleteDialog";

import ProductDrawingDetailPanel from "./ProductDrawingDetailPanel";

import "../InOut/InboundManagement.css";

import SectionPageActions from "../../foundation/layout/SectionPageActions";

import "./MasterDataManagement.css";

import "./ProductDrawingManagement.css";



const PRODUCT_SELECTION_KEY = "titan-product-selected-id";



function createEmptyMasterSearch() {

  return { ...EMPTY_BASIC_SEARCH, activeStatus: "" };

}



function getMasterSearchKeyword(search) {

  return [search.company, search.partName, search.partNo, search.material].filter(Boolean).join(" ").trim();

}



function renderDetailValue(row, field) {

  if (field.render === "active") return row.activeLabel ?? (row.active === false ? "미사용" : "사용");

  const value = row[field.key];

  return value != null && String(value).trim() !== "" ? value : "—";

}



function mapMasterRows(categoryKey, rows) {

  return rows.map((row) => {

    const formatted = formatMasterRowForDisplay(row);

    if (categoryKey !== "products") return formatted;

    const usage = getProductUsageStats(row.partNo);

    return {

      ...formatted,

      lastUsedLabel: usage.lastUsedLabel,

      usageCountLabel: usage.usageCountLabel,

    };

  });

}



export default function MasterDataManagement() {

  const { tab: tabParam } = useParams();

  const tabId = resolveMasterDataTab(tabParam);

  const screen = getMasterDataScreen(tabId);

  const isProductsTab = tabId === "products";
  const isWorkersTab = tabId === "workers";
  const excelMasterType = resolveMasterExcelType(tabId);
  const hasExcelActions = isMasterExcelTab(tabId);



  const [refreshKey, setRefreshKey] = useState(0);

  const [activeId, setActiveId] = useState(null);
  const [expandedRowId, setExpandedRowId] = useState(null);

  const [registerOpen, setRegisterOpen] = useState(false);

  const [importOpen, setImportOpen] = useState(false);
  const [exportBusy, setExportBusy] = useState(false);

  const [registerMode, setRegisterMode] = useState("add");

  const [drawingRefreshKey, setDrawingRefreshKey] = useState(0);

  const [advancedOpen, setAdvancedOpen] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);



  const { search, draft, onDraftChange, onSearch, onReset } = useTitanListSearch(

    createEmptyMasterSearch,

    { storageKey: `master-${tabId}` }

  );



  const allRows = useMemo(() => {

    const rows = getMasterDataByCategory(screen?.categoryKey ?? "companies");

    return mapMasterRows(screen?.categoryKey, rows);
  }, [screen?.categoryKey, refreshKey, drawingRefreshKey]);



  const filteredRows = useMemo(() => {

    let rows = allRows;

    const keyword = getMasterSearchKeyword(search);

    if (keyword) {

      const matchedIds = new Set(

        searchMasterData(screen?.categoryKey ?? "companies", keyword).map((row) => row.id)

      );

      rows = rows.filter((row) => matchedIds.has(row.id));

    }

    if (isProductsTab) {

      if (search.activeStatus === "active") {

        rows = rows.filter((row) => row.active !== false);

      } else if (search.activeStatus === "inactive") {

        rows = rows.filter((row) => row.active === false);

      }

    }

    return rows;

  }, [allRows, search, screen?.categoryKey, isProductsTab]);



  const {

    page,

    pageSize,

    totalCount,

    totalPages,

    pagedItems: pagedRows,

    setPage,

    setPageSize,

  } = useListPagination(filteredRows);



  useEffect(() => {
    setPage(1);
    setAdvancedOpen(false);
    setExpandedRowId(null);
    if (isProductsTab) {
      setActiveId(sessionStorage.getItem(PRODUCT_SELECTION_KEY) || null);
      setTitanErrorContext({ screen: "제품관리", component: "MasterDataManagement", path: window.location.pathname });
    } else {
      setActiveId(null);
      clearTitanErrorContext(["screen", "component"]);
    }
  }, [tabId, isProductsTab, setPage]);



  useEffect(() => {

    if (!isProductsTab || !activeId) return;

    sessionStorage.setItem(PRODUCT_SELECTION_KEY, activeId);

  }, [activeId, isProductsTab]);



  useEffect(() => {

    if (!activeId) return;

    const stillExists = allRows.some((row) => row.id === activeId);

    if (!stillExists) {

      setActiveId(null);

      sessionStorage.removeItem(PRODUCT_SELECTION_KEY);

    }

  }, [activeId, allRows]);



  const activeRow = useMemo(() => {

    if (!activeId) return null;

    return allRows.find((row) => row.id === activeId) ?? null;

  }, [activeId, allRows]);



  const kpiCards = useMemo(() => {

    const activeCount = allRows.filter((row) => row.active !== false).length;

    const inactiveCount = allRows.length - activeCount;

    const Icon = screen?.icon ?? Database;

    return [

      {

        id: "total",

        label: "전체 등록",

        value: allRows.length.toLocaleString("ko-KR"),

        unit: "건",

        tone: "blue",

        icon: Icon,

        subLabel: screen?.kpiTitle ?? "",

      },

      {

        id: "active",

        label: "사용 중",

        value: activeCount.toLocaleString("ko-KR"),

        unit: "건",

        tone: "green",

        icon: Database,

        subLabel: "활성 기준정보",

      },

      {

        id: "inactive",

        label: "미사용",

        value: inactiveCount.toLocaleString("ko-KR"),

        unit: "건",

        tone: "gray",

        icon: Database,

        subLabel: "비활성 기준정보",

      },

    ];

  }, [allRows, screen]);



  const metricChipItems = useMemo(() => buildMetricChipItems(kpiCards), [kpiCards]);

  const tableColumns = useMemo(
    () =>

      (screen?.columns ?? []).map((col) => ({

        key: col.key,

        label: col.label,

        widthPercent: col.widthPercent,

        render:

          col.render === "active"

            ? (row) => (

                <span className={`status-badge ${row.active === false ? "미사용" : "사용"}`}>

                  {row.activeLabel ?? (row.active === false ? "미사용" : "사용")}

                </span>

              )

            : undefined,

      })),

    [screen?.columns]

  );



  const deleteGuard = useMemo(() => {

    if (!deleteTarget || screen?.categoryKey !== "products") return { ok: true };

    return canDeleteProduct(deleteTarget.partNo);

  }, [deleteTarget, screen?.categoryKey]);



  const selectRow = (row) => {

    setActiveId(row.id);

  };



  const openRegister = (mode, row = null) => {

    setRegisterMode(mode);

    setRegisterOpen(true);

    if (mode === "edit" && row) setActiveId(row.id);

  };



  const handleSave = (form) => {

    const result =

      registerMode === "edit" && activeRow

        ? stageMasterUpdate(screen.categoryKey, activeRow.id, form)

        : stageMasterAdd(screen.categoryKey, form);



    if (!result.ok) return;

    if (screen.categoryKey === "products" && registerMode === "edit" && activeRow?.id) {

      logProductChange(activeRow.id, {

        category: "product",

        action: "제품 정보 수정",

        summary: `${form.code || activeRow.code} · ${form.name || activeRow.name}`,

      });

      setDrawingRefreshKey((key) => key + 1);

    }

    setRefreshKey((key) => key + 1);

    setRegisterOpen(false);

    if (result.row?.id) setActiveId(result.row.id);

  };



  const handleDelete = () => {

    if (!deleteTarget) return;

    const result = stageMasterDelete(screen.categoryKey, deleteTarget.id);

    if (!result.ok) return;

    if (screen.categoryKey === "products") {

      deleteProductDrawingRecord(deleteTarget.id);

    }

    setDeleteTarget(null);

    setActiveId(null);

    sessionStorage.removeItem(PRODUCT_SELECTION_KEY);

    setRefreshKey((key) => key + 1);

  };



  const handleExportExcel = async () => {
    if (!excelMasterType || exportBusy) return;
    setExportBusy(true);
    await exportMasterExcel(excelMasterType);
    setExportBusy(false);
  };

  if (!screen || screen.customScreen) return null;



  return (

    <div className={`inbound-page master-data-page${isProductsTab ? " master-data-page--products" : ""}`}>

      <SectionPageActions>
        <PrimaryButton type="button" onClick={() => openRegister("add")}>
          <Plus size={14} aria-hidden="true" />
          등록
        </PrimaryButton>
        <SecondaryButton
          type="button"
          onClick={() => openRegister("edit", activeRow)}
          disabled={!activeRow}
        >
          <Pencil size={14} aria-hidden="true" />
          수정
        </SecondaryButton>
        <SecondaryButton
          type="button"
          onClick={() => setDeleteTarget(activeRow)}
          disabled={!activeRow}
        >
          <Trash2 size={14} aria-hidden="true" />
          삭제
        </SecondaryButton>
        {hasExcelActions ? (
          <>
            <SecondaryButton type="button" onClick={() => setImportOpen(true)}>
              <FileSpreadsheet size={14} aria-hidden="true" />
              Excel 가져오기
            </SecondaryButton>
            <SecondaryButton type="button" onClick={handleExportExcel} disabled={exportBusy}>
              <Download size={14} aria-hidden="true" />
              Excel 내보내기
            </SecondaryButton>
          </>
        ) : null}
      </SectionPageActions>

      <TitanKpiBarSlot ariaLabel="현황판" className="inbound-page__kpi">
        <TitanWorkflowStatusChipBar items={metricChipItems} ariaLabel="현황판" />
      </TitanKpiBarSlot>



      <TitanSearchPanel

        draft={draft}

        onDraftChange={onDraftChange}

        onSearch={onSearch}

        onReset={onReset}

        advancedOpen={isProductsTab ? advancedOpen : false}

        onAdvancedToggle={() => (isProductsTab ? setAdvancedOpen((open) => !open) : undefined)}

        advancedContent={

          isProductsTab ? (

            <div className="product-master-search-advanced">

              <span className="product-master-search-advanced__label">사용 여부</span>

              <div className="product-master-search-advanced__options">

                {[

                  { value: "", label: "전체" },

                  { value: "active", label: "사용" },

                  { value: "inactive", label: "미사용" },

                ].map((option) => (

                  <label key={option.value || "all"} className="product-master-search-advanced__option">

                    <input

                      type="radio"

                      name="productActiveStatus"

                      checked={(draft.activeStatus ?? "") === option.value}

                      onChange={() => onDraftChange({ ...draft, activeStatus: option.value })}

                    />

                    {option.label}

                  </label>

                ))}

              </div>

            </div>

          ) : null

        }

        companies={[]}

        records={filteredRows}

      />



      <div className="inbound-page__workspace">

        <div className="inbound-page__list">

          <TitanDataTable

            className="inbound-page__table"

            columns={tableColumns}

            rows={pagedRows}

            activeRowId={activeId}

            expandedRowId={expandedRowId}

            onExpandedRowChange={setExpandedRowId}

            renderExpandedRow={(row) => (

              <div className="titan-list-expand">

                <dl className="inbound-detail titan-list-expand__detail">

                  {screen.detailFields.map((field) => (

                    <div key={field.key}>

                      <dt>{field.label}</dt>

                      <dd>{renderDetailValue(row, field)}</dd>

                    </div>

                  ))}

                </dl>

              </div>

            )}

            onRowClick={selectRow}

            onRowDoubleClick={(row) => openRegister("edit", row)}

            emptyMessage="등록된 기준정보가 없습니다."

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



        {activeRow ? (

          <TitanDetailPanel

            className={isProductsTab ? "product-detail-panel" : ""}

            showProcessFlow={false}

            detailContent={

              isProductsTab ? (

                <ProductDrawingDetailPanel

                  product={activeRow}

                  detailFields={screen.detailFields}

                  refreshKey={drawingRefreshKey}

                  onRefresh={() => setDrawingRefreshKey((key) => key + 1)}

                />

              ) : (

                <dl className="inbound-detail">

                  {screen.detailFields.map((field) => (

                    <div key={field.key}>

                      <dt>{field.label}</dt>

                      <dd>{renderDetailValue(activeRow, field)}</dd>

                    </div>

                  ))}

                </dl>

              )

            }

          />

        ) : null}

      </div>



      <MasterDataRegisterModal

        open={registerOpen}

        onClose={() => setRegisterOpen(false)}

        onSave={handleSave}

        screen={screen}

        mode={registerMode}

        initialRow={registerMode === "edit" ? activeRow : null}

      />



      {hasExcelActions && excelMasterType ? (
        <MasterExcelImportModal
          masterType={excelMasterType}
          open={importOpen}
          onClose={() => setImportOpen(false)}
          onComplete={() => {
            setRefreshKey((key) => key + 1);
            setPage(1);
          }}
        />
      ) : null}



      {deleteTarget ? (

        <MasterDataDeleteDialog

          row={deleteTarget}

          categoryLabel={screen.title}

          blocked={!deleteGuard.ok}

          blockedMessage={deleteGuard.message}

          confirmMessage={isWorkersTab ? "미사용 처리하시겠습니까?" : "정말 삭제하시겠습니까?"}

          softDelete={isWorkersTab}

          onConfirm={handleDelete}

          onClose={() => setDeleteTarget(null)}

        />

      ) : null}

    </div>

  );

}



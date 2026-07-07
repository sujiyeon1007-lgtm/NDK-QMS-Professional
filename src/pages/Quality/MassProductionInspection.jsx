import { useMemo, useState, useCallback, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import StatusChip from "../../foundation/components/StatusChip";
import TitanDataTable from "../../foundation/components/DataTable";
import TitanSearchPanel, {
  TitanAdvancedSearchField,
  useSearchSuggestionHelpers,
} from "../../foundation/components/TitanSearchPanel";
import TitanStandardProductAdvancedSearch from "../../foundation/components/TitanStandardProductAdvancedSearch";
import TitanAdvancedSearchGrid from "../../foundation/components/TitanAdvancedSearchGrid";
import {
  AssigneeField,
  DateRangeField,
} from "../../foundation/components/TitanSearchAdvancedFields";
import TitanTableFooter from "../../foundation/components/TitanTableFooter";
import TitanKpiBarSlot from "../../foundation/components/TitanKpiBarSlot";
import TitanWorkflowStatusChipBar from "../../foundation/components/TitanWorkflowStatusChipBar";
import { useWorkflowChipFilter } from "../../foundation/hooks/useWorkflowChipFilter";
import {
  createEmptyInspectionManagementSearch,
  STANDARD_PRODUCT_BASIC_SEARCH_FIELDS,
} from "../../config/listSearchStandard";
import { buildMassInspectionListColumns } from "../../config/standardProductList";
import { renderWorkflowProcessChip } from "../../utils/workflowProcessChip";
import {
  getProductionProcessCodes,
} from "../../config/productionProcessCodes";
import { useTitanListSearch } from "../../foundation/hooks/useTitanListSearch";
import { useListPagination } from "../../foundation/hooks/useListPagination";
import { getMasterDataByCategory } from "../../utils/masterData";
import { cancelInspectionRegistration } from "../../utils/inspectionLogSession";
import {
  getMassProductionInspectionRows,
  matchesMassProductionInspectionSearch,
} from "../../utils/massProductionInspection";
import {
  isMassInspectionRegisterEligible,
  navigateToInspectionRegister,
} from "../../utils/inspectionRegisterNavigation";
import { getInspectionMassScreenData } from "../../utils/qualityWorkspaceData";
import InspectionRegisterRowActions from "./InspectionRegisterRowActions";
import TitanScreenDetailPopup from "../../foundation/components/TitanScreenDetailPopup";
import { openRowDetailPopup } from "../../foundation/utils/openRowDetailPopup";
import "../InOut/InboundManagement.css";
import "./QualityManagement.css";

export default function MassProductionInspection() {
  const navigate = useNavigate();
  const location = useLocation();
  const [refreshKey, setRefreshKey] = useState(0);
  const { search, draft, onDraftChange, onSearch, onReset, advancedOpen, onAdvancedToggle } =
    useTitanListSearch(createEmptyInspectionManagementSearch, { storageKey: "inspection-mass" });
  const [selectedIds, setSelectedIds] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [detailPopupRow, setDetailPopupRow] = useState(null);
  const screenData = useMemo(() => getInspectionMassScreenData(), [refreshKey]);
  const chipRecords = screenData.baseRecords;
  const { activeChipId, handleChipClick } = useWorkflowChipFilter({
    draft,
    onDraftChange,
    onReset,
  });

  useEffect(() => {
    if (location.state?.inspectionRefresh) {
      setRefreshKey((value) => value + 1);
      const targetId = location.state?.activeId;
      if (targetId) {
        const targetRow = getMassProductionInspectionRows().find(
          (row) => row.rowKey === targetId || row.managementId === targetId || row.logId === targetId
        );
        setActiveId(targetRow?.rowKey ?? targetId);
      }
    }
  }, [location.state]);

  const companies = useMemo(() => getMasterDataByCategory("companies"), []);
  const processCodes = useMemo(() => getProductionProcessCodes(), []);
  const searchRecords = useMemo(() => screenData.baseRecords, [screenData.baseRecords]);
  const { getSuggestions } = useSearchSuggestionHelpers(searchRecords, {
    process: processCodes.map((item) => item.name),
  });

  const rows = useMemo(() => {
    return screenData.baseRecords
      .filter((row) => matchesMassProductionInspectionSearch(row, search))
      .sort((a, b) => b.registeredDate.localeCompare(a.registeredDate));
  }, [search, screenData.baseRecords]);

  const {
    page,
    pageSize,
    totalCount,
    totalPages,
    pagedItems: pagedRows,
    setPage,
    setPageSize,
  } = useListPagination(rows);

  const activeRow = rows.find((row) => row.rowKey === activeId) ?? null;

  const handleSelectCoLotProduct = (managementId) => {
    const target = rows.find((row) => row.managementId === managementId);
    if (target) setActiveId(target.rowKey);
  };

  const toggleRow = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const toggleAll = () => {
    if (selectedIds.length === pagedRows.length && pagedRows.every((row) => selectedIds.includes(row.rowKey))) {
      setSelectedIds((prev) => prev.filter((id) => !pagedRows.some((row) => row.rowKey === id)));
    } else {
      setSelectedIds((prev) => [...new Set([...prev, ...pagedRows.map((row) => row.rowKey)])]);
    }
  };

  const handleRegister = useCallback(
    (row) => {
      const managementId = String(row?.managementId ?? row?.record?.id ?? "").trim();
      if (!managementId || managementId === "—") {
        window.alert("관리번호가 없어 검사등록을 진행할 수 없습니다.");
        return;
      }
      if (!isMassInspectionRegisterEligible(row)) {
        window.alert("검사대기 상태의 제품만 등록할 수 있습니다.");
        return;
      }
      navigateToInspectionRegister(navigate, { managementId });
    },
    [navigate]
  );

  const handleEdit = useCallback(
    (row) => {
      if (!row?.logId) return;
      navigate(`/quality/inspection/${row.logId}/report`);
    },
    [navigate]
  );

  const handleDelete = useCallback((row) => {
    if (!row?.logId) return;
    const confirmed = globalThis.confirm?.("검사 등록을 취소하고 검사대기 상태로 되돌리시겠습니까?");
    if (!confirmed) return;
    cancelInspectionRegistration(row.logId);
    setRefreshKey((value) => value + 1);
  }, []);

  const openDetailPopup = useCallback((row) => {
    openRowDetailPopup(row, { setActiveId, setDetailPopupRow, getRowId: (r) => r.rowKey });
  }, []);

  const columns = useMemo(
    () =>
      buildMassInspectionListColumns({
        renderStatus: (row) => (
          <StatusChip variant={row.statusVariant}>{row.statusLabel}</StatusChip>
        ),
        renderProcess: (row) => renderWorkflowProcessChip(row),
        renderActions: (row) => {
          const canRegister = isMassInspectionRegisterEligible(row);
          const isDone = Boolean(row.logId);
          return (
            <InspectionRegisterRowActions
              canRegister={canRegister}
              canEdit={isDone}
              canDelete={isDone}
              onRegister={() => handleRegister(row)}
              onEdit={() => handleEdit(row)}
              onDelete={() => handleDelete(row)}
            />
          );
        },
      }),
    [handleRegister, handleEdit, handleDelete]
  );

  return (
    <div className="inbound-page quality-page">
      <TitanKpiBarSlot ariaLabel="검사 현황" className="inbound-page__kpi">
        <TitanWorkflowStatusChipBar
          chipSetId="inspection"
          records={chipRecords}
          activeId={activeChipId}
          onChipClick={handleChipClick}
        />
      </TitanKpiBarSlot>

      <TitanSearchPanel
        draft={draft}
        onDraftChange={onDraftChange}
        onSearch={onSearch}
        onReset={onReset}
        advancedOpen={advancedOpen}
        onAdvancedToggle={onAdvancedToggle}
        companies={companies}
        records={searchRecords}
        basicFields={STANDARD_PRODUCT_BASIC_SEARCH_FIELDS}
        showStatusField
        statusFieldLabel="현재상태"
        advancedContent={
          <div className="titan-advanced-search__rows">
            <TitanStandardProductAdvancedSearch
              draft={draft}
              onDraftChange={onDraftChange}
              getSuggestions={getSuggestions}
            />
            <TitanAdvancedSearchGrid>
              <DateRangeField
                label="검사등록일"
                fromKey="registeredDateFrom"
                toKey="registeredDateTo"
                draft={draft}
                onDraftChange={onDraftChange}
              />
              <AssigneeField draft={draft} onDraftChange={onDraftChange} getSuggestions={getSuggestions} />
              <TitanAdvancedSearchField
                label="비고"
                fieldKey="note"
                value={draft.note ?? ""}
                onChange={(value) => onDraftChange({ ...draft, note: value })}
                placeholder="비고"
              />
            </TitanAdvancedSearchGrid>
          </div>
        }
      />

      <div className="inbound-page__list quality-page__list">
        <TitanDataTable
          className="inbound-page__table"
          columns={columns}
          rows={pagedRows}
          getRowId={(row) => row.rowKey}
          selectable
          selectedRowIds={selectedIds}
          onToggleRow={toggleRow}
          onToggleAll={toggleAll}
          activeRowId={activeRow?.rowKey}
          onRowClick={(row) => setActiveId(row.rowKey)}
          onRowDoubleClick={openDetailPopup}
          emptyMessage="열처리완료 · 검사대기 제품이 없습니다."
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

      <TitanScreenDetailPopup
        screenKey="inspection"
        open={Boolean(detailPopupRow)}
        onClose={() => setDetailPopupRow(null)}
        record={detailPopupRow}
        context={{
          onSelectCoLotProduct: (managementId) => {
            const target = rows.find((row) => row.managementId === managementId);
            if (target) {
              setActiveId(target.rowKey);
              setDetailPopupRow(target);
            }
          },
        }}
      />
    </div>
  );
}

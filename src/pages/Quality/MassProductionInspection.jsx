import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import StatusChip from "../../foundation/components/StatusChip";
import TitanDataTable from "../../foundation/components/DataTable";
import TitanSearchPanel, {
  TitanAdvancedSearchField,
  useSearchSuggestionHelpers,
} from "../../foundation/components/TitanSearchPanel";
import TitanAdvancedSearchGrid from "../../foundation/components/TitanAdvancedSearchGrid";
import {
  AssigneeField,
  CustomerLotNoField,
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
import { MASS_INSPECTION_STATUS } from "../../config/inspectionManagement";
import {
  getProcessChipVariant,
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
import { getSessionProductionRecords } from "../../utils/productionRecords";
import InspectionRegisterRowActions from "./InspectionRegisterRowActions";
import TitanScreenDetailPopup from "../../foundation/components/TitanScreenDetailPopup";
import { openRowDetailPopup } from "../../foundation/utils/openRowDetailPopup";
import "../InOut/InboundManagement.css";
import "./QualityManagement.css";

export default function MassProductionInspection() {
  const navigate = useNavigate();
  const [refreshKey, setRefreshKey] = useState(0);
  const { search, draft, onDraftChange, onSearch, onReset, advancedOpen, onAdvancedToggle } =
    useTitanListSearch(createEmptyInspectionManagementSearch, { storageKey: "inspection-mass" });
  const [selectedIds, setSelectedIds] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [detailPopupRow, setDetailPopupRow] = useState(null);
  const chipRecords = useMemo(() => getSessionProductionRecords(), [refreshKey]);
  const { activeChipId, handleChipClick } = useWorkflowChipFilter({
    draft,
    onDraftChange,
    onReset,
  });

  const companies = useMemo(() => getMasterDataByCategory("companies"), []);
  const processCodes = useMemo(() => getProductionProcessCodes(), []);
  const searchRecords = useMemo(() => getMassProductionInspectionRows(), [refreshKey]);
  const { getSuggestions } = useSearchSuggestionHelpers(searchRecords, {
    process: processCodes.map((item) => item.name),
  });

  const rows = useMemo(() => {
    return getMassProductionInspectionRows()
      .filter((row) => matchesMassProductionInspectionSearch(row, search))
      .sort((a, b) => b.registeredDate.localeCompare(a.registeredDate));
  }, [search, refreshKey]);

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

  const handleRegister = (row) => {
    if (!row?.managementId) return;
    navigate(`/quality/inspection/register?managementId=${encodeURIComponent(row.managementId)}`);
  };

  const handleEdit = (row) => {
    if (!row?.logId) return;
    navigate(`/quality/inspection/${row.logId}/report`);
  };

  const handleDelete = (row) => {
    if (!row?.logId) return;
    const confirmed = globalThis.confirm?.("검사 등록을 취소하고 검사대기 상태로 되돌리시겠습니까?");
    if (!confirmed) return;
    cancelInspectionRegistration(row.logId);
    setRefreshKey((value) => value + 1);
  };

  const openDetailPopup = (row) => {
    openRowDetailPopup(row, { setActiveId, setDetailPopupRow, getRowId: (r) => r.rowKey });
  };

  const columns = useMemo(
    () =>
      buildMassInspectionListColumns({
        renderStatus: (row) => (
          <StatusChip variant={row.statusVariant}>{row.statusLabel}</StatusChip>
        ),
        renderProcess: (row) =>
          row.processName && row.processName !== "—" ? (
            <StatusChip variant={getProcessChipVariant(row.processName)}>{row.processName}</StatusChip>
          ) : (
            "—"
          ),
        renderActions: (row) => {
          const isWaiting = row.statusLabel === MASS_INSPECTION_STATUS.WAIT;
          const isDone = row.statusLabel === MASS_INSPECTION_STATUS.DONE;
          return (
            <InspectionRegisterRowActions
              onDetail={() => {
                setActiveId(row.rowKey);
                setDetailPopupRow(row);
              }}
              canRegister={isWaiting}
              canEdit={isDone}
              canDelete={isDone}
              onRegister={() => handleRegister(row)}
              onEdit={() => handleEdit(row)}
              onDelete={() => handleDelete(row)}
            />
          );
        },
      }),
    []
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
            <TitanAdvancedSearchGrid>
              <DateRangeField
                label="등록일"
                fromKey="registeredDateFrom"
                toKey="registeredDateTo"
                draft={draft}
                onDraftChange={onDraftChange}
              />
              <AssigneeField draft={draft} onDraftChange={onDraftChange} getSuggestions={getSuggestions} />
              <CustomerLotNoField draft={draft} onDraftChange={onDraftChange} getSuggestions={getSuggestions} />
              <TitanAdvancedSearchField
                label="재질"
                fieldKey="material"
                value={draft.material ?? ""}
                onChange={(value) => onDraftChange({ ...draft, material: value })}
                suggestions={getSuggestions("material", draft.material)}
                placeholder="재질"
              />
            </TitanAdvancedSearchGrid>
            <TitanAdvancedSearchGrid>
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
          emptyMessage="생산완료 · 검사대기 제품이 없습니다."
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
          traceRecord: detailPopupRow?.record,
          statusLabel: detailPopupRow?.statusLabel,
          statusVariant: detailPopupRow?.statusVariant,
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

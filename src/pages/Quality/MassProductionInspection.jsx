import { useMemo, useState, useCallback, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Plus } from "lucide-react";
import { PrimaryButton } from "../../foundation/components/Button";
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
import { buildMassInspectionListColumns, buildInspectionStatusListColumns } from "../../config/standardProductList";
import { INSPECTION_TYPE } from "../../config/inspectionManagement";
import { renderWorkflowProcessChip } from "../../utils/workflowProcessChip";
import {
  getProductionProcessCodes,
} from "../../config/productionProcessCodes";
import { useTitanListSearch } from "../../foundation/hooks/useTitanListSearch";
import { useListPagination } from "../../foundation/hooks/useListPagination";
import { getMasterDataByCategory } from "../../utils/masterData";
import {
  addInspectionLogAttachments,
  cancelInspectionRegistration,
  removeInspectionLogAttachment,
} from "../../utils/inspectionLogSession";
import {
  getMassProductionInspectionRows,
  matchesMassProductionInspectionSearch,
} from "../../utils/massProductionInspection";
import {
  isMassInspectionRegisterEligible,
  navigateToInspectionRegister,
} from "../../utils/inspectionRegisterNavigation";
import { getInspectionMassScreenData, getInspectionStatusScreenData } from "../../utils/qualityWorkspaceData";
import InspectionRegisterRowActions from "./InspectionRegisterRowActions";
import TitanScreenDetailPopup from "../../foundation/components/TitanScreenDetailPopup";
import FoundationAttachment, {
  FoundationAttachmentBadge,
  FoundationAttachmentPopup,
} from "../../foundation/components/FoundationAttachment";
import { openRowDetailPopup } from "../../foundation/utils/openRowDetailPopup";
import TitanWorkflowNavigation from "../../foundation/components/TitanWorkflowNavigation";
import "../InOut/InboundManagement.css";
import "./QualityManagement.css";

export default function MassProductionInspection({
  viewMode = "task",
  pageHeading = "",
  sectionHeading = "",
  inspectionTypeFilter = null,
  showToolbarRegister = true,
  showWorkflowNav = true,
  showKpi = true,
  registerOnlyActions = false,
  registerCategory = "양산",
  searchStorageKey = null,
} = {}) {
  const isStatusView = viewMode === "status";
  const navigate = useNavigate();
  const location = useLocation();
  const [refreshKey, setRefreshKey] = useState(0);
  const listStorageKey =
    searchStorageKey ??
    (viewMode === "status"
      ? "inspection-status"
      : inspectionTypeFilter === INSPECTION_TYPE.DEVELOPMENT
        ? "inspection-dev-register"
        : "inspection-mass-register");
  const { search, draft, onDraftChange, onSearch, onReset, advancedOpen, onAdvancedToggle } =
    useTitanListSearch(createEmptyInspectionManagementSearch, { storageKey: listStorageKey });
  const [selectedIds, setSelectedIds] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [detailPopupRow, setDetailPopupRow] = useState(null);
  const [attachmentPopupRow, setAttachmentPopupRow] = useState(null);
  const screenData = useMemo(
    () =>
      viewMode === "status"
        ? getInspectionStatusScreenData()
        : getInspectionMassScreenData(undefined, inspectionTypeFilter),
    [refreshKey, viewMode, inspectionTypeFilter]
  );
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
        const targetRow = getMassProductionInspectionRows({ inspectionType: inspectionTypeFilter }).find(
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

  const openDetailPopup = useCallback((row) => {
    openRowDetailPopup(row, { setActiveId, setDetailPopupRow, getRowId: (r) => r.rowKey });
  }, []);

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
      navigateToInspectionRegister(navigate, { managementId, category: registerCategory });
    },
    [navigate, registerCategory]
  );

  const openToolbarRegister = useCallback(() => {
    const selectedRows = rows.filter((row) => selectedIds.includes(row.rowKey));
    let target = null;

    if (activeRow && isMassInspectionRegisterEligible(activeRow)) {
      target = activeRow;
    } else if (selectedRows.length === 1 && isMassInspectionRegisterEligible(selectedRows[0])) {
      target = selectedRows[0];
    } else if (selectedRows.length > 1) {
      window.alert("등록할 제품을 한 건만 선택해 주세요.");
      return;
    } else if (activeRow?.managementId && activeRow.managementId !== "—") {
      window.alert("검사대기 상태의 제품만 등록할 수 있습니다.");
      return;
    } else {
      navigateToInspectionRegister(navigate, { category: registerCategory });
      return;
    }

    handleRegister(target);
  }, [activeRow, handleRegister, navigate, registerCategory, rows, selectedIds, showToolbarRegister]);

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

  const handleUploadAttachments = useCallback((files) => {
    if (!detailPopupRow?.logId) return;
    const updated = addInspectionLogAttachments(detailPopupRow.logId, files);
    if (!updated) return;
    setRefreshKey((value) => value + 1);
    setDetailPopupRow((current) =>
      current
        ? {
            ...current,
            log: updated,
            attachments: updated.attachments,
            attachmentCount: updated.attachments.length,
          }
        : current
    );
  }, [detailPopupRow?.logId]);

  const handleDeleteAttachment = useCallback((attachmentId) => {
    if (!detailPopupRow?.logId) return;
    const updated = removeInspectionLogAttachment(detailPopupRow.logId, attachmentId);
    if (!updated) return;
    setRefreshKey((value) => value + 1);
    setDetailPopupRow((current) =>
      current
        ? {
            ...current,
            log: updated,
            attachments: updated.attachments,
            attachmentCount: updated.attachments.length,
          }
        : current
    );
  }, [detailPopupRow?.logId]);

  const columns = useMemo(
    () => {
      if (isStatusView) {
        return buildInspectionStatusListColumns({
          renderProcess: (row) => renderWorkflowProcessChip(row),
          renderResult: (row) => (
            <StatusChip variant={row.statusVariant}>{row.inspectionResult || row.statusLabel}</StatusChip>
          ),
          renderAttachments: (row) => (
            <FoundationAttachmentBadge
              count={row.attachmentCount}
              onClick={(event) => {
                event.stopPropagation();
                setAttachmentPopupRow(row);
              }}
            />
          ),
        });
      }

      return buildMassInspectionListColumns({
        renderStatus: (row) => (
          <StatusChip variant={row.statusVariant}>{row.statusLabel}</StatusChip>
        ),
        renderProcess: (row) => renderWorkflowProcessChip(row),
        renderAttachments: (row) => (
          <FoundationAttachmentBadge
            count={row.attachmentCount}
            onClick={(event) => {
              event.stopPropagation();
              setAttachmentPopupRow(row);
            }}
          />
        ),
        renderActions: (row) => {
          const canRegister = isMassInspectionRegisterEligible(row);
          const isDone = Boolean(row.logId);
          if (registerOnlyActions) {
            return (
              <InspectionRegisterRowActions
                canRegister={canRegister}
                canEdit={false}
                canDelete={false}
                onRegister={() => handleRegister(row)}
              />
            );
          }
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
      });
    },
    [handleRegister, handleEdit, handleDelete, isStatusView, registerOnlyActions]
  );

  return (
    <div className={`inbound-page quality-page${isStatusView ? " quality-page--inquiry" : ""}${sectionHeading ? " quality-page--section" : ""}`}>
      {sectionHeading ? (
        <div className="inbound-page__history-heading quality-page__section-heading" role="heading" aria-level="2">
          {sectionHeading}
        </div>
      ) : null}
      {pageHeading ? (
        <div className="inbound-page__history-heading" role="heading" aria-level="2">
          {pageHeading}
        </div>
      ) : null}
      {!isStatusView && showToolbarRegister ? (
        <div className="titan-section-page__inline-actions" role="toolbar" aria-label={`${sectionHeading || "검사"} 작업`}>
          <PrimaryButton type="button" onClick={openToolbarRegister}>
            <Plus size={14} aria-hidden="true" />
            등록
          </PrimaryButton>
        </div>
      ) : null}

      {!isStatusView && showWorkflowNav ? <TitanWorkflowNavigation stepId="inspectionRegister" /> : null}

      {showKpi ? (
      <TitanKpiBarSlot ariaLabel={isStatusView ? "검사 이력" : "검사 등록"} className="inbound-page__kpi">
        <TitanWorkflowStatusChipBar
          chipSetId="inspection"
          records={chipRecords}
          activeId={activeChipId}
          onChipClick={handleChipClick}
        />
      </TitanKpiBarSlot>
      ) : null}

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
                label="첨부파일"
                fieldKey="attachmentStatus"
                value={draft.attachmentStatus ?? ""}
                onChange={(value) => onDraftChange({ ...draft, attachmentStatus: value })}
                placeholder="등록 / 미등록 / 파일명"
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
          selectable={!isStatusView}
          selectedRowIds={isStatusView ? [] : selectedIds}
          onToggleRow={isStatusView ? undefined : toggleRow}
          onToggleAll={isStatusView ? undefined : toggleAll}
          activeRowId={activeRow?.rowKey}
          onRowClick={(row) => setActiveId(row.rowKey)}
          onRowDoubleClick={openDetailPopup}
          emptyMessage={
            isStatusView
              ? "등록된 검사 이력이 없습니다."
              : "열처리완료 · 검사대기 제품이 없습니다."
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

      <TitanScreenDetailPopup
        screenKey="inspection"
        open={Boolean(detailPopupRow)}
        onClose={() => setDetailPopupRow(null)}
        record={detailPopupRow}
        context={{
          eventLists: {
            attachments: (
              <FoundationAttachment
                attachments={detailPopupRow?.attachments ?? detailPopupRow?.log?.attachments ?? []}
                disabled={isStatusView || !detailPopupRow?.logId}
                onUpload={isStatusView ? undefined : handleUploadAttachments}
                onDelete={isStatusView ? undefined : handleDeleteAttachment}
              />
            ),
          },
          onSelectCoLotProduct: (managementId) => {
            const target = rows.find((row) => row.managementId === managementId);
            if (target) {
              setActiveId(target.rowKey);
              setDetailPopupRow(target);
            }
          },
        }}
      />

      <FoundationAttachmentPopup
        open={Boolean(attachmentPopupRow)}
        title="첨부파일"
        attachments={attachmentPopupRow?.attachments ?? []}
        onClose={() => setAttachmentPopupRow(null)}
      />
    </div>
  );
}

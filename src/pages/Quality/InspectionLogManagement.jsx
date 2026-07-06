import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileSpreadsheet, FileText, Plus } from "lucide-react";
import { PrimaryButton, SecondaryButton } from "../../foundation/components/Button";
import StatusChip from "../../foundation/components/StatusChip";
import TitanDataTable from "../../foundation/components/DataTable";
import TitanSearchPanel, {
  useSearchSuggestionHelpers,
} from "../../foundation/components/TitanSearchPanel";
import TitanStandardProductAdvancedSearch from "../../foundation/components/TitanStandardProductAdvancedSearch";
import TitanTableFooter from "../../foundation/components/TitanTableFooter";
import { openRowDetailPopup } from "../../foundation/utils/openRowDetailPopup";
import TitanScreenDetailPopup from "../../foundation/components/TitanScreenDetailPopup";
import InspectionRegisterRowActions from "./InspectionRegisterRowActions";
import TitanKpiBarSlot from "../../foundation/components/TitanKpiBarSlot";
import TitanWorkflowStatusChipBar from "../../foundation/components/TitanWorkflowStatusChipBar";
import { useWorkflowChipFilter } from "../../foundation/hooks/useWorkflowChipFilter";
import { createEmptyInspectionLogSearch, STANDARD_PRODUCT_BASIC_SEARCH_FIELDS } from "../../config/listSearchStandard";
import { buildInspectionLogListColumns } from "../../config/standardProductList";
import { INSPECTION_LOG_REGISTER_LABEL, INSPECTION_REPORT_LABEL } from "../../config/registerModalStandard";
import { renderWorkflowProcessChip } from "../../utils/workflowProcessChip";
import {
  getProcessChipVariant,
  getProductionProcessCodes,
} from "../../config/productionProcessCodes";
import { useTitanListSearch } from "../../foundation/hooks/useTitanListSearch";
import { useListPagination } from "../../foundation/hooks/useListPagination";
import { getMasterDataByCategory } from "../../utils/masterData";
import { getInspectionLogs } from "../../utils/inspectionLogSession";
import { getInspectionScreenData } from "../../utils/titanScreenDataSource";
import { ensureInspectionReportForLog } from "../../utils/inspectionReportSession";
import {
  mapInspectionLogToListRow,
  matchesInspectionLogSearch,
} from "../../utils/inspectionLogStatus";
import { getProcessFlowSteps } from "../../utils/processFlow";
import { getSessionProductionRecords } from "../../utils/productionRecords";
import "../InOut/InboundManagement.css";
import SectionPageActions from "../../foundation/layout/SectionPageActions";
import "./QualityManagement.css";

export default function InspectionLogManagement() {
  const navigate = useNavigate();
  const [refreshKey, setRefreshKey] = useState(0);
  const { search, draft, onDraftChange, onSearch, onReset, advancedOpen, onAdvancedToggle } =
    useTitanListSearch(createEmptyInspectionLogSearch, { storageKey: "inspection-log" });
  const [selectedIds, setSelectedIds] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [detailPopupRow, setDetailPopupRow] = useState(null);
  const chipRecords = useMemo(
    () => getInspectionScreenData(getInspectionLogs()).baseRecords,
    [refreshKey]
  );
  const { activeChipId, handleChipClick } = useWorkflowChipFilter({
    draft,
    onDraftChange,
    onReset,
  });

  const companies = useMemo(() => getMasterDataByCategory("companies"), []);
  const processCodes = useMemo(() => getProductionProcessCodes(), []);
  const searchRecords = useMemo(() => getInspectionLogs(), [refreshKey]);
  const { getSuggestions } = useSearchSuggestionHelpers(searchRecords, {
    process: processCodes.map((item) => item.name),
  });

  const rows = useMemo(() => {
    return getInspectionLogs()
      .map(mapInspectionLogToListRow)
      .filter((row) => matchesInspectionLogSearch(row, search))
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

  const activeRow = pagedRows.find((row) => row.id === activeId) ?? pagedRows[0] ?? null;

  const toggleRow = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const toggleAll = () => {
    if (selectedIds.length === pagedRows.length && pagedRows.every((row) => selectedIds.includes(row.id))) {
      setSelectedIds((prev) => prev.filter((id) => !pagedRows.some((row) => row.id === id)));
    } else {
      setSelectedIds((prev) => [...new Set([...prev, ...pagedRows.map((row) => row.id)])]);
    }
  };

  const renderProcessChip = (row) => renderWorkflowProcessChip(row);

  const columns = useMemo(
    () =>
      buildInspectionLogListColumns({
        renderProcess: renderProcessChip,
        renderActions: (row) => (
          <InspectionRegisterRowActions
            onRegister={() => openRegister(row.managementId)}
            onEdit={() => {
              ensureInspectionReportForLog(row.id);
              navigate(`/quality/inspection/${row.id}/report`);
            }}
            canDelete={false}
          />
        ),
      }),
    []
  );

  const activeRecord =
    getSessionProductionRecords().find((record) => record.id === activeRow?.managementId) ?? null;

  const processFlowSteps = activeRecord ? getProcessFlowSteps(activeRecord) : [];

  const openRegister = (managementId = "") => {
    const query = managementId ? `?managementId=${encodeURIComponent(managementId)}` : "";
    navigate(`/quality/inspection/register${query}`);
  };

  const handleOpenReport = () => {
    if (!activeRow?.id) return;
    ensureInspectionReportForLog(activeRow.id);
    navigate(`/quality/inspection/${activeRow.id}/report`);
  };

  const handleDetailRegister = () => {
    if (!activeRow?.managementId || activeRow.managementId === "—") {
      openRegister();
      return;
    }
    openRegister(activeRow.managementId);
  };

  const openDetailPopup = (row) => {
    openRowDetailPopup(row, { setActiveId, setDetailPopupRow });
  };

  const handleRowDoubleClick = (row) => {
    openDetailPopup(row);
  };

  const buildInspectionLogDetailContent = (row) =>
    row ? (
      <dl className="inbound-detail">
        <div>
          <dt>관리번호</dt>
          <dd>{row.managementId}</dd>
        </div>
        <div>
          <dt>발주번호</dt>
          <dd>{row.purchaseOrderNo}</dd>
        </div>
        <div>
          <dt>LOT.NO</dt>
          <dd>{row.lotNo}</dd>
        </div>
        <div>
          <dt>업체 LOT</dt>
          <dd>{row.customerLotNo}</dd>
        </div>
        <div>
          <dt>업체명</dt>
          <dd>{row.company}</dd>
        </div>
        <div>
          <dt>품명</dt>
          <dd>{row.partName}</dd>
        </div>
        <div>
          <dt>품번</dt>
          <dd>{row.partNo}</dd>
        </div>
        <div>
          <dt>재질</dt>
          <dd>{row.material}</dd>
        </div>
        <div>
          <dt>공정</dt>
          <dd>
            {row.processName && row.processName !== "—" ? (
              <StatusChip variant={getProcessChipVariant(row.processName)}>{row.processName}</StatusChip>
            ) : (
              "—"
            )}
          </dd>
        </div>
        <div>
          <dt>검사일</dt>
          <dd>{row.inspectionDate}</dd>
        </div>
        <div>
          <dt>검사자</dt>
          <dd>{row.assignee}</dd>
        </div>
        <div>
          <dt>검사 항목</dt>
          <dd>{row.log.inspectionItems?.join(", ") || row.log.inspectionItem || "—"}</dd>
        </div>
        <div>
          <dt>검사 결과</dt>
          <dd>
            <StatusChip variant={row.statusVariant}>{row.statusLabel}</StatusChip>
          </dd>
        </div>
        <div>
          <dt>등록일</dt>
          <dd>{row.registeredDate}</dd>
        </div>
        <div>
          <dt>비고</dt>
          <dd>{row.log.note || "—"}</dd>
        </div>
      </dl>
    ) : null;

  return (
    <div className="inbound-page quality-page">
      <SectionPageActions>
        <PrimaryButton type="button" onClick={() => openRegister()}>
          <Plus size={14} aria-hidden="true" />
          {INSPECTION_LOG_REGISTER_LABEL}
        </PrimaryButton>
        <SecondaryButton type="button">
          <FileSpreadsheet size={14} aria-hidden="true" />
          엑셀 출력
        </SecondaryButton>
      </SectionPageActions>

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
          <TitanStandardProductAdvancedSearch
            draft={draft}
            onDraftChange={onDraftChange}
            getSuggestions={getSuggestions}
          />
        }
      />

      <div className="inbound-page__list quality-page__list">
        <TitanDataTable
          className="inbound-page__table"
          columns={columns}
          rows={pagedRows}
          selectable
          selectedRowIds={selectedIds}
          onToggleRow={toggleRow}
          onToggleAll={toggleAll}
          activeRowId={activeRow?.id}
          onRowClick={(row) => setActiveId(row.id)}
          onRowDoubleClick={handleRowDoubleClick}
          emptyMessage="등록된 검사일지가 없습니다."
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
        screenKey="inspectionLog"
        open={Boolean(detailPopupRow)}
        onClose={() => setDetailPopupRow(null)}
        record={detailPopupRow}
        context={{
          onSelectCoLotProduct: (id) => {
            const target = rows.find((row) => row.managementId === id || row.id === id);
            if (target) {
              setActiveId(target.id);
              setDetailPopupRow(target);
            }
          },
        }}
      />
    </div>
  );
}

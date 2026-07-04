import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { FileSpreadsheet, Plus } from "lucide-react";
import { PrimaryButton, SecondaryButton } from "../../foundation/components/Button";
import StatusChip from "../../foundation/components/StatusChip";
import TitanDataTable from "../../foundation/components/DataTable";
import TitanSearchPanel, {
  TitanAdvancedSearchField,
  useSearchSuggestionHelpers,
} from "../../foundation/components/TitanSearchPanel";
import { DateRangeField } from "../../foundation/components/TitanSearchAdvancedFields";
import TitanAdvancedSearchGrid from "../../foundation/components/TitanAdvancedSearchGrid";
import TitanTableFooter from "../../foundation/components/TitanTableFooter";
import TitanDetailPanel from "../../foundation/components/TitanDetailPanel";
import TitanKpiBarSlot from "../../foundation/components/TitanKpiBarSlot";
import TitanWorkflowStatusChipBar from "../../foundation/components/TitanWorkflowStatusChipBar";
import { buildMetricChipItems } from "../../utils/kpiMetricChipItems";
import {
  DEPARTMENT_TAB_ALL,
  DEPARTMENT_WORK_PRIORITY,
  DEPARTMENT_WORK_STATUS,
  DEPARTMENT_WORK_STATUS_CARDS,
  DEPARTMENT_WORK_STATUS_PANEL,
} from "../../config/departmentWorkDashboard";
import { createEmptyDepartmentWorkSearch } from "../../config/listSearchStandard";
import { buildDepartmentWorkListColumns } from "../../config/standardProductList";
import { DEPARTMENT_WORK_REGISTER_LABEL } from "../../config/registerModalStandard";
import { useTitanListSearch } from "../../foundation/hooks/useTitanListSearch";
import { useListPagination } from "../../foundation/hooks/useListPagination";
import { getMasterDataByCategory } from "../../utils/masterData";
import {
  buildDepartmentWorkKpiCounts,
  getDepartmentWorkTasks,
  upsertDepartmentWorkTask,
} from "../../utils/departmentWorkSession";
import {
  filterDepartmentWorkByTab,
  mapDepartmentWorkToListRow,
  matchesDepartmentWorkSearch,
} from "../../utils/departmentWorkStatus";
import { getProcessFlowSteps } from "../../utils/processFlow";
import { getSessionProductionRecords } from "../../utils/productionRecords";
import DepartmentWorkRegisterModal from "./DepartmentWorkRegisterModal";
import "../InOut/InboundManagement.css";
import SectionPageActions from "../../foundation/layout/SectionPageActions";

const PRIORITY_CHIP_VARIANT = {
  높음: "defect",
  보통: "wait",
  낮음: "hold",
};

function resolveDepartmentTab(tabParam) {
  if (!tabParam || tabParam === DEPARTMENT_TAB_ALL) return DEPARTMENT_TAB_ALL;
  if (["production", "quality", "sales"].includes(tabParam)) return tabParam;
  return DEPARTMENT_TAB_ALL;
}

export default function DepartmentWorkManagement() {
  const { departmentTab: tabParam = DEPARTMENT_TAB_ALL } = useParams();
  const departmentTab = resolveDepartmentTab(tabParam);

  const [refreshKey, setRefreshKey] = useState(0);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const { search, draft, onDraftChange, onSearch, onReset, advancedOpen, onAdvancedToggle } =
    useTitanListSearch(createEmptyDepartmentWorkSearch, {
      storageKey: `department-work-${departmentTab}`,
    });
  const [activeId, setActiveId] = useState(null);
  const [expandedRowId, setExpandedRowId] = useState(null);

  const companies = useMemo(() => getMasterDataByCategory("companies"), []);
  const searchRecords = useMemo(() => getDepartmentWorkTasks(), [refreshKey]);
  const { getSuggestions } = useSearchSuggestionHelpers(searchRecords);

  useEffect(() => {
    setActiveId(null);
    setExpandedRowId(null);
  }, [departmentTab]);

  const statusCards = useMemo(() => {
    const counts = buildDepartmentWorkKpiCounts(getDepartmentWorkTasks(), departmentTab);
    return DEPARTMENT_WORK_STATUS_CARDS.map((card) => ({
      ...card,
      count: counts[card.id] ?? 0,
    }));
  }, [refreshKey, departmentTab]);

  const metricChipItems = useMemo(() => {
    const values = Object.fromEntries(statusCards.map((card) => [card.id, card.count]));
    return buildMetricChipItems(DEPARTMENT_WORK_STATUS_CARDS, values);
  }, [statusCards]);

  const rows = useMemo(() => {
    return filterDepartmentWorkByTab(
      getDepartmentWorkTasks()
        .map(mapDepartmentWorkToListRow)
        .filter((row) => matchesDepartmentWorkSearch(row, search)),
      departmentTab
    ).sort((a, b) => {
      const statusOrder = { 진행중: 0, 대기: 1, 보류: 2, 완료: 3 };
      const statusDiff = (statusOrder[a.status] ?? 9) - (statusOrder[b.status] ?? 9);
      if (statusDiff !== 0) return statusDiff;
      return b.requestDate.localeCompare(a.requestDate);
    });
  }, [search, refreshKey, departmentTab]);

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

  const columns = useMemo(
    () =>
      buildDepartmentWorkListColumns({
        renderStatus: (row) => (
          <StatusChip variant={row.statusVariant}>{row.statusLabel}</StatusChip>
        ),
        renderPriority: (row) => (
          <StatusChip variant={PRIORITY_CHIP_VARIANT[row.priority] || "wait"}>{row.priority}</StatusChip>
        ),
      }),
    []
  );

  const activeRecord =
    getSessionProductionRecords().find((record) => record.id === activeRow?.task?.managementId) ??
    null;
  const processFlowSteps = activeRecord ? getProcessFlowSteps(activeRecord) : [];

  const openRegister = (task = null) => {
    setEditTask(task);
    setRegisterOpen(true);
  };

  const handleRegister = (form) => {
    upsertDepartmentWorkTask({
      ...form,
      id: form.id,
      createdAt: form.createdAt,
    });
    setRefreshKey((key) => key + 1);
    setPage(1);
  };

  return (
    <div className="inbound-page">
      <SectionPageActions>
        <PrimaryButton type="button" onClick={() => openRegister(null)}>
          <Plus size={14} aria-hidden="true" />
          {DEPARTMENT_WORK_REGISTER_LABEL}
        </PrimaryButton>
        <SecondaryButton type="button">
          <FileSpreadsheet size={14} aria-hidden="true" />
          엑셀 출력
        </SecondaryButton>
      </SectionPageActions>

      <TitanKpiBarSlot ariaLabel={DEPARTMENT_WORK_STATUS_PANEL.title} className="inbound-page__kpi">
        <TitanWorkflowStatusChipBar
          items={metricChipItems}
          ariaLabel={DEPARTMENT_WORK_STATUS_PANEL.title}
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
        showStatusField
        statusFieldLabel="진행상태"
        advancedContent={
          <TitanAdvancedSearchGrid>
            <TitanAdvancedSearchField
              label="업무명"
              fieldKey="title"
              value={draft.title}
              onChange={(value) => onDraftChange({ ...draft, title: value })}
              suggestions={getSuggestions("title", draft.title)}
              placeholder="업무명"
            />
            <TitanAdvancedSearchField
              label="담당자"
              fieldKey="assignee"
              value={draft.assignee}
              onChange={(value) => onDraftChange({ ...draft, assignee: value })}
              suggestions={getSuggestions("assignee", draft.assignee)}
              placeholder="담당자"
            />
            <label className="titan-advanced-search__field">
              <span className="titan-advanced-search__label">우선순위</span>
              <select
                className="titan-search-panel__select"
                value={draft.priority}
                onChange={(e) => onDraftChange({ ...draft, priority: e.target.value })}
              >
                <option value="">전체</option>
                {DEPARTMENT_WORK_PRIORITY.map((priority) => (
                  <option key={priority} value={priority}>
                    {priority}
                  </option>
                ))}
              </select>
            </label>
            <DateRangeField
              label="요청일"
              fromKey="requestDateFrom"
              toKey="requestDateTo"
              draft={draft}
              onDraftChange={onDraftChange}
            />
            <DateRangeField
              label="완료 예정일"
              fromKey="dueDateFrom"
              toKey="dueDateTo"
              draft={draft}
              onDraftChange={onDraftChange}
            />
          </TitanAdvancedSearchGrid>
        }
      />

      <div className="inbound-page__workspace">
        <div className="inbound-page__list">
          <TitanDataTable
            className="inbound-page__table"
            columns={columns}
            rows={pagedRows}
            activeRowId={activeRow?.id}
            expandedRowId={expandedRowId}
            onExpandedRowChange={setExpandedRowId}
            renderExpandedRow={(row) => (
              <div className="titan-list-expand">
                <dl className="inbound-detail titan-list-expand__detail">
                  <div>
                    <dt>업무 내용</dt>
                    <dd>{row.task.content || "—"}</dd>
                  </div>
                  <div>
                    <dt>완료 예정일</dt>
                    <dd>{row.dueDate}</dd>
                  </div>
                  <div>
                    <dt>관리번호</dt>
                    <dd>{row.task.managementId || "—"}</dd>
                  </div>
                  <div>
                    <dt>비고</dt>
                    <dd>{row.task.note || "—"}</dd>
                  </div>
                </dl>
              </div>
            )}
            onRowClick={(row) => setActiveId(row.id)}
            emptyMessage="등록된 업무가 없습니다."
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
            actionLabel={DEPARTMENT_WORK_REGISTER_LABEL}
            actionIcon={Plus}
            onAction={() => openRegister(activeRow.task)}
            processFlowSteps={processFlowSteps}
            detailContent={
              <dl className="inbound-detail">
                <div>
                  <dt>업무명</dt>
                  <dd>{activeRow.title}</dd>
                </div>
                <div>
                  <dt>담당부서</dt>
                  <dd>{activeRow.department}</dd>
                </div>
                <div>
                  <dt>담당자</dt>
                  <dd>{activeRow.assignee}</dd>
                </div>
                <div>
                  <dt>업무 내용</dt>
                  <dd>{activeRow.task.content || "—"}</dd>
                </div>
                <div>
                  <dt>요청일</dt>
                  <dd>{activeRow.requestDate}</dd>
                </div>
                <div>
                  <dt>완료 예정일</dt>
                  <dd>{activeRow.dueDate}</dd>
                </div>
                <div>
                  <dt>우선순위</dt>
                  <dd>
                    <StatusChip variant={PRIORITY_CHIP_VARIANT[activeRow.priority] || "wait"}>
                      {activeRow.priority}
                    </StatusChip>
                  </dd>
                </div>
                <div>
                  <dt>진행상태</dt>
                  <dd>
                    <StatusChip variant={activeRow.statusVariant}>{activeRow.statusLabel}</StatusChip>
                  </dd>
                </div>
                <div>
                  <dt>관리번호</dt>
                  <dd>{activeRow.task.managementId || "—"}</dd>
                </div>
                <div>
                  <dt>업체명</dt>
                  <dd>{activeRow.company}</dd>
                </div>
                <div>
                  <dt>품명</dt>
                  <dd>{activeRow.partName}</dd>
                </div>
                <div>
                  <dt>품번</dt>
                  <dd>{activeRow.partNo}</dd>
                </div>
                <div>
                  <dt>재질</dt>
                  <dd>{activeRow.material}</dd>
                </div>
                <div>
                  <dt>비고</dt>
                  <dd>{activeRow.task.note || "—"}</dd>
                </div>
              </dl>
            }
          />
        ) : null}
      </div>

      <DepartmentWorkRegisterModal
        open={registerOpen}
        onClose={() => {
          setRegisterOpen(false);
          setEditTask(null);
        }}
        onRegister={handleRegister}
        defaultDepartmentId={departmentTab === DEPARTMENT_TAB_ALL ? "quality" : departmentTab}
        initialTask={editTask}
      />
    </div>
  );
}

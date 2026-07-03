import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";

import Card from "../../foundation/components/Card";
import StatusChip from "../../foundation/components/StatusChip";
import StatusSummaryCard from "../../foundation/components/StatusSummaryCard";
import TitanStandardList from "../../foundation/components/TitanStandardList";
import TitanCollapsibleSearchPanel from "../../foundation/components/TitanCollapsibleSearchPanel";
import { SecondaryButton } from "../../foundation/components/Button";
import TitanSearchPanel, { useSearchSuggestionHelpers } from "../../foundation/components/TitanSearchPanel";
import {
  DateRangeField,
  LotNoField,
  ManagementIdField,
  ManagerField,
} from "../../foundation/components/TitanSearchAdvancedFields";
import { HOME_INTEGRATED_SEARCH_CONFIG } from "../../config/homeIntegratedSearch";
import {
  HOME_NOTICES_PREVIEW_LIMIT,
  HOME_RECENT_LIST_TITLE,
  HOME_RECENT_TABS,
  HOME_TOP_KPI_CARDS,
  HOME_WORK_SCHEDULE_PREVIEW_LIMIT,
  HOME_WORKFLOW_FULL_VIEW_PATH,
  HOME_WORKFLOW_PREVIEW_LIMIT,
} from "../../config/homeDashboard";
import {
  buildHomeTopKpiCounts,
  buildProductWorkflowPreview,
  buildRecentListByTab,
  buildTodayWorkSummary,
} from "../../utils/homeDashboardData";
import {
  HOME_TASK_STATUS,
  addUserHomeTask,
  getUserTodayTasks,
  toggleHomeTaskCompleted,
} from "../../utils/homeTasksSession";
import TitanNoticePanel from "../../foundation/components/TitanNoticePanel";
import TitanWorkflowStatusChipBar from "../../foundation/components/TitanWorkflowStatusChipBar";
import TitanWorkflowStepTrack from "../../foundation/components/TitanWorkflowStepTrack";
import { getHomeNotices } from "../../utils/homeNoticesSession";
import { buildHomeProductProgressTableColumns } from "../../config/productWorkflowList";
import HomeWorkflowProgressRate from "./HomeWorkflowProgressRate";
import HomeTaskModal from "./HomeTaskModal";

export function HomeKpiPanel({ records }) {
  const counts = useMemo(() => buildHomeTopKpiCounts(records), [records]);

  return (
    <section className="home-panel home-panel--kpi titan-card" aria-label="KPI Dashboard">
      <div className="home-kpi-row home-kpi-row--compact">
        {HOME_TOP_KPI_CARDS.map((card) => (
          <StatusSummaryCard
            key={card.id}
            {...card}
            count={counts[card.id] ?? 0}
            countSuffix={card.countSuffix}
          />
        ))}
      </div>
    </section>
  );
}

export function HomeIntegratedSearchPanel({
  draft,
  onDraftChange,
  onSearch,
  onReset,
  advancedOpen,
  onAdvancedToggle,
  companies,
  searchRecords,
}) {
  const { collapse, showStatusField, statusOptions, panelClassName, ariaLabel } =
    HOME_INTEGRATED_SEARCH_CONFIG;

  const processCodes = useMemo(
    () => [...new Set(searchRecords.map((row) => row.processName).filter(Boolean))],
    [searchRecords]
  );
  const managers = useMemo(
    () => [...new Set(searchRecords.map((row) => row.managerLabel).filter((v) => v && v !== "—"))],
    [searchRecords]
  );
  const { getSuggestions } = useSearchSuggestionHelpers(searchRecords, {
    process: processCodes,
    status: statusOptions,
    manager: managers,
  });

  return (
    <TitanCollapsibleSearchPanel
      className="home-panel home-panel--search home-search-collapse"
      closedLabel={collapse.closedLabel}
      openLabel={collapse.openLabel}
      defaultOpen={collapse.defaultOpen}
      ariaLabel={ariaLabel}
    >
      <TitanSearchPanel
        draft={draft}
        onDraftChange={onDraftChange}
        onSearch={onSearch}
        onReset={onReset}
        advancedOpen={advancedOpen}
        onAdvancedToggle={onAdvancedToggle}
        companies={companies}
        records={searchRecords}
        showStatusField={showStatusField}
        extraSuggestions={{ status: statusOptions, manager: managers }}
        className={panelClassName}
        enableEnterSearch
        advancedContent={
          <div className="titan-advanced-search__grid">
            <ManagementIdField draft={draft} onDraftChange={onDraftChange} getSuggestions={getSuggestions} />
            <LotNoField draft={draft} onDraftChange={onDraftChange} getSuggestions={getSuggestions} />
            <DateRangeField
              label="납기일"
              fromKey="dueDateFrom"
              toKey="dueDateTo"
              draft={draft}
              onDraftChange={onDraftChange}
            />
            <ManagerField draft={draft} onDraftChange={onDraftChange} getSuggestions={getSuggestions} />
          </div>
        }
      />
    </TitanCollapsibleSearchPanel>
  );
}

/** @deprecated HomeKpiPanel + HomeIntegratedSearchPanel 사용 */
export function HomeKpiSearchPanel(props) {
  return (
    <>
      <HomeKpiPanel records={props.records} />
      <HomeIntegratedSearchPanel {...props} searchRecords={props.searchRecords} />
    </>
  );
}

export function HomeTodaySummary({ records }) {
  const items = useMemo(() => buildTodayWorkSummary(records), [records]);

  return (
    <section className="home-panel home-panel--today home-panel--status-bar titan-card" aria-label="금일 업무현황">
      <div className="home-today-bar">
        <span className="home-today-bar__label">금일 업무현황</span>
        <div className="home-today-chips">
          {items.map((item) => (
            <span
              key={item.id}
              className={`home-status-chip titan-process--${item.phaseKey}`}
            >
              <span className="home-status-chip__dot" aria-hidden="true" />
              <span className="home-status-chip__label">{item.label}</span>
              <strong className="home-status-chip__value">
                {item.value.toLocaleString("ko-KR")}건
              </strong>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/** 제품 진행 Row Expand 상세 — 진행률 · 공정 Step · 메타 정보 (REV.6) */
export function HomeWorkflowRowDetail({ item }) {
  return (
    <div className="home-workflow-expand">
      <HomeWorkflowProgressRate percent={item.progressPercent} />

      <div className="home-workflow-expand__divider" aria-hidden="true" />

      <TitanWorkflowStepTrack
        phases={item.phases}
        showCaptions
        ariaLabel={`${item.managementId ?? ""} 공정 진행`}
      />

      <div className="home-workflow-expand__divider" aria-hidden="true" />

      <dl className="home-workflow-expand__meta">
        <div>
          <dt>담당자</dt>
          <dd>{item.managerLabel}</dd>
        </div>
        <div>
          <dt>예정 납기일</dt>
          <dd className={`home-due-date home-due-date--${item.dueDateTone}`}>
            <span className="home-due-date__dot" aria-hidden="true" />
            <span>{item.dueDateLabel}</span>
          </dd>
        </div>
        <div className="home-workflow-expand__meta-note">
          <dt>비고</dt>
          <dd>{item.noteLabel}</dd>
        </div>
      </dl>
    </div>
  );
}

/** ② 진행현황 — 공정 Chip 선택 (클릭 → search.status 필터) */
export function HomeProgressOverviewPanel({ records, activeChipId, onChipClick }) {
  const { chipSetId } = HOME_INTEGRATED_SEARCH_CONFIG;

  return (
    <div className="home-progress-overview" aria-label="진행현황 공정 선택">
      <TitanWorkflowStatusChipBar
        chipSetId={chipSetId}
        records={records}
        activeId={activeChipId}
        onChipClick={onChipClick}
        className="home-progress-overview__chips"
        ariaLabel="진행현황"
      />
    </div>
  );
}

/** ③ 제품 진행 리스트 — 공정 Chip + 통합검색 Filter 연동 */
export function HomeProductProgressTable({ records, search }) {
  const [expandedRowId, setExpandedRowId] = useState(null);
  const columns = useMemo(() => buildHomeProductProgressTableColumns(), []);
  const items = useMemo(
    () => buildProductWorkflowPreview(records, { limit: HOME_WORKFLOW_PREVIEW_LIMIT, search }),
    [records, search]
  );

  useEffect(() => {
    if (expandedRowId && !items.some((item) => item.managementId === expandedRowId)) {
      setExpandedRowId(null);
    }
  }, [items, expandedRowId]);

  return (
    <TitanStandardList
      columns={columns}
      rows={items}
      getRowId={(row) => row.managementId}
      expandedRowId={expandedRowId}
      onExpandedRowChange={setExpandedRowId}
      renderExpandedRow={(row) => <HomeWorkflowRowDetail item={row} />}
      emptyMessage="진행 중인 제품이 없습니다."
      ariaLabel="제품 진행 리스트"
    />
  );
}

/** 진행현황 Panel — Overview + Product Table (REV.1 + 기능 복구) */
export function HomeProgressPanel({ records, search, activeChipId, onChipClick }) {
  return (
    <Card className="home-panel home-panel--progress">
      <div className="home-panel__head">
        <h3>진행현황</h3>
        <Link to={HOME_WORKFLOW_FULL_VIEW_PATH} className="home-panel__link-btn">
          전체 보기
        </Link>
      </div>
      <HomeProgressOverviewPanel
        records={records}
        activeChipId={activeChipId}
        onChipClick={onChipClick}
      />
      <HomeProductProgressTable records={records} search={search} />
    </Card>
  );
}

/** @deprecated HomeProgressPanel 사용 */
export function HomeProductWorkflowPanel(props) {
  return <HomeProgressPanel {...props} />;
}

export function HomeWorkSchedulePanel({ refreshKey, onRefresh }) {
  const [modalOpen, setModalOpen] = useState(false);
  const tasks = useMemo(
    () => getUserTodayTasks().slice(0, HOME_WORK_SCHEDULE_PREVIEW_LIMIT),
    [refreshKey]
  );

  const handleToggle = (task) => {
    toggleHomeTaskCompleted(task.id, task.status !== HOME_TASK_STATUS.DONE);
    onRefresh?.();
  };

  const handleSave = (payload) => {
    addUserHomeTask(payload);
    setModalOpen(false);
    onRefresh?.();
  };

  return (
    <Card className="home-panel home-panel--schedule">
      <div className="home-panel__head">
        <h3>업무일정</h3>
        <SecondaryButton type="button" onClick={() => setModalOpen(true)}>
          <Plus size={14} />
          추가
        </SecondaryButton>
      </div>
      <ul className="home-todo-list">
        {tasks.length === 0 ? (
          <li className="home-empty">등록된 일정이 없습니다.</li>
        ) : (
          tasks.map((task) => {
            const done = task.status === HOME_TASK_STATUS.DONE;
            return (
              <li key={task.id} className={done ? "is-done" : "is-progress"}>
                <label className="home-todo-list__item">
                  <input
                    type="checkbox"
                    checked={done}
                    onChange={() => handleToggle(task)}
                  />
                  <span className="home-todo-list__title">{task.title}</span>
                  <span className={`home-todo-list__status status-badge ${done ? "완료" : "진행중"}`}>
                    {task.status}
                  </span>
                </label>
              </li>
            );
          })
        )}
      </ul>
      {modalOpen ? (
        <HomeTaskModal mode="add" onSave={handleSave} onClose={() => setModalOpen(false)} />
      ) : null}
    </Card>
  );
}

/** @deprecated HomeWorkSchedulePanel 사용 */
export function HomeTodoPanel(props) {
  return <HomeWorkSchedulePanel {...props} />;
}

export function HomeNoticePanel({ refreshKey }) {
  const [expanded, setExpanded] = useState(false);
  const notices = useMemo(() => getHomeNotices(), [refreshKey]);

  return (
    <Card
      className={`home-panel home-panel--notice${expanded ? " is-expanded" : ""}`.trim()}
    >
      <TitanNoticePanel
        title="공지사항"
        notices={notices}
        previewLimit={HOME_NOTICES_PREVIEW_LIMIT}
        headClassName="home-panel__head"
        onExpandedChange={setExpanded}
      />
    </Card>
  );
}

export function HomeRecentWorkPanel({ records }) {
  const [activeTab, setActiveTab] = useState(HOME_RECENT_TABS[0]?.id ?? "incoming");
  const items = useMemo(
    () => buildRecentListByTab(records, activeTab).slice(0, 5),
    [records, activeTab]
  );

  return (
    <Card className="home-panel home-panel--recent">
      <div className="home-panel__head">
        <h3>{HOME_RECENT_LIST_TITLE}</h3>
      </div>
      <div className="home-recent-tabs" role="tablist" aria-label={HOME_RECENT_LIST_TITLE}>
        {HOME_RECENT_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            className={`home-recent-tabs__btn${activeTab === tab.id ? " is-active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <ul className="home-recent-list">
        {items.length === 0 ? (
          <li className="home-empty">표시할 이력이 없습니다.</li>
        ) : (
          items.map((item) => (
            <li key={`${activeTab}-${item.managementId}`} className="home-recent-list__item">
              <div className="home-recent-list__main">
                <strong>{item.managementId}</strong>
                <span>{item.company}</span>
                <span>{item.partName}</span>
              </div>
              <div className="home-recent-list__meta">
                <StatusChip variant={item.statusVariant}>{item.statusLabel}</StatusChip>
                <span>{item.registeredAt}</span>
              </div>
            </li>
          ))
        )}
      </ul>
    </Card>
  );
}

export function HomeStatusSummaryPanel({ records }) {
  const [activeTab, setActiveTab] = useState("production");
  const stats = useMemo(
    () => buildHomeStatusSummaryStats(records, activeTab),
    [records, activeTab]
  );
  const activeTabLabel =
    HOME_STATUS_SUMMARY_TABS.find((tab) => tab.id === activeTab)?.label ?? "현황 요약";

  return (
    <Card className="home-panel home-panel--summary home-panel--left-clamp">
      <div className="home-panel__head">
        <h3>현황 요약</h3>
      </div>
      <div className="home-summary-tabs" role="tablist" aria-label="현황 요약">
          {HOME_STATUS_SUMMARY_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              className={`home-summary-tabs__btn${activeTab === tab.id ? " is-active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <ul className="home-summary-stats" aria-label={activeTabLabel}>
          {stats.map((row) => (
            <li key={row.label}>
              <span>{row.label}</span>
              <strong>{row.value.toLocaleString("ko-KR")}건</strong>
            </li>
          ))}
      </ul>
    </Card>
  );
}

export function HomeQuickMenu() {
  return (
    <Card className="home-panel home-panel--quick home-panel--left-clamp">
      <div className="home-panel__head">
        <h3>빠른 메뉴</h3>
      </div>
      <div className="home-quick-menu">
          {HOME_QUICK_MENUS.map((item) => (
            <Link key={item.id} to={item.to} className="home-quick-menu__btn">
              {item.label}
            </Link>
          ))}
      </div>
    </Card>
  );
}

import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";

import Card from "../../foundation/components/Card";
import StatusChip from "../../foundation/components/StatusChip";
import StatusSummaryCard from "../../foundation/components/StatusSummaryCard";
import TitanStandardList from "../../foundation/components/TitanStandardList";
import TitanListInteractionHint from "../../foundation/components/TitanListInteractionHint";
import TitanScreenDetailPopup from "../../foundation/components/TitanScreenDetailPopup";
import { SecondaryButton } from "../../foundation/components/Button";
import TitanSearchPanel, { useSearchSuggestionHelpers } from "../../foundation/components/TitanSearchPanel";
import TitanAdvancedSearchGrid from "../../foundation/components/TitanAdvancedSearchGrid";
import {
  DateRangeField,
  ManagerField,
} from "../../foundation/components/TitanSearchAdvancedFields";
import { STANDARD_PRODUCT_BASIC_SEARCH_FIELDS } from "../../config/listSearchStandard";
import { HOME_INTEGRATED_SEARCH_CONFIG } from "../../config/homeIntegratedSearch";
import {
  HOME_ADMIN_SHORTCUTS,
  HOME_NOTICES_PREVIEW_LIMIT,
  HOME_QUICK_MENUS,
  HOME_RECENT_LIST_TITLE,
  HOME_RECENT_PREVIEW_LIMIT,
  HOME_RECENT_FULL_VIEW_PATH,
  HOME_RECENT_TABS,
  HOME_TODAY_TASKS_LIMIT,
  HOME_TODAY_WORK_CARDS,
  HOME_TOP_KPI_CARDS,
  HOME_WORK_SCHEDULE_PREVIEW_LIMIT,
  HOME_WORKFLOW_FULL_VIEW_PATH,
  HOME_WORKFLOW_PREVIEW_LIMIT,
} from "../../config/homeDashboard";
import { isHomeWidgetVisible } from "../../utils/titanModuleRuntime";
import { useTitanModuleFlags } from "../../hooks/useTitanModuleFlags";
import { isTitanAdminUser } from "../../utils/titanAdminAccess";
import {
  buildHomeTopKpiCounts,
  buildProductWorkflowPreview,
  buildRecentWorkList,
  buildHomeRecentWorkItems,
  buildTodayActionItems,
  buildTodayWorkSummary,
  buildDocumentExpiryAlerts,
} from "../../utils/homeDashboardData";
import {
  HOME_TASK_STATUS,
  addUserHomeTask,
  getUserTodayTasks,
  toggleHomeTaskCompleted,
} from "../../utils/homeTasksSession";
import TitanWorkflowStatusChipBar from "../../foundation/components/TitanWorkflowStatusChipBar";
import TitanWorkflowStepTrack from "../../foundation/components/TitanWorkflowStepTrack";
import TitanProductTraceabilityPanel from "../../foundation/components/TitanProductTraceabilityPanel";
import { getHomeWorkspaceRecords } from "../../utils/homeWorkspaceData";
import { getHomeNotices, mapHomeNoticeToPanelItem } from "../../utils/homeNoticesSession";
import { buildHomeProductProgressTableColumns } from "../../config/productWorkflowList";
import HomeWorkflowProgressRate from "./HomeWorkflowProgressRate";
import HomeTaskModal from "./HomeTaskModal";
import HomeNoticeRegisterModal from "./HomeNoticeRegisterModal";

export function HomeKpiPanel({ records }) {
  const { flags } = useTitanModuleFlags();
  const counts = useMemo(() => buildHomeTopKpiCounts(records), [records]);
  const visibleCards = useMemo(
    () => HOME_TOP_KPI_CARDS.filter((card) => isHomeWidgetVisible(card.id, flags)),
    [flags]
  );

  if (visibleCards.length === 0) return null;

  return (
    <section className="home-panel home-panel--kpi titan-card" aria-label="KPI Dashboard">
      <div className="home-panel__head home-panel__head--inline">
        <h3>KPI Dashboard</h3>
      </div>
      <div className="home-kpi-row home-kpi-row--compact">
        {visibleCards.map((card) => (
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
  const { showStatusField, statusOptions, panelClassName, ariaLabel } =
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
    <section
      className="home-panel home-panel--search home-search-panel titan-card is-open"
      aria-label={ariaLabel}
    >
      <div className="home-panel__head home-panel__head--compact">
        <h3>통합검색</h3>
      </div>
      <TitanSearchPanel
        bare
        draft={draft}
        onDraftChange={onDraftChange}
        onSearch={onSearch}
        onReset={onReset}
        advancedOpen={advancedOpen}
        onAdvancedToggle={onAdvancedToggle}
        companies={companies}
        records={searchRecords}
        basicFields={STANDARD_PRODUCT_BASIC_SEARCH_FIELDS}
        showStatusField={showStatusField}
        extraSuggestions={{ status: statusOptions, manager: managers }}
        className={panelClassName}
        enableEnterSearch
        advancedContent={
          <TitanAdvancedSearchGrid>
            <DateRangeField
              label="납기일"
              fromKey="dueDateFrom"
              toKey="dueDateTo"
              draft={draft}
              onDraftChange={onDraftChange}
            />
            <ManagerField draft={draft} onDraftChange={onDraftChange} getSuggestions={getSuggestions} />
          </TitanAdvancedSearchGrid>
        }
      />
    </section>
  );
}

/** 금일 해야 할 일 — Workflow 추천 + 사용자 등록 */
export function HomeTodayTasksPanel({ records, refreshKey, onRefresh }) {
  const { flags } = useTitanModuleFlags();
  const [modalOpen, setModalOpen] = useState(false);
  const visible = isHomeWidgetVisible("todayTasks", flags);

  const userTasks = useMemo(
    () =>
      getUserTodayTasks()
        .filter((task) => task.status !== HOME_TASK_STATUS.DONE)
        .slice(0, HOME_TODAY_TASKS_LIMIT),
    [refreshKey]
  );

  const systemItems = useMemo(
    () =>
      [
        ...buildTodayActionItems(records).filter((item) =>
          isHomeWidgetVisible(item.widgetKey, flags)
        ),
        ...buildDocumentExpiryAlerts(HOME_TODAY_TASKS_LIMIT),
      ].slice(0, HOME_TODAY_TASKS_LIMIT),
    [records, flags]
  );

  if (!visible) return null;

  const handleSave = (payload) => {
    addUserHomeTask(payload);
    setModalOpen(false);
    onRefresh?.();
  };

  const handleToggleUserTask = (task) => {
    toggleHomeTaskCompleted(task.id, task.status !== HOME_TASK_STATUS.DONE);
    onRefresh?.();
  };

  const isEmpty = userTasks.length === 0 && systemItems.length === 0;

  return (
    <>
      <Card className="home-panel home-panel--today-tasks home-panel--left-clamp">
        <div className="home-panel__head">
          <h3>금일 해야 할 일</h3>
          <SecondaryButton type="button" onClick={() => setModalOpen(true)}>
            <Plus size={14} aria-hidden="true" />
            할 일 추가
          </SecondaryButton>
        </div>
        <ul className="home-today-tasks">
          {isEmpty ? (
            <li className="home-empty">금일 처리할 업무가 없습니다.</li>
          ) : null}
          {userTasks.map((task) => (
            <li key={task.id}>
              <label className="home-today-tasks__item home-today-tasks__item--user">
                <input
                  type="checkbox"
                  checked={task.status === HOME_TASK_STATUS.DONE}
                  onChange={() => handleToggleUserTask(task)}
                />
                <span className="home-today-tasks__body">
                  <strong>{task.title}</strong>
                  <span>{task.assignee || "—"}</span>
                </span>
              </label>
            </li>
          ))}
          {systemItems.map((item) => (
            <li key={item.id}>
              <Link
                to={item.to}
                className={`home-today-tasks__item home-today-tasks__item--system titan-process--${item.phaseKey}`}
              >
                <span className="home-today-tasks__check" aria-hidden="true" />
                <span className="home-today-tasks__body">
                  <strong>{item.title}</strong>
                </span>
                <span className="home-today-tasks__count">
                  {item.count.toLocaleString("ko-KR")}건
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Card>

      {modalOpen ? (
        <HomeTaskModal mode="add" onSave={handleSave} onClose={() => setModalOpen(false)} />
      ) : null}
    </>
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
  const { flags } = useTitanModuleFlags();
  if (!isHomeWidgetVisible("todayWork", flags)) return null;

  const summaryMap = useMemo(
    () => Object.fromEntries(buildTodayWorkSummary(records).map((item) => [item.id, item.value])),
    [records]
  );

  const cards = useMemo(
    () =>
      HOME_TODAY_WORK_CARDS.filter((card) => isHomeWidgetVisible(card.summaryId, flags)),
    [flags]
  );

  if (cards.length === 0) return null;

  return (
    <section className="home-panel home-panel--today-summary titan-card" aria-label="현재 진행현황">
      <div className="home-panel__head home-panel__head--compact">
        <h3>현재 진행현황</h3>
        <p className="home-panel__subtitle">입고부터 출고까지 현재 진행 중인 업무 현황</p>
      </div>
      <div className="home-kpi-row home-kpi-row--today">
        {cards.map((card) => (
          <StatusSummaryCard
            key={card.summaryId}
            label={card.label}
            subLabel={card.subLabel}
            icon={card.icon}
            to={card.to}
            tone={card.tone}
            count={summaryMap[card.summaryId] ?? 0}
            countSuffix="건"
            iconSize={20}
          />
        ))}
      </div>
    </section>
  );
}

/** 제품 진행 Row Expand 상세 — 진행률 · 공정 Step · 메타 정보 (REV.6) */
export function HomeWorkflowRowDetail({ item }) {
  const traceRecord = useMemo(
    () => getHomeWorkspaceRecords().find((record) => record.id === item.managementId) ?? null,
    [item.managementId]
  );

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

      {traceRecord ? (
        <>
          <div className="home-workflow-expand__divider" aria-hidden="true" />
          <TitanProductTraceabilityPanel
            record={traceRecord}
            onSelectCoLotProduct={(id) => {
              window.location.assign(`/production/daily?managementId=${encodeURIComponent(id)}`);
            }}
          />
        </>
      ) : null}
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
  const [detailPopupRow, setDetailPopupRow] = useState(null);
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

  const handleRowDoubleClick = (row) => {
    setDetailPopupRow(row);
  };

  return (
    <>
      <TitanListInteractionHint className="home-list-interaction-hint" />
      <TitanStandardList
        columns={columns}
        rows={items}
        getRowId={(row) => row.managementId}
        expandedRowId={expandedRowId}
        onExpandedRowChange={setExpandedRowId}
        onRowDoubleClick={handleRowDoubleClick}
        renderExpandedRow={(row) => <HomeWorkflowRowDetail item={row} />}
        emptyMessage="진행 중인 제품이 없습니다."
        ariaLabel="제품 진행 리스트"
      />
      <TitanScreenDetailPopup
        screenKey="inbound"
        open={Boolean(detailPopupRow)}
        onClose={() => setDetailPopupRow(null)}
        record={detailPopupRow}
      />
    </>
  );
}

/** 제품 흐름 현황 Panel — Overview + Product Table */
export function HomeProgressPanel({ records, search, activeChipId, onChipClick }) {
  return (
    <Card className="home-panel home-panel--progress" aria-label="제품 흐름 현황">
      <div className="home-panel__head">
        <div className="home-panel__head-text">
          <h3>제품 흐름 현황</h3>
          <p className="home-panel__subtitle">
            입고부터 출고까지 제품의 현재 진행 상태를 확인합니다.
          </p>
        </div>
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

export function HomeNoticePanel({ refreshKey, onRefresh }) {
  const [listExpanded, setListExpanded] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const notices = useMemo(
    () => getHomeNotices().map(mapHomeNoticeToPanelItem),
    [refreshKey]
  );
  const hasMore = notices.length > HOME_NOTICES_PREVIEW_LIMIT;
  const visibleNotices = listExpanded ? notices : notices.slice(0, HOME_NOTICES_PREVIEW_LIMIT);

  return (
    <>
      <Card
        className={`home-panel home-panel--notice titan-card${listExpanded ? " is-list-expanded" : ""}`.trim()}
      >
        <div className="home-panel__head home-panel__head--notice">
          <h3>공지사항</h3>
          <SecondaryButton type="button" onClick={() => setRegisterOpen(true)}>
            <Plus size={14} aria-hidden="true" />
            공지 등록
          </SecondaryButton>
        </div>
        {visibleNotices.length === 0 ? (
          <p className="home-empty">등록된 공지가 없습니다.</p>
        ) : (
          <>
            <ul className="home-notice-cards" aria-label="공지사항">
              {visibleNotices.map((notice) => (
                <li key={notice.id} className={`home-notice-card home-notice-card--${notice.type}`}>
                  <div className="home-notice-card__row">
                    <span className="home-notice-card__badge">{notice.typeLabel}</span>
                    <strong className="home-notice-card__title">{notice.title}</strong>
                    <span className="home-notice-card__date">
                      {notice.dateLabel ?? notice.date ?? "—"}
                    </span>
                  </div>
                  {listExpanded && notice.body ? (
                    <p className="home-notice-card__body">{notice.body}</p>
                  ) : null}
                </li>
              ))}
            </ul>
            {hasMore ? (
              <button
                type="button"
                className="home-notice-more-btn"
                onClick={() => setListExpanded((value) => !value)}
                aria-expanded={listExpanded}
              >
                {listExpanded ? "▲ 접기" : "▼ 더보기"}
              </button>
            ) : null}
          </>
        )}
      </Card>

      {registerOpen ? (
        <HomeNoticeRegisterModal
          onSave={() => onRefresh?.()}
          onClose={() => setRegisterOpen(false)}
        />
      ) : null}
    </>
  );
}

function resolveRecentTimelineChip(statusLabel = "") {
  const label = String(statusLabel);
  if (label.includes("완료") || label.includes("발행")) {
    return { label: "완료", variant: "complete" };
  }
  if (label.includes("대기")) {
    return { label: "대기", variant: "hold" };
  }
  if (label.includes("중")) {
    return { label: "진행", variant: "progress" };
  }
  return { label: label.slice(0, 4) || "—", variant: "hold" };
}

export function HomeRecentWorkPanel({ records }) {
  const items = useMemo(() => buildHomeRecentWorkItems(records, HOME_RECENT_PREVIEW_LIMIT), [records]);

  return (
    <Card className="home-panel home-panel--recent home-panel--left-clamp">
      <div className="home-panel__head home-panel__head--recent">
        <h3>{HOME_RECENT_LIST_TITLE}</h3>
        <Link to={HOME_RECENT_FULL_VIEW_PATH} className="home-panel__more-link">
          전체보기 &gt;
        </Link>
      </div>
      {items.length === 0 ? (
        <p className="home-empty">표시할 이력이 없습니다.</p>
      ) : (
        <ul className="home-recent-timeline">
          {items.map((item, index) => {
            const timeLabel = String(item.registeredAt ?? "").split(" ").pop()?.slice(0, 5) ?? "—";
            const lotLabel = item.lotNo ? ` (${item.lotNo})` : "";
            const chip = resolveRecentTimelineChip(item.statusLabel);

            return (
              <li key={`recent-${item.managementId}-${index}`} className="home-recent-timeline__item">
                <span className="home-recent-timeline__time">{timeLabel}</span>
                <div className="home-recent-timeline__body">
                  <strong>
                    {item.partName}
                    {lotLabel}
                  </strong>
                  <span className="home-recent-timeline__action">{item.statusLabel}</span>
                  <span className="home-recent-timeline__meta">{item.registrar ?? "—"}</span>
                </div>
                <StatusChip variant={chip.variant}>{chip.label}</StatusChip>
              </li>
            );
          })}
        </ul>
      )}
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
  const { flags } = useTitanModuleFlags();
  const items = HOME_QUICK_MENUS.filter((item) => isHomeWidgetVisible(item.id, flags));
  if (items.length === 0) return null;

  return (
    <Card className="home-panel home-panel--quick home-panel--left-clamp">
      <div className="home-panel__head">
        <h3>빠른 메뉴</h3>
      </div>
      <div className="home-quick-menu">
        {items.map((item) => (
          <Link key={item.id} to={item.to} className="home-quick-menu__btn">
            {item.label}
          </Link>
        ))}
      </div>
    </Card>
  );
}

/** 관리자 전용 HOME 위젯 */
export function HomeAdminWidgetsPanel() {
  const isAdmin = isTitanAdminUser();

  if (!isAdmin) return null;

  return (
    <Card className="home-panel home-panel--admin home-panel--left-clamp">
      <div className="home-panel__head">
        <h3>관리자</h3>
        <span className="home-panel__badge">Admin</span>
      </div>
      <div className="home-admin-shortcuts">
        {HOME_ADMIN_SHORTCUTS.map((item) => (
          <Link key={item.id} to={item.to} className="home-admin-shortcuts__btn">
            {item.label}
          </Link>
        ))}
      </div>
    </Card>
  );
}

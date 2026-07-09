import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Clock, FileCheck2, PackageCheck, UserRound } from "lucide-react";

import { PrimaryButton, SecondaryButton } from "../../foundation/components/Button";
import FoundationActionBar from "../../foundation/components/FoundationActionBar";
import FoundationAttachment, { FoundationAttachmentBadge } from "../../foundation/components/FoundationAttachment";
import StatusChip from "../../foundation/components/StatusChip";
import TitanAdvancedSearchGrid from "../../foundation/components/TitanAdvancedSearchGrid";
import TitanDataTable from "../../foundation/components/DataTable";
import TitanKpiBarSlot from "../../foundation/components/TitanKpiBarSlot";
import TitanSearchPanel, { useSearchSuggestionHelpers } from "../../foundation/components/TitanSearchPanel";
import TitanStandardDetailPopup from "../../foundation/components/detailPopup/TitanStandardDetailPopup";
import TitanTableFooter from "../../foundation/components/TitanTableFooter";
import TitanTableRowActions from "../../foundation/components/TitanTableRowActions";
import TitanWorkflowStatusChipBar from "../../foundation/components/TitanWorkflowStatusChipBar";
import { DateRangeField, NoteField, WorkerField } from "../../foundation/components/TitanSearchAdvancedFields";
import { createEmptyInboundSearch, matchesBasicSearch, STANDARD_PRODUCT_BASIC_SEARCH_FIELDS } from "../../config/listSearchStandard";
import {
  SHOT_WORK_STATUS,
  SHOT_WORK_STATUS_OPTIONS,
  getShotWorkStatusMeta,
  normalizeShotWorkStatus,
} from "../../config/workTypeWorkflow";
import { useListPagination } from "../../foundation/hooks/useListPagination";
import { useTitanListSearch } from "../../foundation/hooks/useTitanListSearch";
import { buildMetricChipItems } from "../../utils/kpiMetricChipItems";
import { getMasterDataByCategory } from "../../utils/masterData";
import { updateSessionProductionRecord } from "../../utils/productionRecords";
import { getShotWorkScreenData } from "../../utils/productionWorkspaceData";
import { getJournalReferenceDate } from "../../utils/workJournalData";
import { OperationsWorkflowNextDialog } from "../InOut/OutboundStatementPromptDialog";
import { getOperationsWorkflowNextStep } from "../../config/operationsRouteRegistry";
import "../../foundation/components/OperationsWorkflowNextDialog.css";
import "../InOut/InboundManagement.css";
import "../Inventory/InventoryStatus.css";
import "./ProductionManagement.css";

const SHOT_DETAIL_TABS = [
  { id: "basic", label: "기본정보" },
  { id: "workflow", label: "쇼트 작업" },
  { id: "attachments", label: "첨부파일" },
  { id: "memo", label: "메모" },
];

function createEmptyShotSearch() {
  return {
    ...createEmptyInboundSearch(),
    incomingDateFrom: "",
    incomingDateTo: "",
    shotDateFrom: "",
    shotDateTo: "",
    worker: "",
  };
}

function formatQty(record) {
  return `${(Number(record?.qty) || 0).toLocaleString("ko-KR")} ${record?.unit || "EA"}`;
}

function getShotDate(record) {
  return record.shotWorkDate || record.workDate || "";
}

function mapShotRow(record) {
  const status = getShotWorkStatusMeta(record.shotStatus);
  const attachments = Array.isArray(record.shotAttachments) ? record.shotAttachments : [];
  return {
    id: record.id,
    managementId: record.id,
    company: record.company || "—",
    partName: record.partName || "—",
    partNo: record.partNo || "—",
    spec: record.spec || "—",
    material: record.material || "—",
    qtyLabel: formatQty(record),
    worker: record.shotWorker || record.registrar || "—",
    incomingDate: record.incomingDate || "—",
    shotWorkDate: getShotDate(record) || "—",
    shotCompletedAt: record.shotCompletedAt || "—",
    statusLabel: status.label,
    statusVariant: status.variant,
    note: record.shotNote || record.note || "—",
    attachmentCount: attachments.length,
    attachments,
    record,
  };
}

function matchesShotSearch(row, search) {
  if (!matchesBasicSearch(search, row.record)) return false;
  if (search.managementId && !row.managementId.toLowerCase().includes(search.managementId.toLowerCase())) return false;
  if (search.lotNo && !String(row.record.lotNo ?? "").toLowerCase().includes(search.lotNo.toLowerCase())) return false;
  if (search.incomingDateFrom && row.record.incomingDate < search.incomingDateFrom) return false;
  if (search.incomingDateTo && row.record.incomingDate > search.incomingDateTo) return false;
  if (search.shotDateFrom && getShotDate(row.record) < search.shotDateFrom) return false;
  if (search.shotDateTo && getShotDate(row.record) > search.shotDateTo) return false;
  if (search.worker && !String(row.worker).toLowerCase().includes(search.worker.toLowerCase())) return false;
  if (
    search.status &&
    normalizeShotWorkStatus(row.record.shotStatus) !== search.status &&
    row.statusLabel !== search.status
  ) {
    return false;
  }
  if (search.note && !String(row.note).toLowerCase().includes(search.note.toLowerCase())) return false;
  return true;
}

function matchesShotKpiDrilldown(row, kpiFilter) {
  if (!kpiFilter?.id) return true;
  const referenceDate = getJournalReferenceDate();
  const shotDate = getShotDate(row.record) || row.record.shotCompletedAt || row.record.incomingDate;
  const status = normalizeShotWorkStatus(row.record.shotStatus);

  if (kpiFilter.id === "todayCount") return shotDate === referenceDate;
  if (kpiFilter.id === "todayQty") return shotDate === referenceDate && status === SHOT_WORK_STATUS.COMPLETE;
  if (kpiFilter.id === "waiting") return status === SHOT_WORK_STATUS.WAITING;
  if (kpiFilter.id === "completed") return status === SHOT_WORK_STATUS.COMPLETE;
  if (kpiFilter.id === "workerTopQty") {
    if (kpiFilter.worker === "미지정") return row.worker === "—" || row.worker === "미지정";
    return row.worker === kpiFilter.worker;
  }
  return true;
}

function ShotBasicPanel({ row }) {
  return (
    <dl className="titan-standard-detail-popup__basic-grid">
      <dt>관리번호</dt>
      <dd>{row.managementId}</dd>
      <dt>업체</dt>
      <dd>{row.company}</dd>
      <dt>품명</dt>
      <dd>{row.partName}</dd>
      <dt>품번</dt>
      <dd>{row.partNo}</dd>
      <dt>규격</dt>
      <dd>{row.spec}</dd>
      <dt>재질</dt>
      <dd>{row.material}</dd>
      <dt>수량</dt>
      <dd>{row.qtyLabel}</dd>
      <dt>입고일</dt>
      <dd>{row.incomingDate}</dd>
      <dt>상태</dt>
      <dd>
        <StatusChip variant={row.statusVariant}>{row.statusLabel}</StatusChip>
      </dd>
      <dt className="titan-standard-detail-popup__basic-note-label">비고</dt>
      <dd className="titan-standard-detail-popup__basic-note-value">{row.note}</dd>
    </dl>
  );
}

function ShotWorkflowPanel({ row, workers, onPatch, onStart, onComplete }) {
  const status = normalizeShotWorkStatus(row.record.shotStatus);
  return (
    <div className="shot-workspace__workflow-panel">
      <div className="shot-workspace__workflow-grid">
        <label>
          <span>작업자</span>
          <select value={row.record.shotWorker || ""} onChange={(event) => onPatch(row.id, { shotWorker: event.target.value })}>
            <option value="">작업자 선택</option>
            {workers.map((worker) => (
              <option key={worker.id ?? worker.name} value={worker.name}>
                {worker.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>작업일</span>
          <input type="date" value={getShotDate(row.record)} onChange={(event) => onPatch(row.id, { shotWorkDate: event.target.value })} />
        </label>
        <label>
          <span>상태</span>
          <select value={status} onChange={(event) => onPatch(row.id, { shotStatus: event.target.value })}>
            {SHOT_WORK_STATUS_OPTIONS.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <label className="shot-workspace__field--wide">
          <span>비고</span>
          <textarea rows={3} value={row.record.shotNote || row.record.note || ""} onChange={(event) => onPatch(row.id, { shotNote: event.target.value })} />
        </label>
      </div>
      <FoundationActionBar
        align="start"
        actions={[
          {
            id: "start",
            label: "작업 시작",
            variant: "secondary",
            icon: Clock,
            disabled: status !== SHOT_WORK_STATUS.WAITING,
            onClick: () => onStart(row),
          },
          {
            id: "complete",
            label: "작업 완료",
            variant: "primary",
            icon: CheckCircle2,
            disabled: status === SHOT_WORK_STATUS.COMPLETE,
            onClick: () => onComplete(row),
          },
        ]}
      />
    </div>
  );
}

function ShotMemoPanel({ row, onPatch }) {
  return (
    <label className="shot-workspace__memo">
      <span>쇼트 작업 메모</span>
      <textarea rows={8} value={row.record.shotNote || row.record.note || ""} onChange={(event) => onPatch(row.id, { shotNote: event.target.value })} />
    </label>
  );
}

export default function ShotWorkStatusPage() {
  const navigate = useNavigate();
  const [refreshKey, setRefreshKey] = useState(0);
  const [workflowNextStep, setWorkflowNextStep] = useState(null);
  const [activeId, setActiveId] = useState("");
  const [detailRow, setDetailRow] = useState(null);
  const [activeKpiId, setActiveKpiId] = useState(null);
  const [kpiFilter, setKpiFilter] = useState(null);
  const { search, draft, onDraftChange, onSearch, onReset, advancedOpen, onAdvancedToggle } =
    useTitanListSearch(createEmptyShotSearch, { storageKey: "production-shot" });

  const companies = useMemo(() => getMasterDataByCategory("companies"), []);
  const workers = useMemo(() => getMasterDataByCategory("workers"), []);
  const { baseRecords: workspaceRecords, counts } = useMemo(() => {
    void refreshKey;
    return getShotWorkScreenData();
  }, [refreshKey]);
  const { getSuggestions } = useSearchSuggestionHelpers(workspaceRecords, {
    worker: workers.map((item) => item.name).filter(Boolean),
    status: SHOT_WORK_STATUS_OPTIONS.map((item) => item.label),
  });

  const rows = useMemo(
    () =>
      workspaceRecords
        .map(mapShotRow)
        .filter((row) => matchesShotSearch(row, search))
        .filter((row) => matchesShotKpiDrilldown(row, kpiFilter))
        .sort((a, b) => String(b.incomingDate).localeCompare(String(a.incomingDate))),
    [workspaceRecords, search, kpiFilter]
  );

  const {
    page,
    pageSize,
    totalCount,
    totalPages,
    pagedItems: pagedRows,
    setPage,
    setPageSize,
  } = useListPagination(rows);

  const activeRow = rows.find((row) => row.id === activeId) ?? null;
  const selectedDetailRow = detailRow ? rows.find((row) => row.id === detailRow.id) ?? detailRow : null;

  const bumpRefresh = useCallback(() => setRefreshKey((key) => key + 1), []);

  const patchShotRecord = useCallback(
    (id, patch) => {
      updateSessionProductionRecord(id, patch);
      bumpRefresh();
    },
    [bumpRefresh]
  );

  const handleStart = useCallback(
    (row) => {
      patchShotRecord(row.id, {
        shotStatus: SHOT_WORK_STATUS.IN_PROGRESS,
        shotWorkDate: getShotDate(row.record) || getJournalReferenceDate(),
        shotStartedAt: row.record.shotStartedAt || new Date().toISOString(),
      });
      setActiveId(row.id);
    },
    [patchShotRecord]
  );

  const handleComplete = useCallback(
    (row) => {
      patchShotRecord(row.id, {
        shotStatus: SHOT_WORK_STATUS.COMPLETE,
        shotWorkDate: getShotDate(row.record) || getJournalReferenceDate(),
        shotCompletedAt: getJournalReferenceDate(),
        completionStatus: "쇼트완료",
        workflowStatus: "쇼트완료",
      });
      setActiveId(row.id);
      setWorkflowNextStep(getOperationsWorkflowNextStep("shotComplete"));
    },
    [patchShotRecord]
  );

  const handleUploadAttachments = useCallback(
    (row, files) => {
      patchShotRecord(row.id, {
        shotAttachments: [...(row.record.shotAttachments ?? []), ...files],
      });
    },
    [patchShotRecord]
  );

  const handleDeleteAttachment = useCallback(
    (row, attachmentId) => {
      patchShotRecord(row.id, {
        shotAttachments: (row.record.shotAttachments ?? []).filter((attachment) => attachment.id !== attachmentId),
      });
    },
    [patchShotRecord]
  );

  const applyShotKpiFilter = useCallback(
    (chip) => {
      if (activeKpiId === chip.id) {
        setActiveKpiId(null);
        setKpiFilter(null);
        onReset();
        setPage(1);
        return;
      }

      const referenceDate = getJournalReferenceDate();
      const nextDraft = createEmptyShotSearch();
      let nextFilter = { id: chip.id };

      if (chip.id === "todayCount") {
        nextDraft.shotDateFrom = referenceDate;
        nextDraft.shotDateTo = referenceDate;
      } else if (chip.id === "todayQty") {
        nextDraft.shotDateFrom = referenceDate;
        nextDraft.shotDateTo = referenceDate;
        nextDraft.status = "작업 완료";
      } else if (chip.id === "waiting") {
        nextDraft.status = "작업 대기";
      } else if (chip.id === "completed") {
        nextDraft.status = "작업 완료";
      } else if (chip.id === "workerTopQty") {
        nextDraft.worker = counts.workerTopLabel === "미지정" ? "" : counts.workerTopLabel;
        nextFilter = { ...nextFilter, worker: counts.workerTopLabel };
      }

      setActiveKpiId(chip.id);
      setKpiFilter(nextFilter);
      onDraftChange(nextDraft);
      setPage(1);
    },
    [activeKpiId, counts.workerTopLabel, onDraftChange, onReset, setPage]
  );

  const handleSearchReset = useCallback(() => {
    setActiveKpiId(null);
    setKpiFilter(null);
    onReset();
    setPage(1);
  }, [onReset, setPage]);

  const kpiItems = useMemo(
    () =>
      buildMetricChipItems([
        { id: "todayCount", label: "금일 쇼트 작업 건수", value: counts.todayCount, unit: "건", tone: "production", icon: FileCheck2 },
        { id: "todayQty", label: "금일 처리(EA)", value: counts.todayQty, unit: "EA", tone: "incoming", icon: PackageCheck },
        { id: "waiting", label: "작업 대기", value: counts.waiting, unit: "건", tone: "hold", icon: Clock },
        { id: "completed", label: "작업 완료", value: counts.completed, unit: "건", tone: "complete", icon: CheckCircle2 },
        { id: "workerTopQty", label: `작업자별 처리량 (${counts.workerTopLabel})`, value: counts.workerTopQty, unit: "EA", tone: "inspection", icon: UserRound },
      ]).map((item) => ({ ...item, filterable: true })),
    [counts]
  );

  const columns = useMemo(
    () => [
      { key: "managementId", label: "관리번호", widthHint: "id", identifier: true },
      { key: "company", label: "업체", widthHint: "company" },
      { key: "partName", label: "품명", widthHint: "product" },
      { key: "spec", label: "규격", widthHint: "spec" },
      { key: "material", label: "재질", widthHint: "material" },
      { key: "qtyLabel", label: "수량(EA)", widthHint: "qty" },
      { key: "worker", label: "작업자", widthHint: "manager" },
      { key: "incomingDate", label: "입고일", widthHint: "date" },
      { key: "shotWorkDate", label: "작업일", widthHint: "date" },
      { key: "shotCompletedAt", label: "완료일", widthHint: "date" },
      {
        key: "statusLabel",
        label: "상태",
        widthHint: "status",
        render: (row) => <StatusChip variant={row.statusVariant}>{row.statusLabel}</StatusChip>,
      },
      { key: "note", label: "비고", widthHint: "note" },
      {
        key: "attachments",
        label: "첨부파일",
        widthHint: "status",
        render: (row) => (
          <FoundationAttachmentBadge
            count={row.attachmentCount}
            onClick={(event) => {
              event.stopPropagation();
              setActiveId(row.id);
              setDetailRow(row);
            }}
          />
        ),
      },
      {
        key: "actions",
        label: "작업",
        widthHint: "actions",
        render: (row) => (
          <TitanTableRowActions>
            <SecondaryButton
              className="titan-btn--table-action"
              disabled={normalizeShotWorkStatus(row.record.shotStatus) !== SHOT_WORK_STATUS.WAITING}
              onClick={(event) => {
                event.stopPropagation();
                handleStart(row);
              }}
            >
              시작
            </SecondaryButton>
            <PrimaryButton
              className="titan-btn--table-action"
              disabled={normalizeShotWorkStatus(row.record.shotStatus) === SHOT_WORK_STATUS.COMPLETE}
              onClick={(event) => {
                event.stopPropagation();
                handleComplete(row);
              }}
            >
              완료
            </PrimaryButton>
          </TitanTableRowActions>
        ),
      },
    ],
    [handleComplete, handleStart]
  );

  return (
    <div className="inbound-page production-page shot-workspace">
      <TitanKpiBarSlot ariaLabel="쇼트 작업현황 KPI" className="inbound-page__kpi">
        <TitanWorkflowStatusChipBar
          items={kpiItems}
          activeId={activeKpiId}
          onChipClick={applyShotKpiFilter}
          ariaLabel="쇼트 작업현황 KPI"
        />
      </TitanKpiBarSlot>

      <TitanSearchPanel
        draft={draft}
        onDraftChange={onDraftChange}
        onSearch={onSearch}
        onReset={handleSearchReset}
        advancedOpen={advancedOpen}
        onAdvancedToggle={onAdvancedToggle}
        companies={companies}
        records={workspaceRecords}
        extraSuggestions={{
          status: SHOT_WORK_STATUS_OPTIONS.map((item) => item.label),
          worker: workers.map((item) => item.name).filter(Boolean),
        }}
        basicFields={STANDARD_PRODUCT_BASIC_SEARCH_FIELDS}
        showStatusField
        statusFieldLabel="쇼트상태"
        advancedContent={
          <TitanAdvancedSearchGrid>
            <DateRangeField label="입고일" fromKey="incomingDateFrom" toKey="incomingDateTo" draft={draft} onDraftChange={onDraftChange} />
            <DateRangeField label="작업일" fromKey="shotDateFrom" toKey="shotDateTo" draft={draft} onDraftChange={onDraftChange} />
            <WorkerField draft={draft} onDraftChange={onDraftChange} getSuggestions={getSuggestions} />
            <NoteField draft={draft} onDraftChange={onDraftChange} getSuggestions={getSuggestions} />
          </TitanAdvancedSearchGrid>
        }
      />

      <section className="production-plan-page__list-card" aria-label="쇼트 작업 리스트">
        <div className="manual-lot-page__section-head">
          <h3>쇼트 작업 리스트</h3>
          <span className="manual-lot-page__count">{totalCount.toLocaleString("ko-KR")}건</span>
        </div>
        <TitanDataTable
          className="inbound-page__table"
          columns={columns}
          rows={pagedRows}
          activeRowId={activeRow?.id}
          onRowClick={(row) => setActiveId(row.id)}
          onRowDoubleClick={(row) => {
            setActiveId(row.id);
            setDetailRow(row);
          }}
          emptyMessage="쇼트 작업 대상 입고 건이 없습니다."
        />
        <TitanTableFooter
          totalCount={totalCount}
          page={page}
          totalPages={totalPages}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      </section>

      <TitanStandardDetailPopup
        open={Boolean(selectedDetailRow)}
        onClose={() => setDetailRow(null)}
        tabs={SHOT_DETAIL_TABS}
        summary={
          selectedDetailRow
            ? {
                company: selectedDetailRow.company,
                partName: selectedDetailRow.partName,
                partNo: selectedDetailRow.partNo,
                lotNo: selectedDetailRow.record.lotNo || "—",
                currentProcess: "쇼트 작업",
                currentProcessVariant: "production",
                statusLabel: selectedDetailRow.statusLabel,
                statusVariant: selectedDetailRow.statusVariant,
              }
            : null
        }
        renderTabContent={(tabId) => {
          if (!selectedDetailRow) return null;
          if (tabId === "basic") return <ShotBasicPanel row={selectedDetailRow} />;
          if (tabId === "workflow") {
            return (
              <ShotWorkflowPanel
                row={selectedDetailRow}
                workers={workers}
                onPatch={patchShotRecord}
                onStart={handleStart}
                onComplete={handleComplete}
              />
            );
          }
          if (tabId === "attachments") {
            return (
              <FoundationAttachment
                attachments={selectedDetailRow.record.shotAttachments ?? []}
                uploadedBy={selectedDetailRow.worker}
                onUpload={(files) => handleUploadAttachments(selectedDetailRow, files)}
                onDelete={(attachmentId) => handleDeleteAttachment(selectedDetailRow, attachmentId)}
              />
            );
          }
          return <ShotMemoPanel row={selectedDetailRow} onPatch={patchShotRecord} />;
        }}
      />

      <OperationsWorkflowNextDialog
        open={Boolean(workflowNextStep)}
        step={workflowNextStep}
        onNavigate={(path) => {
          navigate(path);
          setWorkflowNextStep(null);
        }}
        onStay={() => setWorkflowNextStep(null)}
        onClose={() => setWorkflowNextStep(null)}
      />
    </div>
  );
}

import { useMemo, useState } from "react";
import { FileSpreadsheet, Plus } from "lucide-react";
import { PrimaryButton, SecondaryButton } from "../../foundation/components/Button";
import TitanSearchPanel, { useSearchSuggestionHelpers } from "../../foundation/components/TitanSearchPanel";
import {
  AssigneeField,
  DateRangeField,
  LotNoField,
  ManagementIdField,
  ProcessField,
  StatusSelectField,
} from "../../foundation/components/TitanSearchAdvancedFields";
import StatusChip from "../../foundation/components/StatusChip";
import TitanDataTable from "../../foundation/components/DataTable";
import TitanTableFooter from "../../foundation/components/TitanTableFooter";
import TitanDetailPanel from "../../foundation/components/TitanDetailPanel";
import TitanKpiBarSlot from "../../foundation/components/TitanKpiBarSlot";
import TitanWorkflowStatusChipBar from "../../foundation/components/TitanWorkflowStatusChipBar";
import { useWorkflowChipFilter } from "../../foundation/hooks/useWorkflowChipFilter";
import {
  CERTIFICATE_FILE_STATUS_OPTIONS,
} from "../../config/qualityDashboard";
import { createEmptyCertificateSearch } from "../../config/listSearchStandard";
import { buildCertificateListColumns } from "../../config/standardProductList";
import { CERTIFICATE_FILE_REGISTER_LABEL } from "../../config/registerModalStandard";
import {
  getProcessChipVariant,
  getProductionProcessCodes,
} from "../../config/productionProcessCodes";
import { useTitanListSearch } from "../../foundation/hooks/useTitanListSearch";
import { useListPagination } from "../../foundation/hooks/useListPagination";
import { getActiveWorkers, getMasterDataByCategory } from "../../utils/masterData";
import {
  getCertificateFileEntries,
  upsertCertificateFileEntry,
  buildCertificateEntryFromRecord,
} from "../../utils/certificateSession";
import { mapCertificateEntryToListRow, matchesCertificateSearch } from "../../utils/certificateStatus";
import { getProcessFlowSteps } from "../../utils/processFlow";
import { getSessionProductionRecords } from "../../utils/productionRecords";
import CertificateRegisterModal from "./CertificateRegisterModal";
import "../InOut/InboundManagement.css";
import SectionPageActions from "../../foundation/layout/SectionPageActions";
import "./QualityManagement.css";

function FileMark({ registered }) {
  return (
    <span className={`quality-file-mark${registered ? "" : " is-empty"}`}>{registered ? "○" : "—"}</span>
  );
}

export default function CertificateManagement() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [registerInitial, setRegisterInitial] = useState(null);
  const { search, draft, onDraftChange, onSearch, onReset, advancedOpen, onAdvancedToggle } =
    useTitanListSearch(createEmptyCertificateSearch, { storageKey: "certificate" });
  const [selectedIds, setSelectedIds] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const chipRecords = useMemo(() => getSessionProductionRecords(), [refreshKey]);
  const { activeChipId, handleChipClick } = useWorkflowChipFilter({
    draft,
    onDraftChange,
    onReset,
  });

  const companies = useMemo(() => getMasterDataByCategory("companies"), []);
  const workers = useMemo(() => getActiveWorkers(), []);
  const processCodes = useMemo(() => getProductionProcessCodes(), []);
  const searchRecords = useMemo(() => {
    const sessionRecords = getSessionProductionRecords();
    return getCertificateFileEntries().map((entry) => {
      const record = sessionRecords.find((item) => item.id === entry.managementId);
      return record ? { ...record, ...entry, managementId: entry.managementId || record.id } : entry;
    });
  }, [refreshKey]);
  const { getSuggestions } = useSearchSuggestionHelpers(searchRecords, {
    process: processCodes.map((item) => item.name),
    assignee: workers.map((worker) => worker.name),
  });

  const rows = useMemo(() => {
    return getCertificateFileEntries()
      .map(mapCertificateEntryToListRow)
      .filter((row) => matchesCertificateSearch(row, search))
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

  const columns = useMemo(
    () =>
      buildCertificateListColumns({
        renderStatus: (row) => (
          <StatusChip variant={row.statusVariant}>{row.statusLabel}</StatusChip>
        ),
        renderProcess: (row) =>
          row.processName && row.processName !== "—" ? (
            <StatusChip variant={getProcessChipVariant(row.processName)}>{row.processName}</StatusChip>
          ) : (
            "—"
          ),
        renderExcel: (row) => <FileMark registered={row.excelRegistered} />,
        renderPdf: (row) => <FileMark registered={row.pdfRegistered} />,
      }),
    []
  );

  const activeRecord =
    getSessionProductionRecords().find((record) => record.id === activeRow?.managementId) ?? null;

  const processFlowSteps = activeRecord ? getProcessFlowSteps(activeRecord) : [];

  const openRegister = (initialData = null) => {
    setRegisterInitial(initialData);
    setRegisterOpen(true);
  };

  const handleRegister = (form) => {
    upsertCertificateFileEntry({
      managementId: form.managementId.trim(),
      company: form.company.trim(),
      partName: form.partName.trim(),
      partNo: form.partNo.trim(),
      material: form.material.trim(),
      lotNo: form.lotNo.trim(),
      process: form.process.trim(),
      qty: Number(form.qty) || 0,
      unit: form.unit || "EA",
      excelFile: form.excelFile,
      pdfFile: form.pdfFile,
    });
    setActiveId(null);
    setRefreshKey((key) => key + 1);
    setPage(1);
  };

  const buildRegisterInitialFromRow = (row) => {
    if (!row) return null;
    const record = getSessionProductionRecords().find((item) => item.id === row.managementId);
    return (
      buildCertificateEntryFromRecord(record, {
        managementId: row.managementId,
        lotNo: row.lotNo !== "—" ? row.lotNo : "",
        company: row.company !== "—" ? row.company : "",
        partName: row.partName !== "—" ? row.partName : "",
        partNo: row.partNo !== "—" ? row.partNo : "",
        material: row.material !== "—" ? row.material : "",
        process: row.processName !== "—" ? row.processName : "",
        qty: row.entry.qty,
        unit: row.entry.unit,
        excelFile: row.entry.excelFile,
        pdfFile: row.entry.pdfFile,
      }) ?? {
        managementId: row.managementId,
        lotNo: row.lotNo !== "—" ? row.lotNo : "",
        company: row.company,
        partName: row.partName,
        partNo: row.partNo,
        material: row.material,
        process: row.processName !== "—" ? row.processName : "",
        qty: row.entry.qty,
        unit: row.entry.unit,
      }
    );
  };

  const handleDetailRegister = () => {
    if (!activeRow) return;
    openRegister(buildRegisterInitialFromRow(activeRow));
  };

  const handleRowDoubleClick = (row) => {
    openRegister(buildRegisterInitialFromRow(row));
  };

  return (
    <div className="inbound-page quality-page">
      <SectionPageActions>
        <PrimaryButton type="button" onClick={() => openRegister()}>
          <Plus size={14} aria-hidden="true" />
          {CERTIFICATE_FILE_REGISTER_LABEL}
        </PrimaryButton>
        <SecondaryButton type="button">
          <FileSpreadsheet size={14} aria-hidden="true" />
          엑셀 출력
        </SecondaryButton>
      </SectionPageActions>

      <TitanKpiBarSlot ariaLabel="성적서 현황" className="inbound-page__kpi">
        <TitanWorkflowStatusChipBar
          chipSetId="certificate"
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
        advancedContent={
          <div className="titan-advanced-search__grid">
            <ManagementIdField draft={draft} onDraftChange={onDraftChange} getSuggestions={getSuggestions} />
            <LotNoField draft={draft} onDraftChange={onDraftChange} getSuggestions={getSuggestions} />
            <ProcessField draft={draft} onDraftChange={onDraftChange} getSuggestions={getSuggestions} />
            <DateRangeField
              label="등록일"
              fromKey="registeredDateFrom"
              toKey="registeredDateTo"
              draft={draft}
              onDraftChange={onDraftChange}
            />
            <AssigneeField draft={draft} onDraftChange={onDraftChange} getSuggestions={getSuggestions} />
            <StatusSelectField
              label="현재상태"
              value={draft.status}
              onChange={(e) => onDraftChange({ ...draft, status: e.target.value })}
              options={CERTIFICATE_FILE_STATUS_OPTIONS}
            />
          </div>
        }
      />

      <div className="inbound-page__workspace">
        <div className="inbound-page__list">
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
            emptyMessage="등록된 성적서 파일이 없습니다."
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
            actionLabel={CERTIFICATE_FILE_REGISTER_LABEL}
            actionIcon={Plus}
            onAction={handleDetailRegister}
            processFlowSteps={processFlowSteps}
            detailContent={
              <dl className="inbound-detail">
                <div>
                  <dt>관리번호</dt>
                  <dd>{activeRow.managementId}</dd>
                </div>
                <div>
                  <dt>LOT.NO</dt>
                  <dd>{activeRow.lotNo}</dd>
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
                  <dt>공정</dt>
                  <dd>
                    {activeRow.processName && activeRow.processName !== "—" ? (
                      <StatusChip variant={getProcessChipVariant(activeRow.processName)}>
                        {activeRow.processName}
                      </StatusChip>
                    ) : (
                      "—"
                    )}
                  </dd>
                </div>
                <div>
                  <dt>엑셀</dt>
                  <dd>
                    <FileMark registered={activeRow.excelRegistered} />
                    {activeRow.entry.excelFile?.name ? ` ${activeRow.entry.excelFile.name}` : ""}
                  </dd>
                </div>
                <div>
                  <dt>PDF</dt>
                  <dd>
                    <FileMark registered={activeRow.pdfRegistered} />
                    {activeRow.entry.pdfFile?.name ? ` ${activeRow.entry.pdfFile.name}` : ""}
                  </dd>
                </div>
                <div>
                  <dt>등록일</dt>
                  <dd>{activeRow.registeredDate}</dd>
                </div>
                <div>
                  <dt>현재상태</dt>
                  <dd>
                    <StatusChip variant={activeRow.statusVariant}>{activeRow.statusLabel}</StatusChip>
                  </dd>
                </div>
              </dl>
            }
          />
        ) : null}
      </div>

      <CertificateRegisterModal
        open={registerOpen}
        onClose={() => setRegisterOpen(false)}
        onRegister={handleRegister}
        initialData={registerInitial}
      />
    </div>
  );
}

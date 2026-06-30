import { useMemo, useState } from "react";
import { FileSpreadsheet, Plus } from "lucide-react";
import { PrimaryButton, SecondaryButton } from "../../foundation/components/Button";
import Input from "../../foundation/components/Input";
import StatusChip from "../../foundation/components/StatusChip";
import TitanDataTable from "../../foundation/components/DataTable";
import TitanSearchPanel from "../../foundation/components/TitanSearchPanel";
import TitanTableFooter from "../../foundation/components/TitanTableFooter";
import TitanDetailPanel from "../../foundation/components/TitanDetailPanel";
import ProductionKpiPanel from "../../foundation/components/ProductionKpiPanel";
import {
  CERTIFICATE_FILE_STATUS_OPTIONS,
  CERTIFICATE_STATUS_CARDS,
  CERTIFICATE_STATUS_PANEL,
} from "../../config/qualityDashboard";
import { createEmptyCertificateSearch } from "../../config/listSearchStandard";
import { buildCertificateListColumns } from "../../config/standardProductList";
import { CERTIFICATE_FILE_REGISTER_LABEL } from "../../config/registerModalStandard";
import {
  getProcessChipVariant,
  getProductionProcessCodes,
} from "../../config/productionProcessCodes";
import { useAdvancedSearchOpen } from "../../foundation/hooks/useAdvancedSearchOpen";
import { useListPagination } from "../../foundation/hooks/useListPagination";
import { getMasterDataByCategory } from "../../utils/masterData";
import {
  getCertificateFileEntries,
  upsertCertificateFileEntry,
  buildCertificateEntryFromRecord,
} from "../../utils/certificateSession";
import { mapCertificateEntryToListRow, matchesCertificateSearch } from "../../utils/certificateStatus";
import { buildCertificateKpiCounts } from "../../utils/qualityAnalytics";
import { getProcessFlowSteps } from "../../utils/processFlow";
import { getSessionProductionRecords } from "../../utils/productionRecords";
import CertificateRegisterModal from "./CertificateRegisterModal";
import "../InOut/InboundManagement.css";
import "./QualityManagement.css";

const EMPTY_SEARCH = createEmptyCertificateSearch();

function FileMark({ registered }) {
  return (
    <span className={`quality-file-mark${registered ? "" : " is-empty"}`}>{registered ? "○" : "—"}</span>
  );
}

export default function CertificateManagement() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [registerInitial, setRegisterInitial] = useState(null);
  const [search, setSearch] = useState(EMPTY_SEARCH);
  const [draft, setDraft] = useState(EMPTY_SEARCH);
  const [advancedOpen, toggleAdvanced] = useAdvancedSearchOpen("titan-certificate-advanced");
  const [selectedIds, setSelectedIds] = useState([]);
  const [activeId, setActiveId] = useState(null);

  const companies = useMemo(() => getMasterDataByCategory("companies"), []);
  const workers = useMemo(() => getMasterDataByCategory("workers"), []);
  const processCodes = useMemo(() => getProductionProcessCodes(), []);

  const certificateStatusCards = useMemo(() => {
    const entries = getCertificateFileEntries();
    const counts = buildCertificateKpiCounts(getSessionProductionRecords(), entries);
    return CERTIFICATE_STATUS_CARDS.map((card) => {
      if (card.id === "registerRate") {
        return { ...card, value: counts.registerRate, unit: "%" };
      }
      return { ...card, count: counts[card.id] ?? 0 };
    });
  }, [refreshKey]);

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

  const handleSearch = () => setSearch({ ...draft });
  const handleReset = () => {
    setDraft(EMPTY_SEARCH);
    setSearch(EMPTY_SEARCH);
  };

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

  const handleDetailRegister = () => {
    if (!activeRow) return;
    const record = getSessionProductionRecords().find((item) => item.id === activeRow.managementId);
    openRegister(
      buildCertificateEntryFromRecord(record, {
        managementId: activeRow.managementId,
        lotNo: activeRow.lotNo !== "—" ? activeRow.lotNo : "",
        company: activeRow.company !== "—" ? activeRow.company : "",
        partName: activeRow.partName !== "—" ? activeRow.partName : "",
        partNo: activeRow.partNo !== "—" ? activeRow.partNo : "",
        material: activeRow.material !== "—" ? activeRow.material : "",
        process: activeRow.processName !== "—" ? activeRow.processName : "",
        qty: activeRow.entry.qty,
        unit: activeRow.entry.unit,
        excelFile: activeRow.entry.excelFile,
        pdfFile: activeRow.entry.pdfFile,
      }) ?? {
        managementId: activeRow.managementId,
        lotNo: activeRow.lotNo !== "—" ? activeRow.lotNo : "",
        company: activeRow.company,
        partName: activeRow.partName,
        partNo: activeRow.partNo,
        material: activeRow.material,
        process: activeRow.processName !== "—" ? activeRow.processName : "",
        qty: activeRow.entry.qty,
        unit: activeRow.entry.unit,
      }
    );
  };

  return (
    <div className="inbound-page quality-page">
      <div className="inbound-page__toolbar">
        <h2 className="inbound-page__title">성적서관리</h2>
        <div className="inbound-page__actions">
          <PrimaryButton type="button" onClick={() => openRegister()}>
            <Plus size={14} aria-hidden="true" />
            {CERTIFICATE_FILE_REGISTER_LABEL}
          </PrimaryButton>
          <SecondaryButton type="button">
            <FileSpreadsheet size={14} aria-hidden="true" />
            엑셀 출력
          </SecondaryButton>
        </div>
      </div>

      <ProductionKpiPanel
        title={CERTIFICATE_STATUS_PANEL.title}
        titleIcon={CERTIFICATE_STATUS_PANEL.titleIcon}
        cards={certificateStatusCards}
        metricMode
      />

      <TitanSearchPanel
        draft={draft}
        onDraftChange={setDraft}
        onSearch={handleSearch}
        onReset={handleReset}
        advancedOpen={advancedOpen}
        onAdvancedToggle={toggleAdvanced}
        companies={companies}
        advancedContent={
          <div className="titan-advanced-search__grid">
            <label className="titan-advanced-search__field">
              <span className="titan-advanced-search__label">관리번호</span>
              <Input
                value={draft.managementId}
                onChange={(e) => setDraft({ ...draft, managementId: e.target.value })}
                placeholder="관리번호"
              />
            </label>
            <label className="titan-advanced-search__field">
              <span className="titan-advanced-search__label">LOT.NO</span>
              <Input
                value={draft.lotNo}
                onChange={(e) => setDraft({ ...draft, lotNo: e.target.value })}
                placeholder="LOT.NO"
              />
            </label>
            <label className="titan-advanced-search__field">
              <span className="titan-advanced-search__label">공정</span>
              <select
                className="titan-search-panel__select"
                value={draft.process}
                onChange={(e) => setDraft({ ...draft, process: e.target.value })}
              >
                <option value="">전체</option>
                {processCodes.map((item) => (
                  <option key={item.id} value={item.name}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="titan-advanced-search__field">
              <span className="titan-advanced-search__label">등록일</span>
              <div className="titan-advanced-search__date-range">
                <Input
                  type="date"
                  value={draft.registeredDateFrom}
                  onChange={(e) => setDraft({ ...draft, registeredDateFrom: e.target.value })}
                />
                <span>~</span>
                <Input
                  type="date"
                  value={draft.registeredDateTo}
                  onChange={(e) => setDraft({ ...draft, registeredDateTo: e.target.value })}
                />
              </div>
            </label>
            <label className="titan-advanced-search__field">
              <span className="titan-advanced-search__label">검사자</span>
              <select
                className="titan-search-panel__select"
                value={draft.assignee}
                onChange={(e) => setDraft({ ...draft, assignee: e.target.value })}
              >
                <option value="">전체</option>
                {workers.map((worker) => (
                  <option key={worker.id} value={worker.name}>
                    {worker.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="titan-advanced-search__field">
              <span className="titan-advanced-search__label">현재상태</span>
              <select
                className="titan-search-panel__select"
                value={draft.status}
                onChange={(e) => setDraft({ ...draft, status: e.target.value })}
              >
                <option value="">전체</option>
                {CERTIFICATE_FILE_STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>
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

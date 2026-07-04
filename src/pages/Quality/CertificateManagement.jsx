import { useMemo, useState } from "react";
import { FileSpreadsheet, Plus } from "lucide-react";
import { PrimaryButton, SecondaryButton } from "../../foundation/components/Button";
import TitanSearchPanel, { useSearchSuggestionHelpers } from "../../foundation/components/TitanSearchPanel";
import TitanStandardProductAdvancedSearch from "../../foundation/components/TitanStandardProductAdvancedSearch";
import StatusChip from "../../foundation/components/StatusChip";
import TitanDataTable from "../../foundation/components/DataTable";
import TitanTableFooter from "../../foundation/components/TitanTableFooter";
import { openRowDetailPopup } from "../../foundation/utils/openRowDetailPopup";
import TitanScreenDetailPopup from "../../foundation/components/TitanScreenDetailPopup";
import CertificateRowActions from "./CertificateRowActions";
import { titanColumn } from "../../config/tableColumnPresets";
import TitanKpiBarSlot from "../../foundation/components/TitanKpiBarSlot";
import TitanWorkflowStatusChipBar from "../../foundation/components/TitanWorkflowStatusChipBar";
import { useWorkflowChipFilter } from "../../foundation/hooks/useWorkflowChipFilter";
import {
  CERTIFICATE_FILE_STATUS_OPTIONS,
} from "../../config/qualityDashboard";
import { createEmptyCertificateSearch, STANDARD_PRODUCT_BASIC_SEARCH_FIELDS } from "../../config/listSearchStandard";
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
  const [detailPopupRow, setDetailPopupRow] = useState(null);
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

  const renderProcessChip = (row) =>
    row.currentProcess && row.currentProcess !== "—" ? (
      <StatusChip variant={getProcessChipVariant(row.currentProcess)}>{row.currentProcess}</StatusChip>
    ) : (
      "—"
    );

  const columns = useMemo(
    () =>
      buildCertificateListColumns({
        renderProcess: renderProcessChip,
        renderActions: (row) => (
          <CertificateRowActions
            onDetail={() => {
              setActiveId(row.id);
              setDetailPopupRow(row);
            }}
            onIssue={() => openRegister(buildRegisterInitialFromRow(row))}
            onEdit={() => openRegister(buildRegisterInitialFromRow(row))}
            onCancel={() => {
              setActiveId(row.id);
              openRegister(buildRegisterInitialFromRow(row));
            }}
          />
        ),
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

  const buildCertificateDetailContent = (row) =>
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
          <dt>엑셀</dt>
          <dd>
            <FileMark registered={row.excelRegistered} />
            {row.entry.excelFile?.name ? ` ${row.entry.excelFile.name}` : ""}
          </dd>
        </div>
        <div>
          <dt>PDF</dt>
          <dd>
            <FileMark registered={row.pdfRegistered} />
            {row.entry.pdfFile?.name ? ` ${row.entry.pdfFile.name}` : ""}
          </dd>
        </div>
        <div>
          <dt>등록일</dt>
          <dd>{row.registeredDate}</dd>
        </div>
        <div>
          <dt>현재상태</dt>
          <dd>
            <StatusChip variant={row.statusVariant}>{row.statusLabel}</StatusChip>
          </dd>
        </div>
      </dl>
    ) : null;

  const openDetailPopup = (row) => {
    openRowDetailPopup(row, { setActiveId, setDetailPopupRow });
  };

  const handleRowDoubleClick = (row) => {
    openDetailPopup(row);
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

      <CertificateRegisterModal
        open={registerOpen}
        onClose={() => setRegisterOpen(false)}
        onRegister={handleRegister}
        initialData={registerInitial}
      />

      <TitanScreenDetailPopup
        screenKey="certificate"
        open={Boolean(detailPopupRow)}
        onClose={() => setDetailPopupRow(null)}
        record={detailPopupRow}
        context={{
          detailContent: buildCertificateDetailContent(detailPopupRow),
          traceRecord: detailPopupRow
            ? getSessionProductionRecords().find((record) => record.id === detailPopupRow.managementId)
            : null,
          processFlowSteps: detailPopupRow
            ? getProcessFlowSteps(
                getSessionProductionRecords().find((record) => record.id === detailPopupRow.managementId)
              )
            : [],
          eventLists: {
            certificatePdf: detailPopupRow?.entry?.pdfFile?.name ? (
              <p>{detailPopupRow.entry.pdfFile.name}</p>
            ) : null,
          },
        }}
      />
    </div>
  );
}

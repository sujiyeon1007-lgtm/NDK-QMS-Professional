import { useEffect, useMemo, useState } from "react";
import { Download } from "lucide-react";
import { SecondaryButton } from "../../foundation/components/Button";
import TitanSearchPanel, { useSearchSuggestionHelpers } from "../../foundation/components/TitanSearchPanel";
import TitanStandardProductAdvancedSearch from "../../foundation/components/TitanStandardProductAdvancedSearch";
import TitanDataTable from "../../foundation/components/DataTable";
import TitanTableFooter from "../../foundation/components/TitanTableFooter";
import { openRowDetailPopup } from "../../foundation/utils/openRowDetailPopup";
import TitanScreenDetailPopup from "../../foundation/components/TitanScreenDetailPopup";
import CertificateStatusRowActions from "./CertificateStatusRowActions";
import { buildCertificateHistoryListColumns } from "../../config/standardProductList";
import { createEmptyCertificateHistorySearch, STANDARD_PRODUCT_BASIC_SEARCH_FIELDS } from "../../config/listSearchStandard";
import { useTitanListSearch } from "../../foundation/hooks/useTitanListSearch";
import { useListPagination } from "../../foundation/hooks/useListPagination";
import { getMasterDataByCategory } from "../../utils/masterData";
import {
  upsertCertificateFileEntry,
  buildCertificateEntryFromRecord,
} from "../../utils/certificateSession";
import { getProductionProcessCodes } from "../../config/productionProcessCodes";
import { getCertificateHistoryScreenData } from "../../utils/qualityWorkspaceData";
import { matchesCertificateHistorySearch } from "../../utils/certificateStatus";
import { getSessionProductionRecords } from "../../utils/productionRecords";
import { subscribeWorkflowDataRefresh } from "../../utils/titanWorkflowRefresh";
import CertificateRegisterModal from "./CertificateRegisterModal";
import "../InOut/InboundManagement.css";
import "./QualityManagement.css";

function PdfDownloadCell({ row }) {
  const fileName = row.entry?.pdfFile?.name;
  if (!fileName) {
    return <span className="quality-file-mark is-empty">—</span>;
  }
  return (
    <SecondaryButton
      type="button"
      className="titan-btn--table-action"
      onClick={(event) => {
        event.stopPropagation();
        window.alert(`PDF: ${fileName}\n(RC1 — SessionStorage 보관 · 향후 V1.1 TDE 연동 예정)`);
      }}
    >
      <Download size={14} aria-hidden="true" />
      PDF
    </SecondaryButton>
  );
}

export default function CertificateStatusPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [registerInitial, setRegisterInitial] = useState(null);
  const { search, draft, onDraftChange, onSearch, onReset, advancedOpen, onAdvancedToggle } =
    useTitanListSearch(createEmptyCertificateHistorySearch, { storageKey: "certificate-status" });
  const [selectedIds, setSelectedIds] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [detailPopupRow, setDetailPopupRow] = useState(null);
  const screenData = useMemo(() => getCertificateHistoryScreenData(), [refreshKey]);
  const companies = useMemo(() => getMasterDataByCategory("companies"), []);
  const processCodes = useMemo(() => getProductionProcessCodes(), []);

  useEffect(() => subscribeWorkflowDataRefresh(() => setRefreshKey((key) => key + 1)), []);

  const searchRecords = useMemo(
    () =>
      screenData.baseRecords.map((row) => ({
        ...(row.record && typeof row.record === "object" ? row.record : {}),
        ...(row.entry && typeof row.entry === "object" ? row.entry : {}),
        managementId: row.managementId,
        issuedDate: row.issuedDate,
      })),
    [screenData.baseRecords]
  );

  const { getSuggestions } = useSearchSuggestionHelpers(searchRecords, {
    process: processCodes.map((item) => item.name),
  });

  const rows = useMemo(() => {
    return screenData.baseRecords
      .filter((row) => matchesCertificateHistorySearch(row, search))
      .sort((a, b) => String(b.issuedDate).localeCompare(String(a.issuedDate)));
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

  const buildRegisterInitialFromRow = (row) => {
    if (!row?.entry) return null;
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
        qty: row.entry?.qty,
        unit: row.entry?.unit,
        excelFile: row.entry?.excelFile,
        pdfFile: row.entry?.pdfFile,
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

  const openReissue = (row) => {
    setRegisterInitial(buildRegisterInitialFromRow(row));
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
      registeredBy: form.registeredBy?.trim() || "",
      excelFile: form.excelFile,
      pdfFile: form.pdfFile,
    });
    setActiveId(null);
    setRefreshKey((key) => key + 1);
    setPage(1);
  };

  const columns = useMemo(
    () =>
      buildCertificateHistoryListColumns({
        renderPdf: (row) => <PdfDownloadCell row={row} />,
        renderActions: (row) => (
          <CertificateStatusRowActions onReissue={() => openReissue(row)} />
        ),
      }),
    []
  );

  const openDetailPopup = (row) => {
    openRowDetailPopup(row, { setActiveId, setDetailPopupRow });
  };

  return (
    <div className="inbound-page quality-page quality-page--inquiry">
      <div className="inbound-page__history-heading" role="heading" aria-level="2">
        성적서 발행 이력
      </div>

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
          selectable={false}
          activeRowId={activeRow?.id}
          onRowClick={(row) => setActiveId(row.id)}
          onRowDoubleClick={openDetailPopup}
          emptyMessage="등록된 성적서 발행 이력이 없습니다."
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
      />
    </div>
  );
}

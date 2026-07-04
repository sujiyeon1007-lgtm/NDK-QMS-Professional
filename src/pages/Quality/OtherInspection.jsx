import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { PrimaryButton } from "../../foundation/components/Button";
import StatusChip from "../../foundation/components/StatusChip";
import TitanDataTable from "../../foundation/components/DataTable";
import TitanSearchPanel, {
  TitanAdvancedSearchField,
  useSearchSuggestionHelpers,
} from "../../foundation/components/TitanSearchPanel";
import TitanAdvancedSearchGrid from "../../foundation/components/TitanAdvancedSearchGrid";
import {
  AssigneeField,
  DateRangeField,
} from "../../foundation/components/TitanSearchAdvancedFields";
import TitanTableFooter from "../../foundation/components/TitanTableFooter";
import {
  createEmptyInspectionManagementSearch,
  STANDARD_PRODUCT_BASIC_SEARCH_FIELDS,
} from "../../config/listSearchStandard";
import { buildOtherInspectionListColumns } from "../../config/standardProductList";
import { OTHER_INSPECTION_CATEGORIES, OTHER_INSPECTION_STATUS } from "../../config/inspectionManagement";
import { useTitanListSearch } from "../../foundation/hooks/useTitanListSearch";
import { useListPagination } from "../../foundation/hooks/useListPagination";
import { getMasterDataByCategory } from "../../utils/masterData";
import {
  getOtherInspections,
  mapOtherInspectionToListRow,
  matchesOtherInspectionSearch,
  softDeleteOtherInspection,
  upsertOtherInspection,
} from "../../utils/otherInspectionSession";
import OtherInspectionRegisterModal from "./OtherInspectionRegisterModal";
import InspectionRegisterRowActions from "./InspectionRegisterRowActions";
import { openRowDetailPopup } from "../../foundation/utils/openRowDetailPopup";
import TitanScreenDetailPopup from "../../foundation/components/TitanScreenDetailPopup";
import SectionPageActions from "../../foundation/layout/SectionPageActions";
import "../InOut/InboundManagement.css";
import "./QualityManagement.css";

function resolveInspectionStatusVariant(status) {
  if (status === "완료") return "complete";
  if (status === "보류") return "defect";
  if (status === "진행중") return "production";
  return "wait";
}

export default function OtherInspection() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [editRecord, setEditRecord] = useState(null);
  const [modalMode, setModalMode] = useState("create");
  const { search, draft, onDraftChange, onSearch, onReset, advancedOpen, onAdvancedToggle } =
    useTitanListSearch(createEmptyInspectionManagementSearch, { storageKey: "inspection-other" });
  const [selectedIds, setSelectedIds] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [detailPopupRow, setDetailPopupRow] = useState(null);

  const companies = useMemo(() => getMasterDataByCategory("companies"), []);
  const searchRecords = useMemo(
    () => getOtherInspections().map(mapOtherInspectionToListRow),
    [refreshKey]
  );
  const { getSuggestions } = useSearchSuggestionHelpers(searchRecords, {
    status: OTHER_INSPECTION_STATUS,
    category: OTHER_INSPECTION_CATEGORIES.map((item) => item.value),
  });

  const rows = useMemo(() => {
    return getOtherInspections()
      .map(mapOtherInspectionToListRow)
      .filter((row) => matchesOtherInspectionSearch(row, search))
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

  const activeRow = pagedRows.find((row) => row.id === activeId) ?? null;

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

  const openCreateModal = () => {
    setEditRecord(null);
    setModalMode("create");
    setRegisterOpen(true);
  };

  const openInspectModal = (row) => {
    setEditRecord(row.record);
    setModalMode("inspect");
    setRegisterOpen(true);
  };

  const openEditModal = (row) => {
    setEditRecord(row.record);
    setModalMode("edit");
    setRegisterOpen(true);
  };

  const handleRegister = (payload) => {
    const next =
      modalMode === "inspect"
        ? { ...payload, status: payload.status === "완료" ? payload.status : "완료" }
        : payload;
    upsertOtherInspection(next);
    setRefreshKey((value) => value + 1);
  };

  const handleDelete = (row) => {
    const confirmed = globalThis.confirm?.("기타검사 항목을 삭제하시겠습니까?");
    if (!confirmed) return;
    softDeleteOtherInspection(row.id);
    setRefreshKey((value) => value + 1);
  };

  const openDetailPopup = (row) => {
    openRowDetailPopup(row, { setActiveId, setDetailPopupRow });
  };

  const columns = useMemo(
    () =>
      buildOtherInspectionListColumns({
        renderStatus: (row) => (
          <StatusChip variant={resolveInspectionStatusVariant(row.status)}>{row.status}</StatusChip>
        ),
        renderActions: (row) => {
          const isComplete = row.status === "완료";
          return (
            <InspectionRegisterRowActions
              onDetail={() => {
                setActiveId(row.id);
                setDetailPopupRow(row);
              }}
              canRegister={!isComplete}
              canEdit
              canDelete
              onRegister={() => openInspectModal(row)}
              onEdit={() => openEditModal(row)}
              onDelete={() => handleDelete(row)}
            />
          );
        },
      }),
    []
  );

  return (
    <div className="inbound-page quality-page">
      <SectionPageActions>
        <PrimaryButton type="button" onClick={openCreateModal}>
          <Plus size={14} aria-hidden="true" />
          검사등록
        </PrimaryButton>
      </SectionPageActions>

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
        statusFieldLabel="상태"
        advancedContent={
          <TitanAdvancedSearchGrid>
            <TitanAdvancedSearchField
              label="구분"
              fieldKey="category"
              value={draft.category ?? ""}
              onChange={(value) => onDraftChange({ ...draft, category: value })}
              suggestions={getSuggestions("category", draft.category)}
              placeholder="구분"
            />
            <DateRangeField
              label="등록일"
              fromKey="registeredDateFrom"
              toKey="registeredDateTo"
              draft={draft}
              onDraftChange={onDraftChange}
            />
            <AssigneeField draft={draft} onDraftChange={onDraftChange} getSuggestions={getSuggestions} />
            <TitanAdvancedSearchField
              label="비고"
              fieldKey="note"
              value={draft.note ?? ""}
              onChange={(value) => onDraftChange({ ...draft, note: value })}
              placeholder="비고"
            />
          </TitanAdvancedSearchGrid>
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
          onRowDoubleClick={openDetailPopup}
          emptyMessage="등록된 기타검사가 없습니다."
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

      <OtherInspectionRegisterModal
        open={registerOpen}
        mode={modalMode}
        onClose={() => {
          setRegisterOpen(false);
          setEditRecord(null);
          setModalMode("create");
        }}
        onRegister={handleRegister}
        initialRecord={editRecord}
      />

      <TitanScreenDetailPopup
        screenKey="inspection"
        open={Boolean(detailPopupRow)}
        onClose={() => setDetailPopupRow(null)}
        record={detailPopupRow}
        context={{
          detailContent: detailPopupRow ? (
            <dl className="inbound-detail">
              <div>
                <dt>품번</dt>
                <dd>{detailPopupRow.partNo}</dd>
              </div>
              <div>
                <dt>품명</dt>
                <dd>{detailPopupRow.partName}</dd>
              </div>
              <div>
                <dt>업체명</dt>
                <dd>{detailPopupRow.company}</dd>
              </div>
              <div>
                <dt>상태</dt>
                <dd>{detailPopupRow.status}</dd>
              </div>
            </dl>
          ) : null,
        }}
      />
    </div>
  );
}

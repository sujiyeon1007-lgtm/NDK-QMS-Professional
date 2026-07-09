import { useMemo, useState } from "react";
import { FileArchive, Pencil, Plus, Trash2 } from "lucide-react";

import TitanDataTable from "../../foundation/components/DataTable";
import TitanRegisterModal from "../../foundation/components/TitanRegisterModal";
import TitanStandardDetailPopup from "../../foundation/components/detailPopup/TitanStandardDetailPopup";
import TitanTableFooter from "../../foundation/components/TitanTableFooter";
import TitanTableRowActions from "../../foundation/components/TitanTableRowActions";
import FoundationAttachment, { FoundationAttachmentBadge, FoundationAttachmentPopup } from "../../foundation/components/FoundationAttachment";
import FoundationQrPanel from "../../foundation/components/FoundationQrPanel";
import { PrimaryButton, SecondaryButton } from "../../foundation/components/Button";
import { useListPagination } from "../../foundation/hooks/useListPagination";
import { getMasterDataByCategory } from "../../utils/masterData";
import {
  deleteIncomingDocumentArchiveRow,
  getIncomingDocumentArchiveRows,
  INCOMING_DOCUMENT_TYPES,
  matchesIncomingDocumentArchiveSearch,
  saveIncomingDocumentArchiveRow,
} from "../../utils/incomingDocumentArchiveSession";
import { normalizeFoundationAttachments } from "../../utils/foundationAttachmentEngine";
import "./DocumentManagementPage.css";

const L = {
  title: "\uC218\uC2E0\uBB38\uC11C \uBCF4\uAD00\uD568",
  desc: "\uAC70\uB798\uCC98\uC5D0\uC11C \uBC1B\uC740 \uBB38\uC11C\uB97C \uC785\uACE0\u00B7LOT Workflow\uC640 \uBD84\uB9AC\uD558\uC5EC \uBCF4\uAD00\u00B7\uAC80\uC0C9\uD569\uB2C8\uB2E4.",
  register: "\uC218\uC2E0\uBB38\uC11C \uB4F1\uB85D",
  editTitle: "\uC218\uC2E0\uBB38\uC11C \uC218\uC815",
  save: "\uC800\uC7A5",
  company: "\uAC70\uB798\uCC98",
  type: "\uBB38\uC11C\uC720\uD615",
  titleLabel: "\uBB38\uC11C\uC81C\uBAA9",
  receivedDate: "\uC218\uC2E0\uC77C",
  orderNo: "\uBC1C\uC8FC\uBC88\uD638",
  orderNoOptional: "\uBC1C\uC8FC\uBC88\uD638 (\uC120\uD0DD)",
  manager: "\uB2F4\uB2F9\uC790",
  memo: "\uBA54\uBAA8",
  attachments: "\uCCA8\uBD80\uD30C\uC77C",
  registeredDate: "\uB4F1\uB85D\uC77C",
  actions: "\uC791\uC5C5",
  edit: "\uC218\uC815",
  delete: "\uC0AD\uC81C",
  reset: "\uCD08\uAE30\uD654",
  all: "\uC804\uCCB4",
  requiredAlert: "\uAC70\uB798\uCC98, \uBB38\uC11C\uC81C\uBAA9, \uC218\uC2E0\uC77C\uC740 \uD544\uC218\uC785\uB2C8\uB2E4.",
  deleteConfirm: "\uC218\uC2E0\uBB38\uC11C\uB97C \uC0AD\uC81C\uD558\uC2DC\uACA0\uC2B5\uB2C8\uAE4C?",
  empty: "\uB4F1\uB85D\uB41C \uC218\uC2E0\uBB38\uC11C\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.",
  noMemo: "\uB4F1\uB85D\uB41C \uBA54\uBAA8\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.",
  noOrder: "\uBC1C\uC8FC\uBC88\uD638 \uC5C6\uC74C",
  stored: "\uC218\uC2E0\uBB38\uC11C \uBCF4\uAD00",
  chooseCompany: "\uAC70\uB798\uCC98 \uC120\uD0DD",
  chooseOptional: "\uC120\uD0DD \uC785\uB825",
};

const DETAIL_TABS = [
  { id: "basicInfo", label: "\uAE30\uBCF8\uC815\uBCF4" },
  { id: "attachments", label: L.attachments },
  { id: "memo", label: L.memo },
  { id: "changes", label: "\uBCC0\uACBD\uC774\uB825" },
];

function emptySearch() {
  return { company: "", documentType: "all", title: "", orderNo: "", registeredDateFrom: "", registeredDateTo: "", receivedDateFrom: "", receivedDateTo: "", memo: "" };
}

function createDraft(row = {}) {
  return {
    id: row.id || "",
    company: row.company || "",
    documentType: row.documentType || INCOMING_DOCUMENT_TYPES[0].id,
    title: row.title || "",
    receivedDate: row.receivedDate || new Date().toISOString().slice(0, 10),
    orderNo: row.orderNo || "",
    manager: row.manager || "",
    memo: row.memo || "",
    attachments: normalizeFoundationAttachments(row.attachments || []),
  };
}

function IncomingDocumentForm({ draft, setDraft, companies }) {
  const update = (key, value) => setDraft((prev) => ({ ...prev, [key]: value }));
  const updateAttachments = (attachments) => update("attachments", attachments);

  return (
    <div className="incoming-document-form">
      <label className="incoming-document-form__field"><span>{L.company} *</span><select value={draft.company} onChange={(event) => update("company", event.target.value)}><option value="">{L.chooseCompany}</option>{companies.map((company) => <option key={company.id} value={company.name}>{company.name}</option>)}</select></label>
      <label className="incoming-document-form__field"><span>{L.type} *</span><select value={draft.documentType} onChange={(event) => update("documentType", event.target.value)}>{INCOMING_DOCUMENT_TYPES.map((type) => <option key={type.id} value={type.id}>{type.label}</option>)}</select></label>
      <label className="incoming-document-form__field incoming-document-form__field--wide"><span>{L.titleLabel} *</span><input value={draft.title} onChange={(event) => update("title", event.target.value)} /></label>
      <label className="incoming-document-form__field"><span>{L.receivedDate} *</span><input type="date" value={draft.receivedDate} onChange={(event) => update("receivedDate", event.target.value)} /></label>
      <label className="incoming-document-form__field"><span>{L.orderNoOptional}</span><input value={draft.orderNo} onChange={(event) => update("orderNo", event.target.value)} placeholder={L.chooseOptional} /></label>
      <label className="incoming-document-form__field"><span>{L.manager}</span><input value={draft.manager} onChange={(event) => update("manager", event.target.value)} /></label>
      <label className="incoming-document-form__field incoming-document-form__field--wide"><span>{L.memo}</span><textarea rows={3} value={draft.memo} onChange={(event) => update("memo", event.target.value)} /></label>
      <section className="incoming-document-form__attachments"><h3>{L.attachments}</h3><FoundationAttachment attachments={draft.attachments} onUpload={(files) => updateAttachments([...draft.attachments, ...normalizeFoundationAttachments(files)])} onDelete={(attachmentId) => updateAttachments(draft.attachments.filter((attachment) => attachment.id !== attachmentId))} /></section>
    </div>
  );
}

function DetailBasic({ row }) {
  const items = [[L.company, row.company], [L.type, row.documentTypeLabel], [L.titleLabel, row.title], [L.receivedDate, row.receivedDate], [L.orderNo, row.orderNo || "-"], [L.manager, row.manager || "-"], [L.registeredDate, row.registeredDate], [L.attachments, row.attachments?.length ? `${row.attachments.length}count` : "-"]];
  return <>
    <dl className="incoming-document-detail-grid">{items.map(([label, value]) => <div key={label} className="incoming-document-detail-grid__item"><dt>{label}</dt><dd>{value || "-"}</dd></div>)}</dl>
    <FoundationQrPanel entityType="document" target={row} title={row.title || row.id} />
  </>;
}

function DetailMemo({ row }) {
  return <p className="incoming-document-detail-memo">{row.memo || L.noMemo}</p>;
}

function DetailHistory({ row }) {
  return <ul className="incoming-document-history">{(row.history || []).map((item, index) => <li key={`${item.at}-${index}`}><span>{String(item.at || "").replace("T", " ").slice(0, 16)}</span><strong>{item.action || "-"}</strong><em>{item.user || "-"}</em></li>)}</ul>;
}

export default function IncomingDocumentArchivePage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [search, setSearch] = useState(emptySearch);
  const [activeId, setActiveId] = useState("");
  const [detailRow, setDetailRow] = useState(null);
  const [registerMode, setRegisterMode] = useState(null);
  const [draft, setDraft] = useState(() => createDraft());
  const [attachmentPopupRow, setAttachmentPopupRow] = useState(null);
  const rows = useMemo(() => getIncomingDocumentArchiveRows(), [refreshKey]);
  const companies = useMemo(() => getMasterDataByCategory("companies"), [refreshKey]);
  const filteredRows = useMemo(() => rows.filter((row) => matchesIncomingDocumentArchiveSearch(row, search)), [rows, search]);
  const pagination = useListPagination(filteredRows);

  const openRegister = (row = null) => { setDraft(createDraft(row || {})); setRegisterMode(row ? "edit" : "register"); };
  const submit = () => {
    if (!draft.company || !draft.title || !draft.receivedDate) { window.alert(L.requiredAlert); return; }
    const saved = saveIncomingDocumentArchiveRow(draft);
    setRegisterMode(null); setRefreshKey((value) => value + 1); setActiveId(saved.id);
  };
  const remove = (row) => { if (row && window.confirm(`${row.title}\n${L.deleteConfirm}`)) { deleteIncomingDocumentArchiveRow(row.id); setRefreshKey((value) => value + 1); setDetailRow(null); } };
  const updateDetailAttachments = (attachments) => { if (!detailRow) return; const saved = saveIncomingDocumentArchiveRow({ ...detailRow, attachments }); setDetailRow(saved); setRefreshKey((value) => value + 1); };
  const renderDetailTab = (tabId) => {
    if (!detailRow) return null;
    if (tabId === "attachments") return <FoundationAttachment attachments={detailRow.attachments} onUpload={(files) => updateDetailAttachments([...detailRow.attachments, ...normalizeFoundationAttachments(files)])} onDelete={(attachmentId) => updateDetailAttachments(detailRow.attachments.filter((attachment) => attachment.id !== attachmentId))} />;
    if (tabId === "memo") return <DetailMemo row={detailRow} />;
    if (tabId === "changes") return <DetailHistory row={detailRow} />;
    return <DetailBasic row={detailRow} />;
  };

  const columns = [
    { key: "company", label: L.company, widthPercent: 13 }, { key: "documentTypeLabel", label: L.type, widthPercent: 13 }, { key: "title", label: L.titleLabel, widthPercent: 18 }, { key: "receivedDate", label: L.receivedDate, widthPercent: 9 }, { key: "orderNo", label: L.orderNo, widthPercent: 12, render: (row) => row.orderNo || "-" }, { key: "manager", label: L.manager, widthPercent: 9, render: (row) => row.manager || "-" }, { key: "registeredDate", label: L.registeredDate, widthPercent: 9 },
    { key: "attachments", label: L.attachments, widthPercent: 8, render: (row) => <FoundationAttachmentBadge count={row.attachments?.length || 0} onClick={(event) => { event.stopPropagation(); setAttachmentPopupRow(row); }} /> },
    { key: "actions", label: L.actions, widthPercent: 9, render: (row) => <TitanTableRowActions><SecondaryButton type="button" className="titan-btn--table-action" onClick={(event) => { event.stopPropagation(); openRegister(row); }}><Pencil size={12} aria-hidden="true" />{L.edit}</SecondaryButton><SecondaryButton type="button" className="titan-btn--table-action" onClick={(event) => { event.stopPropagation(); remove(row); }}><Trash2 size={12} aria-hidden="true" />{L.delete}</SecondaryButton></TitanTableRowActions> },
  ];

  return <div className="incoming-document-archive">
    <header className="incoming-document-archive__toolbar"><div><h2><FileArchive size={18} aria-hidden="true" />{L.title}</h2><p>{L.desc}</p></div><PrimaryButton type="button" onClick={() => openRegister()}><Plus size={14} aria-hidden="true" />{L.register}</PrimaryButton></header>
    <section className="incoming-document-search" aria-label="incoming document search">
      <label><span>{L.company}</span><input value={search.company} onChange={(event) => setSearch((prev) => ({ ...prev, company: event.target.value }))} /></label>
      <label><span>{L.type}</span><select value={search.documentType} onChange={(event) => setSearch((prev) => ({ ...prev, documentType: event.target.value }))}><option value="all">{L.all}</option>{INCOMING_DOCUMENT_TYPES.map((type) => <option key={type.id} value={type.id}>{type.label}</option>)}</select></label>
      <label><span>{L.titleLabel}</span><input value={search.title} onChange={(event) => setSearch((prev) => ({ ...prev, title: event.target.value }))} /></label>
      <label><span>{L.orderNo}</span><input value={search.orderNo} onChange={(event) => setSearch((prev) => ({ ...prev, orderNo: event.target.value }))} /></label>
      <label><span>{L.receivedDate} From</span><input type="date" value={search.receivedDateFrom} onChange={(event) => setSearch((prev) => ({ ...prev, receivedDateFrom: event.target.value }))} /></label>
      <label><span>{L.receivedDate} To</span><input type="date" value={search.receivedDateTo} onChange={(event) => setSearch((prev) => ({ ...prev, receivedDateTo: event.target.value }))} /></label>
      <label><span>{L.registeredDate} From</span><input type="date" value={search.registeredDateFrom} onChange={(event) => setSearch((prev) => ({ ...prev, registeredDateFrom: event.target.value }))} /></label>
      <label><span>{L.registeredDate} To</span><input type="date" value={search.registeredDateTo} onChange={(event) => setSearch((prev) => ({ ...prev, registeredDateTo: event.target.value }))} /></label>
      <label><span>{L.memo}</span><input value={search.memo} onChange={(event) => setSearch((prev) => ({ ...prev, memo: event.target.value }))} /></label>
      <SecondaryButton type="button" onClick={() => setSearch(emptySearch())}>{L.reset}</SecondaryButton>
    </section>
    <div className="quality-page__list"><TitanDataTable columns={columns} rows={pagination.pagedItems} activeRowId={activeId} onRowClick={(row) => setActiveId(row.id)} onRowDoubleClick={(row) => { setActiveId(row.id); setDetailRow(row); }} emptyMessage={L.empty} /><TitanTableFooter totalCount={pagination.totalCount} page={pagination.page} totalPages={pagination.totalPages} pageSize={pagination.pageSize} onPageChange={pagination.setPage} onPageSizeChange={pagination.setPageSize} /></div>
    <TitanRegisterModal open={Boolean(registerMode)} onClose={() => setRegisterMode(null)} onSubmit={submit} title={registerMode === "edit" ? L.editTitle : L.register} submitLabel={registerMode === "edit" ? L.save : L.register}><IncomingDocumentForm draft={draft} setDraft={setDraft} companies={companies} /></TitanRegisterModal>
    <TitanStandardDetailPopup open={Boolean(detailRow)} onClose={() => setDetailRow(null)} tabs={DETAIL_TABS} summary={detailRow ? { company: detailRow.company, partName: detailRow.title, partNo: detailRow.orderNo || L.noOrder, lotNo: detailRow.receivedDate, currentProcess: L.stored, statusLabel: detailRow.documentTypeLabel, statusVariant: "wait" } : null} renderTabContent={renderDetailTab} ariaLabel={L.title} />
    <FoundationAttachmentPopup open={Boolean(attachmentPopupRow)} title={attachmentPopupRow ? `${attachmentPopupRow.title} ${L.attachments}` : L.attachments} attachments={attachmentPopupRow?.attachments || []} onClose={() => setAttachmentPopupRow(null)} />
  </div>;
}
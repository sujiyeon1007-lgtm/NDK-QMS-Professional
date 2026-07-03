/**
 * Project TITAN V1.0 — 공통 상세 검색 필드 (자동완성)
 */
import Input from "./Input";
import { TitanAdvancedSearchField } from "./TitanSearchPanel";

export function ManagementIdField({ draft, onDraftChange, getSuggestions }) {
  return (
    <TitanAdvancedSearchField
      label="관리번호"
      fieldKey="managementId"
      value={draft.managementId ?? ""}
      onChange={(value) => onDraftChange({ ...draft, managementId: value })}
      suggestions={getSuggestions("managementId", draft.managementId)}
      placeholder="관리번호"
    />
  );
}

export function LotNoField({ draft, onDraftChange, getSuggestions }) {
  return (
    <TitanAdvancedSearchField
      label="LOT.NO"
      fieldKey="lotNo"
      value={draft.lotNo ?? ""}
      onChange={(value) => onDraftChange({ ...draft, lotNo: value })}
      suggestions={getSuggestions("lotNo", draft.lotNo)}
      placeholder="LOT.NO"
    />
  );
}

export function CustomerLotNoField({ draft, onDraftChange, getSuggestions }) {
  return (
    <TitanAdvancedSearchField
      label="업체 LOT"
      fieldKey="customerLotNo"
      value={draft.customerLotNo ?? ""}
      onChange={(value) => onDraftChange({ ...draft, customerLotNo: value })}
      suggestions={getSuggestions("customerLotNo", draft.customerLotNo)}
      placeholder="업체 LOT"
    />
  );
}

export function PurchaseOrderNoField({ draft, onDraftChange, getSuggestions }) {
  return (
    <TitanAdvancedSearchField
      label="발주번호"
      fieldKey="purchaseOrderNo"
      value={draft.purchaseOrderNo ?? ""}
      onChange={(value) => onDraftChange({ ...draft, purchaseOrderNo: value })}
      suggestions={getSuggestions("purchaseOrderNo", draft.purchaseOrderNo)}
      placeholder="발주번호"
    />
  );
}

export function DrawingNoField({ draft, onDraftChange, getSuggestions }) {
  return (
    <TitanAdvancedSearchField
      label="도번"
      fieldKey="drawingNo"
      value={draft.drawingNo ?? ""}
      onChange={(value) => onDraftChange({ ...draft, drawingNo: value })}
      suggestions={getSuggestions("drawingNo", draft.drawingNo)}
      placeholder="도번"
    />
  );
}

export function ProcessField({ draft, onDraftChange, getSuggestions }) {
  return (
    <TitanAdvancedSearchField
      label="열처리 공정"
      fieldKey="process"
      value={draft.process ?? ""}
      onChange={(value) => onDraftChange({ ...draft, process: value })}
      suggestions={getSuggestions("process", draft.process)}
      placeholder="열처리 공정"
      allowEmpty
      emptyLabel="전체"
    />
  );
}

export function ManagerField({ draft, onDraftChange, getSuggestions }) {
  return (
    <TitanAdvancedSearchField
      label="담당자"
      fieldKey="manager"
      value={draft.manager ?? ""}
      onChange={(value) => onDraftChange({ ...draft, manager: value })}
      suggestions={getSuggestions("manager", draft.manager)}
      placeholder="담당자"
    />
  );
}

export function AssigneeField({ draft, onDraftChange, getSuggestions }) {
  return (
    <TitanAdvancedSearchField
      label="검사자"
      fieldKey="assignee"
      value={draft.assignee ?? ""}
      onChange={(value) => onDraftChange({ ...draft, assignee: value })}
      suggestions={getSuggestions("assignee", draft.assignee)}
      placeholder="검사자"
    />
  );
}

export function ApproverField({ draft, onDraftChange, getSuggestions }) {
  return (
    <TitanAdvancedSearchField
      label="승인자"
      fieldKey="approver"
      value={draft.approver ?? ""}
      onChange={(value) => onDraftChange({ ...draft, approver: value })}
      suggestions={getSuggestions("approver", draft.approver)}
      placeholder="승인자"
    />
  );
}

export function WorkerField({ draft, onDraftChange, getSuggestions }) {
  return (
    <TitanAdvancedSearchField
      label="작업자"
      fieldKey="worker"
      value={draft.worker ?? ""}
      onChange={(value) => onDraftChange({ ...draft, worker: value })}
      suggestions={getSuggestions("worker", draft.worker)}
      placeholder="작업자"
    />
  );
}

export function EquipmentField({ draft, onDraftChange, getSuggestions }) {
  return (
    <TitanAdvancedSearchField
      label="설비"
      fieldKey="equipment"
      value={draft.equipment ?? ""}
      onChange={(value) => onDraftChange({ ...draft, equipment: value })}
      suggestions={getSuggestions("equipment", draft.equipment)}
      placeholder="설비"
    />
  );
}

export function NoteField({ draft, onDraftChange, getSuggestions }) {
  return (
    <TitanAdvancedSearchField
      label="비고"
      fieldKey="note"
      value={draft.note ?? ""}
      onChange={(value) => onDraftChange({ ...draft, note: value })}
      suggestions={getSuggestions("note", draft.note)}
      placeholder="비고"
    />
  );
}

export function DateRangeField({ label, fromKey, toKey, draft, onDraftChange }) {
  return (
    <label className="titan-advanced-search__field">
      <span className="titan-advanced-search__label">{label}</span>
      <div className="titan-advanced-search__date-range">
        <Input
          type="date"
          value={draft[fromKey] ?? ""}
          onChange={(e) => onDraftChange({ ...draft, [fromKey]: e.target.value })}
        />
        <span>~</span>
        <Input
          type="date"
          value={draft[toKey] ?? ""}
          onChange={(e) => onDraftChange({ ...draft, [toKey]: e.target.value })}
        />
      </div>
    </label>
  );
}

export function StatusSelectField({ label, value, onChange, options }) {
  return (
    <label className="titan-advanced-search__field">
      <span className="titan-advanced-search__label">{label}</span>
      <select className="titan-search-panel__select" value={value ?? ""} onChange={onChange}>
        <option value="">전체</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

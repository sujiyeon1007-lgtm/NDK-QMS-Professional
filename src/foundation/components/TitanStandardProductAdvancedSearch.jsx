import TitanAdvancedSearchGrid from "./TitanAdvancedSearchGrid";
import { TitanAdvancedSearchField } from "./TitanSearchPanel";
import {
  CustomerLotNoField,
  DateRangeField,
  ManagerField,
  NoteField,
  ProcessField,
  QtyField,
} from "./TitanSearchAdvancedFields";

/**
 * Project TITAN V1.3 — 관리 페이지 표준 상세검색 (최대 3행 · 가로 스크롤 없음)
 * 2행: 입고일 · 생산일 · 담당자 · 업체 LOT · 재질 · 열처리 공정
 * 3행: 수량 · 비고
 */
export default function TitanStandardProductAdvancedSearch({
  draft,
  onDraftChange,
  getSuggestions = () => [],
  incomingDateFromKey = "incomingDateFrom",
  incomingDateToKey = "incomingDateTo",
  productionDateFromKey = "productionDateFrom",
  productionDateToKey = "productionDateTo",
  productionDateLabel = "생산일",
  leadRow = null,
  trailRow = null,
}) {
  return (
    <div className="titan-advanced-search__rows">
      <TitanAdvancedSearchGrid>
        {leadRow}
        <DateRangeField
          label="입고일"
          fromKey={incomingDateFromKey}
          toKey={incomingDateToKey}
          draft={draft}
          onDraftChange={onDraftChange}
        />
        <DateRangeField
          label={productionDateLabel}
          fromKey={productionDateFromKey}
          toKey={productionDateToKey}
          draft={draft}
          onDraftChange={onDraftChange}
        />
        <ManagerField draft={draft} onDraftChange={onDraftChange} getSuggestions={getSuggestions} />
        <CustomerLotNoField draft={draft} onDraftChange={onDraftChange} getSuggestions={getSuggestions} />
        <TitanAdvancedSearchField
          label="재질"
          fieldKey="material"
          value={draft.material ?? ""}
          onChange={(value) => onDraftChange({ ...draft, material: value })}
          suggestions={getSuggestions("material", draft.material)}
          placeholder="재질"
        />
        <ProcessField draft={draft} onDraftChange={onDraftChange} getSuggestions={getSuggestions} />
      </TitanAdvancedSearchGrid>
      <TitanAdvancedSearchGrid>
        <QtyField draft={draft} onDraftChange={onDraftChange} />
        <NoteField draft={draft} onDraftChange={onDraftChange} getSuggestions={getSuggestions} />
        {trailRow}
      </TitanAdvancedSearchGrid>
    </div>
  );
}

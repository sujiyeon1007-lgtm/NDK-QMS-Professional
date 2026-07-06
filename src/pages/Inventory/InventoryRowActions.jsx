import { SecondaryButton } from "../../foundation/components/Button";
import TitanTableRowActions from "../../foundation/components/TitanTableRowActions";

/** 재고관리 — [수정] (상세는 더블클릭) */
export default function InventoryRowActions({ onEdit, canEdit = true }) {
  return (
    <TitanTableRowActions>
      <SecondaryButton
        type="button"
        className="titan-btn--table-action"
        disabled={!canEdit}
        onClick={(event) => {
          event.stopPropagation();
          if (canEdit) onEdit?.();
        }}
      >
        수정
      </SecondaryButton>
    </TitanTableRowActions>
  );
}

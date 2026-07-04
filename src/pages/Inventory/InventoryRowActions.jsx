import { SecondaryButton } from "../../foundation/components/Button";
import TitanTableRowActions from "../../foundation/components/TitanTableRowActions";

/**
 * 재고관리 — [상세] [수정]
 */
export default function InventoryRowActions({ onDetail, onEdit, canEdit = true }) {
  return (
    <TitanTableRowActions onDetail={onDetail}>
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

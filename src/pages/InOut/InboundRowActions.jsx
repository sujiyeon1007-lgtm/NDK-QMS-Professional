import { SecondaryButton } from "../../foundation/components/Button";
import TitanTableRowActions from "../../foundation/components/TitanTableRowActions";

/** 입고관리 — [수정] [삭제] (상세는 더블클릭) */
export default function InboundRowActions({
  onEdit,
  onDelete,
  canEdit = true,
  canDelete = true,
}) {
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
      <SecondaryButton
        type="button"
        className="titan-btn--table-action"
        disabled={!canDelete}
        onClick={(event) => {
          event.stopPropagation();
          if (canDelete) onDelete?.();
        }}
      >
        삭제
      </SecondaryButton>
    </TitanTableRowActions>
  );
}

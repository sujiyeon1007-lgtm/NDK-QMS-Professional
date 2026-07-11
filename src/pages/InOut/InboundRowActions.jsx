import { SecondaryButton } from "../../foundation/components/Button";
import TitanTableRowActions from "../../foundation/components/TitanTableRowActions";

/** 입고관리 — [수정] [삭제] [생산대기로 이동] (상세는 더블클릭) */
export default function InboundRowActions({
  onEdit,
  onMoveToProduction,
  onDelete,
  canEdit = true,
  canMoveToProduction = false,
  canDelete = true,
}) {
  return (
    <TitanTableRowActions>
      {canEdit ? (
        <SecondaryButton
          type="button"
          className="titan-btn--table-action"
          onClick={(event) => {
            event.stopPropagation();
            onEdit?.();
          }}
        >
          수정
        </SecondaryButton>
      ) : null}
      {canDelete ? (
        <SecondaryButton
          type="button"
          className="titan-btn--table-action"
          onClick={(event) => {
            event.stopPropagation();
            onDelete?.();
          }}
        >
          삭제
        </SecondaryButton>
      ) : null}
      {canMoveToProduction ? (
        <SecondaryButton
          type="button"
          className="titan-btn--table-action"
          onClick={(event) => {
            event.stopPropagation();
            onMoveToProduction?.();
          }}
        >
          생산대기로 이동
        </SecondaryButton>
      ) : null}
    </TitanTableRowActions>
  );
}

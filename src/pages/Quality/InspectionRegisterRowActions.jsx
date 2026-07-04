import { SecondaryButton } from "../../foundation/components/Button";
import TitanTableRowActions from "../../foundation/components/TitanTableRowActions";

/**
 * 검사관리 공통 — 리스트 마지막 컬럼 [상세] [등록] [수정] [삭제]
 */
export default function InspectionRegisterRowActions({
  onDetail,
  onRegister,
  onEdit,
  onDelete,
  canRegister = true,
  canEdit = true,
  canDelete = true,
}) {
  return (
    <TitanTableRowActions onDetail={onDetail}>
      <SecondaryButton
        type="button"
        className="titan-btn--table-action"
        disabled={!canRegister}
        onClick={(event) => {
          event.stopPropagation();
          if (canRegister) onRegister?.();
        }}
      >
        등록
      </SecondaryButton>
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

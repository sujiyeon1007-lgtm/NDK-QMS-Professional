import { PrimaryButton, SecondaryButton } from "../../foundation/components/Button";
import TitanTableRowActions from "../../foundation/components/TitanTableRowActions";

/**
 * QR관리 — [상세] [생성] [출력] [삭제]
 */
export default function QrManagementRowActions({
  onDetail,
  onCreate,
  onPrint,
  onDelete,
  canCreate = false,
  canPrint = false,
  canDelete = false,
}) {
  return (
    <TitanTableRowActions onDetail={onDetail}>
      <SecondaryButton
        type="button"
        className="titan-btn--table-action"
        disabled={!canCreate}
        onClick={(event) => {
          event.stopPropagation();
          if (canCreate) onCreate?.();
        }}
      >
        생성
      </SecondaryButton>
      <SecondaryButton
        type="button"
        className="titan-btn--table-action"
        disabled={!canPrint}
        onClick={(event) => {
          event.stopPropagation();
          if (canPrint) onPrint?.();
        }}
      >
        출력
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

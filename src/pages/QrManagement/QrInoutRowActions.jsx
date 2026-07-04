import { SecondaryButton } from "../../foundation/components/Button";
import TitanTableRowActions from "../../foundation/components/TitanTableRowActions";

/**
 * QR관리 입출고 — [상세] [출력] [재생성] [삭제]
 */
export default function QrInoutRowActions({
  onDetail,
  onPrint,
  onRegenerate,
  onDelete,
  canPrint = false,
  canRegenerate = false,
  canDelete = false,
}) {
  return (
    <TitanTableRowActions onDetail={onDetail}>
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
        disabled={!canRegenerate}
        onClick={(event) => {
          event.stopPropagation();
          if (canRegenerate) onRegenerate?.();
        }}
      >
        재생성
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

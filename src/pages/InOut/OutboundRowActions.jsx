import { PrimaryButton, SecondaryButton } from "../../foundation/components/Button";
import TitanTableRowActions from "../../foundation/components/TitanTableRowActions";

/**
 * 출고관리 — [상세] [출고] [수정] [취소]
 */
export default function OutboundRowActions({
  onDetail,
  onShip,
  onEdit,
  onCancel,
  canShip = true,
  canEdit = true,
  canCancel = true,
  shipLabel = "출고",
}) {
  return (
    <TitanTableRowActions onDetail={onDetail}>
      <PrimaryButton
        type="button"
        className="titan-btn--table-action"
        disabled={!canShip}
        onClick={(event) => {
          event.stopPropagation();
          if (canShip) onShip?.();
        }}
      >
        {shipLabel}
      </PrimaryButton>
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
        disabled={!canCancel}
        onClick={(event) => {
          event.stopPropagation();
          if (canCancel) onCancel?.();
        }}
      >
        취소
      </SecondaryButton>
    </TitanTableRowActions>
  );
}

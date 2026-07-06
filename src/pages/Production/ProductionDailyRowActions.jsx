import { PrimaryButton, SecondaryButton } from "../../foundation/components/Button";
import TitanTableRowActions from "../../foundation/components/TitanTableRowActions";

/** 생산일보 — [수정] [완료] [취소] (상세는 더블클릭) */
export default function ProductionDailyRowActions({
  onEdit,
  onComplete,
  onCancelComplete,
  onCancelLot,
  canEdit = false,
  canComplete = false,
  canCancelComplete = false,
  canCancelLot = false,
}) {
  const canCancel = canCancelComplete || canCancelLot;

  const handleCancel = () => {
    if (canCancelComplete) {
      onCancelComplete?.();
      return;
    }
    if (canCancelLot) {
      onCancelLot?.();
    }
  };

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
      <PrimaryButton
        type="button"
        className="titan-btn--table-action"
        disabled={!canComplete}
        onClick={(event) => {
          event.stopPropagation();
          if (canComplete) onComplete?.();
        }}
      >
        완료
      </PrimaryButton>
      <SecondaryButton
        type="button"
        className="titan-btn--table-action"
        disabled={!canCancel}
        onClick={(event) => {
          event.stopPropagation();
          if (canCancel) handleCancel();
        }}
      >
        취소
      </SecondaryButton>
    </TitanTableRowActions>
  );
}

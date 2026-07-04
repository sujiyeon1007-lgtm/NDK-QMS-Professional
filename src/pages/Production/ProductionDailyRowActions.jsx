import { PrimaryButton, SecondaryButton } from "../../foundation/components/Button";
import TitanTableRowActions from "../../foundation/components/TitanTableRowActions";

/**
 * 생산일보 — 리스트 마지막 컬럼 [상세] [완료] [취소]
 */
export default function ProductionDailyRowActions({
  onDetail,
  onComplete,
  onCancelComplete,
  canComplete = false,
  canCancelComplete = false,
}) {
  return (
    <TitanTableRowActions onDetail={onDetail}>
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
        disabled={!canCancelComplete}
        onClick={(event) => {
          event.stopPropagation();
          if (canCancelComplete) onCancelComplete?.();
        }}
      >
        취소
      </SecondaryButton>
    </TitanTableRowActions>
  );
}

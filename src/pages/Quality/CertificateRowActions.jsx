import { PrimaryButton, SecondaryButton } from "../../foundation/components/Button";
import TitanTableRowActions from "../../foundation/components/TitanTableRowActions";

/**
 * 성적서관리 — [상세] [발행] [수정] [취소]
 */
export default function CertificateRowActions({
  onDetail,
  onIssue,
  onEdit,
  onCancel,
  canIssue = true,
  canEdit = true,
  canCancel = true,
}) {
  return (
    <TitanTableRowActions onDetail={onDetail}>
      <PrimaryButton
        type="button"
        className="titan-btn--table-action"
        disabled={!canIssue}
        onClick={(event) => {
          event.stopPropagation();
          if (canIssue) onIssue?.();
        }}
      >
        발행
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

import { ChevronLeft, ChevronRight } from "lucide-react";

import FoundationActionBar from "../FoundationActionBar";
import { resolveMasterDetailNavigation } from "../../utils/masterDetailNavigation";
import "./titanMasterDetailFooter.css";

export function TitanMasterDetailFooter({
  categoryLabel = "항목",
  rows = [],
  currentRowId,
  onNavigate,
  onEdit,
  onDelete,
  onClose,
  editDisabled = false,
  deleteDisabled = false,
  ariaLabel,
}) {
  const navigation = resolveMasterDetailNavigation(rows, currentRowId);
  const positionText =
    navigation.position > 0
      ? `${categoryLabel} ${navigation.position} / ${navigation.total}`
      : `${categoryLabel} — / ${navigation.total}`;

  const handlePrev = () => {
    if (!navigation.hasPrev || !navigation.prevRow) return;
    onNavigate?.(navigation.prevRow);
  };

  const handleNext = () => {
    if (!navigation.hasNext || !navigation.nextRow) return;
    onNavigate?.(navigation.nextRow);
  };

  const actions = [
    {
      id: "prev",
      label: "이전",
      icon: ChevronLeft,
      variant: "secondary",
      disabled: !navigation.hasPrev,
      onClick: handlePrev,
    },
    {
      id: "next",
      label: "다음",
      icon: ChevronRight,
      variant: "secondary",
      disabled: !navigation.hasNext,
      onClick: handleNext,
    },
    onEdit
      ? {
          id: "edit",
          label: "수정",
          variant: "secondary",
          disabled: editDisabled,
          onClick: onEdit,
        }
      : null,
    onDelete
      ? {
          id: "delete",
          label: "삭제",
          variant: "danger",
          disabled: deleteDisabled,
          onClick: onDelete,
        }
      : null,
    {
      id: "close",
      label: "닫기",
      variant: "secondary",
      onClick: onClose,
    },
  ].filter(Boolean);

  return (
    <div className="titan-master-detail-footer">
      <span className="titan-master-detail-footer__position" aria-live="polite">
        {positionText}
      </span>
      <FoundationActionBar
        actions={actions}
        align="end"
        size="compact"
        ariaLabel={ariaLabel ?? `${categoryLabel} 상세 작업`}
        className="titan-master-detail-footer__actions"
      />
    </div>
  );
}

export default TitanMasterDetailFooter;

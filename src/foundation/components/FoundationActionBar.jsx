import { ChevronLeft, ChevronRight, Edit3, FileText, Mail, Paperclip, Printer, QrCode, Trash2, X } from "lucide-react";

import { resolveMasterDetailNavigation } from "../../config/detailPopupPolicy";

export const FOUNDATION_ACTION_DEFINITIONS = Object.freeze({
  edit: { id: "edit", label: "\uC218\uC815", icon: Edit3, variant: "secondary" },
  delete: { id: "delete", label: "\uC0AD\uC81C", icon: Trash2, variant: "danger" },
  qr: { id: "qr", label: "QR", icon: QrCode, variant: "secondary" },
  attachment: { id: "attachment", label: "\uCCA8\uBD80", icon: Paperclip, variant: "secondary" },
  pdf: { id: "pdf", label: "PDF", icon: FileText, variant: "secondary" },
  print: { id: "print", label: "\uCD9C\uB825", icon: Printer, variant: "primary" },
  mail: { id: "mail", label: "\uBA54\uC77C", icon: Mail, variant: "secondary" },
  close: { id: "close", label: "\uB2EB\uAE30", icon: X, variant: "secondary" },
});

export const FOUNDATION_ACTION_IDS = Object.freeze(Object.keys(FOUNDATION_ACTION_DEFINITIONS));
export const FOUNDATION_DETAIL_ACTION_ORDER = Object.freeze([
  "edit",
  "delete",
  "qr",
  "attachment",
  "pdf",
  "print",
  "mail",
  "close",
]);

export const FOUNDATION_DOCUMENT_ACTIONS = Object.freeze({
  CERTIFICATE_PRINT: "certificatePrint",
  TRANSACTION_STATEMENT_PRINT: "transactionStatementPrint",
  PDF: "pdf",
  PRINT: "print",
  QR: "qr",
  MAIL: "mail",
  CLOSE: "close",
});

export const FOUNDATION_DOCUMENT_ACTION_DEFINITIONS = Object.freeze({
  [FOUNDATION_DOCUMENT_ACTIONS.CERTIFICATE_PRINT]: {
    id: FOUNDATION_DOCUMENT_ACTIONS.CERTIFICATE_PRINT,
    label: "\uC131\uC801\uC11C \uCD9C\uB825",
    icon: FileText,
    variant: "primary",
  },
  [FOUNDATION_DOCUMENT_ACTIONS.TRANSACTION_STATEMENT_PRINT]: {
    id: FOUNDATION_DOCUMENT_ACTIONS.TRANSACTION_STATEMENT_PRINT,
    label: "\uAC70\uB798\uBA85\uC138\uC11C \uCD9C\uB825",
    icon: Printer,
    variant: "primary",
  },
  [FOUNDATION_DOCUMENT_ACTIONS.PDF]: {
    id: FOUNDATION_DOCUMENT_ACTIONS.PDF,
    label: "PDF",
    icon: FileText,
    variant: "secondary",
  },
  [FOUNDATION_DOCUMENT_ACTIONS.PRINT]: {
    id: FOUNDATION_DOCUMENT_ACTIONS.PRINT,
    label: "\uC778\uC1C4",
    icon: Printer,
    variant: "secondary",
  },
  [FOUNDATION_DOCUMENT_ACTIONS.QR]: {
    id: FOUNDATION_DOCUMENT_ACTIONS.QR,
    label: "QR",
    icon: QrCode,
    variant: "secondary",
  },
  [FOUNDATION_DOCUMENT_ACTIONS.MAIL]: {
    id: FOUNDATION_DOCUMENT_ACTIONS.MAIL,
    label: "\uBA54\uC77C",
    icon: Mail,
    variant: "secondary",
  },
  [FOUNDATION_DOCUMENT_ACTIONS.CLOSE]: {
    id: FOUNDATION_DOCUMENT_ACTIONS.CLOSE,
    label: "\uB2EB\uAE30",
    icon: X,
    variant: "secondary",
  },
});

function normalizeAction(action) {
  if (typeof action === "string") {
    return FOUNDATION_ACTION_DEFINITIONS[action] || { id: action, label: action };
  }
  const base = FOUNDATION_ACTION_DEFINITIONS[action?.id] || {};
  return {
    ...base,
    ...action,
    label: action?.label || base.label || action?.id,
  };
}

function normalizeDocumentAction(action) {
  if (typeof action === "string") {
    return FOUNDATION_DOCUMENT_ACTION_DEFINITIONS[action] || { id: action, label: action };
  }
  const base = FOUNDATION_DOCUMENT_ACTION_DEFINITIONS[action?.id] || {};
  return {
    ...base,
    ...action,
    label: action?.label || base.label || action?.id,
  };
}

function FoundationActionButton({ action, disabled, onAction }) {
  const Icon = action.icon;
  const classes = [
    "foundation-action-bar__button",
    `foundation-action-bar__button--${action.variant || "secondary"}`,
    action.className,
  ]
    .filter(Boolean)
    .join(" ");

  const handleClick = (event) => {
    event.stopPropagation();
    action.onClick?.(event, action);
    onAction?.(action.id, action, event);
  };

  return (
    <button
      type="button"
      className={classes}
      onClick={handleClick}
      disabled={disabled || action.disabled}
      aria-label={action.ariaLabel || action.label}
      title={action.title || action.label}
    >
      {Icon ? <Icon size={14} aria-hidden="true" /> : null}
      <span>{action.label}</span>
    </button>
  );
}

export default function FoundationActionBar({
  actions = [],
  onAction,
  disabled = false,
  align = "end",
  size = "default",
  ariaLabel = "\uC791\uC5C5",
  className = "",
}) {
  const normalizedActions = actions.map(normalizeAction).filter((action) => action && !action.hidden);
  if (!normalizedActions.length) return null;

  const classes = [
    "foundation-action-bar",
    `foundation-action-bar--${align}`,
    `foundation-action-bar--${size}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes} role="toolbar" aria-label={ariaLabel}>
      {normalizedActions.map((action) => (
        <FoundationActionButton
          key={action.id}
          action={action}
          disabled={disabled}
          onAction={onAction}
        />
      ))}
    </div>
  );
}

export function FoundationDocumentAction({ actions = [], onAction, ...props }) {
  const normalizedActions = actions.map(normalizeDocumentAction).filter((action) => action && !action.hidden);
  return <FoundationActionBar actions={normalizedActions} onAction={onAction} {...props} />;
}

/** /settings master data detail popup footer */
export function TitanMasterDetailFooter({
  categoryLabel = "\uD56D\uBAA9",
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
      : `${categoryLabel} \u2014 / ${navigation.total}`;

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
      label: "\uC774\uC804",
      icon: ChevronLeft,
      variant: "secondary",
      disabled: !navigation.hasPrev,
      onClick: handlePrev,
    },
    {
      id: "next",
      label: "\uB2E4\uC74C",
      icon: ChevronRight,
      variant: "secondary",
      disabled: !navigation.hasNext,
      onClick: handleNext,
    },
    onEdit
      ? {
          id: "edit",
          label: "\uC218\uC815",
          variant: "secondary",
          disabled: editDisabled,
          onClick: onEdit,
        }
      : null,
    onDelete
      ? {
          id: "delete",
          label: "\uC0AD\uC81C",
          variant: "danger",
          disabled: deleteDisabled,
          onClick: onDelete,
        }
      : null,
    {
      id: "close",
      label: "\uB2EB\uAE30",
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
        ariaLabel={ariaLabel ?? `${categoryLabel} \uC0C1\uC138 \uC791\uC5C5`}
        className="titan-master-detail-footer__actions"
      />
    </div>
  );
}
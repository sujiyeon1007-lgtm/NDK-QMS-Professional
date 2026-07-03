import { formatDocumentStatusLabel, getDocumentStatusDefinition } from "../../config/documentStatusPolicy";

export default function DocumentStatusChip({ statusId, withEmoji = true, className = "" }) {
  const def = getDocumentStatusDefinition(statusId);
  return (
    <span className={`titan-document-status ${def.cssClass} ${className}`.trim()}>
      <span className="titan-document-status__dot" aria-hidden="true" />
      <span className="titan-document-status__label">
        {formatDocumentStatusLabel(statusId, { withEmoji })}
      </span>
    </span>
  );
}

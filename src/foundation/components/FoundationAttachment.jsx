import { useRef, useState } from "react";
import { PrimaryButton, SecondaryButton } from "./Button";
import {
  downloadFoundationAttachment,
  formatFoundationAttachmentIcon,
  formatFoundationAttachmentTypeLabel,
  FOUNDATION_ATTACHMENT_ACCEPT,
  FOUNDATION_ATTACHMENT_TYPES,
  createFoundationAttachmentFallbackDataUrl,
  resolveFoundationAttachmentKind,
  readFoundationAttachmentFile,
} from "../../utils/foundationAttachmentEngine";

const CLIP_ICON = "\uD83D\uDCCE";
const EMPTY_ICON = "\u25CB";
const CLOSE_LABEL = "\u00D7";

function stopActionEvent(event) {
  event?.preventDefault?.();
  event?.stopPropagation?.();
}

function resolveActionAttachment(attachment) {
  if (attachment?.dataUrl) return attachment;
  return {
    ...attachment,
    dataUrl: createFoundationAttachmentFallbackDataUrl(attachment),
    mimeType: "text/plain",
  };
}

function confirmAttachmentDelete(attachment) {
  const name = attachment?.name || attachment?.fileName || "첨부파일";
  return window.confirm(`첨부파일을 삭제하시겠습니까?\n\n${name}`);
}

function FoundationAttachmentPreviewModal({ attachment, onClose }) {
  if (!attachment) return null;

  const target = resolveActionAttachment(attachment);
  const kind = resolveFoundationAttachmentKind(target);
  const isImage = kind === "image" && target.dataUrl;
  const isPdf = kind === "pdf" && target.dataUrl;

  return (
    <div className="titan-attachment-preview" role="dialog" aria-modal="true" aria-label="첨부파일 미리보기">
      <div className="titan-attachment-preview__panel">
        <header className="titan-attachment-preview__header">
          <div>
            <strong>{formatFoundationAttachmentTypeLabel(target)}</strong>
            <span>{target.name}</span>
          </div>
          <button type="button" onClick={onClose} aria-label="닫기">
            {CLOSE_LABEL}
          </button>
        </header>
        <div className="titan-attachment-preview__body">
          {isImage ? (
            <img src={target.dataUrl} alt={target.name} />
          ) : isPdf ? (
            <iframe title={target.name} src={target.dataUrl} />
          ) : (
            <iframe title={target.name} src={target.dataUrl} />
          )}
        </div>
        <footer className="titan-attachment-preview__footer">
          <SecondaryButton type="button" onClick={() => downloadFoundationAttachment(target)}>
            다운로드
          </SecondaryButton>
          <SecondaryButton type="button" onClick={onClose}>
            닫기
          </SecondaryButton>
        </footer>
      </div>
    </div>
  );
}

export function FoundationAttachmentBadge({ count = 0, onClick, className = "", showUnit = true }) {
  const hasFiles = count > 0;
  const classes = [
    "titan-attachment-badge",
    hasFiles ? "" : "titan-attachment-badge--empty",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (!hasFiles) return <span className={classes}>{EMPTY_ICON} 미등록</span>;

  return (
    <button type="button" className={classes} onClick={onClick} aria-label={`첨부파일 ${count}개`}>
      {CLIP_ICON} {count}{showUnit ? "개" : ""}
    </button>
  );
}

export function FoundationAttachmentPopup({ open, title = "첨부파일", attachments = [], onClose }) {
  const [previewTarget, setPreviewTarget] = useState(null);
  if (!open) return null;

  return (
    <div className="titan-attachment-popup" role="dialog" aria-modal="true" aria-label={title}>
      <div className="titan-attachment-popup__panel">
        <header className="titan-attachment-popup__header">
          <h3>{title}</h3>
          <button type="button" onClick={onClose} aria-label="닫기">
            {CLOSE_LABEL}
          </button>
        </header>

        <div className="titan-attachment-popup__list">
          {attachments.length ? (
            <>
              <div className="titan-attachment-popup__columns" aria-hidden="true">
                <span>첨부유형</span>
                <span>파일명</span>
                <span>작업</span>
              </div>
              {attachments.map((attachment) => (
                <div key={attachment.id} className="titan-attachment-popup__item">
                  <span className="titan-attachment-popup__type">{formatFoundationAttachmentTypeLabel(attachment)}</span>
                  <span className="titan-attachment-popup__name">{attachment.name}</span>
                  <span className="titan-attachment-popup__actions">
                    <button
                      type="button"
                      onClick={(event) => {
                        stopActionEvent(event);
                        setPreviewTarget(attachment);
                      }}
                    >
                      미리보기
                    </button>
                    <button
                      type="button"
                      onClick={(event) => {
                        stopActionEvent(event);
                        downloadFoundationAttachment(resolveActionAttachment(attachment));
                      }}
                    >
                      다운로드
                    </button>
                  </span>
                </div>
              ))}
            </>
          ) : (
            <p className="titan-attachment-popup__empty">등록된 첨부파일이 없습니다.</p>
          )}
        </div>

        <footer className="titan-attachment-popup__footer">
          <SecondaryButton type="button" onClick={onClose}>
            닫기
          </SecondaryButton>
        </footer>
        <FoundationAttachmentPreviewModal attachment={previewTarget} onClose={() => setPreviewTarget(null)} />
      </div>
    </div>
  );
}

export function FoundationFileUploader({
  disabled = false,
  accept = FOUNDATION_ATTACHMENT_ACCEPT,
  uploadedBy = "",
  attachmentTypes = FOUNDATION_ATTACHMENT_TYPES,
  onFilesReady,
}) {
  const inputRef = useRef(null);
  const [pendingFiles, setPendingFiles] = useState([]);
  const [attachmentType, setAttachmentType] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const handleFileChange = async (event) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (!files.length) return;
    if (!attachmentType) {
      setMessage("첨부유형을 선택해 주세요.");
      return;
    }

    setBusy(true);
    setMessage("");
    try {
      const parsed = await Promise.all(
        files.map((file) => readFoundationAttachmentFile(file, { uploadedBy, attachmentType }))
      );
      setPendingFiles((current) => [...current, ...parsed]);
    } catch (error) {
      setMessage(error?.message === "unsupported file type" ? "지원하지 않는 파일 형식입니다." : "파일을 읽을 수 없습니다.");
    } finally {
      setBusy(false);
    }
  };

  const handleUpload = () => {
    if (!pendingFiles.length) {
      setMessage("업로드할 파일을 선택해 주세요.");
      return;
    }
    onFilesReady?.(pendingFiles);
    setPendingFiles([]);
    setMessage(`첨부파일 ${pendingFiles.length}개를 등록했습니다.`);
  };

  return (
    <div className="titan-attachment-manager__uploader">
      <label className="titan-attachment-manager__type">
        <span>첨부유형</span>
        <select
          value={attachmentType}
          onChange={(event) => setAttachmentType(event.target.value)}
          disabled={disabled || busy}
          required
        >
          <option value="">첨부유형 선택</option>
          {attachmentTypes.map((type) => (
            <option key={type.id} value={type.id}>
              {type.icon} {type.label}
            </option>
          ))}
        </select>
      </label>

      <div className="titan-attachment-manager__upload">
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={accept}
          onChange={handleFileChange}
          disabled={disabled || busy}
        />
        <SecondaryButton type="button" onClick={() => inputRef.current?.click()} disabled={disabled || busy}>
          파일 선택
        </SecondaryButton>
        <PrimaryButton type="button" onClick={handleUpload} disabled={disabled || busy || !pendingFiles.length}>
          업로드
        </PrimaryButton>
      </div>

      {pendingFiles.length ? (
        <div className="titan-attachment-manager__pending">
          <strong>업로드 대기</strong>
          {pendingFiles.map((file) => (
            <span key={file.id}>
              {formatFoundationAttachmentTypeLabel(file)} {file.name}
            </span>
          ))}
        </div>
      ) : null}

      {message ? <p className="titan-attachment-manager__message">{message}</p> : null}
    </div>
  );
}

export default function FoundationAttachment({
  attachments = [],
  disabled = false,
  disabledMessage = "상세 팝업 또는 등록 팝업에서 첨부파일을 관리할 수 있습니다.",
  onUpload,
  onDelete,
  canDeleteAttachment = () => true,
}) {
  const [previewTarget, setPreviewTarget] = useState(null);

  const handlePreview = (event, attachment) => {
    stopActionEvent(event);
    setPreviewTarget(attachment);
  };

  const handleDownload = (event, attachment) => {
    stopActionEvent(event);
    downloadFoundationAttachment(resolveActionAttachment(attachment));
  };

  const handleDelete = (event, attachment) => {
    stopActionEvent(event);
    if (disabled || !canDeleteAttachment(attachment)) return;
    if (!confirmAttachmentDelete(attachment)) return;
    onDelete?.(attachment.id);
  };

  return (
    <div className="titan-attachment-manager">
      {disabled ? <p className="titan-attachment-manager__notice">{disabledMessage}</p> : null}

      <FoundationFileUploader disabled={disabled} onFilesReady={onUpload} />

      <section className="titan-attachment-manager__registered" aria-label="등록된 첨부파일">
        <h4>등록된 첨부파일</h4>
        {attachments.length ? (
          <ul>
            {attachments.map((attachment) => (
              <li key={attachment.id}>
                <span className="titan-attachment-manager__registered-type">
                  {formatFoundationAttachmentTypeLabel(attachment)}
                </span>
                <span className="titan-attachment-manager__registered-name">
                  {attachment.name}
                </span>
                <div>
                  <button
                    type="button"
                    onClick={(event) => handlePreview(event, attachment)}
                  >
                    미리보기
                  </button>
                  <button
                    type="button"
                    onClick={(event) => handleDownload(event, attachment)}
                  >
                    다운로드
                  </button>
                  <button
                    type="button"
                    onClick={(event) => handleDelete(event, attachment)}
                    disabled={disabled || !canDeleteAttachment(attachment)}
                  >
                    삭제
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="titan-attachment-manager__empty">등록된 첨부파일이 없습니다.</p>
        )}
      </section>
      <FoundationAttachmentPreviewModal attachment={previewTarget} onClose={() => setPreviewTarget(null)} />
    </div>
  );
}
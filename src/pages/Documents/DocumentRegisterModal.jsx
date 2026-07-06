import { useEffect, useMemo, useState } from "react";
import { Upload } from "lucide-react";

import TitanRegisterModal from "../../foundation/components/TitanRegisterModal";
import { DEFAULT_DOCUMENT_FOLDERS, isDocumentManagementEligibleType, resolveDefaultFolder } from "../../config/documentManagementV13";
import { QUALITY_DOCUMENT_TYPES } from "../../config/qualityDocumentManagement";
import {
  getCompanyProductsForDocumentRegister,
  registerCompanyDocument,
  registerDocumentRevision,
  updateCompanyDocument,
} from "../../utils/documentCrudActions";
import { readDocumentFile } from "../../utils/productDrawingSession";

const FOLDER_OPTIONS = DEFAULT_DOCUMENT_FOLDERS.filter((item) => item.id !== "all");

const DOCUMENT_REGISTER_TYPE_OPTIONS = QUALITY_DOCUMENT_TYPES.filter(
  (item) => !item.noticeDocument && isDocumentManagementEligibleType(item.value)
);

function parseTagsInput(value = "") {
  return String(value)
    .split(/[\s,]+/)
    .map((tag) => tag.trim())
    .filter(Boolean)
    .map((tag) => (tag.startsWith("#") ? tag : `#${tag}`));
}

function resolveDocumentTypeFromTab(tabId = "") {
  const map = {
    drawing: "drawing",
    work_standard: "work_standard",
    inspection_standard: "inspection_standard",
  };
  return map[tabId] || "work_standard";
}

export default function DocumentRegisterModal({
  open,
  onClose,
  onSaved,
  companyName,
  mode = "register",
  initialRow = null,
  productContext = null,
  documentTabId = "",
}) {
  const products = useMemo(
    () => getCompanyProductsForDocumentRegister(companyName),
    [companyName, open]
  );

  const [form, setForm] = useState({
    productId: "",
    documentType: "work_standard",
    title: "",
    documentNo: "",
    revision: "Rev.01",
    folder: "",
    tagsInput: "",
    description: "",
    validUntil: "",
    fileName: "",
    mimeType: "",
    dataUrl: "",
  });
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    if (!open) return;
    if ((mode === "edit" || mode === "revision") && initialRow) {
      setForm({
        productId: initialRow.productId || products[0]?.id || "",
        documentType: initialRow.documentType || "work_standard",
        title: initialRow.title || "",
        documentNo: initialRow.documentNo || "",
        revision: mode === "revision" ? "" : initialRow.revision || "Rev.01",
        folder: initialRow.folder || resolveDefaultFolder(initialRow.documentType),
        tagsInput: (initialRow.tags ?? []).join(" "),
        description: initialRow.description || "",
        validUntil: initialRow.validUntil || "",
        fileName: initialRow.pdfFileName || "",
        mimeType: initialRow.mimeType || "",
        dataUrl: initialRow.dataUrl || "",
      });
    } else {
      const defaultType = resolveDocumentTypeFromTab(documentTabId);
      setForm({
        productId: productContext?.id || products[0]?.id || "",
        documentType: defaultType,
        title: "",
        documentNo: "",
        revision: "Rev.01",
        folder: resolveDefaultFolder(defaultType),
        tagsInput: "",
        description: "",
        validUntil: "",
        fileName: "",
        mimeType: "",
        dataUrl: "",
      });
    }
    setError("");
  }, [open, mode, initialRow, products, productContext, documentTabId]);

  const attachFile = async (file) => {
    if (!file) return;
    try {
      const payload = await readDocumentFile(file);
      if (!payload) return;
      setForm((prev) => ({
        ...prev,
        fileName: payload.fileName,
        mimeType: payload.mimeType,
        dataUrl: payload.dataUrl,
        title: prev.title || payload.fileName.replace(/\.[^.]+$/, ""),
      }));
      setError("");
    } catch (attachError) {
      setError(attachError.message || "파일을 등록할 수 없습니다.");
    }
  };

  const handleSubmit = () => {
    const payload = {
      productId: form.productId,
      documentType: form.documentType,
      title: form.title,
      documentNo: form.documentNo,
      revision: form.revision,
      folder: form.folder,
      tags: parseTagsInput(form.tagsInput),
      description: form.description,
      validUntil: form.validUntil,
      fileName: form.fileName,
      mimeType: form.mimeType,
      dataUrl: form.dataUrl,
    };

    let result;
    if (mode === "register") {
      result = registerCompanyDocument(companyName, payload);
    } else if (mode === "edit") {
      result = updateCompanyDocument(initialRow, payload);
    } else {
      result = registerDocumentRevision(initialRow, payload);
    }

    if (!result.ok) {
      setError(result.message);
      return;
    }
    onSaved?.(result);
  };

  if (!open) return null;

  const titleMap = {
    register: "문서 등록",
    edit: "문서 수정",
    revision: "Revision 등록",
  };

  return (
    <TitanRegisterModal
      open={open}
      onClose={onClose}
      onSubmit={handleSubmit}
      kicker={companyName}
      title={titleMap[mode] || "문서 등록"}
      submitLabel={mode === "edit" ? "저장" : "등록"}
    >
      {error ? (
        <p className="document-register-modal__error" role="alert">
          {error}
        </p>
      ) : null}

      <div className="document-register-modal__grid">
        {mode === "register" ? (
          <label className="document-register-modal__field span-2">
            <span>품번 *</span>
            <select
              value={form.productId}
              onChange={(event) => setForm((prev) => ({ ...prev, productId: event.target.value }))}
            >
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.label}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        <label className="document-register-modal__field span-2">
          <span>문서 종류</span>
          <select
            value={form.documentType}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                documentType: event.target.value,
                folder: prev.folder || resolveDefaultFolder(event.target.value),
              }))
            }
            disabled={mode === "revision"}
          >
            {DOCUMENT_REGISTER_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="document-register-modal__field span-2">
          <span>문서명 *</span>
          <input
            type="text"
            value={form.title}
            onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
            placeholder="문서명"
          />
        </label>

        <label className="document-register-modal__field">
          <span>문서번호</span>
          <input
            type="text"
            value={form.documentNo}
            onChange={(event) => setForm((prev) => ({ ...prev, documentNo: event.target.value }))}
            disabled={mode === "revision"}
          />
        </label>

        <label className="document-register-modal__field">
          <span>Revision</span>
          <input
            type="text"
            value={form.revision}
            onChange={(event) => setForm((prev) => ({ ...prev, revision: event.target.value }))}
            placeholder={mode === "revision" ? "자동 증가 (비우면 자동)" : "Rev.01"}
          />
        </label>

        <label className="document-register-modal__field">
          <span>폴더</span>
          <select
            value={form.folder}
            onChange={(event) => setForm((prev) => ({ ...prev, folder: event.target.value }))}
          >
            {FOLDER_OPTIONS.map((folder) => (
              <option key={folder.id} value={folder.label}>
                {folder.label}
              </option>
            ))}
          </select>
        </label>

        <label className="document-register-modal__field">
          <span>만료일</span>
          <input
            type="date"
            value={form.validUntil}
            onChange={(event) => setForm((prev) => ({ ...prev, validUntil: event.target.value }))}
          />
        </label>

        <label className="document-register-modal__field span-2">
          <span>태그</span>
          <input
            type="text"
            value={form.tagsInput}
            onChange={(event) => setForm((prev) => ({ ...prev, tagsInput: event.target.value }))}
            placeholder="#서암 #감사 #열처리"
          />
        </label>

        <label className="document-register-modal__field span-2">
          <span>설명</span>
          <textarea
            rows={2}
            value={form.description}
            onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
          />
        </label>
      </div>

      <div
        className={`document-register-modal__dropzone${dragOver ? " is-over" : ""}`}
        onDragOver={(event) => {
          event.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragOver(false);
          attachFile(event.dataTransfer.files?.[0]);
        }}
      >
        <Upload size={18} aria-hidden="true" />
        <p>문서를 Drag &amp; Drop 하거나 파일을 선택하세요</p>
        <span>PDF · JPG · PNG · DOC · DOCX · XLS · XLSX</span>
        <label className="document-register-modal__file-btn">
          파일 선택
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx,application/pdf,image/jpeg,image/png"
            onChange={(event) => attachFile(event.target.files?.[0])}
          />
        </label>
        {form.fileName ? <strong>{form.fileName}</strong> : null}
      </div>
    </TitanRegisterModal>
  );
}

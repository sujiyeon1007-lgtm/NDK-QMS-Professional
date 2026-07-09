import { useEffect, useState } from "react";
import TitanRegisterModal from "../../foundation/components/TitanRegisterModal";
import { FoundationFileUploader } from "../../foundation/components/FoundationAttachment";
import { addDrawingRevision } from "../../utils/productDrawingSession";

export default function ProductDrawingRevisionModal({ open, onClose, onSaved, product, currentDrawing = null }) {
  const [form, setForm] = useState({
    drawingNo: "",
    revision: "",
    revisionDate: "",
    note: "",
    fileName: "",
    mimeType: "",
    dataUrl: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setForm({
      drawingNo: product?.drawingNo || currentDrawing?.drawingNo || "",
      revision: "",
      revisionDate: new Date().toISOString().slice(0, 10),
      note: "",
      fileName: "",
      mimeType: "",
      dataUrl: "",
    });
    setError("");
  }, [open, product, currentDrawing]);

  const handleFilesReady = (files = []) => {
    const file = files[0];
    if (!file) return;
    setForm((prev) => ({
      ...prev,
      fileName: file.name,
      mimeType: file.mimeType,
      dataUrl: file.dataUrl,
    }));
    setError("");
  };

  const handleSubmit = () => {
    const result = addDrawingRevision(product.id, form);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    onSaved?.(result.revision);
  };

  if (!open || !product) return null;

  return (
    <TitanRegisterModal
      open={open}
      onClose={onClose}
      onSubmit={handleSubmit}
      kicker="제품관리"
      title="도면 Revision 등록"
      submitLabel="등록"
    >
      {error ? (
        <p className="product-drawing-modal__error" role="alert">
          {error}
        </p>
      ) : null}

      <div className="product-drawing-modal__grid">
        <label className="product-drawing-modal__field">
          <span>도면번호</span>
          <input
            type="text"
            value={form.drawingNo}
            onChange={(event) => setForm((prev) => ({ ...prev, drawingNo: event.target.value }))}
            placeholder="204B1144P0001"
          />
        </label>
        <label className="product-drawing-modal__field">
          <span>Revision *</span>
          <input
            type="text"
            value={form.revision}
            onChange={(event) => setForm((prev) => ({ ...prev, revision: event.target.value }))}
            placeholder="C"
          />
        </label>
        <label className="product-drawing-modal__field">
          <span>개정일</span>
          <input
            type="date"
            value={form.revisionDate}
            onChange={(event) => setForm((prev) => ({ ...prev, revisionDate: event.target.value }))}
          />
        </label>
        <label className="product-drawing-modal__field span-2">
          <span>비고</span>
          <textarea
            rows={2}
            value={form.note}
            onChange={(event) => setForm((prev) => ({ ...prev, note: event.target.value }))}
          />
        </label>
      </div>

      <div className="product-drawing-modal__dropzone">
        <FoundationFileUploader onFilesReady={handleFilesReady} />
        {form.fileName ? <strong>{form.fileName}</strong> : null}
      </div>
    </TitanRegisterModal>
  );
}

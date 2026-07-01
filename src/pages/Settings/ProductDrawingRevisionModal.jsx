import { useEffect, useState } from "react";
import { Upload } from "lucide-react";
import TitanRegisterModal from "../../foundation/components/TitanRegisterModal";
import { addDrawingRevision, readDrawingFile } from "../../utils/productDrawingSession";

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
  const [dragOver, setDragOver] = useState(false);

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

  const attachFile = async (file) => {
    if (!file) return;
    try {
      const payload = await readDrawingFile(file);
      if (!payload) return;
      setForm((prev) => ({
        ...prev,
        fileName: payload.fileName,
        mimeType: payload.mimeType,
        dataUrl: payload.dataUrl,
      }));
      setError("");
    } catch (attachError) {
      setError(attachError.message || "파일을 등록할 수 없습니다.");
    }
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

      <div
        className={`product-drawing-modal__dropzone${dragOver ? " is-over" : ""}`}
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
        <p>도면을 Drag &amp; Drop 하거나 파일을 선택하세요</p>
        <span>PDF · JPG · PNG</span>
        <label className="product-drawing-modal__file-btn">
          파일 선택
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
            onChange={(event) => attachFile(event.target.files?.[0])}
          />
        </label>
        {form.fileName ? <strong>{form.fileName}</strong> : null}
      </div>
    </TitanRegisterModal>
  );
}

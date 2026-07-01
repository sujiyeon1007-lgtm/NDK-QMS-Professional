import { useEffect, useState } from "react";

import { Upload } from "lucide-react";

import TitanRegisterModal from "../../foundation/components/TitanRegisterModal";

import {

  RELATED_DOCUMENT_TYPES,

  addRelatedDocument,

  readDrawingFile,

  replaceRelatedDocument,

} from "../../utils/productDrawingSession";



export default function ProductRelatedDocumentModal({

  open,

  onClose,

  onSaved,

  product,

  mode = "add",

  initialDocument = null,

}) {

  const [form, setForm] = useState({

    type: "sop",

    title: "",

    note: "",

    fileName: "",

    mimeType: "",

    dataUrl: "",

  });

  const [error, setError] = useState("");

  const [dragOver, setDragOver] = useState(false);



  useEffect(() => {

    if (!open) return;

    if (mode === "replace" && initialDocument) {

      setForm({

        type: initialDocument.type || "other",

        title: initialDocument.title || "",

        note: initialDocument.note || "",

        fileName: initialDocument.fileName || "",

        mimeType: initialDocument.mimeType || "",

        dataUrl: initialDocument.dataUrl || "",

      });

    } else {

      setForm({

        type: "sop",

        title: "",

        note: "",

        fileName: "",

        mimeType: "",

        dataUrl: "",

      });

    }

    setError("");

  }, [open, mode, initialDocument]);



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

        title: prev.title || payload.fileName.replace(/\.[^.]+$/, ""),

      }));

      setError("");

    } catch (attachError) {

      setError(attachError.message || "파일을 등록할 수 없습니다.");

    }

  };



  const handleSubmit = () => {

    const result =

      mode === "replace" && initialDocument

        ? replaceRelatedDocument(product.id, initialDocument.id, form)

        : addRelatedDocument(product.id, form);

    if (!result.ok) {

      setError(result.message);

      return;

    }

    onSaved?.(result.document);

  };



  if (!open || !product) return null;



  return (

    <TitanRegisterModal

      open={open}

      onClose={onClose}

      onSubmit={handleSubmit}

      kicker="제품관리"

      title={mode === "replace" ? "관련 문서 교체" : "관련 문서 등록"}

      submitLabel={mode === "replace" ? "교체" : "등록"}

    >

      {error ? (

        <p className="product-drawing-modal__error" role="alert">

          {error}

        </p>

      ) : null}



      <div className="product-drawing-modal__grid">

        <fieldset className="product-drawing-modal__field span-2 product-drawing-modal__radio-group">

          <legend>문서 종류</legend>

          <div className="product-drawing-modal__radio-options">

            {RELATED_DOCUMENT_TYPES.map((option) => (

              <label key={option.value} className="product-drawing-modal__radio-option">

                <input

                  type="radio"

                  name="documentType"

                  value={option.value}

                  checked={form.type === option.value}

                  onChange={() => setForm((prev) => ({ ...prev, type: option.value }))}

                />

                {option.label}

              </label>

            ))}

          </div>

        </fieldset>

        <label className="product-drawing-modal__field span-2">

          <span>문서명 *</span>

          <input

            type="text"

            value={form.title}

            onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}

            placeholder="문서명"

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

        <p>문서를 Drag &amp; Drop 하거나 파일을 선택하세요</p>

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



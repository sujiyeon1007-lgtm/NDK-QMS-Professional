import { useEffect, useState } from "react";

import TitanRegisterModal from "../../foundation/components/TitanRegisterModal";
import { FoundationFileUploader } from "../../foundation/components/FoundationAttachment";

import {

  RELATED_DOCUMENT_TYPES,

  addRelatedDocument,

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



  const handleFilesReady = (files = []) => {
    const file = files[0];
    if (!file) return;
    setForm((prev) => ({
      ...prev,
      fileName: file.name,
      mimeType: file.mimeType,
      dataUrl: file.dataUrl,
      title: prev.title || file.name.replace(/\.[^.]+$/, ""),
    }));
    setError("");
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



      <div className="product-drawing-modal__dropzone">
        <FoundationFileUploader onFilesReady={handleFilesReady} />
        {form.fileName ? <strong>{form.fileName}</strong> : null}
      </div>

    </TitanRegisterModal>

  );

}



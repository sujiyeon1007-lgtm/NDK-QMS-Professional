import { ImagePlus, Trash2 } from "lucide-react";
import { SecondaryButton } from "../../foundation/components/Button";
import { MICROSTRUCTURE_MAGNIFICATION_OPTIONS } from "../../utils/productSpecificationModel";

const MICRO_MAGNIFICATIONS = MICROSTRUCTURE_MAGNIFICATION_OPTIONS.map((value) => `${value}x`);
const ACCEPTED_TYPES = ["image/bmp", "image/jpeg", "image/jpg", "image/png"];

function normalizePhotoSlots(photos = []) {
  const slots = Array.isArray(photos) ? [...photos] : [];
  while (slots.length < MICRO_MAGNIFICATIONS.length) slots.push("");
  return slots.slice(0, MICRO_MAGNIFICATIONS.length);
}

export default function MicrostructurePhotoSlots({
  photos = [],
  onChange,
  disabled = false,
  editable = true,
  className = "",
}) {
  const slots = normalizePhotoSlots(photos);

  const emit = (nextSlots) => onChange?.(normalizePhotoSlots(nextSlots));

  const handleUpload = (index, file) => {
    if (!file || disabled || !editable) return;
    if (!ACCEPTED_TYPES.includes(file.type)) {
      window.alert("BMP / JPG / PNG only");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => emit(slots.map((value, slotIndex) => (slotIndex === index ? reader.result : value)));
    reader.readAsDataURL(file);
  };

  const handleRemove = (index) => {
    emit(slots.map((value, slotIndex) => (slotIndex === index ? "" : value)));
  };

  return (
    <div className={`product-micro-photo-slots${className ? ` ${className}` : ""}`}>
      <div className="product-micro-photo-slots__grid">
        {MICRO_MAGNIFICATIONS.map((mag, index) => (
          <figure key={mag} className="product-micro-photo-slots__item">
            {editable && !disabled ? (
              <label className="product-micro-photo-slots__upload">
                {slots[index] ? (
                  <img src={slots[index]} alt={`${mag} micro`} />
                ) : (
                  <div className="product-micro-photo-slots__frame" aria-hidden="true">
                    <ImagePlus size={20} />
                  </div>
                )}
                <input
                  type="file"
                  accept=".bmp,.jpg,.jpeg,.png,image/bmp,image/jpeg,image/png"
                  className="product-micro-photo-slots__file"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    handleUpload(index, file);
                    event.target.value = "";
                  }}
                />
              </label>
            ) : slots[index] ? (
              <img src={slots[index]} alt={`${mag} micro`} className="product-micro-photo-slots__preview" />
            ) : (
              <div className="product-micro-photo-slots__frame product-micro-photo-slots__frame--empty" aria-hidden="true" />
            )}
            <figcaption>{mag}</figcaption>
            {editable && !disabled && slots[index] ? (
              <SecondaryButton type="button" className="product-micro-photo-slots__remove" onClick={() => handleRemove(index)}>
                <Trash2 size={12} />
                Remove
              </SecondaryButton>
            ) : null}
          </figure>
        ))}
      </div>
      <p className="product-micro-photo-slots__hint">BMP / JPG / PNG - one file per magnification</p>
    </div>
  );
}

export { MICRO_MAGNIFICATIONS, normalizePhotoSlots };

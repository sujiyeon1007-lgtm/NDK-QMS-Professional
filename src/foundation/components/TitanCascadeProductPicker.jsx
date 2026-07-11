import { useMemo, useState } from "react";
import { PrimaryButton, SecondaryButton } from "./Button";
import QuickProductRegisterModal from "./QuickProductRegisterModal";
import { TitanAutoComplete } from "./TitanSearchAutocomplete";
import {
  findCompanyProduct,
  findCompanyProductByPartNo,
  findCompanyProductByPartName,
  getCompanyDrawingNoOptions,
  mapProductToFormAutofill,
} from "../../utils/productMasterSearch";

const emptySelection = {
  partName: "",
  partNo: "",
  drawingNo: "",
};

/**
 * Excel Cascade Filter — 업체 → 품명 → 품번 → (도번) → 자동입력
 */
export default function TitanCascadeProductPicker({
  company = "",
  value = emptySelection,
  onChange,
  onProductSelect,
  showDrawingNo = true,
  showAutoFields = true,
  partNameOnly = false,
  autoFields = {},
  fieldClassName = "",
  gridClassName = "titan-cascade-product-picker",
  inline = false,
  disabled = false,
  kicker = "등록",
}) {
  const [unknownPrompt, setUnknownPrompt] = useState(null);
  const [quickRegisterOpen, setQuickRegisterOpen] = useState(false);

  const companySelected = Boolean(String(company ?? "").trim());
  const isDisabled = disabled || !companySelected;

  const drawingNoOptions = useMemo(() => {
    if (!showDrawingNo || !value.partName || !value.partNo) return [];
    return getCompanyDrawingNoOptions(company, value.partName, value.partNo);
  }, [company, showDrawingNo, value.partName, value.partNo]);

  const showDrawingSelect = showDrawingNo && drawingNoOptions.length > 0;

  const emitSelection = (nextSelection, product = null) => {
    onChange?.(nextSelection, product);
    if (product) {
      onProductSelect?.(product, mapProductToFormAutofill(product));
    }
  };

  const resolveProduct = (selection) => {
    const product = findCompanyProduct(
      company,
      selection.partName,
      selection.partNo,
      selection.drawingNo
    );
    emitSelection(selection, product);
    return product;
  };

  const handlePartNameChange = (partName) => {
    setUnknownPrompt(null);
    if (!partName) {
      onChange?.({ partName: "", partNo: "", drawingNo: "" }, null);
      return;
    }

    if (partNameOnly) {
      const product = findCompanyProductByPartName(company, partName);
      if (product) {
        const autofill = mapProductToFormAutofill(product);
        emitSelection(
          {
            partName: autofill.partName,
            partNo: autofill.partNo,
            drawingNo: autofill.drawingNo,
          },
          product
        );
        return;
      }
      onChange?.({ partName, partNo: "", drawingNo: "" }, null);
      return;
    }

    const next = { partName, partNo: "", drawingNo: "" };
    onChange?.(next, null);
  };

  const handlePartNoChange = (partNo) => {
    setUnknownPrompt(null);
    let next = { ...value, partNo, drawingNo: "" };

    if (!value.partName && partNo) {
      const product = findCompanyProductByPartNo(company, partNo);
      if (product) {
        next = {
          partName: product.name ?? "",
          partNo: product.partNo ?? partNo,
          drawingNo: "",
        };
        const drawings = getCompanyDrawingNoOptions(company, next.partName, next.partNo);
        if (drawings.length === 1) {
          resolveProduct({ ...next, drawingNo: drawings[0] });
          return;
        }
        resolveProduct(next, product);
        return;
      }
    }

    const drawings = getCompanyDrawingNoOptions(company, next.partName || value.partName, partNo);
    if (drawings.length === 1) {
      resolveProduct({ ...next, drawingNo: drawings[0] });
      return;
    }
    if (drawings.length === 0) {
      resolveProduct(next);
      return;
    }
    onChange?.(next, null);
  };

  const handleDrawingNoChange = (drawingNo) => {
    resolveProduct({ ...value, drawingNo });
  };

  const handleUnknownSearch = (query, stage) => {
    setUnknownPrompt({ query, stage });
  };

  const handleQuickSaved = (row) => {
    if (!row) return;
    const autofill = mapProductToFormAutofill(row);
    const next = {
      partName: autofill.partName,
      partNo: autofill.partNo,
      drawingNo: autofill.drawingNo,
    };
    emitSelection(next, row);
    setUnknownPrompt(null);
    setQuickRegisterOpen(false);
  };

  const renderReadonly = (label, fieldValue) => (
    <label className={fieldClassName || undefined}>
      <span>{label}</span>
      <input type="text" value={fieldValue || ""} readOnly placeholder="제품 선택 시 자동 입력" />
    </label>
  );

  return (
    <>
      <div className={`${gridClassName}${inline ? " titan-cascade-product-picker--inline" : ""}`.trim()}>
        <TitanAutoComplete
          fieldType="productName"
          label="품명"
          className={fieldClassName}
          companyFilter={company}
          value={value.partName}
          onChange={(partName) => {
            setUnknownPrompt(null);
            onChange?.(
              {
                partName,
                partNo: partName ? value.partNo : "",
                drawingNo: "",
              },
              null
            );
          }}
          onSelect={(partName, meta) => {
            if (meta?.autofill) {
              emitSelection(
                {
                  partName: meta.autofill.partName,
                  partNo: meta.autofill.partNo,
                  drawingNo: meta.autofill.drawingNo,
                },
                meta.product
              );
              return;
            }
            handlePartNameChange(partName);
          }}
          enableProductAutofill
          placeholder={companySelected ? "품명 검색" : "업체를 먼저 선택하세요"}
          disabled={isDisabled}
        />

        {!partNameOnly ? (
          <TitanAutoComplete
            fieldType="partNo"
            label="품번"
            className={fieldClassName}
            companyFilter={company}
            value={value.partNo}
            onChange={(partNo) => {
              setUnknownPrompt(null);
              onChange?.({ ...value, partNo, drawingNo: "" }, null);
            }}
            onSelect={(partNo, meta) => {
              if (meta?.autofill) {
                emitSelection(
                  {
                    partName: meta.autofill.partName,
                    partNo: meta.autofill.partNo,
                    drawingNo: meta.autofill.drawingNo,
                  },
                  meta.product
                );
                return;
              }
              handlePartNoChange(partNo);
            }}
            enableProductAutofill
            placeholder={value.partName ? "품번 검색" : "품명 또는 품번 검색"}
            disabled={isDisabled}
          />
        ) : (
          renderReadonly("품번", value.partNo)
        )}

        {showDrawingSelect ? (
          <TitanAutoComplete
            fieldType="drawingNo"
            label="도번"
            className={fieldClassName}
            companyFilter={company}
            value={value.drawingNo}
            onChange={(drawingNo) => onChange?.({ ...value, drawingNo }, null)}
            onSelect={handleDrawingNoChange}
            suggestions={drawingNoOptions}
            placeholder="도번 검색"
            disabled={isDisabled || !value.partNo}
          />
        ) : null}

        {unknownPrompt ? (
          <div
            className={`titan-cascade-product-picker__prompt${inline ? " span-2" : " titan-modal__field--full"}`}
            role="status"
          >
            <p>등록되지 않은 제품입니다. 새 제품으로 등록하시겠습니까?</p>
            <div className="titan-cascade-product-picker__prompt-actions">
              <PrimaryButton type="button" onClick={() => setQuickRegisterOpen(true)}>
                등록
              </PrimaryButton>
              <SecondaryButton type="button" onClick={() => setUnknownPrompt(null)}>
                취소
              </SecondaryButton>
            </div>
          </div>
        ) : null}

        {showAutoFields ? (
          <>
            {renderReadonly("재질", autoFields.material)}
            {renderReadonly("규격", autoFields.spec)}
            {renderReadonly("기본단가", autoFields.unitPrice)}
            {!showDrawingSelect ? renderReadonly("도번", autoFields.drawingNo) : null}
          </>
        ) : null}
      </div>

      <QuickProductRegisterModal
        open={quickRegisterOpen}
        onClose={() => setQuickRegisterOpen(false)}
        company={company}
        partNo={unknownPrompt?.stage === "partNo" ? unknownPrompt.query : ""}
        partName={unknownPrompt?.stage === "partName" ? unknownPrompt.query : ""}
        onSaved={handleQuickSaved}
        kicker={kicker}
      />
    </>
  );
}

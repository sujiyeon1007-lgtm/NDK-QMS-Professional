import { useMemo, useState } from "react";
import { PrimaryButton, SecondaryButton } from "./Button";
import QuickProductRegisterModal from "./QuickProductRegisterModal";
import TitanSearchableSelect from "./TitanSearchableSelect";
import {
  findCompanyProduct,
  findCompanyProductByPartNo,
  getCompanyDrawingNoOptions,
  getCompanyPartNoOptions,
  getCompanyProductNameOptions,
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

  const partNameOptions = useMemo(
    () => (companySelected ? getCompanyProductNameOptions(company) : []),
    [company, companySelected]
  );

  const partNoOptions = useMemo(
    () =>
      companySelected && value.partName
        ? getCompanyPartNoOptions(company, value.partName)
        : [],
    [company, companySelected, value.partName]
  );

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
        <TitanSearchableSelect
          className={fieldClassName}
          label="품명"
          value={value.partName}
          onChange={handlePartNameChange}
          options={partNameOptions}
          placeholder={companySelected ? "품명 선택" : "업체를 먼저 선택하세요"}
          disabled={isDisabled}
          emptySearchMessage="등록되지 않은 제품입니다."
          onEmptySearch={(query) => handleUnknownSearch(query, "partName")}
        />

        <TitanSearchableSelect
          className={fieldClassName}
          label="품번"
          value={value.partNo}
          onChange={handlePartNoChange}
          options={partNoOptions}
          placeholder={value.partName ? "품번 선택" : "품명 또는 품번 선택"}
          disabled={isDisabled}
          emptySearchMessage="등록되지 않은 제품입니다."
          onEmptySearch={(query) => handleUnknownSearch(query, "partNo")}
        />

        {showDrawingSelect ? (
          <TitanSearchableSelect
            className={fieldClassName}
            label="도번"
            value={value.drawingNo}
            onChange={handleDrawingNoChange}
            options={drawingNoOptions}
            placeholder="도번 선택"
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
            {renderReadonly("기본 열처리 종류", autoFields.process || autoFields.heatTreatment)}
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

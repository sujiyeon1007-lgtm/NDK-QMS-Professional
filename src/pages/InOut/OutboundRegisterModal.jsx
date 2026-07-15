import { useEffect, useMemo, useState } from "react";
import Input from "../../foundation/components/Input";
import TitanRegisterModal from "../../foundation/components/TitanRegisterModal";
import TitanSearchableSelect from "../../foundation/components/TitanSearchableSelect";
import { OUTBOUND_REGISTER_LABEL } from "../../config/registerModalStandard";
import { getActiveWorkers } from "../../utils/masterData";
import {
  getOutboundEligibleRecords,
  mapRecordToOutboundRegisterForm,
  validateOutboundRegisterForm,
  resolveOutboundProductAvailableQty,
  buildOutboundProductKey,
} from "../../utils/outboundRegistration";
import { getPrintOutputDate } from "../../utils/titanPrintDates";
import { resolveDefaultAssigneeFromAuth } from "../../utils/titanAssigneeResolver";

const EMPTY_FORM = mapRecordToOutboundRegisterForm(null);

function formatOutboundProductOption(product) {
  const available = resolveOutboundProductAvailableQty(product);
  return `${product.company} · ${product.partName} · ${product.partNo} · 출고가능 ${available} EA`;
}

function resolveRegisterProduct(productKey, managementId, eligibleProducts = []) {
  const key = String(productKey ?? "").trim();
  if (key) {
    const byKey = eligibleProducts.find((item) => item.productKey === key);
    if (byKey) return byKey;
  }

  const trimmed = managementId?.trim();
  if (!trimmed) return null;

  return (
    eligibleProducts.find((item) => item.id === trimmed) ??
    eligibleProducts.find((item) => (item.managementIds ?? []).includes(trimmed)) ??
    null
  );
}

export default function OutboundRegisterModal({
  open,
  onClose,
  onRegister,
  initialManagementId = "",
  initialProductKey = "",
}) {
  const [form, setForm] = useState(EMPTY_FORM);
  const workers = useMemo(() => getActiveWorkers(), [open]);

  const eligibleProducts = useMemo(() => (open ? getOutboundEligibleRecords() : []), [open]);

  const displayProducts = useMemo(() => {
    const products = [...eligibleProducts];
    const current = resolveRegisterProduct(form.productKey, form.managementId, products);
    if (current && !products.some((item) => item.productKey === current.productKey)) {
      products.unshift(current);
    }
    return products;
  }, [eligibleProducts, form.managementId, form.productKey]);

  const outboundProductOptions = useMemo(
    () => displayProducts.map((product) => formatOutboundProductOption(product)),
    [displayProducts]
  );

  const selectedOutboundOption = useMemo(() => {
    const product = displayProducts.find(
      (item) =>
        item.productKey === form.productKey ||
        (item.id === form.managementId && !form.productKey)
    );
    return product ? formatOutboundProductOption(product) : "";
  }, [displayProducts, form.managementId, form.productKey]);

  useEffect(() => {
    if (!open) return;

    const products = getOutboundEligibleRecords();
    const baseForm = {
      ...EMPTY_FORM,
      shipDate: getPrintOutputDate(),
      manager: resolveDefaultAssigneeFromAuth(),
    };

    const product = resolveRegisterProduct(initialProductKey, initialManagementId, products);
    setForm(mapRecordToOutboundRegisterForm(product, baseForm));
  }, [open, initialManagementId, initialProductKey]);

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleProductChange = (optionLabel) => {
    const product = displayProducts.find((item) => formatOutboundProductOption(item) === optionLabel);
    if (!product) return;
    setForm(
      mapRecordToOutboundRegisterForm(product, {
        ...form,
        managementId: product.id,
        productKey: product.productKey || buildOutboundProductKey(product),
        shipQty: "",
      })
    );
  };

  const handleSubmit = () => {
    try {
      const validation = validateOutboundRegisterForm(form);
      if (!validation.ok) {
        window.alert(validation.message || "출고 등록 정보를 확인하세요.");
        return;
      }

      onRegister?.({
        ok: true,
        form: { ...form, productKey: validation.product.productKey },
        managementId: validation.record.id,
        productKey: validation.product.productKey,
        record: validation.record,
        shipQty: validation.shipQty,
        stockBefore: validation.stock,
        stockAfter: validation.stock - validation.shipQty,
        allocations: validation.allocations,
      });
      onClose?.();
    } catch (error) {
      console.error("[OutboundRegisterModal] submit failed", error);
      window.alert(error?.message || "출고 등록 중 오류가 발생했습니다.");
    }
  };

  return (
    <TitanRegisterModal
      open={open}
      onClose={onClose}
      onSubmit={handleSubmit}
      kicker="입출고관리"
      title={OUTBOUND_REGISTER_LABEL}
      titleId="outbound-register-modal-title"
      size="wide"
    >
      <div className="titan-modal__section">
        <p className="titan-modal__section-title">출고 대상 선택</p>
        <TitanSearchableSelect
          className="titan-modal__field titan-modal__field--full"
          label="제품"
          value={selectedOutboundOption}
          onChange={(option) => handleProductChange(option)}
          options={outboundProductOptions}
          placeholder="제품 선택 (업체 · 품명 · 품번)"
        />
      </div>

      <div className="titan-modal__section">
        <p className="titan-modal__section-title">기본 정보</p>
        <div className="titan-modal__grid">
          <label className="titan-modal__field">
            <span>업체명</span>
            <Input value={form.company} readOnly disabled />
          </label>
          <label className="titan-modal__field">
            <span>품명</span>
            <Input value={form.partName} readOnly disabled />
          </label>
          <label className="titan-modal__field">
            <span>품번</span>
            <Input value={form.partNo} readOnly disabled />
          </label>
          <label className="titan-modal__field">
            <span>재질</span>
            <Input value={form.material} readOnly disabled />
          </label>
          <label className="titan-modal__field">
            <span>공정</span>
            <Input value={form.processName} readOnly disabled />
          </label>
          <label className="titan-modal__field">
            <span>LOT 배분</span>
            <Input value="자동 (FIFO)" readOnly disabled />
          </label>
        </div>
      </div>

      <div className="titan-modal__section">
        <p className="titan-modal__section-title">수량</p>
        <div className="titan-modal__grid">
          <label className="titan-modal__field">
            <span>출고가능(EA)</span>
            <Input value={form.stockQty} readOnly disabled placeholder="자동 입력" />
          </label>
          <label className="titan-modal__field">
            <span>출고수량(EA)</span>
            <Input
              value={form.shipQty}
              onChange={(e) => updateField("shipQty", e.target.value)}
              placeholder="출고 수량 입력"
            />
          </label>
        </div>
      </div>

      <div className="titan-modal__section">
        <p className="titan-modal__section-title">출고 정보</p>
        <div className="titan-modal__grid">
          <label className="titan-modal__field">
            <span>출고일</span>
            <Input
              type="date"
              value={form.shipDate}
              onChange={(e) => updateField("shipDate", e.target.value)}
            />
          </label>
          <label className="titan-modal__field">
            <span>담당자</span>
            <select value={form.manager} onChange={(e) => updateField("manager", e.target.value)}>
              <option value="">선택</option>
              {workers.map((item) => (
                <option key={item.id} value={item.name}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <label className="titan-modal__field titan-modal__field--full">
            <span>비고</span>
            <Input
              value={form.note}
              onChange={(e) => updateField("note", e.target.value)}
              placeholder="비고"
            />
          </label>
        </div>
      </div>
    </TitanRegisterModal>
  );
}

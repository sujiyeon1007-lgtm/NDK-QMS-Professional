import { useEffect, useMemo, useRef, useState } from "react";

import {
  QR_ENGINE_COPY,
  QR_ENGINE_GENERATOR_TYPES,
} from "../../config/qrEngineArchitecture";
import { PrimaryButton, SecondaryButton } from "../../foundation/components/Button";
import {
  buildGeneratorPreview,
  generateOrReissueFromGenerator,
  getEquipmentGeneratorOptions,
  getLotGeneratorOptions,
  getQrEngineRegistryRowByTarget,
  syncQrEngineAutoRegistry,
} from "../../utils/qrEngineRegistryService";
import {
  downloadQrSvgAsPng,
  exportQrEnginePdf,
  notifyLabelPrintPlaceholder,
  printQrEngineSheet,
} from "../../utils/qrEnginePrintService";
import QrEnginePreview from "./components/QrEnginePreview";
import QrEnginePrintSheet from "./components/QrEnginePrintSheet";

export default function QrEngineGeneratorPage() {
  const [generatorTypeId, setGeneratorTypeId] = useState(QR_ENGINE_GENERATOR_TYPES.equipment.id);
  const [target, setTarget] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [registryRefresh, setRegistryRefresh] = useState(0);
  const printRef = useRef(null);
  const previewRef = useRef(null);

  useEffect(() => {
    syncQrEngineAutoRegistry();
  }, []);

  const equipmentOptions = useMemo(() => getEquipmentGeneratorOptions(), [registryRefresh]);
  const lotOptions = useMemo(() => getLotGeneratorOptions(), [registryRefresh]);

  const options =
    generatorTypeId === QR_ENGINE_GENERATOR_TYPES.lot.id ? lotOptions : equipmentOptions;

  useEffect(() => {
    if (!target && options.length) setTarget(options[0].value);
  }, [generatorTypeId, options, target]);

  const preview = useMemo(
    () => buildGeneratorPreview(generatorTypeId, target),
    [generatorTypeId, target]
  );

  const registryRow = useMemo(
    () => getQrEngineRegistryRowByTarget(generatorTypeId, target),
    [generatorTypeId, target, registryRefresh]
  );

  const printRow = registryRow ?? (preview
    ? {
        id: `draft-${generatorTypeId}-${target}`,
        target,
        scanValue: preview.scanValue,
        payload: preview.payload,
        printTitle: preview.title,
        printSubtitle: preview.subtitle,
      }
    : null);

  const handleGenerate = async (reissue = false) => {
    if (!target) {
      setMessage("대상을 선택하세요.");
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      const result = generateOrReissueFromGenerator(generatorTypeId, target, { reissue });
      if (!result.ok) {
        setMessage(result.message ?? "QR 생성 실패");
        return;
      }
      setRegistryRefresh((v) => v + 1);
      setMessage(reissue ? "QR 재발행이 완료되었습니다." : "QR Registry에 등록되었습니다.");
    } finally {
      setBusy(false);
    }
  };

  const handlePng = async () => {
    const svg = previewRef.current?.querySelector("svg");
    const result = await downloadQrSvgAsPng(svg, `${target || "qr"}.png`);
    if (!result.ok) setMessage(result.message ?? "PNG 저장 실패");
  };

  const runPrint = async (kind) => {
    if (!printRow?.scanValue) {
      setMessage("먼저 QR을 생성하거나 대상을 선택하세요.");
      return;
    }
    if (kind === "label") {
      notifyLabelPrintPlaceholder();
      return;
    }
    setBusy(true);
    try {
      await new Promise((resolve) => requestAnimationFrame(() => resolve()));
      const root = printRef.current;
      if (!root) return;
      if (kind === "pdf") {
        await exportQrEnginePdf(root, `${target || "qr"}.pdf`, registryRow ? [registryRow.id] : []);
      } else {
        await printQrEngineSheet(root, registryRow ? [registryRow.id] : []);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="qr-engine-page">
      <p className="qr-engine-hint">{QR_ENGINE_COPY.autoGenerateHint}</p>

      <section className="qr-engine-generator-panel" aria-label="QR Generator">
        <h2 className="titan-section-page__subtitle">{QR_ENGINE_COPY.generatorTitle}</h2>

        <div className="qr-engine-generator-type" role="radiogroup" aria-label="QR 종류">
          {Object.values(QR_ENGINE_GENERATOR_TYPES).map((type) => (
            <label key={type.id} className="qr-engine-generator-type__option">
              <input
                type="radio"
                name="qr-generator-type"
                value={type.id}
                checked={generatorTypeId === type.id}
                onChange={() => {
                  setGeneratorTypeId(type.id);
                  setTarget("");
                  setMessage("");
                }}
              />
              <span>{type.labelKo}</span>
            </label>
          ))}
        </div>

        <label className="qr-engine-generator-field">
          <span>
            {generatorTypeId === QR_ENGINE_GENERATOR_TYPES.lot.id ? "LOT 선택" : "Equipment 선택"}
          </span>
          <select
            className="qr-engine-generator-select"
            value={target}
            onChange={(event) => setTarget(event.target.value)}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <div ref={previewRef}>
          <QrEnginePreview
            scanValue={preview?.scanValue ?? ""}
            payload={preview?.payload ?? ""}
            title={preview?.title ?? ""}
            subtitle={preview?.subtitle ?? ""}
          />
        </div>

        {registryRow ? (
          <p className="qr-engine-status" role="status">
            Registry: {registryRow.displayQrId} · 재발행 {registryRow.reissueCount}회 · 출력{" "}
            {registryRow.printCount}회
          </p>
        ) : null}
        {message ? <p className="home-empty" role="status">{message}</p> : null}

        <div className="qr-engine-scan-actions">
          <PrimaryButton type="button" disabled={busy || !target} onClick={() => handleGenerate(false)}>
            QR 생성
          </PrimaryButton>
          <SecondaryButton type="button" disabled={busy || !registryRow} onClick={() => handleGenerate(true)}>
            재발행
          </SecondaryButton>
          <SecondaryButton type="button" disabled={busy || !preview?.scanValue} onClick={handlePng}>
            PNG 저장
          </SecondaryButton>
          <SecondaryButton type="button" disabled={busy || !printRow} onClick={() => runPrint("pdf")}>
            PDF 출력
          </SecondaryButton>
          <SecondaryButton type="button" disabled={busy || !printRow} onClick={() => runPrint("a4")}>
            A4 출력
          </SecondaryButton>
          <SecondaryButton type="button" disabled={busy} onClick={() => runPrint("label")}>
            라벨 출력
          </SecondaryButton>
        </div>
      </section>

      <div className="qr-engine-print-host" aria-hidden="true">
        <div ref={printRef}>
          <QrEnginePrintSheet rows={printRow ? [printRow] : []} title="QR Engine Label" />
        </div>
      </div>
    </div>
  );
}
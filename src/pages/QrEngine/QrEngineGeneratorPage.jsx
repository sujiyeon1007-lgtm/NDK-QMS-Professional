import { useEffect, useMemo, useRef, useState } from "react";

import {
  QR_ENGINE_COPY,
  QR_ENGINE_GENERATOR_GROUPS,
  QR_ENGINE_GENERATOR_TYPES,
  QR_ENGINE_WORKFLOWS,
} from "../../config/qrEngineArchitecture";
import {
  PrimaryButton,
  SecondaryButton,
  TitanDashboardCard,
  TitanEmptyState,
  TitanStatusBadge,
} from "../../foundation/uiKit";
import {
  buildGeneratorPreview,
  generateOrReissueFromGenerator,
  getGeneratorOptions,
  getQrEngineRegistryRowByTarget,
  scheduleQrEngineAutoRegistrySync,
} from "../../utils/qrEngineRegistryService";
import {
  downloadQrSvgAsPng,
  exportQrEnginePdf,
  printQrEngineSheet,
} from "../../utils/qrEnginePrintService";
import QrEnginePreview from "./components/QrEnginePreview";
import QrEnginePrintSheet from "./components/QrEnginePrintSheet";

export default function QrEngineGeneratorPage() {
  const [generatorTypeId, setGeneratorTypeId] = useState(QR_ENGINE_GENERATOR_TYPES.equipment.id);
  const [target, setTarget] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [printMode, setPrintMode] = useState("a4");
  const [registryRefresh, setRegistryRefresh] = useState(0);
  const printRef = useRef(null);
  const previewRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    scheduleQrEngineAutoRegistrySync().then(() => {
      if (!cancelled) setRegistryRefresh((value) => value + 1);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const options = useMemo(
    () => getGeneratorOptions(generatorTypeId),
    [generatorTypeId, registryRefresh]
  );
  const selectedType = QR_ENGINE_GENERATOR_TYPES[generatorTypeId] ?? QR_ENGINE_GENERATOR_TYPES.equipment;
  const workflowSteps = QR_ENGINE_WORKFLOWS[generatorTypeId] ?? [];

  useEffect(() => {
    if (!target && options.length) setTarget(options[0].value);
  }, [generatorTypeId, options, target]);

  const preview = useMemo(
    () => buildGeneratorPreview(generatorTypeId, target),
    [generatorTypeId, target]
  );

  const registryRow = useMemo(
    () => getQrEngineRegistryRowByTarget(generatorTypeId, target, { autoSync: false }),
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
      setMessage(reissue ? "QR 재발행이 완료되었습니다." : "QR Registry 등록 상태를 확인했습니다.");
    } finally {
      setBusy(false);
    }
  };

  const handlePng = async () => {
    const svg = previewRef.current?.querySelector("svg");
    setBusy(true);
    try {
      const result = await downloadQrSvgAsPng(svg, `${target || "qr"}.png`, registryRow ? [registryRow.id] : []);
      if (!result.ok) {
        setMessage(result.message ?? "PNG 저장 실패");
        return;
      }
      setRegistryRefresh((v) => v + 1);
      setMessage("PNG 저장이 완료되었습니다.");
    } finally {
      setBusy(false);
    }
  };

  const runPrint = async (kind) => {
    if (!printRow?.scanValue) {
      setMessage("먼저 QR을 생성하거나 대상을 선택하세요.");
      return;
    }
    const nextMode = kind === "label" ? "label" : "a4";
    setPrintMode(nextMode);
    setBusy(true);
    try {
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      const root = printRef.current;
      if (!root) return;
      if (kind === "pdf") {
        await exportQrEnginePdf(root, `${target || "qr"}.pdf`, registryRow ? [registryRow.id] : []);
      } else {
        await printQrEngineSheet(root, registryRow ? [registryRow.id] : []);
      }
      setRegistryRefresh((v) => v + 1);
      setMessage(kind === "pdf" ? "PDF 출력이 완료되었습니다." : kind === "label" ? "라벨 출력이 완료되었습니다." : "A4 출력이 완료되었습니다.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="qr-engine-page">
      <p className="qr-engine-hint">{QR_ENGINE_COPY.autoGenerateHint}</p>

      <TitanDashboardCard title={QR_ENGINE_COPY.generatorTitle} className="qr-engine-generator-panel" aria-label="QR 생성">
        <div className="qr-engine-generator-groups" role="radiogroup" aria-label="업무 영역별 QR 종류">
          {QR_ENGINE_GENERATOR_GROUPS.map((group) => (
            <section key={group.id} className="qr-engine-generator-group" aria-label={group.label}>
              <div className="qr-engine-generator-group__head">
                <strong>{group.label}</strong>
                <span>{group.description}</span>
              </div>
              <div className="qr-engine-generator-type">
                {group.typeIds.map((typeId) => {
                  const type = QR_ENGINE_GENERATOR_TYPES[typeId];
                  if (!type) return null;
                  return (
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
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        <label className="qr-engine-generator-field">
          <span>
            {selectedType.labelKo} 대상 선택
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

        {workflowSteps.length ? (
          <div className="qr-engine-workflow-preview" aria-label={`${selectedType.labelKo} Workflow`}>
            <strong>{selectedType.labelKo} Workflow</strong>
            <ol>
              {workflowSteps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </div>
        ) : null}

        {options.length ? (
          <div ref={previewRef}>
            <QrEnginePreview
              scanValue={preview?.scanValue ?? ""}
              payload={preview?.payload ?? ""}
              title={preview?.title ?? ""}
              subtitle={preview?.subtitle ?? ""}
            />
          </div>
        ) : (
          <TitanEmptyState
            title="생성 가능한 QR 대상이 없습니다."
            description="설비 Master 또는 LOT 데이터가 준비되면 QR 목록이 자동 생성됩니다."
          />
        )}

        {registryRow ? (
          <div className="qr-engine-registry-summary" role="status">
            <div>
              <strong>{registryRow.displayQrId}</strong>
              <span>{registryRow.qrTypeLabel} · {registryRow.target}</span>
            </div>
            <TitanStatusBadge status={registryRow.statusKey === "regenerated" ? "processing" : "success"} text={registryRow.status} />
            <span>재발행 {registryRow.reissueCount}회</span>
            <span>출력 {registryRow.printCount}회</span>
          </div>
        ) : null}
        {message ? <p className="home-empty" role="status">{message}</p> : null}

        <div className="qr-engine-scan-actions">
          <PrimaryButton type="button" disabled={busy || !target} onClick={() => handleGenerate(false)}>
            QR 등록 확인
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
      </TitanDashboardCard>

      <div className="qr-engine-print-host" aria-hidden="true">
        <div ref={printRef}>
          <QrEnginePrintSheet rows={printRow ? [printRow] : []} title="QR 라벨" mode={printMode} />
        </div>
      </div>
    </div>
  );
}
import { useMemo, useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { QrCode } from "lucide-react";

import { resolveQrBrowserPayload } from "../../config/qrBrowserUrlConfig";
import { QRService } from "../../utils/qrEngineRegistryService";
import { downloadQrSvgAsPng, exportQrEnginePdf } from "../../utils/qrEnginePrintService";
import { PrimaryButton, SecondaryButton } from "./Button";

const L = {
  title: "QR \uC815\uBCF4",
  pending: "\uBBF8\uC0DD\uC131",
  active: "\uC0DD\uC131 \uC644\uB8CC",
  uuid: "UUID",
  create: "QR \uC0DD\uC131",
  view: "QR \uBCF4\uAE30",
  hide: "QR \uC228\uAE30\uAE30",
  png: "PNG \uCD9C\uB825",
  pdf: "PDF \uCD9C\uB825",
  reissue: "QR \uC7AC\uBC1C\uAE09",
  noTarget: "QR \uC0DD\uC131 \uB300\uC0C1\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.",
  createDone: "QR\uAC00 \uC0DD\uC131\uB418\uC5C8\uC2B5\uB2C8\uB2E4.",
  reissueDone: "QR\uAC00 \uC7AC\uBC1C\uAE09\uB418\uC5C8\uC2B5\uB2C8\uB2E4.",
};

function resolveTargetKey(target) {
  if (typeof target !== "object") return String(target ?? "").trim();
  return String(target?.qrUuid ?? target?.id ?? target?.documentNo ?? target?.managementId ?? target?.lotNo ?? "").trim();
}

function normalizeRecord(record) {
  if (!record) return null;
  return {
    ...record,
    uuid: record.entityKey,
    qrValue: resolveQrBrowserPayload(record.scanValue ?? record.payload),
  };
}

export default function FoundationQrPanel({ entityType, target, title = "", className = "" }) {
  const targetKey = useMemo(() => resolveTargetKey(target), [target]);
  const [record, setRecord] = useState(() => normalizeRecord(QRService.get(targetKey, entityType)));
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [showQr, setShowQr] = useState(false);
  const qrRef = useRef(null);

  const refresh = () => setRecord(normalizeRecord(QRService.get(targetKey, entityType)));

  const runGenerate = (reissue = false) => {
    if (!targetKey) {
      setMessage(L.noTarget);
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      const result = reissue
        ? QRService.regenerate(entityType, target, { title })
        : QRService.createIfNotExists(entityType, target, { title });
      if (!result.ok) {
        setMessage(result.message || "QR error");
        return;
      }
      refresh();
      setShowQr(true);
      setMessage(reissue ? L.reissueDone : L.createDone);
    } finally {
      setBusy(false);
    }
  };

  const runPng = async () => {
    const svg = qrRef.current?.querySelector("svg");
    setBusy(true);
    try {
      await downloadQrSvgAsPng(svg, `${targetKey || "qr"}.png`, record?.id ? [record.id] : []);
      refresh();
    } finally {
      setBusy(false);
    }
  };

  const runPdf = async () => {
    setBusy(true);
    try {
      await exportQrEnginePdf(qrRef.current, `${targetKey || "qr"}.pdf`, record?.id ? [record.id] : []);
      refresh();
    } finally {
      setBusy(false);
    }
  };

  const classes = ["foundation-qr-panel", className].filter(Boolean).join(" ");
  const hasQr = Boolean(record?.qrValue);

  return (
    <section className={classes} aria-label={L.title}>
      <header className="foundation-qr-panel__header">
        <div>
          <strong><QrCode size={14} aria-hidden="true" />{L.title}</strong>
          <span className={hasQr ? "foundation-qr-panel__status is-active" : "foundation-qr-panel__status"}>
            QR \uC0C1\uD0DC : {hasQr ? L.active : L.pending}
          </span>
        </div>
        {hasQr ? <code>{L.uuid}: {record.uuid}</code> : null}
      </header>

      {showQr && hasQr ? (
        <div className="foundation-qr-panel__preview" ref={qrRef}>
          <QRCodeSVG value={record.qrValue} size={160} level="M" includeMargin />
          <div>
            <strong>{title || targetKey}</strong>
            <code>{record.qrValue}</code>
          </div>
        </div>
      ) : <div className="foundation-qr-panel__preview-host" ref={qrRef}>{hasQr ? <QRCodeSVG value={record.qrValue} size={160} level="M" includeMargin /> : null}</div>}

      <div className="foundation-qr-panel__actions">
        {!hasQr ? (
          <PrimaryButton type="button" onClick={() => runGenerate(false)} disabled={busy || !targetKey}>{L.create}</PrimaryButton>
        ) : (
          <>
            <SecondaryButton type="button" onClick={() => setShowQr((value) => !value)} disabled={busy}>{showQr ? L.hide : L.view}</SecondaryButton>
            <SecondaryButton type="button" onClick={runPng} disabled={busy}>{L.png}</SecondaryButton>
            <SecondaryButton type="button" onClick={runPdf} disabled={busy}>{L.pdf}</SecondaryButton>
            <SecondaryButton type="button" onClick={() => runGenerate(true)} disabled={busy}>{L.reissue}</SecondaryButton>
          </>
        )}
      </div>
      {message ? <p className="foundation-qr-panel__message" role="status">{message}</p> : null}
    </section>
  );
}
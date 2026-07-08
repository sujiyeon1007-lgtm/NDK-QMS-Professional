import { QRCodeSVG } from "qrcode.react";
import { resolveQrBrowserPayload } from "../../../config/qrBrowserUrlConfig";

export default function QrEnginePrintSheet({ rows = [], title = "QR Label", mode = "a4" }) {
  if (!rows.length) return null;
  const sheetClass =
    mode === "label" ? "qr-engine-print-sheet qr-engine-print-sheet--label" : "qr-engine-print-sheet";

  return (
    <div className={`titan-print-document ${sheetClass}`} data-print-title={title}>
      {rows.map((row) => (
        <article key={row.id ?? row.target} className="qr-engine-print-sheet__card titan-print-page">
          <header className="qr-engine-print-sheet__head">
            <strong>{row.printTitle ?? row.title ?? row.target ?? "—"}</strong>
            <span>{row.printSubtitle ?? row.subtitle ?? row.target ?? "—"}</span>
          </header>
          <div className="qr-engine-print-sheet__body">
            <div className="qr-engine-print-sheet__qr">
              <QRCodeSVG value={resolveQrBrowserPayload(row)} size={180} level="M" includeMargin />
            </div>
            <code className="qr-engine-print-sheet__scan">{resolveQrBrowserPayload(row)}</code>
            <pre className="qr-engine-print-sheet__payload">{row.payload ?? ""}</pre>
          </div>
        </article>
      ))}
    </div>
  );
}
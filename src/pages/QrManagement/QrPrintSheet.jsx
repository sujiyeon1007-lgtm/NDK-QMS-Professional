import { QRCodeSVG } from "qrcode.react";
import { resolveQrBrowserPayload } from "../../config/qrBrowserUrlConfig";

/**
 * QR 출력 · PDF용 시트 (titanPrintEngine 호환)
 */
export default function QrPrintSheet({ rows = [], title = "QR 라벨" }) {
  if (!rows.length) return null;

  return (
    <div className="titan-print-document qr-print-sheet" data-print-title={title}>
      {rows.map((row) => (
        <article key={row.id} className="qr-print-sheet__card titan-print-page">
          <header className="qr-print-sheet__head">
            <strong>{row.printTitle ?? row.partName ?? row.equipmentName ?? "—"}</strong>
            <span>{row.printSubtitle ?? row.managementId ?? row.equipmentCode ?? "—"}</span>
          </header>
          <div className="qr-print-sheet__body">
            <div className="qr-print-sheet__qr">
              <QRCodeSVG value={resolveQrBrowserPayload(row)} size={160} level="M" includeMargin />
            </div>
            <pre className="qr-print-sheet__payload">{resolveQrBrowserPayload(row)}</pre>
          </div>
        </article>
      ))}
    </div>
  );
}

import { QRCodeSVG } from "qrcode.react";
import { resolveQrBrowserPayload } from "../../../config/qrBrowserUrlConfig";

export default function QrEnginePreview({ scanValue = "", payload = "", title = "", subtitle = "" }) {
  const qrValue = resolveQrBrowserPayload(scanValue);
  if (!qrValue) {
    return (
      <div className="qr-engine-preview qr-engine-preview--empty" role="status">
        대상을 선택하면 QR Preview가 표시됩니다.
      </div>
    );
  }

  return (
    <div className="qr-engine-preview" aria-label="QR Preview">
      <div className="qr-engine-preview__code" data-qr-svg-root>
        <QRCodeSVG value={qrValue} size={220} level="M" includeMargin />
      </div>
      <div className="qr-engine-preview__meta">
        {title ? <strong>{title}</strong> : null}
        {subtitle ? <span>{subtitle}</span> : null}
        <code className="qr-engine-preview__scan-value">{qrValue}</code>
        {payload ? <pre className="qr-engine-preview__payload">{payload}</pre> : null}
      </div>
    </div>
  );
}
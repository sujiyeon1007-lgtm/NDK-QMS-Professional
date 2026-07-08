import { QRCodeSVG } from "qrcode.react";
import { resolveQrBrowserPayload } from "../../../config/qrBrowserUrlConfig";
import { getLotQrValue } from "../../../utils/ndkWorkflow";
import "./LotQrCode.css";

function LotQrCode({ lotNo, size = 88, className = "", title }) {
  const value = resolveQrBrowserPayload({ qrType: "lot", lotNo, scanValue: getLotQrValue(lotNo) });
  if (!value) {
    return (
      <div className={`lot-qr-code lot-qr-code--empty ${className}`.trim()} aria-hidden="true">
        LOT 미등록
      </div>
    );
  }

  return (
    <div className={`lot-qr-code ${className}`.trim()} title={title || `LOT ${value}`}>
      <QRCodeSVG value={value} size={size} level="M" includeMargin={false} />
      <span className="lot-qr-code-label">{value}</span>
    </div>
  );
}

export default LotQrCode;

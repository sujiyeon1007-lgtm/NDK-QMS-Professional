import { QRCodeSVG } from "qrcode.react";
import "./TitanPrintDocumentMeta.css";

/** 공통 출력 메타 + QR (문서번호 아래 · 우측 상단) */
function TitanPrintDocumentMeta({
  docNo = "",
  incomingDate = "",
  outputDate = "",
  lotNo = "",
  workDate = "",
  equipment = "",
  worker = "",
  qrValue = "",
  qrLabel = "문서 QR",
}) {
  return (
    <div className="titan-print-doc-meta">
      <div className="titan-print-doc-meta__info">
        {docNo && (
          <span>
            문서번호 <strong>{docNo}</strong>
          </span>
        )}
        {lotNo && (
          <span>
            로트번호 <strong>{lotNo}</strong>
          </span>
        )}
        {workDate && (
          <span>
            작업일 <strong>{workDate}</strong>
          </span>
        )}
        {incomingDate && (
          <span>
            입고일 <strong>{incomingDate}</strong>
          </span>
        )}
        {outputDate && (
          <span>
            출력일 <strong>{outputDate}</strong>
          </span>
        )}
        {equipment && equipment !== "—" && (
          <span>
            설비 <strong>{equipment}</strong>
          </span>
        )}
        {worker && worker !== "—" && (
          <span>
            작업자 <strong>{worker}</strong>
          </span>
        )}
      </div>
      {qrValue && (
        <div className="titan-print-doc-meta__qr" aria-label={qrLabel}>
          <QRCodeSVG value={qrValue} size={72} level="M" includeMargin={false} />
          <span className="titan-print-doc-meta__qr-caption">{docNo}</span>
        </div>
      )}
    </div>
  );
}

export default TitanPrintDocumentMeta;

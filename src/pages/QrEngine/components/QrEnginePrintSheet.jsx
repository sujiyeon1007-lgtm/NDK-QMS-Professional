import { QRCodeSVG } from "qrcode.react";
import { resolveQrBrowserPayload } from "../../../config/qrBrowserUrlConfig";
import {
  buildCompanyPrintFooterLines,
  getCompanyBrandingLogoUrl,
  getCompanyBrandingStampUrl,
  getCompanyBrandingSignatureUrl,
} from "../../../utils/companyWorkspaceService";
import NdkLogo from "../../../components/common/NdkLogo";

export default function QrEnginePrintSheet({ rows = [], title = "QR Label", mode = "a4" }) {
  if (!rows.length) return null;
  const sheetClass =
    mode === "label" ? "qr-engine-print-sheet qr-engine-print-sheet--label" : "qr-engine-print-sheet";
  const companyLogo = getCompanyBrandingLogoUrl();
  const footerLines = buildCompanyPrintFooterLines();
  const companyStamp = getCompanyBrandingStampUrl();
  const companySignature = getCompanyBrandingSignatureUrl();

  return (
    <div className={`titan-print-document ${sheetClass}`} data-print-title={title}>
      {rows.map((row) => (
        <article key={row.id ?? row.target} className="qr-engine-print-sheet__card titan-print-page">
          <header className="qr-engine-print-sheet__head">
            {companyLogo ? (
              <img src={companyLogo} alt="Company Logo" className="qr-engine-print-sheet__logo" />
            ) : (
              <NdkLogo className="qr-engine-print-sheet__logo" />
            )}
            <strong>{row.printTitle ?? row.title ?? row.target ?? "—"}</strong>
            <span>{row.printSubtitle ?? row.subtitle ?? row.target ?? "—"}</span>
          </header>
          <div className="qr-engine-print-sheet__body">
            <dl className="qr-engine-print-sheet__meta">
              {row.printLotNo ? (
                <div className="qr-engine-print-sheet__meta-row">
                  <dt>LOT</dt>
                  <dd>{row.printLotNo}</dd>
                </div>
              ) : null}
              {row.printEquipment ? (
                <div className="qr-engine-print-sheet__meta-row">
                  <dt>Equipment</dt>
                  <dd>{row.printEquipment}</dd>
                </div>
              ) : null}
              {row.printCreatedAt ? (
                <div className="qr-engine-print-sheet__meta-row">
                  <dt>생성일</dt>
                  <dd>{row.printCreatedAt}</dd>
                </div>
              ) : null}
            </dl>
            <div className="qr-engine-print-sheet__qr">
              <QRCodeSVG value={resolveQrBrowserPayload(row)} size={180} level="M" includeMargin />
            </div>
            {row.qrType === "equipment" || row.printEquipmentCode || row.displayQrId ? (
              <div className="qr-engine-print-sheet__readable">
                {row.printEquipmentCode ? (
                  <p>
                    <strong>설비</strong> : {row.printEquipmentCode}
                  </p>
                ) : null}
                {row.displayQrId ? (
                  <p>
                    <strong>QR ID</strong> : {row.displayQrId}
                  </p>
                ) : null}
                {row.printShortPath ? (
                  <p className="qr-engine-print-sheet__short-path">{row.printShortPath}</p>
                ) : null}
              </div>
            ) : null}
            <code className="qr-engine-print-sheet__scan">{resolveQrBrowserPayload(row)}</code>
            <pre className="qr-engine-print-sheet__payload">{row.payload ?? ""}</pre>
          </div>
          {footerLines.length || companyStamp || companySignature ? (
            <footer className="qr-engine-print-sheet__footer">
              {companyStamp || companySignature ? (
                <div className="qr-engine-print-sheet__branding" aria-hidden="true">
                  {companyStamp ? <img src={companyStamp} alt="" className="qr-engine-print-sheet__stamp" /> : null}
                  {companySignature ? (
                    <img src={companySignature} alt="" className="qr-engine-print-sheet__signature" />
                  ) : null}
                </div>
              ) : null}
              {footerLines.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </footer>
          ) : null}
        </article>
      ))}
    </div>
  );
}
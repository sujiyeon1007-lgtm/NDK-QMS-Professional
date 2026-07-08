import { TitanBreadcrumb } from "../../foundation/uiKit";
import { QR_ENGINE_COPY } from "../../config/qrEngineArchitecture";
import "../../foundation/styles/titan-hub-page.css";
import "./QrEngine.css";

export default function QrEnginePageShell({ breadcrumbItems, title, description = null, children }) {
  return (
    <div className="titan-section-page">
      <header className="titan-section-page__header">
        <h1 className="titan-section-page__title">{title}</h1>
        {description ? <p className="titan-section-page__desc">{description}</p> : null}
      </header>
      <TitanBreadcrumb items={breadcrumbItems} />
      <div className="titan-section-page__body">{children}</div>
    </div>
  );
}

export function qrEngineBreadcrumbTrail(currentLabel) {
  return [
    { label: QR_ENGINE_COPY.workspaceTitle, to: "/qr/dashboard" },
    { label: currentLabel },
  ];
}
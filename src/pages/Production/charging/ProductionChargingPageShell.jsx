import TitanBreadcrumb from "../../../foundation/components/TitanBreadcrumb";
import "../../../foundation/styles/titan-hub-page.css";

/**
 * 설비 장입관리 하위 화면 — Header 1개 + Breadcrumb (Header 아래)
 * @param {{ breadcrumbItems: import("../../../config/titanBreadcrumbPolicy").TitanBreadcrumbItem[], title: string, description?: string | null, children: import("react").ReactNode }} props
 */
export default function ProductionChargingPageShell({
  breadcrumbItems,
  title,
  description = null,
  children,
}) {
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

import { SectionPageActionsProvider } from "./SectionPageActionsContext";
import TitanBreadcrumb from "../components/TitanBreadcrumb";
import "./SectionPageLayout.css";

function normalizeBreadcrumbItems(items = []) {
  return items
    .map((item) => (typeof item === "string" ? { label: item } : item))
    .filter((item) => item?.label);
}

function SectionPageHeader({ section, description }) {
  return (
    <header className="titan-section-page__header">
      <h1 className="titan-section-page__title">{section.label}</h1>
      {description !== null ? (
        <p className="titan-section-page__desc">
          {description ?? "하위 기능은 상단 탭에서 선택"}
        </p>
      ) : null}
    </header>
  );
}

function SectionPageLayoutInner({
  section,
  description,
  workspaceNav,
  breadcrumbItems,
  sectionTabs,
  hidePageHeader = false,
  children,
}) {
  const normalizedBreadcrumbItems = normalizeBreadcrumbItems(breadcrumbItems);
  const toolbarTabCount = 0;

  return (
    <SectionPageActionsProvider toolbarTabCount={toolbarTabCount}>
      <div className="titan-section-page">
        {!hidePageHeader ? <SectionPageHeader section={section} description={description} /> : null}
        {normalizedBreadcrumbItems.length ? <TitanBreadcrumb items={normalizedBreadcrumbItems} /> : null}
        <div className="titan-section-page__body">{children}</div>
      </div>
    </SectionPageActionsProvider>
  );
}

export default function SectionPageLayout({
  section,
  description,
  workspaceNav,
  breadcrumbItems,
  sectionTabs,
  hidePageHeader = false,
  children,
}) {
  return (
    <SectionPageLayoutInner
      section={section}
      description={description}
      workspaceNav={workspaceNav}
      breadcrumbItems={breadcrumbItems}
      sectionTabs={sectionTabs}
      hidePageHeader={hidePageHeader}
    >
      {children}
    </SectionPageLayoutInner>
  );
}

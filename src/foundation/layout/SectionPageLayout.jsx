import { SectionPageActionsProvider } from "./SectionPageActionsContext";
import TitanMenuToolbar from "./TitanMenuToolbar";
import "./SectionPageLayout.css";

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

function SectionPageLayoutInner({ section, description, children }) {
  return (
    <div className="titan-section-page">
      <SectionPageHeader section={section} description={description} />
      <TitanMenuToolbar tabs={section.tabs} />
      <div className="titan-section-page__body">{children}</div>
    </div>
  );
}

export default function SectionPageLayout({ section, description, children }) {
  return (
    <SectionPageActionsProvider>
      <SectionPageLayoutInner section={section} description={description}>
        {children}
      </SectionPageLayoutInner>
    </SectionPageActionsProvider>
  );
}

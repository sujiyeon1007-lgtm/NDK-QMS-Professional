import SectionTabs from "./SectionTabs";
import "./SectionPageLayout.css";

export default function SectionPageLayout({ section, description, children }) {
  return (
    <div className="titan-section-page">
      <header className="titan-section-page__header">
        <h1 className="titan-section-page__title">{section.label}</h1>
        {description !== null ? (
          <p className="titan-section-page__desc">
            {description ?? "하위 기능은 상단 탭에서 선택"}
          </p>
        ) : null}
        <SectionTabs tabs={section.tabs} />
      </header>
      <div className="titan-section-page__body">{children}</div>
    </div>
  );
}

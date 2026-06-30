import { NavLink } from "react-router-dom";

export default function SectionTabs({ tabs }) {
  return (
    <nav className="titan-section-tabs" aria-label="하위 메뉴">
      {tabs.map((tab) => (
        <NavLink
          key={tab.id}
          to={tab.path}
          className={({ isActive }) => `titan-section-tabs__link${isActive ? " active" : ""}`}
          end
        >
          {tab.label}
        </NavLink>
      ))}
    </nav>
  );
}

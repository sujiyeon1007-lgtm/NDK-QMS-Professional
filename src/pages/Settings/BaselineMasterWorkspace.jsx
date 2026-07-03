import { useState } from "react";

import { getMasterDataBaselineNavItems } from "../../config/masterDataTabGroups";
import MasterDataManagement from "./MasterDataManagement";

import "../InOut/InboundManagement.css";
import "./MasterDataSplitLayout.css";

/** 기준정보 Workspace — Modal 내부 · 좌 메뉴 / 우 리스트 */
export default function BaselineMasterWorkspace() {
  const navItems = getMasterDataBaselineNavItems();
  const [activeTabId, setActiveTabId] = useState(navItems[0]?.id ?? "materials");
  const activeItem = navItems.find((item) => item.id === activeTabId) ?? navItems[0];

  return (
    <div className="master-data-split-page">
      <div className="master-data-split-page__grid">
        <aside className="master-data-split-page__nav" aria-label="기준정보 메뉴">
          <div className="master-data-split-page__nav-head">
            <div>
              <h2>기준정보</h2>
              <span>재질 · 공정 · 설비 · 작업자</span>
            </div>
          </div>

          <nav className="master-data-split-page__menu" aria-label="기준정보 항목">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`master-data-split-page__menu-link${
                  item.id === activeTabId ? " master-data-split-page__menu-link--active" : ""
                }`}
                onClick={() => setActiveTabId(item.id)}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        <section className="master-data-split-page__content" aria-label={activeItem?.label ?? "기준정보"}>
          <MasterDataManagement
            key={activeTabId}
            forcedTabId={activeTabId}
            layoutMode="panel"
            inlineActions
            panelTitle={activeItem?.label}
          />
        </section>
      </div>
    </div>
  );
}

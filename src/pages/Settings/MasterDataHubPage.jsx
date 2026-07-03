import { useEffect } from "react";
import { Link } from "react-router-dom";

import { MASTER_DATA_LAUNCHER_ITEMS } from "../../config/masterDataLauncher";

import "../../foundation/styles/titan-hub-page.css";
import "./MasterDataHub.css";

/**
 * 기준정보관리 Launcher — 6개 관리 화면 진입 허브
 */
export default function MasterDataHubPage() {
  useEffect(() => {
    sessionStorage.removeItem("titan-open-company-modal");
  }, []);

  return (
    <div className="titan-hub-page">
      <p className="titan-hub-page__intro">
        거래처 · 제품 · 재질 · 공정 · 설비 · 작업자 Master는 각각 독립된 리스트 화면에서
        관리합니다. 항목을 선택하면 해당 관리 화면으로 이동합니다.
      </p>

      <div className="titan-hub-page__cards master-data-hub__cards">
        {MASTER_DATA_LAUNCHER_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.id} to={item.path} className="titan-hub-card">
              <Icon size={22} aria-hidden="true" />
              <span className="titan-hub-card__label">{item.label}</span>
              <span className="titan-hub-card__desc">{item.description}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

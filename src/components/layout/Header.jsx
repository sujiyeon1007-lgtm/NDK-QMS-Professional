import { Bell, Search, ShieldCheck } from "lucide-react";
import NdkLogo from "../common/NdkLogo";
import "./Header.css";

function Header() {
  return (
    <header className="app-header">
      <div className="header-left">
        <NdkLogo className="ndk-logo--header" />
        <div>
          <h1>NDK 품질관리 시스템</h1>
          <p>Quality Management System Professional</p>
        </div>
      </div>
      <div className="header-center">
        <div className="header-search-input">
          <Search size={18} aria-hidden="true" />
          <input
            type="search"
            aria-label="통합검색"
            placeholder="통합검색 (업체명, LOT, 품번, 품명, 도번)"
          />
        </div>
      </div>

      <div className="header-right">
        <button className="header-icon-btn">
          <Bell size={18} />
          <span>3</span>
        </button>

        <div className="user-chip">
          <ShieldCheck size={18} />
          <div>
            <strong>품질관리부</strong>
            <small>정반이 사원</small>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
import { useEffect, useState } from "react";
import { Building2, Layers } from "lucide-react";

import TitanWorkspaceModal from "../../foundation/components/TitanWorkspaceModal";
import CompanyMasterWorkspace from "./CompanyMasterWorkspace";
import BaselineMasterWorkspace from "./BaselineMasterWorkspace";

import "../../foundation/styles/titan-hub-page.css";

/**
 * 기준정보관리 Hub — 메인: 업체관리 · 기준정보 버튼만 · 기능은 Modal(Popup)
 */
export default function MasterDataHubPage() {
  const [companyModalOpen, setCompanyModalOpen] = useState(false);
  const [baselineModalOpen, setBaselineModalOpen] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("titan-open-company-modal") === "1") {
      sessionStorage.removeItem("titan-open-company-modal");
      setCompanyModalOpen(true);
    }
  }, []);

  return (
    <div className="titan-hub-page">
      <p className="titan-hub-page__intro">
        거래처 · 제품 Master · 재질 · 공정 · 설비 · 작업자 등록·수정은 Popup에서 수행합니다.
        <br />
        메인 화면은 업무 진입만 제공합니다.
      </p>

      <div className="titan-hub-page__cards">
        <button
          type="button"
          className="titan-hub-card"
          onClick={() => setCompanyModalOpen(true)}
        >
          <Building2 size={22} aria-hidden="true" />
          <span className="titan-hub-card__label">업체관리</span>
          <span className="titan-hub-card__desc">
            거래처 리스트 → 제품 Master 조회 · 등록 · 수정 · 삭제
          </span>
        </button>

        <button
          type="button"
          className="titan-hub-card"
          onClick={() => setBaselineModalOpen(true)}
        >
          <Layers size={22} aria-hidden="true" />
          <span className="titan-hub-card__label">기준정보</span>
          <span className="titan-hub-card__desc">
            재질 · 공정 · 설비 · 작업자 Master 등록 · 수정 · 삭제
          </span>
        </button>
      </div>

      <TitanWorkspaceModal
        open={companyModalOpen}
        onClose={() => setCompanyModalOpen(false)}
        title="업체관리"
        kicker="기준정보관리"
      >
        <CompanyMasterWorkspace />
      </TitanWorkspaceModal>

      <TitanWorkspaceModal
        open={baselineModalOpen}
        onClose={() => setBaselineModalOpen(false)}
        title="기준정보"
        kicker="기준정보관리"
      >
        <BaselineMasterWorkspace />
      </TitanWorkspaceModal>
    </div>
  );
}

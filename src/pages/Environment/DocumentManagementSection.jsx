import { Link } from "react-router-dom";
import { FileText } from "lucide-react";

import TitanComingSoonPlaceholder from "../../foundation/pages/TitanComingSoonPlaceholder";

/**
 * 환경설정 문서관리 섹션 — V1.1: 공지사항은 HOME 전용
 * 제품 문서 관리는 Sidebar 「문서관리」(`/documents`)에서 수행
 */
export default function DocumentManagementSection() {
  return (
    <div className="document-mgmt-section">
      <header className="document-mgmt-section__head">
        <div className="document-mgmt-section__title-wrap">
          <FileText size={20} aria-hidden="true" />
          <div>
            <h2 className="document-mgmt-section__title">문서관리</h2>
            <p className="document-mgmt-section__desc">
              공지사항은 HOME에서 등록·조회합니다. 제품 연결 문서(도면·검사기준·성적서 등)는 문서관리 메뉴에서
              관리합니다.
            </p>
          </div>
        </div>
      </header>

      <TitanComingSoonPlaceholder
        title="문서관리"
        subtitle={
          <>
            제품별 문서 현황은 <Link to="/documents">문서관리</Link> 메뉴를 이용해 주세요. 품질 공지(공지사항) 기능은
            HOME으로 이동되었습니다.
          </>
        }
      />
    </div>
  );
}

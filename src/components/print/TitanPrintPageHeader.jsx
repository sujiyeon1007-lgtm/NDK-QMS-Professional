import NdkLogo from "../common/NdkLogo";
import TitanApprovalBox from "./TitanApprovalBox";
import { getCompanyProfile } from "../../utils/companyWorkspaceService";

/** Project TITAN 공통 출력 Header — 좌: 로고, 중: 제목, 우: 결재란 */
function TitanPrintPageHeader({ title }) {
  const branding = getCompanyProfile().branding ?? {};
  const companyLogo = branding.logo || "";

  return (
    <header className="titan-print-header">
      <div className="titan-print-header-logo">
        {companyLogo ? (
          <img
            className="ndk-logo--print"
            src={companyLogo}
            alt="Company Logo"
            style={{ height: "68px", width: "auto", maxWidth: "42mm", objectFit: "contain" }}
          />
        ) : (
          <NdkLogo
            className="ndk-logo--print"
            style={{ height: "68px", width: "auto", maxWidth: "42mm" }}
          />
        )}
      </div>
      <h1 className="titan-print-title">{title}</h1>
      <div className="titan-print-header-approval">
        <TitanApprovalBox />
      </div>
    </header>
  );
}

export default TitanPrintPageHeader;

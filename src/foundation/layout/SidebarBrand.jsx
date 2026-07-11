import NdkLogo from "../../components/common/NdkLogo";
import { getCompanyBrandingLogoUrl } from "../../utils/companyWorkspaceService";
import { getTitanEditionDisplayLabel } from "../../utils/titanEditionSession";

export default function SidebarBrand() {
  const companyLogoUrl = getCompanyBrandingLogoUrl();

  return (
    <div className="titan-sidebar-brand" aria-label="System brand">
      {companyLogoUrl ? (
        <img className="titan-sidebar-brand__logo" src={companyLogoUrl} alt="NDK Logo" />
      ) : (
        <NdkLogo className="titan-sidebar-brand__logo titan-sidebar-brand__logo--fallback" />
      )}
      <div className="titan-sidebar-brand__text">
        <strong>NDK PQMS</strong>
        <span className="titan-sidebar-brand__edition">{getTitanEditionDisplayLabel()}</span>
      </div>
    </div>
  );
}
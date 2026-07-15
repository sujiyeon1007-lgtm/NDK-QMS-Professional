const fs = require("fs");
const path = require("path");

const brandingPath = path.join(__dirname, "..", "src", "components", "print", "CompanyDocumentBranding.jsx");
const branding = `import {
  getCompanyBrandingSignatureUrl,
  getCompanyBrandingStampUrl,
} from "../../utils/companyWorkspaceService";

export function CompanyBrandingSealImage({
  className = "titan-print-branding-seal",
  alt = "Company seal",
}) {
  const url = getCompanyBrandingStampUrl();
  if (!url) return null;
  return <img className={className} src={url} alt={alt} />;
}

export function CompanyBrandingSignatureImage({
  className = "titan-print-branding-signature",
  alt = "CEO signature",
}) {
  const url = getCompanyBrandingSignatureUrl();
  if (!url) return null;
  return <img className={className} src={url} alt={alt} />;
}

export function CompanyDocumentBrandingBlock({
  showSeal = true,
  showSignature = true,
  className = "titan-print-branding-block",
}) {
  const stamp = showSeal ? getCompanyBrandingStampUrl() : "";
  const signature = showSignature ? getCompanyBrandingSignatureUrl() : "";
  if (!stamp && !signature) return null;

  return (
    <div className={className} aria-label="Company Branding">
      {stamp ? <CompanyBrandingSealImage /> : null}
      {signature ? <CompanyBrandingSignatureImage /> : null}
    </div>
  );
}

export default CompanyDocumentBrandingBlock;
`;

fs.writeFileSync(brandingPath, branding, "utf8");

const policyPath = path.join(__dirname, "..", "src", "config", "rc1OperationalPolicy.js");
let policy = fs.readFileSync(policyPath, "utf8");
policy = policy.replace('"\\uc0dd\\ucsan"', '"\\uc0dd\\uc0b0\\uc0b0"');
policy = policy.replace('"\\uc0dd\\ucsan"', '"생산"');
if (policy.includes("ucsan")) {
  policy = policy.replace(/\\uc0dd\\ucsan/g, "\\uc0dd\\uc0b0\\uc0b0");
}
fs.writeFileSync(policyPath, policy, "utf8");
console.log("fixed branding + policy");

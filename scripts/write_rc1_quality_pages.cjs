const fs = require("fs");

const INSPECTION_STATUS = [
  'import MassProductionInspection from "./MassProductionInspection";',
  "",
  "export default function InspectionStatusPage() {",
  "  return (",
  "    <MassProductionInspection",
  '      viewMode="status"',
  '      pageHeading="\uac80\uc0ac \uc644\ub8cc \uc774\ub825"',
  "    />",
  "  );",
  "}",
  "",
].join("\n");

const INSPECTION_REGISTER = [
  'import { Navigate, useSearchParams } from "react-router-dom";',
  'import MassProductionInspection from "./MassProductionInspection";',
  'import InspectionLogRegisterView from "./InspectionLogRegisterView";',
  "",
  "export default function InspectionRegisterPage() {",
  "  const [searchParams] = useSearchParams();",
  "  const hasEntryQuery =",
  '    searchParams.has("managementId") ||',
  '    searchParams.has("category") ||',
  '    searchParams.has("devId") ||',
  '    searchParams.has("otherId");',
  "",
  "  if (hasEntryQuery) {",
  "    const query = searchParams.toString();",
  "    return (",
  "      <Navigate",
  '        to={"/quality/inspection/register/entry" + (query ? "?" + query : "")}',
  "        replace",
  "      />",
  "    );",
  "  }",
  "",
  "  return (",
  "    <MassProductionInspection",
  '      viewMode="task"',
  '      pageHeading="\uac80\uc0ac \ub4f1\ub85d \ub300\uc0c1"',
  "    />",
  "  );",
  "}",
  "",
  "export function InspectionRegisterEntryPage() {",
  "  return <InspectionLogRegisterView />;",
  "}",
  "",
].join("\n");

function write(path, content) {
  fs.writeFileSync(path, content, { encoding: "utf8" });
  const buf = fs.readFileSync(path);
  console.log(path, buf.length, buf.slice(0, 3));
}

write("src/pages/Quality/InspectionStatusPage.jsx", INSPECTION_STATUS);
write("src/pages/Quality/InspectionRegisterPage.jsx", INSPECTION_REGISTER);

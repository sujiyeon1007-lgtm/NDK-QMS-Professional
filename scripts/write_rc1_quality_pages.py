import pathlib

INSPECTION_STATUS = """import MassProductionInspection from "./MassProductionInspection";

export default function InspectionStatusPage() {
  return (
    <div className="inbound-page quality-page">
      <div className="inbound-page__history-heading" role="heading" aria-level="2">
        \uac80\uc0ac \uc644\ub8cc \uc774\ub825
      </div>
      <MassProductionInspection viewMode="status" />
    </div>
  );
}
"""

INSPECTION_REGISTER = """import { Navigate, useSearchParams } from "react-router-dom";
import MassProductionInspection from "./MassProductionInspection";
import InspectionLogRegisterView from "./InspectionLogRegisterView";

export default function InspectionRegisterPage() {
  const [searchParams] = useSearchParams();
  const hasEntryQuery =
    searchParams.has("managementId") ||
    searchParams.has("category") ||
    searchParams.has("devId") ||
    searchParams.has("otherId");

  if (hasEntryQuery) {
    const query = searchParams.toString();
    return (
      <Navigate
        to={"/quality/inspection/register/entry" + (query ? "?" + query : "")}
        replace
      />
    );
  }

  return (
    <div className="inbound-page quality-page">
      <div className="inbound-page__history-heading" role="heading" aria-level="2">
        \uac80\uc0ac \ub4f1\ub85d \ub300\uc0c1
      </div>
      <MassProductionInspection viewMode="task" />
    </div>
  );
}

export function InspectionRegisterEntryPage() {
  return <InspectionLogRegisterView />;
}
"""


def write(path, raw):
    text = raw.encode("utf-8").decode("unicode_escape")
    pathlib.Path(path).write_text(text, encoding="utf-8", newline="\n")
    data = pathlib.Path(path).read_bytes()
    print(path, len(data), list(data[:3]))


write("src/pages/Quality/InspectionStatusPage.jsx", INSPECTION_STATUS)
write("src/pages/Quality/InspectionRegisterPage.jsx", INSPECTION_REGISTER)

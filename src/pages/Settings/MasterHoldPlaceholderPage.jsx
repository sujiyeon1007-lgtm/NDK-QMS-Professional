import { useParams } from "react-router-dom";

import TitanComingSoonPlaceholder from "../../foundation/pages/TitanComingSoonPlaceholder";
import { getMasterHoldDefinition } from "../../config/masterDataLauncher";

/**
 * V1.1 Master First Freeze — Hold placeholder (code retained, UI gated).
 */
export default function MasterHoldPlaceholderPage() {
  const { holdId } = useParams();
  const definition = getMasterHoldDefinition(holdId);

  return (
    <TitanComingSoonPlaceholder
      title={definition?.label ?? "기준정보 Hold"}
      subtitle={
        definition?.holdReason ??
        "Master First Sprint 이후 활성화 예정입니다. 관련 코드는 유지됩니다."
      }
    />
  );
}

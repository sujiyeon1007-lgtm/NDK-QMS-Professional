import { useMemo } from "react";

import { getChargeWorkConditionFields } from "../../../config/recipeTemplateEngine";
import { getActualWorkRecords } from "../../../utils/actualWorkRecordStore";
import { normalizeProductionLotKey } from "../../../utils/productionDailyReportPrintData";
import "./RunningWorkConditionsPanel.css";

function resolveWorkConditionsForSession(session, equipmentName = "") {
  const fromSession = session?.workConditions;
  if (fromSession && typeof fromSession === "object" && Object.keys(fromSession).length > 0) {
    return fromSession;
  }

  const lotKey = normalizeProductionLotKey(session?.lotNo);
  if (!lotKey) return {};

  const eqName = String(equipmentName ?? session?.equipmentName ?? "").trim();
  const match = getActualWorkRecords()
    .filter((row) => normalizeProductionLotKey(row.lotNo) === lotKey)
    .filter((row) => !eqName || String(row.equipmentName ?? "").trim() === eqName)
    .sort((a, b) =>
      String(b.updatedAt ?? b.createdAt ?? "").localeCompare(String(a.updatedAt ?? a.createdAt ?? ""))
    )[0];

  return match?.actualParameters ?? {};
}

function formatConditionValue(value) {
  const text = String(value ?? "").trim();
  return text || "-";
}

export default function RunningWorkConditionsPanel({ session, processName = "", compact = false }) {
  const conditionFields = useMemo(
    () => getChargeWorkConditionFields(processName),
    [processName]
  );

  const conditions = useMemo(
    () => resolveWorkConditionsForSession(session, session?.equipmentName),
    [session]
  );

  if (!session) return null;

  return (
    <section
      className={`running-work-conditions${compact ? " running-work-conditions--compact" : ""}`}
      aria-label="work conditions"
    >
      <h4 className="running-work-conditions__title">{"\uC6B4\uC804\uC870\uAC74"}</h4>
      <dl className="running-work-conditions__grid">
        {conditionFields.map((field) => (
          <div key={field.key} className="running-work-conditions__field">
            <dt>
              {field.label}
              {field.unit ? ` (${field.unit})` : ""}
            </dt>
            <dd>{formatConditionValue(conditions[field.key])}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
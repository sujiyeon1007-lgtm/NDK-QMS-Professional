import {
  formatHardnessConversionDisplay,
  getProductSpecHardnessUnit,
  HARDNESS_CONVERSION_NOTE,
  normalizeHardnessUnit,
} from "../../utils/hardnessUnitConversion";

export default function HardnessConversionHint({
  value,
  fromUnit,
  spec,
  targetUnits,
  maxTargets = 2,
  className = "ir-hardness-convert",
}) {
  const from = normalizeHardnessUnit(fromUnit) || "HV";
  const specUnit = getProductSpecHardnessUnit(spec);
  const display = formatHardnessConversionDisplay(value, from, targetUnits, {
    specUnit,
    maxTargets,
  });
  if (!display) return null;
  return (
    <span className={className} title={HARDNESS_CONVERSION_NOTE}>
      {display}
    </span>
  );
}

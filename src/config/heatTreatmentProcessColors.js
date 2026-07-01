/**
 * Project TITAN V1.0 Lock — Heat Treatment Process Color Policy
 *
 * 열처리 공정 전용 · Pastel Palette
 * workflow-process-colors.css · titan-process--{key}
 */

/** @type {Record<string, string>} */
export const HEAT_TREATMENT_PROCESS_TONE_BY_NAME = {
  가스질화: "gas-nitriding",
  이온질화: "ion-nitriding",
  침탄: "carburizing",
  고주파: "induction-hardening",
  염욕질화: "salt-bath-nitriding",
  진공열처리: "vacuum-heat-treat",
  풀림: "annealing",
  노말라이징: "normalizing",
  QT: "quench-temper",
  연질화: "soft-nitriding",
};

/**
 * @param {string} [processName]
 * @returns {string}
 */
export function getHeatTreatmentProcessTone(processName = "") {
  const name = String(processName).trim();
  if (!name || name === "—") return "default";
  return HEAT_TREATMENT_PROCESS_TONE_BY_NAME[name] ?? "default";
}

/** @deprecated getHeatTreatmentProcessTone 사용 */
export function getProcessChipVariant(processName) {
  return getHeatTreatmentProcessTone(processName);
}

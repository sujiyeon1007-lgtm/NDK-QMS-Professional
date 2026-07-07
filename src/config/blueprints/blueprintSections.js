/**
 * Project TITAN Blueprint 공통 구조
 * V2.0 Final — 11-section (Task Scope + Exit Condition)
 * @see src/config/titanBlueprintV17.js
 */

/** @typedef {"pending-pm-approval" | "pm-approved" | "implemented" | "frozen"} BlueprintStatus */

/**
 * @param {object} input
 * @returns {import("./titanBlueprintsV17.js").TitanBlueprint}
 */
export function defineBlueprint(input) {
  return {
    version: "V2.0",
    status: "pending-pm-approval",
    taskScope: null,
    exitCondition: null,
    ...input,
  };
}

const fs = require("fs");
const path = require("path");
const root = path.resolve(__dirname, "..");

const rc1 = `/**
 * Project TITAN RC1 Official Operational Policy (PM Official)
 * Lock: 2026-07-10
 * Rule: .cursor/rules/project-titan-rc1-operational-policy.mdc
 */

export const RC1_OPERATIONAL_POLICY_VERSION = "RC1-OPERATIONAL-1.1";
export const RC1_OPERATIONAL_POLICY_DATE = "2026-07-10";

export const RC1_GOAL = "\uC2E4\uC81C \uD68C\uC0AC\uC5D0\uC11C \uC0AC\uC6A9\uD558\uB294 \uAC83 \u2014 \uC0C8\uB85C\uC6B4 \uAE30\uB2A5 \uAC1C\uBC1C\uC774 \uC544\uB984";

export const RC1_OPERATIONAL_SCOPE = Object.freeze([
  "\uAE30\uC900\uC815\uBCF4\uAD00\uB9AC",
  "\uC785\uACE0\uB4F1\uB85D",
  "\uC0DD\uC0B0\uAD00\uB9AC",
  "\uCD9C\uACE0\uB4F1\uB85D",
  "\uAC70\uB798\uBA85\uC138\uC11C \uBC1C\uD589",
  "\uC7AC\uACE0\uAD00\uB9AC",
  "QR Engine",
]);

export const RC1_OPERATIONAL_EXCLUDED = Object.freeze([
  "\uC131\uC801\uC11C (\uAE30\uC874 Excel \uC720\uC9C0)",
  "\uBB38\uC11C\uAD00\uB9AC",
  "\uD1B5\uACC4",
  "\uD68C\uACC4",
  "\uACBD\uB9AC (\uAC70\uB798\uCC98 Master \uC81C\uACF5\uB9CC \u2014 TITAN \uB4F1\uB85D\uC740 Excel Import)",
]);

export const RC1_COMPANY_MASTER_POLICY = Object.freeze({
  source: "\uACBD\uB9AC\uD300 \uC81C\uACF5 Excel",
  importPath: "\uAE30\uC900\uC815\uBCF4\uAD00\uB9AC \u00B7 \uAC70\uB798\uCC98 \u00B7 Excel Import",
  titanCrud: "\uBCF4\uC870 (Import \uC6B0\uC120)",
});

export const RC1_DEVELOPMENT_PRIORITY = Object.freeze([
  "\uC2E4\uC81C \uC6B4\uC601",
  "\uBC84\uADF8 \uC218\uC815",
  "\uC6B4\uC601 \uD53C\uB4DC\uBC31 \uC218\uC9D1",
  "\uC6B4\uC601\uC77C\uC9C0 \uB204\uC801",
  "Architecture \uACB0\uC815",
  "DB \uAD6C\uD604",
  "\uC2E0\uADDC \uAE30\uB2A5",
]);

export const RC1_OUTBOUND_WORKFLOW = Object.freeze([
  "\uC0DD\uC0B0\uC644\uB8CC",
  "\uCD9C\uACE0\uB4F1\uB85D",
  "\uAC70\uB798\uBA85\uC138\uC11C (\uC120\uD0DD)",
  "\uCD9C\uACE0\uC644\uB8CC",
]);

export const RC1_STORAGE_POLICY = Object.freeze({
  active: "sessionStorage",
  delivery: "host-web",
  deferred: Object.freeze(["sqlite", "postgresql", "apiRepository", "mobile"]),
  architectureReview: "V1.1 Architecture Review",
  note: "\uC6B4\uC601 \uB370\uC774\uD130 \uD655\uBCF4 \uC804 \uC800\uC7A5\uC18C(DB) \uAD6C\uD604 \uCC29\uC218 \uAE08\uC9C0",
});

export const RC1_FROZEN_ARCHITECTURE = Object.freeze([
  "UI",
  "Workflow",
  "QR Engine",
  "Print Engine",
  "Document Engine",
]);

export const RC1_SWAPPABLE_LAYER = Object.freeze(["Repository", "Data Source"]);

export const RC1_OPERATIONAL_DATA_COLLECTION = Object.freeze([
  "\uC0DD\uC0B0\uC0AC\uBB34\uC2E4 \uC0AC\uC6A9 \uD328\uD134",
  "\uD488\uC9C8\uC0AC\uBB34\uC2E4 \uC0AC\uC6A9 \uD328\uD134",
  "\uC0AC\uC7A5\uB2D8 \uC694\uAD6C\uC0AC\uD56D",
  "\uC0DD\uC0B0\uD300 \uC694\uAD6C\uC0AC\uD56D",
  "QR \uC0AC\uC6A9 \uBE48\uB3C4",
  "LTE \uC0AC\uC6A9 \uC5EC\uBD80",
  "\uB3D9\uC2DC \uC811\uC18D \uC778\uC6D0",
  "\uBC31\uC5C5 \uC8FC\uAE30",
  "\uC6B4\uC601 \uC911 \uBC1C\uC0DD\uD55C \uC624\uB958",
]);

export const RC1_OPERATION_LOG_FIELDS = Object.freeze([
  "\uB0A0\uC9DC",
  "\uC0AC\uC6A9\uC790",
  "\uAE30\uB2A5",
  "\uACB0\uACFC",
  "\uBB38\uC81C\uC810",
  "\uAC1C\uC120 \uC544\uC774\uB514\uC5B4",
  "\uCC98\uB9AC \uC5EC\uBD80",
]);

export const V11_ARCHITECTURE_REVIEW_DECISIONS = Object.freeze([
  "PostgreSQL",
  "API",
  "Auth",
  "Mobile",
  "Repository",
]);

export {
  V11_ARCHITECTURE_DIRECTION_VERSION,
  V11_ARCHITECTURE_DIRECTION_DATE,
  RC1_CONFIRMED_OPERATING_ENVIRONMENT,
  V11_LONG_TERM_PLATFORM_DIRECTION,
  V11_PRIMARY_GOAL,
  V11_ARCHITECTURE_CONSIDERATIONS,
  V11_ARCHITECTURE_REVIEW_GATE,
  getV11ArchitectureDirectionSummary,
} from "./titanV11ArchitectureDirection.js";

export const RC1_ALLOWED_WORK = Object.freeze([
  "RC1 \uBC84\uADF8 \uC218\uC815",
  "\uC6B4\uC601 \uC548\uC815\uD654",
  "\uC6B4\uC601 UX \uAC1C\uC120",
  "QR \uAC80\uC99D",
  "Build",
  "Browser QA",
  "Host \uBC30\uD3EC",
  "\uC6B4\uC601 \uBB38\uC11C \uC791\uC131",
  "Architecture \uAC80\uD1A0 \uBC0F \uBB38\uC11C\uD654",
]);

export const RC1_DEFERRED_WORK = Object.freeze([
  "SQLite \uAD6C\uD604",
  "PostgreSQL \uAD6C\uD604",
  "API Repository \uAD6C\uD604",
  "Mobile \uAD6C\uD604",
  "Repository \uAD50\uCCB4",
  "\uB300\uADDC\uBAA8 \uB9AC\uD329\uD1A0\uB9C1",
  "\uC2E0\uADDC \uAE30\uB2A5 \uCD94\uAC00",
  "UI \uBCC0\uACBD",
  "Workflow \uBCC0\uACBD",
  "\uC800\uC7A5\uC18C \uBCC0\uACBD",
]);

export const RC1_EXIT_CRITERIA = Object.freeze([
  "Build PASS",
  "Browser QA PASS",
  "Host \uBC30\uD3EC \uAC00\uB2A5",
  "\uC2E4\uC81C \uC5C5\uBB34 \uC6B4\uC601 \uAC00\uB2A5",
  "QR \uC0DD\uC131 \uBC0F \uCD9C\uB825 \uAC80\uC99D \uC644\uB8CC",
  "QR \uD604\uC7A5 \uD14C\uC2A4\uD2B8 \uC644\uB8CC",
  "\uC6B4\uC601\uC77C\uC9C0 \uC791\uC131 \uC2DC\uC791",
]);

export const RC1_POST_PHASES = Object.freeze({
  v101: "\uC6B4\uC601 \uD53C\uB4DC\uBC31 \uBC18\uC601",
  v11: "Architecture \uBC0F DB \uBC29\uD5A5 \uCD5C\uC885 \uD655\uC815",
});

export function getRc1OperationalPolicySummary() {
  return {
    version: RC1_OPERATIONAL_POLICY_VERSION,
    date: RC1_OPERATIONAL_POLICY_DATE,
    goal: RC1_GOAL,
    scope: RC1_OPERATIONAL_SCOPE,
    excluded: RC1_OPERATIONAL_EXCLUDED,
    priority: RC1_DEVELOPMENT_PRIORITY,
    storage: RC1_STORAGE_POLICY,
    frozen: RC1_FROZEN_ARCHITECTURE,
    swappable: RC1_SWAPPABLE_LAYER,
    allowed: RC1_ALLOWED_WORK,
    deferred: RC1_DEFERRED_WORK,
    exitCriteria: RC1_EXIT_CRITERIA,
  };
}
`;

fs.writeFileSync(path.join(root, "src/config/rc1OperationalPolicy.js"), rc1, "utf8");
console.log("rc1OperationalPolicy.js written");

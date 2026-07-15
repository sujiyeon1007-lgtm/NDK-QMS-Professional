const fs = require("fs");
function fixUtf8(rel) {
  if (!fs.existsSync(rel)) return;
  const b = fs.readFileSync(rel);
  if (b.length > 2 && b[1] === 0) {
    fs.writeFileSync(rel, b.toString("utf16le"), "utf8");
    console.log("converted", rel);
  }
}
[
  "src/utils/productProcessWorkflow.js",
  "src/utils/certificateIssuePolicy.js",
  "src/utils/processWorkflowTemplateSession.js",
  "src/config/processWorkflowTemplates.js",
].forEach(fixUtf8);
const cert = "src/utils/certificateIssuePolicy.js";
let ct = fs.readFileSync(cert, "utf8");
if (ct.includes("createDefaultCertificatePolicy") && !ct.includes('issuePolicy: "always_issue"')) {
  ct = ct.replace(/issuePolicy:\s*DEFAULT_CERTIFICATE_ISSUE_POLICY/g, 'issuePolicy: "always_issue"');
  ct = ct.replace(/issuePolicy:\s*CERTIFICATE_ISSUE_POLICY_VALUES\.ALWAYS_ISSUE/g, 'issuePolicy: "always_issue"');
  ct = ct.replace(/issuePolicy:\s*CERTIFICATE_ISSUE_POLICY\.ALWAYS_ISSUE/g, 'issuePolicy: "always_issue"');
  fs.writeFileSync(cert, ct, "utf8");
  console.log("patched cert");
}
const wt = fs.readFileSync("src/utils/productProcessWorkflow.js", "utf8");
console.log("workflow", wt.length, wt.includes("applyTemplateToProduct"));
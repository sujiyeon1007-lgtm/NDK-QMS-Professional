/**
 * Rewrites Company Workspace UI files from UTF-16LE to UTF-8 (no BOM).
 * Usage: node scripts/write-company-ui-v2.cjs
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");

const TARGETS = [
  "src/pages/Company/CompanyLayout.jsx",
  "src/pages/Company/CompanyDashboardPage.jsx",
  "src/pages/Company/CompanySectionPage.jsx",
  "src/pages/Company/CompanySectionPreview.jsx",
  "src/pages/Company/components/CompanyWorkspaceNav.jsx",
  "src/pages/Company/components/CompanySummaryCard.jsx",
  "src/pages/Company/components/CompanyRecentActivityCard.jsx",
  "src/config/companyWorkspaceArchitecture.js",
  "src/pages/Company/Company.css",
];

function isUtf16LeBuffer(buf) {
  if (buf.length < 4) return false;
  if (buf[0] === 0xff && buf[1] === 0xfe) return true;
  return buf[1] === 0 && buf[3] === 0 && buf[0] < 0x80;
}

function decodeBuffer(buf) {
  if (!isUtf16LeBuffer(buf)) return buf.toString("utf8");
  const body = buf[0] === 0xff && buf[1] === 0xfe ? buf.slice(2) : buf;
  return body.toString("utf16le");
}

function writeUtf8(rel, text) {
  const filePath = path.join(root, rel);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, text.replace(/\r?\n/g, "\n"), { encoding: "utf8" });
}

for (const rel of TARGETS) {
  const filePath = path.join(root, rel);
  const buf = fs.readFileSync(filePath);
  const wasUtf16 = isUtf16LeBuffer(buf);
  writeUtf8(rel, decodeBuffer(buf));
  console.log(`wrote ${rel} (utf16=${wasUtf16})`);
}

const fs = require("fs");
const files = [
  "src/config/companyWorkspaceArchitecture.js",
  "src/pages/Company/Company.css",
  "src/pages/Company/CompanyLayout.jsx",
  "src/pages/Company/CompanyDashboardPage.jsx",
  "src/pages/Company/CompanySectionPage.jsx",
  "src/pages/Company/CompanySectionPreview.jsx",
];
for (const f of files) {
  const t = fs.readFileSync(f, "utf16le");
  const bad = t.includes("\uFFFD");
  console.log(f, "len", t.length, "nul", Buffer.from(t).includes(0), "rep", bad);
  if (f.includes("Dashboard")) {
    const labels = [...t.matchAll(/label: "([^"]+)"/g)].map((m) => m[1]);
    console.log("labels", labels.slice(0, 6));
  }
}

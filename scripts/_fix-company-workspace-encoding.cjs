const fs = require('fs');
const path = 'c:/Users/user1/Desktop/NDK-QMS-Professional/src/utils/companyWorkspaceService.js';
let t = fs.readFileSync(path, 'utf8');

const header = '/**\n * Company Workspace Service \u2014 Dashboard \u00b7 Migration \u00b7 CRUD (Sprint 11)\n */';
const nl = t.indexOf('\n', t.indexOf('/**'));
const endHeader = t.indexOf('*/', 0) + 2;
if (t.startsWith('/**')) t = header + t.slice(endHeader);

const summaryFn = 
export function buildCompanySummary() {
  const profile = getCompanyProfile();
  const master = profile.companyMaster ?? {};
  return {
    companyName: master.companyName || "-",
    representative: master.representative || "-",
    businessNumber: master.businessNumber || "-",
    phone: master.phone || "-",
    address: master.address || "-",
    businessType: master.businessType || "-",
    businessItem: master.businessItem || "-",
    logoUrl: profile.branding?.logo || "",
  };
}
;

if (!t.includes('export function buildCompanySummary')) {
  const dashIdx = t.indexOf('export function buildCompanyDashboard');
  const anchor = '}\n\nexport function updateCompanyMaster';
  const afterDash = t.indexOf(anchor, dashIdx);
  if (afterDash < 0) throw new Error('anchor not found');
  t = t.slice(0, afterDash + 1) + summaryFn + t.slice(afterDash + 1);
}

const siteLabelFn = export function resolveBusinessSiteTypeLabel(typeId) {
  const map = {
    headquarters: "\uBCF8\uC0AC",
    factory: "\uACF5\uC7A5",
    warehouse: "\uCC3D\uACE0",
    office: "\uC0AC\uBB34\uC18C",
    other: "\uAE30\uD0C0",
  };
  return map[typeId] ?? typeId ?? "-";
};

const empLabelFn = export function resolveEmployeeStatusLabel(statusId) {
  const map = { active: "\uC7AC\uC9C1", leave: "\uD734\uC9C1", retired: "\uD1F4\uC0AC" };
  return map[statusId] ?? statusId ?? "-";
};

t = t.replace(
  /export function resolveBusinessSiteTypeLabel\(typeId\) \{[\s\S]*?\n\}/,
  siteLabelFn
);
t = t.replace(
  /export function resolveEmployeeStatusLabel\(statusId\) \{[\s\S]*?\n\}/,
  empLabelFn
);

fs.writeFileSync(path, t, { encoding: 'utf8' });
const b = fs.readFileSync(path);
console.log('BOM', b[0] === 0xef && b[1] === 0xbb && b[2] === 0xbf);
console.log('starts', b.slice(0,3).toString('hex'));
console.log('has summary', t.includes('export function buildCompanySummary'));
console.log('hangul', (t.match(/[\uac00-\ud7a3]/g) || []).length);

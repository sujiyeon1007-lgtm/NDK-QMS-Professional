/**
 * RC1 — regenerate src/data/rc1DemoProductMasterSeed.js as UTF-8 (Windows-safe)
 * Run: node scripts/_write-rc1-demo-product-seed.cjs
 */
const fs = require("fs");
const path = require("path");

const OUT = path.join(__dirname, "..", "src", "data", "rc1DemoProductMasterSeed.js");

/** Must match MASTER_DATA company names exactly */
const COMPANY_PREFIX = {
  "서암기계공업": "SE",
  "현대위아": "HW",
  "두산에너빌리티": "DS",
  "SNT다이내믹스": "SN",
  "한화에어로스페이스": "HA",
  "GE": "GE",
  "(주)모전기공": "MJ",
  "(유)창성정밀": "CS",
  "삼화기계공업": "SH",
  "진영산업": "JY",
};

const PRODUCT_TEMPLATES = [
  { suffix: "SHAFT", name: "DRIVE SHAFT", material: "SCM440", process: "QT", spec: "Ø45×320" },
  { suffix: "GEAR", name: "PINION GEAR", material: "SNCM439", process: "渗碳淬火", spec: "M2.5×32T" },
  { suffix: "PIN", name: "GUIDE PIN", material: "SUJ2", process: "淬火回火", spec: "Ø18×95" },
  { suffix: "BUSH", name: "BUSH", material: "S45C", process: "QT", spec: "Ø44×30×50" },
  { suffix: "FLG", name: "FLANGE", material: "42CrMo4", process: "QT", spec: "Ø80×25T" },
];

const UNIT_PRICE_BY_MATERIAL = {
  SCM440: 72000,
  SNCM439: 98000,
  SUJ2: 62000,
  S45C: 38000,
  "42CrMo4": 88000,
  SACM645: 115000,
  SCM440H: 54000,
  SKD61: 125000,
};

const definitions = [];
Object.entries(COMPANY_PREFIX).forEach(([company, prefix]) => {
  PRODUCT_TEMPLATES.forEach((template, templateIndex) => {
    const seq = String(templateIndex + 1).padStart(3, "0");
    definitions.push({
      company,
      prefix,
      partNo: `${prefix}-${template.suffix}-${seq}`,
      name: template.name,
      material: template.material,
      process: template.process,
      spec: template.spec,
      note: "",
    });
  });
});

function esc(value) {
  return String(value ?? "").replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

const defLines = definitions
  .map(
    (row) =>
      `  { company: "${esc(row.company)}", prefix: "${esc(row.prefix)}", partNo: "${esc(row.partNo)}", name: "${esc(row.name)}", material: "${esc(row.material)}", process: "${esc(row.process)}", spec: "${esc(row.spec)}", note: "" },`
  )
  .join("\n");

const materialKeys = Object.keys(UNIT_PRICE_BY_MATERIAL)
  .map((key) => `  "${esc(key)}": ${UNIT_PRICE_BY_MATERIAL[key]},`)
  .join("\n");

const content = `/**
 * RC1 Demo Product Master Seed (Session init when product store empty)
 * Heat-treatment industry parts linked to real Company Master names.
 */
const RC1_DEMO_PRODUCT_DEFINITIONS = [
${defLines}
];

const UNIT_PRICE_BY_MATERIAL = {
${materialKeys}
};

function buildRc1DemoProductRow(definition, index) {
  const seq = String(index + 1).padStart(4, "0");
  const dateCode = "20260710";
  return {
    id: \`rc1-demo-p-\${index + 1}\`,
    code: \`\${definition.prefix}_\${dateCode}_\${seq}\`,
    name: definition.name,
    partNo: definition.partNo,
    company: definition.company,
    drawingNo: \`\${definition.prefix}-\${definition.partNo.split("-").pop()}-DWG\`,
    material: definition.material,
    spec: definition.spec,
    unitPrice: UNIT_PRICE_BY_MATERIAL[definition.material] ?? 65000,
    unit: "EA",
    process: definition.process,
    description: "",
    note: definition.note ?? "",
    active: true,
  };
}

export const RC1_DEMO_PRODUCT_MASTER_SEED = RC1_DEMO_PRODUCT_DEFINITIONS.map((row, index) =>
  buildRc1DemoProductRow(row, index)
);

/**
 * Optional filter — keep products whose company exists in imported customer list.
 * When companyNames is empty, returns full seed (CEO demo before Excel import).
 * @param {string[]} [companyNames]
 */
export function resolveRc1DemoProductMasterSeed(companyNames = []) {
  const names = (companyNames ?? []).map((name) => String(name ?? "").trim()).filter(Boolean);
  if (names.length === 0) {
    return RC1_DEMO_PRODUCT_MASTER_SEED.map((row) => ({ ...row }));
  }
  const nameSet = new Set(names);
  const matched = RC1_DEMO_PRODUCT_MASTER_SEED.filter((row) => nameSet.has(row.company));
  if (matched.length > 0) {
    return matched.map((row) => ({ ...row }));
  }
  return RC1_DEMO_PRODUCT_MASTER_SEED.map((row) => ({ ...row }));
}

export const RC1_DEMO_PRODUCT_MASTER_SEED_VERSION = "RC1-PRODUCT-SEED-1.0";
`;

fs.writeFileSync(OUT, content, { encoding: "utf8" });
console.log("Wrote", OUT);
console.log("Companies:", Object.keys(COMPANY_PREFIX).length, "Products:", definitions.length);
Object.keys(COMPANY_PREFIX).forEach((name) => {
  const count = definitions.filter((row) => row.company === name).length;
  console.log(`  ${name}: ${count}`);
});

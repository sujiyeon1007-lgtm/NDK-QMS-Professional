/**
 * RC1 Demo Product Master Seed (Session init when product store empty)
 * Heat-treatment industry parts linked to real Company Master names.
 */
const RC1_DEMO_PRODUCT_DEFINITIONS = [
  { company: "서암기계공업", prefix: "SE", partNo: "SE-SHAFT-001", name: "DRIVE SHAFT", material: "SCM440", process: "QT", spec: "Ø45×320", note: "" },
  { company: "서암기계공업", prefix: "SE", partNo: "SE-GEAR-002", name: "PINION GEAR", material: "SNCM439", process: "渗碳淬火", spec: "M2.5×32T", note: "" },
  { company: "서암기계공업", prefix: "SE", partNo: "SE-PIN-003", name: "GUIDE PIN", material: "SUJ2", process: "淬火回火", spec: "Ø18×95", note: "" },
  { company: "서암기계공업", prefix: "SE", partNo: "SE-BUSH-004", name: "BUSH", material: "S45C", process: "QT", spec: "Ø44×30×50", note: "" },
  { company: "서암기계공업", prefix: "SE", partNo: "SE-FLG-005", name: "FLANGE", material: "42CrMo4", process: "QT", spec: "Ø80×25T", note: "" },
  { company: "현대위아", prefix: "HW", partNo: "HW-SHAFT-001", name: "DRIVE SHAFT", material: "SCM440", process: "QT", spec: "Ø45×320", note: "" },
  { company: "현대위아", prefix: "HW", partNo: "HW-GEAR-002", name: "PINION GEAR", material: "SNCM439", process: "渗碳淬火", spec: "M2.5×32T", note: "" },
  { company: "현대위아", prefix: "HW", partNo: "HW-PIN-003", name: "GUIDE PIN", material: "SUJ2", process: "淬火回火", spec: "Ø18×95", note: "" },
  { company: "현대위아", prefix: "HW", partNo: "HW-BUSH-004", name: "BUSH", material: "S45C", process: "QT", spec: "Ø44×30×50", note: "" },
  { company: "현대위아", prefix: "HW", partNo: "HW-FLG-005", name: "FLANGE", material: "42CrMo4", process: "QT", spec: "Ø80×25T", note: "" },
  { company: "두산에너빌리티", prefix: "DS", partNo: "DS-SHAFT-001", name: "DRIVE SHAFT", material: "SCM440", process: "QT", spec: "Ø45×320", note: "" },
  { company: "두산에너빌리티", prefix: "DS", partNo: "DS-GEAR-002", name: "PINION GEAR", material: "SNCM439", process: "渗碳淬火", spec: "M2.5×32T", note: "" },
  { company: "두산에너빌리티", prefix: "DS", partNo: "DS-PIN-003", name: "GUIDE PIN", material: "SUJ2", process: "淬火回火", spec: "Ø18×95", note: "" },
  { company: "두산에너빌리티", prefix: "DS", partNo: "DS-BUSH-004", name: "BUSH", material: "S45C", process: "QT", spec: "Ø44×30×50", note: "" },
  { company: "두산에너빌리티", prefix: "DS", partNo: "DS-FLG-005", name: "FLANGE", material: "42CrMo4", process: "QT", spec: "Ø80×25T", note: "" },
  { company: "SNT다이내믹스", prefix: "SN", partNo: "SN-SHAFT-001", name: "DRIVE SHAFT", material: "SCM440", process: "QT", spec: "Ø45×320", note: "" },
  { company: "SNT다이내믹스", prefix: "SN", partNo: "SN-GEAR-002", name: "PINION GEAR", material: "SNCM439", process: "渗碳淬火", spec: "M2.5×32T", note: "" },
  { company: "SNT다이내믹스", prefix: "SN", partNo: "SN-PIN-003", name: "GUIDE PIN", material: "SUJ2", process: "淬火回火", spec: "Ø18×95", note: "" },
  { company: "SNT다이내믹스", prefix: "SN", partNo: "SN-BUSH-004", name: "BUSH", material: "S45C", process: "QT", spec: "Ø44×30×50", note: "" },
  { company: "SNT다이내믹스", prefix: "SN", partNo: "SN-FLG-005", name: "FLANGE", material: "42CrMo4", process: "QT", spec: "Ø80×25T", note: "" },
  { company: "한화에어로스페이스", prefix: "HA", partNo: "HA-SHAFT-001", name: "DRIVE SHAFT", material: "SCM440", process: "QT", spec: "Ø45×320", note: "" },
  { company: "한화에어로스페이스", prefix: "HA", partNo: "HA-GEAR-002", name: "PINION GEAR", material: "SNCM439", process: "渗碳淬火", spec: "M2.5×32T", note: "" },
  { company: "한화에어로스페이스", prefix: "HA", partNo: "HA-PIN-003", name: "GUIDE PIN", material: "SUJ2", process: "淬火回火", spec: "Ø18×95", note: "" },
  { company: "한화에어로스페이스", prefix: "HA", partNo: "HA-BUSH-004", name: "BUSH", material: "S45C", process: "QT", spec: "Ø44×30×50", note: "" },
  { company: "한화에어로스페이스", prefix: "HA", partNo: "HA-FLG-005", name: "FLANGE", material: "42CrMo4", process: "QT", spec: "Ø80×25T", note: "" },
  { company: "GE", prefix: "GE", partNo: "GE-SHAFT-001", name: "DRIVE SHAFT", material: "SCM440", process: "QT", spec: "Ø45×320", note: "" },
  { company: "GE", prefix: "GE", partNo: "GE-GEAR-002", name: "PINION GEAR", material: "SNCM439", process: "渗碳淬火", spec: "M2.5×32T", note: "" },
  { company: "GE", prefix: "GE", partNo: "GE-PIN-003", name: "GUIDE PIN", material: "SUJ2", process: "淬火回火", spec: "Ø18×95", note: "" },
  { company: "GE", prefix: "GE", partNo: "GE-BUSH-004", name: "BUSH", material: "S45C", process: "QT", spec: "Ø44×30×50", note: "" },
  { company: "GE", prefix: "GE", partNo: "GE-FLG-005", name: "FLANGE", material: "42CrMo4", process: "QT", spec: "Ø80×25T", note: "" },
  { company: "(주)모전기공", prefix: "MJ", partNo: "MJ-SHAFT-001", name: "DRIVE SHAFT", material: "SCM440", process: "QT", spec: "Ø45×320", note: "" },
  { company: "(주)모전기공", prefix: "MJ", partNo: "MJ-GEAR-002", name: "PINION GEAR", material: "SNCM439", process: "渗碳淬火", spec: "M2.5×32T", note: "" },
  { company: "(주)모전기공", prefix: "MJ", partNo: "MJ-PIN-003", name: "GUIDE PIN", material: "SUJ2", process: "淬火回火", spec: "Ø18×95", note: "" },
  { company: "(주)모전기공", prefix: "MJ", partNo: "MJ-BUSH-004", name: "BUSH", material: "S45C", process: "QT", spec: "Ø44×30×50", note: "" },
  { company: "(주)모전기공", prefix: "MJ", partNo: "MJ-FLG-005", name: "FLANGE", material: "42CrMo4", process: "QT", spec: "Ø80×25T", note: "" },
  { company: "(유)창성정밀", prefix: "CS", partNo: "CS-SHAFT-001", name: "DRIVE SHAFT", material: "SCM440", process: "QT", spec: "Ø45×320", note: "" },
  { company: "(유)창성정밀", prefix: "CS", partNo: "CS-GEAR-002", name: "PINION GEAR", material: "SNCM439", process: "渗碳淬火", spec: "M2.5×32T", note: "" },
  { company: "(유)창성정밀", prefix: "CS", partNo: "CS-PIN-003", name: "GUIDE PIN", material: "SUJ2", process: "淬火回火", spec: "Ø18×95", note: "" },
  { company: "(유)창성정밀", prefix: "CS", partNo: "CS-BUSH-004", name: "BUSH", material: "S45C", process: "QT", spec: "Ø44×30×50", note: "" },
  { company: "(유)창성정밀", prefix: "CS", partNo: "CS-FLG-005", name: "FLANGE", material: "42CrMo4", process: "QT", spec: "Ø80×25T", note: "" },
  { company: "삼화기계공업", prefix: "SH", partNo: "SH-SHAFT-001", name: "DRIVE SHAFT", material: "SCM440", process: "QT", spec: "Ø45×320", note: "" },
  { company: "삼화기계공업", prefix: "SH", partNo: "SH-GEAR-002", name: "PINION GEAR", material: "SNCM439", process: "渗碳淬火", spec: "M2.5×32T", note: "" },
  { company: "삼화기계공업", prefix: "SH", partNo: "SH-PIN-003", name: "GUIDE PIN", material: "SUJ2", process: "淬火回火", spec: "Ø18×95", note: "" },
  { company: "삼화기계공업", prefix: "SH", partNo: "SH-BUSH-004", name: "BUSH", material: "S45C", process: "QT", spec: "Ø44×30×50", note: "" },
  { company: "삼화기계공업", prefix: "SH", partNo: "SH-FLG-005", name: "FLANGE", material: "42CrMo4", process: "QT", spec: "Ø80×25T", note: "" },
  { company: "진영산업", prefix: "JY", partNo: "JY-SHAFT-001", name: "DRIVE SHAFT", material: "SCM440", process: "QT", spec: "Ø45×320", note: "" },
  { company: "진영산업", prefix: "JY", partNo: "JY-GEAR-002", name: "PINION GEAR", material: "SNCM439", process: "渗碳淬火", spec: "M2.5×32T", note: "" },
  { company: "진영산업", prefix: "JY", partNo: "JY-PIN-003", name: "GUIDE PIN", material: "SUJ2", process: "淬火回火", spec: "Ø18×95", note: "" },
  { company: "진영산업", prefix: "JY", partNo: "JY-BUSH-004", name: "BUSH", material: "S45C", process: "QT", spec: "Ø44×30×50", note: "" },
  { company: "진영산업", prefix: "JY", partNo: "JY-FLG-005", name: "FLANGE", material: "42CrMo4", process: "QT", spec: "Ø80×25T", note: "" },
];

const UNIT_PRICE_BY_MATERIAL = {
  "SCM440": 72000,
  "SNCM439": 98000,
  "SUJ2": 62000,
  "S45C": 38000,
  "42CrMo4": 88000,
  "SACM645": 115000,
  "SCM440H": 54000,
  "SKD61": 125000,
};

function buildRc1DemoProductRow(definition, index) {
  const seq = String(index + 1).padStart(4, "0");
  const dateCode = "20260710";
  return {
    id: `rc1-demo-p-${index + 1}`,
    code: `${definition.prefix}_${dateCode}_${seq}`,
    name: definition.name,
    partNo: definition.partNo,
    company: definition.company,
    drawingNo: `${definition.prefix}-${definition.partNo.split("-").pop()}-DWG`,
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

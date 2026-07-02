import XLSX from "xlsx";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const COMPANY = "서암기계공업";
const DATE = "20260703";
const PREFIX = `SE_${DATE}_`;
const src = process.argv[2] || "c:/Users/user1/Desktop/서암기계공업.xlsx";
const out = path.join(root, "src/data/seoamDemoProducts.js");

const wb = XLSX.readFile(src);
const sh = wb.Sheets[wb.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json(sh, { defval: "" }).slice(1);

const products = [];
let seq = 0;

for (const row of rows) {
  const partNo = String(row.__EMPTY ?? "").trim();
  const name = String(row.__EMPTY_1 ?? "").trim();
  if (!partNo || !name) continue;
  seq += 1;
  const spec = String(row.__EMPTY_2 ?? "").trim();
  const material = String(row.__EMPTY_3 ?? "").trim();
  const unitPriceRaw = row.__EMPTY_4;
  const unitPrice =
    unitPriceRaw === "" || unitPriceRaw == null
      ? null
      : Number(String(unitPriceRaw).replace(/,/g, "")) || null;

  products.push({
    id: `seoam-${seq}`,
    code: `${PREFIX}${String(seq).padStart(4, "0")}`,
    name,
    partNo,
    company: COMPANY,
    drawingNo: "",
    material,
    spec,
    unitPrice,
    unit: "EA",
    process: "",
    description: "",
    note: "",
    active: true,
  });
}

const dir = path.dirname(out);
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const content = `/** Project TITAN Demo — 서암기계공업 Product Master (${products.length}건) · Auto-generated */
export const SEOAM_DEMO_PRODUCTS = ${JSON.stringify(products, null, 2)};
export const SEOAM_DEMO_PRODUCT_COUNT = ${products.length};
`;

fs.writeFileSync(out, content, "utf8");
console.log(`written ${out}`);
console.log(`count ${products.length}`);
console.log(`first ${products[0]?.code} ${products[0]?.partNo}`);
console.log(`last ${products[products.length - 1]?.code} ${products[products.length - 1]?.partNo}`);

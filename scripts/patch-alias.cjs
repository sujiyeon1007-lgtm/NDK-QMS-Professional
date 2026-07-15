const fs = require("fs");
const file = "src/utils/masterData.js";
let md = fs.readFileSync(file, "utf8");
if (!md.includes("export function generateTitanDocumentNumber(")) {
  md += "\nexport function generateTitanDocumentNumber(type, companyAbbrOrName, existingValues = null) {\n  return generateTitanDocumentNumberFromSettings(type, companyAbbrOrName, existingValues);\n}\n";
  fs.writeFileSync(file, md, "utf8");
  console.log("alias added");
} else {
  console.log("alias exists");
}
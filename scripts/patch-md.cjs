const fs = require("fs");
let md = fs.readFileSync("src/utils/masterData.js", "utf8");
md = md.replace(
  'return generateTitanDocumentNumber("product", companyName, existingCodes);',
  'return generateTitanDocumentNumberFromSettings("product", companyName, existingCodes);'
);
const start = md.indexOf("function generateTitanDocumentNumber(type");
if (start >= 0) {
  const end = md.indexOf("import { inferProcessCategoryFromDetail", start);
  if (end > start) md = md.slice(0, start) + md.slice(end);
}
fs.writeFileSync("src/utils/masterData.js", md, "utf8");
console.log("masterData patched");
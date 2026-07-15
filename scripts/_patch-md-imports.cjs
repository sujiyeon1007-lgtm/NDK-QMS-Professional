const fs = require("fs");
const path = require("path");
const file = path.join(__dirname, "..", "src", "utils", "masterData.js");
let s = fs.readFileSync(file, "utf8");
const oldText = '} from "./companyAbbreviation";';
const newText = oldText + '\nimport { generateTitanDocumentNumber } from "./titanDocumentNumbering";\nimport { inferProcessCategoryFromDetail, resolveProductProcessLabel } from "../config/productProcessSelection";';
if (!s.includes(oldText)) throw new Error("miss imports");
fs.writeFileSync(file, s.replace(oldText, newText), "utf8");
console.log("imports ok");

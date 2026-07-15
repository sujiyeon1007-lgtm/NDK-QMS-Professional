const fs = require("fs");
const path = require("path");
const file = path.join(__dirname, "..", "src", "utils", "masterData.js");
let s = fs.readFileSync(file, "utf8");
const oldText = "      process: payload.process?.trim() ?? \"\",\r\n      description: payload.description?.trim() ?? \"\",";
const newText = "      processCategory: payload.processCategory?.trim() ?? inferProcessCategoryFromDetail(payload.processDetail, payload.process),\r\n      processDetail: payload.processDetail?.trim() ?? \"\",\r\n      process: resolveProductProcessLabel(payload.processCategory, payload.processDetail, payload.process),\r\n      description: payload.description?.trim() ?? \"\",";
if (!s.includes(oldText)) throw new Error("miss");
fs.writeFileSync(file, s.replace(oldText, newText), "utf8");
console.log("ok");

const fs = require("fs");
const file = "src/pages/Settings/MasterDataRegisterModal.jsx";
let m = fs.readFileSync(file, "utf8");
if (m.includes("{productField ??")) {
  console.log("already patched");
  process.exit(0);
}
const marker = "const productField = isProductScreen ? renderProductField(field) : null;";
const idx = m.indexOf(marker);
if (idx < 0) {
  console.error("marker not found");
  process.exit(1);
}
const insertAt = m.indexOf("<MasterFieldInput", idx);
if (insertAt < 0) {
  console.error("MasterFieldInput not found");
  process.exit(1);
}
const endAt = m.indexOf("/>", insertAt) + 2;
const old = m.slice(insertAt, endAt);
const neu = "{productField ?? (\n                " + old + "\n              )}";
m = m.slice(0, insertAt) + neu + m.slice(endAt);
fs.writeFileSync(file, m, "utf8");
console.log("modal patched");
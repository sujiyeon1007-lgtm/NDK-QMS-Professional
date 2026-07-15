const fs = require("fs");
const file = "c:/Users/user1/Desktop/NDK-QMS-Professional/src/pages/Settings/MasterDataRegisterModal.jsx";
let s = fs.readFileSync(file, "utf8");
const oldText = "  const isCompanyScreen = screen?.categoryKey === \"companies\";";
const newText = oldText + "\r\n  const isProductScreen = screen?.categoryKey === \"products\";";
if (!s.includes(oldText) || s.includes("isProductScreen")) throw new Error("skip");
fs.writeFileSync(file, s.replace(oldText, newText), "utf8");
console.log("ok");

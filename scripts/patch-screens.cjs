const fs = require("fs");
let s = fs.readFileSync("src/config/masterDataScreens.js", "utf8");
s = s.replace('prefix: "T",', 'prefix: "CT",');
s = s.replace('example: "DS-T-0001"', 'example: "DS-CT-0001"');
fs.writeFileSync("src/config/masterDataScreens.js", s, "utf8");
console.log("screens patched");
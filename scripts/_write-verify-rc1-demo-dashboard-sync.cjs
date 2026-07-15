const fs = require("fs");
const path = require("path");
const target = path.join(__dirname, "verify-rc1-demo-dashboard-sync.mjs");
const source = path.join(__dirname, "_verify-rc1-demo-dashboard-sync.source.mjs");
fs.writeFileSync(target, fs.readFileSync(source, "utf8").replace(/\r?\n/g, "\n"), "utf8");
console.log("Wrote", target);

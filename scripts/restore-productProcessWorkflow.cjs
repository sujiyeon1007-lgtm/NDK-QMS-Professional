const fs = require("fs");
const path = require("path");

const target = path.join(__dirname, "..", "src", "utils", "productProcessWorkflow.js");

if (!fs.existsSync(target)) {
  console.error("missing", target);
  process.exit(1);
}

const buf = fs.readFileSync(target);
const content = buf.length > 2 && buf[1] === 0 ? buf.toString("utf16le") : buf.toString("utf8");
fs.writeFileSync(target, content, "utf8");

const verified = fs.readFileSync(target);
console.log("verified", target, "len", verified.length, "b0", verified[0], "b1", verified[1]);

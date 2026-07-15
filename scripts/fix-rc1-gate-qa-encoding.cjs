const fs = require("fs");
const path = require("path");

const root = __dirname;
const targets = ["verify-rc1-golden-scenario.mjs", "verify-rc1-lot-workflow-sync.mjs"];

for (const name of targets) {
  const filePath = path.join(root, name);
  if (!fs.existsSync(filePath)) {
    console.warn("skip missing", name);
    continue;
  }
  const buf = fs.readFileSync(filePath);
  const isUtf16 = buf.length >= 2 && buf[0] === 0x2f && buf[1] === 0x00;
  if (!isUtf16) {
    console.log(name, "already utf8");
    continue;
  }
  const content = buf.toString("utf16le").replace(/^\uFEFF/, "");
  fs.writeFileSync(filePath, content, "utf8");
  console.log(name, "converted utf16le -> utf8");
}

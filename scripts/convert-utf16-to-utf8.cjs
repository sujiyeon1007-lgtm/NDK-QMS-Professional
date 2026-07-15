const fs = require("fs");
const paths = [
  "src/utils/productProcessWorkflow.js",
  "src/pages/Production/charging/ProcessStepCompleteDialog.jsx",
  "src/config/certificatePolicyMaster.js",
];
for (const rel of paths) {
  if (!fs.existsSync(rel)) { console.log("skip", rel); continue; }
  const buf = fs.readFileSync(rel);
  let text;
  if (buf.length >= 2 && buf[1] === 0) {
    text = buf.toString("utf16le");
  } else if (buf.length >= 3 && buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf) {
    text = buf.toString("utf8", 3);
  } else {
    text = buf.toString("utf8");
  }
  fs.writeFileSync(rel, text, "utf8");
  const out = fs.readFileSync(rel);
  console.log(rel, out.length, out[0], out[1]);
}
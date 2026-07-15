const fs = require("fs");
const path = require("path");

const files = [
  "docs/blueprints/V1.1/sqlite-migration-blueprint.md",
  "docs/blueprints/V1.1/INDEX.md",
];

for (const rel of files) {
  const abs = path.join(process.cwd(), rel);
  const buf = fs.readFileSync(abs);
  let text;
  if (buf[0] === 0xff && buf[1] === 0xfe) {
    text = buf.toString("utf16le").replace(/^\uFEFF/, "");
  } else if (buf.includes(0x00) && buf[0] === 0x23) {
    text = buf.toString("utf16le").replace(/^\uFEFF/, "");
  } else {
    text = buf.toString("utf8");
  }
  fs.writeFileSync(abs, text, "utf8");
  console.log("fixed", rel, "chars", text.length);
}

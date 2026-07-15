import fs from "fs";

for (const file of ["src/config/titanDocumentNumbering.js", "src/utils/titanDocumentNumbering.js"]) {
  const buf = fs.readFileSync(file);
  const text = buf.includes(0) ? buf.toString("utf16le") : buf.toString("utf8");
  fs.writeFileSync(file, text, "utf8");
}

const configPath = "src/config/titanDocumentNumbering.js";
let config = fs.readFileSync(configPath, "utf8");
config = config.replaceAll("TITAN_DOCUMENT_NUMBERING_TYPES", "TITAN_DOCUMENT_NUMBER_TYPES");
config = config.replace(
  ".map((item) => [item.id, item.prefix])));",
  ".map((item) => [item.id, item.prefix]));"
);
config = config.replace('|| "XX",;', '|| "XX";');
fs.writeFileSync(configPath, config, "utf8");
console.log("encoding fixed");

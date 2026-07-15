const fs = require("fs");
const content = [
  "export const TITAN_PROCESS_MASTER_V2_PLANNED = {",
  "  status: \"planned\",",
  "  route: \"/settings/processes\",",
  "  note: \"Process Master V2 planned\",",
  "  replaces: \"productProcessSelection.js\",",
  "};",
  "",
].join("\n");
fs.writeFileSync("src/config/titanProcessMasterV2.js", content, "utf8");
console.log("written");
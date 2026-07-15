const fs = require("fs");
const s = fs.readFileSync("c:/Users/user1/Desktop/NDK-QMS-Professional/src/utils/masterData.js", "utf8");
const oldText = "      process: payload.process?.trim() ?? \"\",\r\n      description: payload.description?.trim() ?? \"\",";
const oldText2 = "      process: payload.process?.trim() ?? \"\",\n      description: payload.description?.trim() ?? \"\",";
console.log("crlf", s.includes(oldText));
console.log("lf", s.includes(oldText2));

const fs=require("fs");const f="c:/Users/user1/Desktop/NDK-QMS-Professional/src/config/companyMasterArchitecture.js";let s=fs.readFileSync(f,"utf8");
const o='  { name: "두산에너빌리티", abbreviation: "DS" },\r\n  { name: "GE", abbreviation: "GE" },';
const n='  { name: "두산에너빌리티", abbreviation: "DS" },\r\n  { name: "삼성중공업", abbreviation: "SHI" },\r\n  { name: "한화오션", abbreviation: "HANWHA" },\r\n  { name: "현대중공업", abbreviation: "HHI" },\r\n  { name: "GE", abbreviation: "GE" },';
if(!s.includes(o)) throw 1; fs.writeFileSync(f,s.replace(o,n)); console.log('ok examples');

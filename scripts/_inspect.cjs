const fs=require("fs");
const files=[
"c:/Users/user1/Desktop/NDK-QMS-Professional/src/pages/Settings/MasterDataRegisterModal.jsx",
"c:/Users/user1/Desktop/NDK-QMS-Professional/src/utils/productMasterInspectionSpec.js"
];
for(const f of files){if(!fs.existsSync(f)){console.log('missing',f);continue;} const b=fs.readFileSync(f); const hasNull=b.includes(0); console.log(f.split('/').pop(),'len',b.length,'null',hasNull,'head',b.slice(0,40).toString('utf8').replace(/\n/g,'\\n'));}

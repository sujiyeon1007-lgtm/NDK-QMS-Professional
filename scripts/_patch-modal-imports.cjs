const fs = require("fs");
const path = require("path");
const file = path.join(__dirname, "..", "src", "pages", "Settings", "MasterDataRegisterModal.jsx");
let s = fs.readFileSync(file, "utf8");
const oldText = 'import TitanRegisterModal from "../../foundation/components/TitanRegisterModal";\r\nimport { buildCompanyAbbreviation } from "../../utils/companyAbbreviation";\r\nimport { getActiveMasterNames, getMasterDataByCategory, validateMasterRow } from "../../utils/masterData";';
const newText = 'import TitanRegisterModal from "../../foundation/components/TitanRegisterModal";\r\nimport TitanSearchAutocomplete from "../../foundation/components/TitanSearchAutocomplete";\r\nimport { buildCompanyAbbreviation } from "../../utils/companyAbbreviation";\r\nimport {\r\n  generateProductManagementCode,\r\n  getActiveMasterNames,\r\n  getMasterDataByCategory,\r\n  validateMasterRow,\r\n} from "../../utils/masterData";\r\nimport {\r\n  PRODUCT_PROCESS_CATEGORIES,\r\n  getProductProcessDetailOptions,\r\n  inferProcessCategoryFromDetail,\r\n} from "../../config/productProcessSelection";';
if (!s.includes(oldText)) throw new Error("miss imports");
fs.writeFileSync(file, s.replace(oldText, newText), "utf8");
console.log("imports ok");

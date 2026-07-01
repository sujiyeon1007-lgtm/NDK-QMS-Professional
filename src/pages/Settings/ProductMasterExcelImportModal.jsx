import MasterExcelImportModal from "./MasterExcelImportModal";

/** @deprecated Use MasterExcelImportModal with masterType="products" */
export default function ProductMasterExcelImportModal(props) {
  return <MasterExcelImportModal masterType="products" {...props} />;
}

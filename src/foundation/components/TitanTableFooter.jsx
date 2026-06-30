import { TABLE_PAGE_SIZE_OPTIONS } from "../../config/listSearchStandard";
import TitanPageSizeSelector from "./TitanPageSizeSelector";
import TitanPagination from "./TitanPagination";

export default function TitanTableFooter({
  totalCount,
  page,
  totalPages,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = TABLE_PAGE_SIZE_OPTIONS,
  className = "",
}) {
  return (
    <div className={`titan-table-footer ${className}`.trim()}>
      <div className="titan-table-footer__total">
        총 <strong>{totalCount.toLocaleString("ko-KR")}</strong>건
      </div>
      <TitanPagination
        className="titan-table-footer__pagination"
        page={page}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
      <TitanPageSizeSelector
        className="titan-table-footer__page-size"
        pageSize={pageSize}
        onPageSizeChange={onPageSizeChange}
        options={pageSizeOptions}
      />
    </div>
  );
}

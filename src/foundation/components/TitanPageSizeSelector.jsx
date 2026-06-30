import { TABLE_PAGE_SIZE_OPTIONS } from "../../config/listSearchStandard";

export default function TitanPageSizeSelector({
  pageSize,
  onPageSizeChange,
  options = TABLE_PAGE_SIZE_OPTIONS,
  className = "",
}) {
  return (
    <label className={`titan-page-size ${className}`.trim()}>
      <span className="titan-page-size__label">페이지당</span>
      <select
        className="titan-page-size__select"
        value={pageSize}
        onChange={(e) => onPageSizeChange(Number(e.target.value))}
        aria-label="페이지당 표시 건수"
      >
        {options.map((size) => (
          <option key={size} value={size}>
            {size}
          </option>
        ))}
      </select>
      <span className="titan-page-size__suffix">건</span>
    </label>
  );
}

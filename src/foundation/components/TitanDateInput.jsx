/**
 * Project TITAN — 공통 DatePicker (검색 · 폼 동일 높이)
 */
import Input from "./Input";

export default function TitanDateInput({ className = "", ...props }) {
  return (
    <Input
      type="date"
      className={`titan-advanced-search__date-input ${className}`.trim()}
      {...props}
    />
  );
}

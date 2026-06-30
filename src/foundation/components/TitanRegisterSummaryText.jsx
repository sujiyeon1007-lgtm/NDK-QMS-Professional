import { formatTitanSummaryText } from "../../utils/titanTextWrap";

/**
 * Project TITAN V1.0 — 등록 모달 입력값 요약 텍스트
 */
export default function TitanRegisterSummaryText({ text, as: Tag = "span", className = "" }) {
  const value = formatTitanSummaryText(text);
  if (!value) return null;

  return (
    <Tag className={`titan-register-summary__text ${className}`.trim()}>{value}</Tag>
  );
}

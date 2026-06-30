import { formatTitanButtonLabel } from "../../utils/titanTextWrap";

/**
 * Project TITAN V1.0 — 단어 단위 줄바꿈 텍스트
 */
export default function TitanMultilineText({
  text,
  className = "",
  as: Tag = "span",
  format = true,
}) {
  const value = format ? formatTitanButtonLabel(text) : text;
  if (!value) return null;

  return (
    <Tag className={`titan-text-wrap ${className}`.trim()}>
      {value}
    </Tag>
  );
}

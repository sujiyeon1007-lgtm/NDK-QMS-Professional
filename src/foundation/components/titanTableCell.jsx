/**
 * Project TITAN — 공통 Grid 셀 렌더 (ERP/MES Compact)
 */
import TitanIdentifierCell from "./TitanIdentifierCell";
import { isTitanIdentifierColumn } from "../../config/tableColumnPresets";

export function formatTitanCellText(value) {
  if (value == null || String(value).trim() === "") {
    return "—";
  }
  return String(value);
}

export function renderTitanTableCell(row, col) {
  if (col.render) {
    return col.render(row);
  }
  if (col.key === "__select") {
    return null;
  }

  if (isTitanIdentifierColumn(col.key) || col.identifier) {
    const raw =
      col.key === "managementId" ? (row[col.key] ?? row.id) : row[col.key];
    const text = formatTitanCellText(raw);
    return <TitanIdentifierCell value={text === "—" ? "" : text} />;
  }

  const text = formatTitanCellText(row[col.key]);

  return (
    <span className="titan-table-text-cell" title={text === "—" ? undefined : text}>
      {text}
    </span>
  );
}

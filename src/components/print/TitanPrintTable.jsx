function getHeaderClass(column) {
  if (column.align === "left") return "titan-print-th-left";
  return "titan-print-th-center";
}

function getCellClass(column, layout) {
  const classes = [];

  if (layout.wrapMaxLines > 0) {
    classes.push("titan-print-col-partname");
  } else if (layout.singleLine) {
    classes.push("titan-print-col-single");
  }

  if (layout.narrow) {
    classes.push("titan-print-col-narrow");
  }

  if (column.id === "partNo") {
    classes.push("titan-print-col-partno");
  }

  if (column.id === "qty") {
    classes.push("titan-print-col-qty");
  }

  if (layout.handwriting) {
    classes.push("titan-print-col-lot");
  }

  if (column.align === "left") {
    classes.push("titan-print-td-left");
  } else {
    classes.push("titan-print-td-center");
  }

  return classes.join(" ");
}

/** Project TITAN — 출력 전용 테이블 (말줄임·한 글자 줄바꿈 금지) */
function TitanPrintTable({ columns, rows, columnWidths, renderCell }) {
  return (
    <table className="titan-print-table">
      <colgroup>
        {columnWidths.map((col) => (
          <col key={col.id} style={{ width: `${col.widthPercent}%` }} />
        ))}
      </colgroup>
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={column.id} scope="col" className={getHeaderClass(column)}>
              {column.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.id ?? row.no}>
            {columns.map((column, index) => {
              const layout = columnWidths[index];
              const className = getCellClass(column, layout);

              const content = renderCell
                ? renderCell(row, column, index)
                : column.getValue(row);

              return (
                <td key={column.id} className={className}>
                  {content ?? ""}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default TitanPrintTable;

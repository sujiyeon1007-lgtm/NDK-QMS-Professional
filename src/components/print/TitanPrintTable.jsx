function getHeaderClass(column) {
  if (column.align === "left") return "titan-print-th-left";
  if (column.align === "right") return "titan-print-th-right";
  return "titan-print-th-center";
}

function getCellClass(column, layout) {
  const classes = [];

  if (column.wrap || layout.wrap) {
    classes.push("titan-print-col-wrap");
  } else if (layout.wrapMaxLines > 0) {
    classes.push("titan-print-col-partname");
  } else if (layout.singleLine) {
    classes.push("titan-print-col-single");
  }

  if (layout.narrow) {
    classes.push("titan-print-col-narrow");
  }

  if (column.id === "partName") {
    classes.push("titan-print-col-partname");
  }

  if (column.id === "partNo") {
    classes.push("titan-print-col-partno");
  }

  if (column.id === "stockQty") {
    classes.push("titan-print-col-stock");
  }

  if (layout.handwriting) {
    classes.push("titan-print-col-handwriting");
  }

  if (column.checkbox) {
    classes.push("titan-print-col-checkbox");
  }

  if (column.align === "left") {
    classes.push("titan-print-td-left");
  } else if (column.align === "right") {
    classes.push("titan-print-td-right");
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

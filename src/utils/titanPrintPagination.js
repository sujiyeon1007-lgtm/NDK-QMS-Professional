/** 출력물 페이지 분할 */
export function paginateRows(rows, rowsPerPage) {
  if (!rows.length) {
    return [[]];
  }

  const pages = [];
  for (let index = 0; index < rows.length; index += rowsPerPage) {
    pages.push(rows.slice(index, index + rowsPerPage));
  }
  return pages;
}

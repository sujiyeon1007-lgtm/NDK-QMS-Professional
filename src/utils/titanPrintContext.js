/** Project TITAN — 출력 메타 (일시·사용자) */

const PRINT_USER = "품질관리부";

export function getPrintUser() {
  return PRINT_USER;
}

export function getPrintDateTime(now = new Date()) {
  const date = now.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const time = now.toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return `${date} ${time}`;
}

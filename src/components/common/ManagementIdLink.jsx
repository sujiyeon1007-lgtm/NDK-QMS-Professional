import { Link, useNavigate } from "react-router-dom";

function historyPath(id) {
  return `/history?id=${encodeURIComponent(id)}`;
}

/**
 * 관리번호 → 이력조회 이동 (Project TITAN 공통)
 * @param {boolean} inline - true: button 내부 등 중첩 불가 시 span+navigate
 */
function ManagementIdLink({ id, className = "", stopPropagation = true, inline = false }) {
  const navigate = useNavigate();
  const to = historyPath(id);
  const classes = ["mgmt-id-link", className].filter(Boolean).join(" ");

  if (inline) {
    return (
      <span
        className={classes}
        role="link"
        tabIndex={0}
        onClick={(event) => {
          if (stopPropagation) event.stopPropagation();
          navigate(to);
        }}
        onKeyDown={(event) => {
          if (event.key !== "Enter" && event.key !== " ") return;
          event.preventDefault();
          if (stopPropagation) event.stopPropagation();
          navigate(to);
        }}
      >
        {id}
      </span>
    );
  }

  return (
    <Link
      to={to}
      className={classes}
      onClick={(event) => {
        if (stopPropagation) event.stopPropagation();
      }}
    >
      {id}
    </Link>
  );
}

export default ManagementIdLink;

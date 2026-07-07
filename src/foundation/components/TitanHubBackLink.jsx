import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

/** Launcher Hub 하위 화면 → Hub 복귀 */
export default function TitanHubBackLink({ to, label }) {
  return (
    <Link to={to} className="titan-hub-back-link">
      <ChevronLeft size={16} aria-hidden="true" />
      {label}
    </Link>
  );
}

import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

/** 기준정보관리 하위 화면 → Launcher 복귀 */
export default function MasterDataBackLink() {
  return (
    <Link to="/settings" className="master-data-screen__back">
      <ChevronLeft size={16} aria-hidden="true" />
      기준정보관리
    </Link>
  );
}

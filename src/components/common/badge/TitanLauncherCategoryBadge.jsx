import TitanStatusBadge from "./TitanStatusBadge";

/**
 * Project TITAN — Launcher Category Badge (TitanStatusBadge alias)
 * Hub/Launcher 카드 우측 상단 카테고리 표시 전용
 *
 * @param {{ text: string, color?: import("./TitanStatusBadge").TitanStatusBadgeColor, className?: string }} props
 */
export default function TitanLauncherCategoryBadge(props) {
  return <TitanStatusBadge {...props} />;
}

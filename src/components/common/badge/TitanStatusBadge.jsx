import styles from "./TitanStatusBadge.module.css";

/** @typedef {"blue"|"orange"|"green"|"purple"|"yellow"|"cyan"} TitanStatusBadgeColor */

export const TITAN_STATUS_BADGE_COLORS = /** @type {const} */ ([
  "blue",
  "orange",
  "green",
  "purple",
  "yellow",
  "cyan",
]);

const COLOR_CLASS = {
  blue: styles.blue,
  orange: styles.orange,
  green: styles.green,
  purple: styles.purple,
  yellow: styles.yellow,
  cyan: styles.cyan,
};

/**
 * Project TITAN — 공식 Launcher/카테고리 Badge
 * 디자인 고정 · text · color(Accent)만 Props로 변경
 *
 * @param {{ text: string, color?: TitanStatusBadgeColor, className?: string }} props
 */
export default function TitanStatusBadge({ text, color = "blue", className = "" }) {
  const toneClass = COLOR_CLASS[color] ?? COLOR_CLASS.blue;

  return (
    <span className={[styles.badge, toneClass, className].filter(Boolean).join(" ")}>
      {text}
    </span>
  );
}

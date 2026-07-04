/** Unified stub for routes/screens not yet implemented — stabilization V1.0 */
export const TITAN_COMING_SOON_MESSAGE = "준비 중입니다.";

/**
 * @param {{ title: string, subtitle?: string }} props
 */
export default function TitanComingSoonPlaceholder({ title, subtitle }) {
  return (
    <div className="titan-page-placeholder">
      <div className="titan-page-placeholder__card">
        <span className="titan-page-placeholder__badge">PROJECT TITAN V1.0</span>
        <h2>{title}</h2>
        {subtitle ? <p className="titan-page-placeholder__subtitle">{subtitle}</p> : null}
        <p>{TITAN_COMING_SOON_MESSAGE}</p>
      </div>
    </div>
  );
}

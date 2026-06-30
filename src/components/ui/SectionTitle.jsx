export default function SectionTitle({ title, subtitle, actions, className = "" }) {
  return (
    <div className={`ndk-section-title ${className}`.trim()}>
      <div className="ndk-section-title__text">
        {title ? <h3>{title}</h3> : null}
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
      {actions ? <div className="ndk-section-title__actions">{actions}</div> : null}
    </div>
  );
}

export default function InfoCard({ title, children, className = "", ...props }) {
  return (
    <section className={`ndk-info-card ${className}`.trim()} {...props}>
      {title ? <h4 className="ndk-info-card__title">{title}</h4> : null}
      {children}
    </section>
  );
}

export function RequiredMark() {
  return <span className="ndk-info-card__required" aria-hidden="true">*</span>;
}

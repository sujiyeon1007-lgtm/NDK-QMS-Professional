/**
 * Project TITAN — Common Expand Row Detail (HOME · Master · 리스트 공통)
 *
 * @param {object} props
 * @param {string} [props.title]
 * @param {string} [props.subtitle]
 * @param {Array<{ key?: string, label: string, value?: React.ReactNode }>} [props.fields]
 * @param {React.ReactNode} [props.children]
 */
export default function TitanCommonExpandRow({
  title,
  subtitle,
  fields = [],
  children,
  className = "",
}) {
  return (
    <div className={`titan-common-expand-row home-workflow-expand ${className}`.trim()}>
      {title || subtitle ? (
        <div className="titan-common-expand-row__head home-workflow-expand__head">
          {title ? <strong>{title}</strong> : null}
          {subtitle ? <span>{subtitle}</span> : null}
        </div>
      ) : null}

      {fields.length > 0 ? (
        <>
          <div className="titan-common-expand-row__divider home-workflow-expand__divider" aria-hidden="true" />
          <dl className="titan-common-expand-row__meta home-workflow-expand__meta home-workflow-expand__meta--stack">
            {fields.map((field) => (
              <div key={field.key ?? field.label}>
                <dt>{field.label}</dt>
                <dd>{field.value ?? "—"}</dd>
              </div>
            ))}
          </dl>
        </>
      ) : null}

      {children}
    </div>
  );
}

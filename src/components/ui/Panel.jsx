export default function Panel({ className = "", children, as: Tag = "section", ...props }) {
  const rootClass = ["ndk-panel", "panel", className].filter(Boolean).join(" ");
  return (
    <Tag className={rootClass} {...props}>
      {children}
    </Tag>
  );
}

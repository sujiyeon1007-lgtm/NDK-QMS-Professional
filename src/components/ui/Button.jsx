const VARIANT_CLASS = {
  primary: "ndk-btn--primary",
  secondary: "ndk-btn--secondary",
  success: "ndk-btn--success",
  danger: "ndk-btn--danger",
};

export default function Button({
  variant = "secondary",
  solid = false,
  block = false,
  className = "",
  type = "button",
  children,
  ...props
}) {
  const rootClass = [
    "ndk-btn",
    VARIANT_CLASS[variant] ?? VARIANT_CLASS.secondary,
    solid && (variant === "success" || variant === "danger") ? "ndk-btn--solid" : "",
    block ? "ndk-btn--block" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button type={type} className={rootClass} {...props}>
      {children}
    </button>
  );
}

export function PrimaryButton(props) {
  return <Button variant="primary" {...props} />;
}

export function SecondaryButton(props) {
  return <Button variant="secondary" {...props} />;
}

export function DangerButton(props) {
  return <Button variant="danger" {...props} />;
}

export function SuccessButton(props) {
  return <Button variant="success" solid {...props} />;
}

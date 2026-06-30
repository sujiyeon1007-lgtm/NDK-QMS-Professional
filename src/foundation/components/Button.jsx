import { Children } from "react";
import TitanMultilineText from "./TitanMultilineText";

function renderButtonChildren(children) {
  return Children.map(children, (child, index) => {
    if (typeof child === "string") {
      return <TitanMultilineText key={`btn-text-${index}`} text={child} />;
    }
    return child;
  });
}

export function PrimaryButton({ children, className = "", ...props }) {
  return (
    <button type="button" className={`titan-btn titan-btn--primary ${className}`.trim()} {...props}>
      {renderButtonChildren(children)}
    </button>
  );
}

export function SecondaryButton({ children, className = "", ...props }) {
  return (
    <button type="button" className={`titan-btn titan-btn--secondary ${className}`.trim()} {...props}>
      {renderButtonChildren(children)}
    </button>
  );
}

export default function Button({ variant = "secondary", children, className = "", ...props }) {
  const cls = variant === "primary" ? "titan-btn--primary" : "titan-btn--secondary";
  return (
    <button type="button" className={`titan-btn ${cls} ${className}`.trim()} {...props}>
      {renderButtonChildren(children)}
    </button>
  );
}

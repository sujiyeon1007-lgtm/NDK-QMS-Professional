export default function Card({ children, className = "", ...props }) {
  return (
    <div className={`titan-card ${className}`.trim()} {...props}>
      {children}
    </div>
  );
}

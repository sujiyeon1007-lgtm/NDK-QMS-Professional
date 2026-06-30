export default function Input({ className = "", ...props }) {
  return <input className={`titan-input ${className}`.trim()} {...props} />;
}

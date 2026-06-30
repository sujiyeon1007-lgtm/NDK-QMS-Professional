import ndkLogo from "../../assets/ndk-logo.png";
import "./NdkLogo.css";

function NdkLogo({ className = "", alt = "NDK 한국이온질화센터", ...props }) {
  return (
    <img
      src={ndkLogo}
      alt={alt}
      className={["ndk-logo", className].filter(Boolean).join(" ")}
      {...props}
    />
  );
}

export default NdkLogo;

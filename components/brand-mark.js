export function BrandMark({ size = 38, inverted = false }) {
  const stroke = inverted ? "#ffffff" : "#163a63";
  const fill = inverted ? "#8ee7c5" : "#2fb785";
  return (
    <span className="brand-mark" style={{ width: size, height: size }} aria-hidden="true">
      <svg viewBox="0 0 42 42" width={size} height={size} role="img">
        <rect width="42" height="42" rx="11" fill={inverted ? "rgba(255,255,255,.1)" : "#edf8f4"} />
        <path d="M21 30V20m0 0-8-6m8 6 8-6M13 14V9m16 5V9" fill="none" stroke={stroke} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="13" cy="8.5" r="3.2" fill={fill} />
        <circle cx="29" cy="8.5" r="3.2" fill={fill} />
        <circle cx="21" cy="31.5" r="3.2" fill={fill} />
      </svg>
    </span>
  );
}

/* eslint-disable @next/next/no-img-element -- the raw logo path is intentionally cached for offline use */

export function BrandMark({ size = 38, inverted = false }) {
  return (
    <span
      className={`brand-mark official-brand-mark${inverted ? " is-inverted" : ""}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <img src="/btlogo.png" alt="" width="716" height="644" />
    </span>
  );
}

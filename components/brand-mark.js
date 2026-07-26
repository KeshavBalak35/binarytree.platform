export function BrandMark({ size = 38, inverted = false }) {
  return (
    <span
      className={`brand-mark patchwork-mark${inverted ? " is-inverted" : ""}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <span className="brand-scrap brand-scrap-one" />
      <span className="brand-scrap brand-scrap-two" />
      <span className="brand-stitch">×</span>
    </span>
  );
}

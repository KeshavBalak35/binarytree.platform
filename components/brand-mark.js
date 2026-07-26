export function BrandMark({ size = 38, inverted = false }) {
  return (
    <span
      className={`brand-mark binary-tree-mark${inverted ? " is-inverted" : ""}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <span className="tree-line tree-trunk" />
      <span className="tree-line tree-branch tree-branch-left" />
      <span className="tree-line tree-branch tree-branch-right" />
      <span className="tree-node tree-node-root" />
      <span className="tree-node tree-node-left" />
      <span className="tree-node tree-node-right" />
    </span>
  );
}

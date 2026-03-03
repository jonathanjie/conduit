"use client";

/**
 * Subtle animated network-node background.
 * Renders an SVG with circles (nodes) and thin connecting lines.
 * Two variants: "light" for white/cream sections, "dark" for dark sections.
 */
export default function NodesBg({
  variant = "light",
}: {
  variant?: "light" | "dark";
}) {
  const isLight = variant === "light";
  const nodeColor = isLight ? "rgba(37,99,235,0.10)" : "rgba(191,219,254,0.08)";
  const nodeStroke = isLight ? "rgba(37,99,235,0.14)" : "rgba(191,219,254,0.10)";
  const lineColor = isLight ? "rgba(37,99,235,0.06)" : "rgba(191,219,254,0.05)";
  const accentColor = isLight ? "rgba(245,158,11,0.08)" : "rgba(245,158,11,0.06)";
  const accentStroke = isLight ? "rgba(245,158,11,0.12)" : "rgba(245,158,11,0.08)";
  const violetColor = isLight ? "rgba(124,58,237,0.07)" : "rgba(124,58,237,0.05)";
  const violetStroke = isLight ? "rgba(124,58,237,0.10)" : "rgba(124,58,237,0.07)";

  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden"
      aria-hidden="true"
    >
      <svg
        className="absolute inset-0 w-full h-full"
        preserveAspectRatio="xMidYMid slice"
      >
        {/* Connecting lines */}
        <line x1="8%" y1="15%" x2="22%" y2="35%" stroke={lineColor} strokeWidth="1" />
        <line x1="22%" y1="35%" x2="38%" y2="20%" stroke={lineColor} strokeWidth="1" />
        <line x1="38%" y1="20%" x2="55%" y2="40%" stroke={lineColor} strokeWidth="1" />
        <line x1="75%" y1="18%" x2="88%" y2="38%" stroke={lineColor} strokeWidth="1" />
        <line x1="88%" y1="38%" x2="78%" y2="60%" stroke={lineColor} strokeWidth="1" />
        <line x1="15%" y1="70%" x2="32%" y2="80%" stroke={lineColor} strokeWidth="1" />
        <line x1="32%" y1="80%" x2="50%" y2="68%" stroke={lineColor} strokeWidth="1" />
        <line x1="60%" y1="75%" x2="78%" y2="60%" stroke={lineColor} strokeWidth="1" />
        <line x1="55%" y1="40%" x2="75%" y2="18%" stroke={lineColor} strokeWidth="1" />
        <line x1="50%" y1="68%" x2="60%" y2="75%" stroke={lineColor} strokeWidth="1" />

        {/* Blue nodes */}
        <circle cx="8%" cy="15%" r="5" fill={nodeColor} stroke={nodeStroke} strokeWidth="1">
          <animateTransform attributeName="transform" type="translate" values="0,0; 3,-5; 0,0" dur="10s" repeatCount="indefinite" />
        </circle>
        <circle cx="22%" cy="35%" r="7" fill={nodeColor} stroke={nodeStroke} strokeWidth="1">
          <animateTransform attributeName="transform" type="translate" values="0,0; -4,6; 0,0" dur="12s" repeatCount="indefinite" />
        </circle>
        <circle cx="55%" cy="40%" r="5" fill={nodeColor} stroke={nodeStroke} strokeWidth="1">
          <animateTransform attributeName="transform" type="translate" values="0,0; 5,3; 0,0" dur="9s" repeatCount="indefinite" />
        </circle>
        <circle cx="88%" cy="38%" r="6" fill={nodeColor} stroke={nodeStroke} strokeWidth="1">
          <animateTransform attributeName="transform" type="translate" values="0,0; -3,-4; 0,0" dur="11s" repeatCount="indefinite" />
        </circle>
        <circle cx="50%" cy="68%" r="5" fill={nodeColor} stroke={nodeStroke} strokeWidth="1">
          <animateTransform attributeName="transform" type="translate" values="0,0; 4,-3; 0,0" dur="10s" repeatCount="indefinite" />
        </circle>

        {/* Amber accent nodes */}
        <circle cx="38%" cy="20%" r="6" fill={accentColor} stroke={accentStroke} strokeWidth="1">
          <animateTransform attributeName="transform" type="translate" values="0,0; -5,4; 0,0" dur="13s" repeatCount="indefinite" />
        </circle>
        <circle cx="32%" cy="80%" r="4" fill={accentColor} stroke={accentStroke} strokeWidth="1">
          <animateTransform attributeName="transform" type="translate" values="0,0; 3,5; 0,0" dur="11s" repeatCount="indefinite" />
        </circle>

        {/* Violet accent nodes */}
        <circle cx="75%" cy="18%" r="4" fill={violetColor} stroke={violetStroke} strokeWidth="1">
          <animateTransform attributeName="transform" type="translate" values="0,0; 4,-6; 0,0" dur="14s" repeatCount="indefinite" />
        </circle>
        <circle cx="78%" cy="60%" r="6" fill={violetColor} stroke={violetStroke} strokeWidth="1">
          <animateTransform attributeName="transform" type="translate" values="0,0; -6,3; 0,0" dur="12s" repeatCount="indefinite" />
        </circle>
        <circle cx="15%" cy="70%" r="5" fill={violetColor} stroke={violetStroke} strokeWidth="1">
          <animateTransform attributeName="transform" type="translate" values="0,0; 5,4; 0,0" dur="10s" repeatCount="indefinite" />
        </circle>
        <circle cx="60%" cy="75%" r="4" fill={nodeColor} stroke={nodeStroke} strokeWidth="1">
          <animateTransform attributeName="transform" type="translate" values="0,0; -3,5; 0,0" dur="11s" repeatCount="indefinite" />
        </circle>
      </svg>
    </div>
  );
}

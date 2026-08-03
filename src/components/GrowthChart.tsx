// Self-contained SVG line chart (no chart library). Renders LOGIC score over
// time. Server-renderable pure component.

export type Point = { x: number; label: string; value: number };

export default function GrowthChart({ points }: { points: Point[] }) {
  const W = 640;
  const H = 220;
  const P = 34; // padding

  if (points.length === 0) {
    return (
      <div className="muted small" style={{ padding: "40px 0", textAlign: "center" }}>
        まだデータがありません。LOGICトレーニングを1問解くとここに成長グラフが表示されます。
      </div>
    );
  }

  const n = points.length;
  const xFor = (i: number) => (n === 1 ? W / 2 : P + (i * (W - 2 * P)) / (n - 1));
  const yFor = (v: number) => H - P - (v / 100) * (H - 2 * P);

  const path = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${xFor(i).toFixed(1)} ${yFor(p.value).toFixed(1)}`)
    .join(" ");
  const area =
    `M ${xFor(0).toFixed(1)} ${(H - P).toFixed(1)} ` +
    points.map((p, i) => `L ${xFor(i).toFixed(1)} ${yFor(p.value).toFixed(1)}`).join(" ") +
    ` L ${xFor(n - 1).toFixed(1)} ${(H - P).toFixed(1)} Z`;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      style={{ display: "block" }}
      role="img"
      aria-label="LOGIC score growth chart"
    >
      {[0, 25, 50, 75, 100].map((g) => (
        <g key={g}>
          <line
            x1={P}
            x2={W - P}
            y1={yFor(g)}
            y2={yFor(g)}
            stroke="#2b3442"
            strokeWidth={1}
          />
          <text x={8} y={yFor(g) + 4} fill="#647082" fontSize={10}>
            {g}
          </text>
        </g>
      ))}
      <path d={area} fill="#6d7cff22" />
      <path d={path} fill="none" stroke="#6d7cff" strokeWidth={2.5} strokeLinejoin="round" />
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={xFor(i)} cy={yFor(p.value)} r={4} fill="#6d7cff" />
          <text
            x={xFor(i)}
            y={yFor(p.value) - 10}
            fill="#e7ebf2"
            fontSize={11}
            textAnchor="middle"
          >
            {p.value}
          </text>
          <text
            x={xFor(i)}
            y={H - P + 16}
            fill="#647082"
            fontSize={10}
            textAnchor="middle"
          >
            {p.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

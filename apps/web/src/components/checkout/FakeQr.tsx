/** QR "de mentirinha" (visual), determinístico a partir de uma string. */
export function FakeQr({ seed, size = 184 }: { seed: string; size?: number }) {
  const n = 29;
  let h = 2166136261;
  for (const ch of seed) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  const rand = () => {
    h ^= h << 13;
    h ^= h >>> 17;
    h ^= h << 5;
    return ((h >>> 0) % 1000) / 1000;
  };
  const finder = (x: number, y: number) => (x < 8 && y < 8) || (x >= n - 8 && y < 8) || (x < 8 && y >= n - 8);
  const cells: string[] = [];
  for (let y = 0; y < n; y++)
    for (let x = 0; x < n; x++) if (!finder(x, y) && rand() > 0.52) cells.push(`M${x} ${y}h1v1h-1z`);
  const eye = (x: number, y: number) => (
    <g key={`${x}-${y}`}>
      <rect x={x} y={y} width={7} height={7} fill="#1E1B18" />
      <rect x={x + 1} y={y + 1} width={5} height={5} fill="#fff" />
      <rect x={x + 2} y={y + 2} width={3} height={3} fill="#1E1B18" />
    </g>
  );
  return (
    <svg viewBox={`-1 -1 ${n + 2} ${n + 2}`} width={size} height={size} shapeRendering="crispEdges" className="rounded-xl bg-white">
      <path d={cells.join("")} fill="#1E1B18" />
      {eye(0, 0)}
      {eye(n - 7, 0)}
      {eye(0, n - 7)}
      <rect x={n / 2 - 3} y={n / 2 - 3} width={6} height={6} rx={1.5} fill="#FF6B35" />
    </svg>
  );
}

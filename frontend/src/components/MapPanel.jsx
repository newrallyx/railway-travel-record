const flattenPoints = (segments = []) => segments.flatMap((segment) => segment.renderGeometry ?? segment.geometry ?? []);

const calcBounds = (points) => {
  if (!points.length) return null;
  const lngs = points.map((p) => p[0]);
  const lats = points.map((p) => p[1]);
  return {
    minLng: Math.min(...lngs),
    maxLng: Math.max(...lngs),
    minLat: Math.min(...lats),
    maxLat: Math.max(...lats)
  };
};

const project = (point, bounds, width, height, padding = 30) => {
  const lngRange = Math.max(bounds.maxLng - bounds.minLng, 0.01);
  const latRange = Math.max(bounds.maxLat - bounds.minLat, 0.01);
  const x = padding + ((point[0] - bounds.minLng) / lngRange) * (width - 2 * padding);
  const y = height - padding - ((point[1] - bounds.minLat) / latRange) * (height - 2 * padding);
  return [x, y];
};

const colors = { hsr: '#dc2626', conventional: '#2563eb' };

export default function MapPanel({ routeResult }) {
  if (!routeResult || !routeResult.ok) {
    return <div className="panel map-panel empty">请输入起点、终点和途经站后计算铁路路径。</div>;
  }

  const width = 820;
  const height = 520;
  const points = flattenPoints(routeResult.segments);
  const bounds = calcBounds(points);
  if (!bounds) {
    return <div className="panel map-panel empty">暂无可绘制路径。</div>;
  }

  return (
    <div className="panel map-panel">
      <h3>铁路路径地图</h3>
      <svg viewBox={`0 0 ${width} ${height}`} className="map-svg" aria-label="铁路路径地图">
        {routeResult.segments.map((segment) => {
          const path = (segment.renderGeometry ?? segment.geometry)
            .map((point) => project(point, bounds, width, height).join(','))
            .join(' ');
          return (
            <polyline
              key={segment.id + segment.fromStationId + segment.toStationId}
              points={path}
              fill="none"
              stroke={colors[segment.railType] ?? '#111827'}
              strokeWidth="4"
              strokeLinecap="round"
            />
          );
        })}
        {routeResult.stationPath.map((station) => {
          const [x, y] = project([station.lng, station.lat], bounds, width, height);
          return (
            <g key={station.id}>
              <circle cx={x} cy={y} r="5" fill="#111827" />
              <text x={x + 8} y={y - 6} fontSize="12" fill="#111827">{station.name}</text>
            </g>
          );
        })}
      </svg>
      <div className="legend"><span className="dot hsr" />高铁 <span className="dot conv" />普速</div>
    </div>
  );
}

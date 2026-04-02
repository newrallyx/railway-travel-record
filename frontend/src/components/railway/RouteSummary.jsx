const MODE_TEXT = {
  auto: '自动',
  hsr_only: '仅高铁',
  conventional_only: '仅普速',
  hsr_preferred: '高铁优先',
  conventional_preferred: '普速优先'
};

export default function RouteSummary({ routeResult }) {
  if (!routeResult) {
    return <div className="card muted">请输入起点、终点和途经站后计算铁路路径。</div>;
  }

  if (!routeResult.ok) {
    return <div className="card error-text">{routeResult.reason || '路径计算失败。'}</div>;
  }

  return (
    <div className="card route-summary">
      <h3>路径结果</h3>
      <p>是否找到路径：成功</p>
      <p>起点站：{routeResult.fromStation.name}</p>
      <p>终点站：{routeResult.toStation.name}</p>
      <p>途经站：{routeResult.viaStations.length ? routeResult.viaStations.map((s) => s.name).join(' → ') : '无'}</p>
      <p>采用模式：{MODE_TEXT[routeResult.mode] ?? routeResult.mode}</p>
      <p>线路/区间：{routeResult.lines.join('、')}</p>
      <p>总里程：{routeResult.totalDistanceKm.toFixed(1)} km</p>
      <p>经过站序：{routeResult.stationPath.map((s) => s.name).join(' → ')}</p>
    </div>
  );
}

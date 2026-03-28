export default function TripDetail({ detail, onDelete, deleting }) {
  if (!detail) {
    return <div className="panel-state">请选择一条旅程查看详情。</div>;
  }

  const { trip, line, fromStation, toStation, segments } = detail;

  return (
    <section className="trip-detail">
      <div className="detail-header">
        <h3>旅程详情</h3>
        <button
          type="button"
          className="danger-button"
          onClick={() => onDelete(trip.id)}
          disabled={deleting}
        >
          {deleting ? '删除中...' : '删除旅程'}
        </button>
      </div>

      <dl>
        <dt>线路</dt><dd>{line?.name || '-'}</dd>
        <dt>起点站</dt><dd>{fromStation?.name || '-'}</dd>
        <dt>终点站</dt><dd>{toStation?.name || '-'}</dd>
        <dt>区段数量</dt><dd>{segments.length}</dd>
        <dt>车次</dt><dd>{trip.trainNumber || '-'}</dd>
        <dt>日期</dt><dd>{trip.travelDate || '-'}</dd>
        <dt>备注</dt><dd>{trip.note || '-'}</dd>
      </dl>

      <h4>区段明细</h4>
      {!segments.length ? (
        <p className="panel-state">该旅程暂无区段数据。</p>
      ) : (
        <ul className="segment-list">
          {segments.map((segment) => (
            <li key={segment.id}>
              {segment.fromStationId} → {segment.toStationId} (#{segment.sequence})
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

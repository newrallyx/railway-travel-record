export default function TripDetail({ trip, onDelete }) {
  if (!trip) {
    return <div className="panel-empty">请选择左侧旅程查看详情。</div>;
  }

  return (
    <div className="trip-detail">
      <h3>{trip.title}</h3>
      <p>模式：{trip.mode}</p>
      <p>日期：{trip.travelDate || '未填写'}</p>
      <p>车次：{trip.trainNumber || '未填写'}</p>
      <p>起终点：{trip.fromStation?.name} → {trip.toStation?.name}</p>
      <p>备注：{trip.note || '无'}</p>
      <h4>区段</h4>
      <ul>
        {trip.tripSegments.map((segment) => (
          <li key={segment.id}>
            [{segment.line?.name || segment.lineId}] {segment.fromStation?.name} → {segment.toStation?.name}
            （{segment.segmentIds.length} 段）
          </li>
        ))}
      </ul>
      <button className="danger-btn" onClick={() => onDelete(trip.id)}>删除当前旅程</button>
    </div>
  );
}

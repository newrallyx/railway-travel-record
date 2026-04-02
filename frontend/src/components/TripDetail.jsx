export default function TripDetail({ trip }) {
  if (!trip) return null;
  return (
    <div className="panel">
      <h3>旅程详情</h3>
      <p>标题：{trip.title}</p>
      <p>起终点：{trip.fromStation?.name} → {trip.toStation?.name}</p>
      <p>路径类型：{trip.routeMode}</p>
      <p>车次：{trip.trainNumber || '无'}</p>
      <p>日期：{trip.travelDate || '无'}</p>
    </div>
  );
}

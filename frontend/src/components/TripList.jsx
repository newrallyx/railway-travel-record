export default function TripList({ trips, selectedTripId, onSelect, loading }) {
  if (loading) return <div className="panel-empty">加载中...</div>;
  if (!trips.length) return <div className="panel-empty">暂无旅程，先新增一条吧。</div>;

  return (
    <ul className="trip-list">
      {trips.map((trip) => (
        <li
          key={trip.id}
          className={trip.id === selectedTripId ? 'trip-item selected' : 'trip-item'}
          onClick={() => onSelect(trip.id)}
        >
          <h4>{trip.title || `${trip.id}`}</h4>
          <p>{trip.travelDate || '未填写日期'}</p>
          <p>{trip.trainNumber || '未填写车次'}</p>
        </li>
      ))}
    </ul>
  );
}

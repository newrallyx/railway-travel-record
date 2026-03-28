export default function TripList({ trips, selectedTripId, onSelect, loading }) {
  if (loading) {
    return <div className="panel-state">正在加载旅程列表...</div>;
  }

  if (!trips.length) {
    return <div className="panel-state">还没有旅程记录，先新增一条吧。</div>;
  }

  return (
    <ul className="trip-list">
      {trips.map((trip) => (
        <li key={trip.id}>
          <button
            type="button"
            onClick={() => onSelect(trip.id)}
            className={trip.id === selectedTripId ? 'trip-item active' : 'trip-item'}
          >
            <div className="trip-route">
              {trip.fromStationName} → {trip.toStationName}
            </div>
            <div className="trip-meta">{trip.lineName}</div>
            <div className="trip-meta">{trip.travelDate || '未填写日期'} {trip.trainNumber ? `· ${trip.trainNumber}` : ''}</div>
          </button>
        </li>
      ))}
    </ul>
  );
}

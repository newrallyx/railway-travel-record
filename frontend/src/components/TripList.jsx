export default function TripList({ trips, onSelect }) {
  return (
    <div className="panel">
      <h3>已保存旅程</h3>
      {trips.length === 0 ? <p className="muted">暂无旅程记录。</p> : null}
      <div className="trip-list">
        {trips.map((trip) => (
          <button key={trip.id} type="button" className="trip-item" onClick={() => onSelect(trip)}>
            <strong>{trip.title}</strong>
            <span>{trip.fromStation?.name} → {trip.toStation?.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

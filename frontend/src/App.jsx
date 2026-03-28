import { useEffect, useState } from 'react';
import { api } from './api';
import TripList from './components/TripList';
import TripDetail from './components/TripDetail';
import TripForm from './components/TripForm';
import MapPanel from './components/MapPanel';

export default function App() {
  const [stations, setStations] = useState([]);
  const [lines, setLines] = useState([]);
  const [segments, setSegments] = useState([]);
  const [trips, setTrips] = useState([]);
  const [selectedTripId, setSelectedTripId] = useState(null);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadMeta = async () => {
    const [stationsData, linesData, segmentsData] = await Promise.all([
      api.getStations(),
      api.getLines(),
      api.getSegments()
    ]);
    setStations(stationsData);
    setLines(linesData);
    setSegments(segmentsData);
  };

  const loadTrips = async (preferredTripId = null) => {
    const tripList = await api.getTrips();
    setTrips(tripList);

    const nextId = preferredTripId ?? selectedTripId ?? tripList[0]?.id ?? null;
    setSelectedTripId(nextId);
    if (nextId) {
      const detail = await api.getTripById(nextId);
      setSelectedTrip(detail);
    } else {
      setSelectedTrip(null);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      setError('');
      try {
        await loadMeta();
        await loadTrips();
      } catch (err) {
        setError(err.message || '初始化失败');
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  const handleSelectTrip = async (tripId) => {
    setSelectedTripId(tripId);
    try {
      const detail = await api.getTripById(tripId);
      setSelectedTrip(detail);
    } catch (err) {
      setError(err.message || '加载旅程详情失败');
    }
  };

  const handleCreateTrip = async (payload) => {
    try {
      const created = await api.createTrip(payload);
      await loadTrips(created.id);
      setSelectedTrip(created);
      setError('');
    } catch (err) {
      setError(err.message || '新增旅程失败');
    }
  };

  const handleDeleteTrip = async (tripId) => {
    try {
      await api.deleteTrip(tripId);
      const left = trips.filter((item) => item.id !== tripId);
      const nextId = left[0]?.id ?? null;
      setTrips(left);
      setSelectedTripId(nextId);
      if (nextId) {
        const detail = await api.getTripById(nextId);
        setSelectedTrip(detail);
      } else {
        setSelectedTrip(null);
      }
      setError('');
    } catch (err) {
      setError(err.message || '删除旅程失败');
    }
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <h2>铁路旅程</h2>
        <TripList
          trips={trips}
          selectedTripId={selectedTripId}
          onSelect={handleSelectTrip}
          loading={loading}
        />
        <TripForm lines={lines} segments={segments} stations={stations} onCreate={handleCreateTrip} />
      </aside>

      <main className="main-content">
        <MapPanel trip={selectedTrip} />
        <section className="detail-panel">
          {error && <div className="error-banner">{error}</div>}
          <TripDetail trip={selectedTrip} onDelete={handleDeleteTrip} />
        </section>
      </main>
    </div>
  );
}

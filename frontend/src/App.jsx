import { useEffect, useMemo, useState } from 'react';
import { api } from './api';
import TripList from './components/TripList';
import TripDetail from './components/TripDetail';
import TripForm from './components/TripForm';
import MapPanel from './components/MapPanel';

export default function App() {
  const [stations, setStations] = useState([]);
  const [lines, setLines] = useState([]);
  const [trips, setTrips] = useState([]);
  const [selectedTripId, setSelectedTripId] = useState('');
  const [selectedTripDetail, setSelectedTripDetail] = useState(null);

  const [loading, setLoading] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const selectedSummary = useMemo(
    () => trips.find((trip) => trip.id === selectedTripId),
    [trips, selectedTripId]
  );

  const fetchBaseData = async () => {
    setLoading(true);
    setError('');
    try {
      const [loadedStations, loadedLines, loadedTrips] = await Promise.all([
        api.getStations(),
        api.getLines(),
        api.getTrips()
      ]);
      setStations(loadedStations);
      setLines(loadedLines);
      setTrips(loadedTrips);
      setSelectedTripId((prev) => prev || loadedTrips[0]?.id || '');
    } catch (loadError) {
      setError(loadError.message || '加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBaseData();
  }, []);

  useEffect(() => {
    if (!selectedTripId) {
      setSelectedTripDetail(null);
      return;
    }

    let active = true;

    const fetchTripDetail = async () => {
      setLoadingDetail(true);
      try {
        const detail = await api.getTripDetail(selectedTripId);
        if (active) {
          setSelectedTripDetail(detail);
        }
      } catch (detailError) {
        if (active) {
          setError(detailError.message || '加载详情失败');
          setSelectedTripDetail(null);
        }
      } finally {
        if (active) {
          setLoadingDetail(false);
        }
      }
    };

    fetchTripDetail();

    return () => {
      active = false;
    };
  }, [selectedTripId]);

  const handleCreateTrip = async (form) => {
    setSubmitting(true);
    try {
      const created = await api.createTrip(form);
      const refreshedTrips = await api.getTrips();
      setTrips(refreshedTrips);
      setSelectedTripId(created.trip.id);
      setSelectedTripDetail(created);
      return created;
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTrip = async (tripId) => {
    const sure = window.confirm('确认删除该旅程吗？删除后不可恢复。');
    if (!sure) {
      return;
    }

    setDeleting(true);
    try {
      await api.deleteTrip(tripId);
      const refreshedTrips = await api.getTrips();
      setTrips(refreshedTrips);

      if (!refreshedTrips.length) {
        setSelectedTripId('');
        setSelectedTripDetail(null);
        return;
      }

      if (tripId === selectedTripId) {
        setSelectedTripId(refreshedTrips[0].id);
      }
    } catch (deleteError) {
      setError(deleteError.message || '删除失败');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <main className="app-shell">
      <header className="app-header">
        <h1>Railway Track Recorder</h1>
        <p>铁路乘车轨迹记录 / 展示 / 回顾（MVP）</p>
      </header>

      {error && <div className="error-banner">{error}</div>}

      <section className="layout-grid">
        <aside className="left-column card">
          <TripForm lines={lines} stations={stations} onSubmit={handleCreateTrip} submitting={submitting} />
          <h3>旅程列表</h3>
          <TripList
            trips={trips}
            selectedTripId={selectedTripId}
            onSelect={setSelectedTripId}
            loading={loading}
          />
        </aside>

        <section className="right-column">
          <div className="card map-card">
            <MapPanel detail={selectedTripDetail} />
          </div>

          <div className="card detail-card">
            {loadingDetail && selectedSummary ? (
              <div className="panel-state">正在加载详情...</div>
            ) : (
              <TripDetail detail={selectedTripDetail} onDelete={handleDeleteTrip} deleting={deleting} />
            )}
          </div>
        </section>
      </section>
    </main>
  );
}

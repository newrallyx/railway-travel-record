import { useEffect, useMemo, useState } from 'react';
import { api } from './api';
import TripForm from './components/TripForm';
import MapPanel from './components/MapPanel';
import TripList from './components/TripList';
import TripDetail from './components/TripDetail';
import RouteSummary from './components/railway/RouteSummary';

const hydrateTrip = (trip) => ({
  ...trip,
  fromStation: trip.routeResult?.fromStation ?? null,
  toStation: trip.routeResult?.toStation ?? null,
  viaStations: trip.routeResult?.viaStations ?? []
});

export default function App() {
  const [routeResult, setRouteResult] = useState(null);
  const [trips, setTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.listTrips().then((data) => setTrips(data.map(hydrateTrip))).catch(() => setTrips([]));
  }, []);

  const searchStations = useMemo(() => async (keyword) => api.searchStations(keyword), []);

  const handleCalculate = async (form) => {
    if (!form.fromStation || !form.toStation) {
      setError('请先选择起点站和终点站。');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const data = await api.findRoute({
        fromStationId: form.fromStation.id,
        toStationId: form.toStation.id,
        viaStationIds: form.viaStations.filter(Boolean).map((item) => item.id),
        mode: form.routeMode
      });
      setRouteResult(data);
      if (!data.ok) {
        setError(data.reason);
      }
    } catch (e) {
      setError(e.message || '路径计算失败。');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (form) => {
    if (!routeResult || !routeResult.ok) {
      setError('请先计算可用路径后再保存旅程。');
      return;
    }

    setSaving(true);
    try {
      const saved = await api.saveTrip({
        id: selectedTrip?.id,
        title: form.title,
        inputMode: form.inputMode,
        fromStationId: form.fromStation?.id,
        toStationId: form.toStation?.id,
        viaStationIds: form.viaStations.filter(Boolean).map((item) => item.id),
        routeMode: form.routeMode,
        trainNumber: form.trainNumber,
        travelDate: form.travelDate,
        note: form.note,
        routeResult
      });
      const hydrated = hydrateTrip(saved);
      setTrips((prev) => [hydrated, ...prev.filter((item) => item.id !== hydrated.id)]);
      setSelectedTrip(hydrated);
    } catch (e) {
      setError(e.message || '保存失败。');
    } finally {
      setSaving(false);
    }
  };

  const handleSelectTrip = (trip) => {
    setSelectedTrip(trip);
    setRouteResult(trip.routeResult ?? null);
    setError('');
  };

  return (
    <main className="app-shell app-layout">
      <aside className="left-column">
        <TripForm
          selectedTrip={selectedTrip}
          searchStations={searchStations}
          onCalculate={handleCalculate}
          onSave={handleSave}
          loading={loading}
          saving={saving}
          error={error}
        />
        <RouteSummary routeResult={routeResult} />
        <TripList trips={trips} onSelect={handleSelectTrip} />
        <TripDetail trip={selectedTrip} />
      </aside>
      <section className="right-column">
        <MapPanel routeResult={routeResult} />
      </section>
    </main>
  );
}

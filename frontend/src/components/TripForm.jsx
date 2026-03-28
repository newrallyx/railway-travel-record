import { useMemo, useState } from 'react';

const initialState = {
  mode: 'manual',
  title: '',
  lineId: '',
  fromStationId: '',
  toStationId: '',
  trainNumber: '',
  travelDate: '',
  note: ''
};

export default function TripForm({ lines, segments, stations, onCreate }) {
  const [form, setForm] = useState(initialState);
  const [submitting, setSubmitting] = useState(false);

  const lineSegments = useMemo(() => {
    return segments
      .filter((segment) => segment.lineId === form.lineId)
      .sort((a, b) => a.sequence - b.sequence);
  }, [segments, form.lineId]);

  const stationMap = useMemo(() => new Map(stations.map((station) => [station.id, station])), [stations]);

  const orderedStations = useMemo(() => {
    if (!lineSegments.length) return [];
    const ids = [lineSegments[0].fromStationId, ...lineSegments.map((segment) => segment.toStationId)];
    return ids.map((id) => stationMap.get(id)).filter(Boolean);
  }, [lineSegments, stationMap]);

  const onSubmit = async (event) => {
    event.preventDefault();
    if (!form.lineId || !form.fromStationId || !form.toStationId) return;

    setSubmitting(true);
    try {
      await onCreate({
        mode: form.mode,
        title: form.title,
        trainNumber: form.trainNumber,
        travelDate: form.travelDate || null,
        note: form.note,
        tripSegments: [
          {
            lineId: form.lineId,
            fromStationId: form.fromStationId,
            toStationId: form.toStationId,
            trainNumber: form.trainNumber,
            travelDate: form.travelDate || null,
            note: form.note,
            segmentIds: []
          }
        ]
      });

      setForm(initialState);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="trip-form" onSubmit={onSubmit}>
      <h3>新增旅程</h3>
      <label>
        录入方式
        <select value={form.mode} onChange={(e) => setForm((prev) => ({ ...prev, mode: e.target.value }))}>
          <option value="manual">手动录入单段</option>
          <option value="preset">选择预置线路区段</option>
        </select>
      </label>
      <label>
        标题
        <input value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} placeholder="例如：周末返程" />
      </label>
      <label>
        线路
        <select value={form.lineId} onChange={(e) => setForm((prev) => ({ ...prev, lineId: e.target.value, fromStationId: '', toStationId: '' }))} required>
          <option value="">请选择线路</option>
          {lines.map((line) => (
            <option value={line.id} key={line.id}>{line.name}</option>
          ))}
        </select>
      </label>
      <label>
        起点站
        <select value={form.fromStationId} onChange={(e) => setForm((prev) => ({ ...prev, fromStationId: e.target.value }))} required>
          <option value="">请选择起点</option>
          {orderedStations.map((station) => (
            <option key={`from-${station.id}`} value={station.id}>{station.name}</option>
          ))}
        </select>
      </label>
      <label>
        终点站
        <select value={form.toStationId} onChange={(e) => setForm((prev) => ({ ...prev, toStationId: e.target.value }))} required>
          <option value="">请选择终点</option>
          {orderedStations.map((station) => (
            <option key={`to-${station.id}`} value={station.id}>{station.name}</option>
          ))}
        </select>
      </label>
      <label>
        车次（可选）
        <input value={form.trainNumber} onChange={(e) => setForm((prev) => ({ ...prev, trainNumber: e.target.value }))} />
      </label>
      <label>
        日期（可选）
        <input type="date" value={form.travelDate} onChange={(e) => setForm((prev) => ({ ...prev, travelDate: e.target.value }))} />
      </label>
      <label>
        备注（可选）
        <textarea value={form.note} onChange={(e) => setForm((prev) => ({ ...prev, note: e.target.value }))} />
      </label>
      <button type="submit" disabled={submitting}>{submitting ? '提交中...' : '新增旅程'}</button>
    </form>
  );
}

import { useMemo, useState } from 'react';

const initialForm = {
  lineId: '',
  fromStationId: '',
  toStationId: '',
  trainNumber: '',
  travelDate: '',
  note: ''
};

export default function TripForm({ lines, stations, onSubmit, submitting }) {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');

  const filteredStations = useMemo(() => {
    const line = lines.find((item) => item.id === form.lineId);
    if (!line) return [];

    return line.stationIds
      .map((stationId) => stations.find((station) => station.id === stationId))
      .filter(Boolean);
  }, [lines, stations, form.lineId]);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));

    if (key === 'lineId') {
      setForm((prev) => ({ ...prev, lineId: value, fromStationId: '', toStationId: '' }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!form.lineId || !form.fromStationId || !form.toStationId) {
      setError('请先选择线路、起点站、终点站。');
      return;
    }

    try {
      await onSubmit(form);
      setForm(initialForm);
    } catch (submitError) {
      setError(submitError.message || '新增失败');
    }
  };

  return (
    <form className="trip-form" onSubmit={handleSubmit}>
      <h3>新增旅程</h3>
      <label>
        线路
        <select value={form.lineId} onChange={(e) => handleChange('lineId', e.target.value)}>
          <option value="">请选择线路</option>
          {lines.map((line) => (
            <option key={line.id} value={line.id}>{line.name}</option>
          ))}
        </select>
      </label>
      <label>
        起点站
        <select
          value={form.fromStationId}
          disabled={!form.lineId}
          onChange={(e) => handleChange('fromStationId', e.target.value)}
        >
          <option value="">请选择起点站</option>
          {filteredStations.map((station) => (
            <option key={station.id} value={station.id}>{station.name}</option>
          ))}
        </select>
      </label>
      <label>
        终点站
        <select
          value={form.toStationId}
          disabled={!form.lineId}
          onChange={(e) => handleChange('toStationId', e.target.value)}
        >
          <option value="">请选择终点站</option>
          {filteredStations.map((station) => (
            <option key={station.id} value={station.id}>{station.name}</option>
          ))}
        </select>
      </label>
      <label>
        车次（可选）
        <input value={form.trainNumber} onChange={(e) => handleChange('trainNumber', e.target.value)} placeholder="如 G1234" />
      </label>
      <label>
        日期（可选）
        <input type="date" value={form.travelDate} onChange={(e) => handleChange('travelDate', e.target.value)} />
      </label>
      <label>
        备注（可选）
        <textarea value={form.note} onChange={(e) => handleChange('note', e.target.value)} rows={3} placeholder="记录本次出行体验" />
      </label>

      {error && <p className="error-text">{error}</p>}

      <button type="submit" className="primary-button" disabled={submitting}>
        {submitting ? '提交中...' : '保存旅程'}
      </button>
    </form>
  );
}

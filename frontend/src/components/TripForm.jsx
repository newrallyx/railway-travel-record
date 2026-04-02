import { useMemo, useState } from 'react';
import StationAutocomplete from './railway/StationAutocomplete';
import ViaStationList from './railway/ViaStationList';

const MODE_OPTIONS = [
  { value: 'auto', label: '自动' },
  { value: 'hsr_only', label: '仅高铁' },
  { value: 'conventional_only', label: '仅普速' },
  { value: 'hsr_preferred', label: '高铁优先' },
  { value: 'conventional_preferred', label: '普速优先' }
];

const createInitialForm = () => ({
  inputMode: '手动录入',
  title: '',
  fromStation: null,
  toStation: null,
  viaStations: [],
  routeMode: 'auto',
  trainNumber: '',
  travelDate: '',
  note: ''
});

export default function TripForm({
  selectedTrip,
  searchStations,
  onCalculate,
  onSave,
  loading,
  saving,
  error
}) {
  const [form, setForm] = useState(createInitialForm);

  const effectiveForm = useMemo(() => {
    if (!selectedTrip) return form;
    return {
      inputMode: selectedTrip.inputMode ?? '手动录入',
      title: selectedTrip.title ?? '',
      fromStation: selectedTrip.fromStation ?? null,
      toStation: selectedTrip.toStation ?? null,
      viaStations: selectedTrip.viaStations ?? [],
      routeMode: selectedTrip.routeMode ?? 'auto',
      trainNumber: selectedTrip.trainNumber ?? '',
      travelDate: selectedTrip.travelDate ?? '',
      note: selectedTrip.note ?? ''
    };
  }, [selectedTrip, form]);

  const updateForm = (patch) => setForm((prev) => ({ ...prev, ...patch }));
  const current = selectedTrip ? effectiveForm : form;

  const canCalculate = current.fromStation && current.toStation && !loading;

  const handleCalculate = (event) => {
    event.preventDefault();
    onCalculate(current);
  };

  return (
    <form className="panel" onSubmit={handleCalculate}>
      <h2>铁路旅程录入</h2>
      <div className="field">
        <label>录入方式</label>
        <input value={current.inputMode} onChange={(e) => updateForm({ inputMode: e.target.value })} />
      </div>
      <div className="field">
        <label>标题</label>
        <input value={current.title} onChange={(e) => updateForm({ title: e.target.value })} placeholder="例如：清明上海出差" />
      </div>

      <StationAutocomplete
        label="起点站"
        placeholder="请输入起点站"
        value={current.fromStation}
        onSelect={(station) => updateForm({ fromStation: station })}
        searchStations={searchStations}
      />

      <StationAutocomplete
        label="终点站"
        placeholder="请输入终点站"
        value={current.toStation}
        onSelect={(station) => updateForm({ toStation: station })}
        searchStations={searchStations}
      />

      <ViaStationList
        items={current.viaStations}
        onChange={(viaStations) => updateForm({ viaStations })}
        searchStations={searchStations}
      />

      <div className="field">
        <label>路径类型</label>
        <select value={current.routeMode} onChange={(e) => updateForm({ routeMode: e.target.value })}>
          {MODE_OPTIONS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
        </select>
      </div>

      <div className="field"><label>车次（可选）</label><input value={current.trainNumber} onChange={(e) => updateForm({ trainNumber: e.target.value })} /></div>
      <div className="field"><label>日期（可选）</label><input type="date" value={current.travelDate} onChange={(e) => updateForm({ travelDate: e.target.value })} /></div>
      <div className="field"><label>备注（可选）</label><textarea rows={3} value={current.note} onChange={(e) => updateForm({ note: e.target.value })} /></div>

      {error ? <div className="error-text">{error}</div> : null}

      <div className="form-actions">
        <button type="submit" disabled={!canCalculate}>{loading ? '计算中...' : '计算路径'}</button>
        <button type="button" onClick={() => setForm(createInitialForm())}>新增旅程</button>
        <button type="button" disabled={saving} onClick={() => onSave(current)}>{saving ? '保存中...' : '保存旅程'}</button>
      </div>
    </form>
  );
}

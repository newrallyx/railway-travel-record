import StationAutocomplete from './StationAutocomplete';

export default function ViaStationList({ items, onChange, searchStations }) {
  const updateItem = (index, station) => {
    const next = [...items];
    next[index] = station;
    onChange(next);
  };

  const removeItem = (index) => onChange(items.filter((_, i) => i !== index));

  const moveItem = (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return (
    <div className="field via-list">
      <label>途经站</label>
      {items.length === 0 ? <small className="muted">当前无途经站，可按需添加。</small> : null}
      {items.map((station, index) => (
        <div className="via-row" key={`via-${index}`}>
          <StationAutocomplete
            label={`途经站 ${index + 1}`}
            placeholder="请输入途经站"
            value={station}
            onSelect={(selected) => updateItem(index, selected)}
            searchStations={searchStations}
          />
          <div className="via-actions">
            <button type="button" onClick={() => moveItem(index, -1)}>上移</button>
            <button type="button" onClick={() => moveItem(index, 1)}>下移</button>
            <button type="button" className="danger" onClick={() => removeItem(index)}>删除</button>
          </div>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...items, null])}>+ 添加途经站</button>
    </div>
  );
}

import { useEffect, useState } from 'react';

export default function StationAutocomplete({
  label,
  placeholder,
  value,
  onSelect,
  searchStations,
  error
}) {
  const [keyword, setKeyword] = useState(value?.name ?? '');
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const [hint, setHint] = useState('');

  useEffect(() => {
    setKeyword(value?.name ?? '');
  }, [value?.id, value?.name]);

  useEffect(() => {
    const q = keyword.trim();
    if (!showPanel || !q) {
      setOptions([]);
      setHint('');
      return;
    }

    let disposed = false;
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const result = await searchStations(q);
        if (disposed) return;
        setOptions(result);
        setHint(result.length === 0 ? '未找到匹配站点，请尝试更完整的站名。' : '');
      } catch {
        if (!disposed) setHint('站点搜索失败，请稍后重试。');
      } finally {
        if (!disposed) setLoading(false);
      }
    }, 280);

    return () => {
      disposed = true;
      clearTimeout(timer);
    };
  }, [keyword, searchStations, showPanel]);

  return (
    <div className="field">
      <label>{label}</label>
      <input
        value={keyword}
        placeholder={placeholder}
        onFocus={() => setShowPanel(true)}
        onBlur={() => setTimeout(() => setShowPanel(false), 140)}
        onChange={(event) => {
          setKeyword(event.target.value);
          if (!event.target.value.trim()) onSelect(null);
        }}
      />
      {error ? <small className="error-text">{error}</small> : null}
      {showPanel && keyword.trim() ? (
        <div className="autocomplete-panel">
          {loading ? <div className="autocomplete-item muted">搜索中...</div> : null}
          {!loading && options.map((station) => (
            <button
              key={station.id}
              className="autocomplete-item"
              type="button"
              onClick={() => {
                onSelect(station);
                setKeyword(station.name);
                setShowPanel(false);
              }}
            >
              <strong>{station.name}</strong>
              <span>{[station.city, station.province].filter(Boolean).join(' / ') || (station.aliases?.join(' / ') ?? '')}</span>
            </button>
          ))}
          {!loading && hint ? <div className="autocomplete-item muted">{hint}</div> : null}
        </div>
      ) : null}
    </div>
  );
}

const calcScore = (station, keyword) => {
  const name = station.name.toLowerCase();
  const aliases = (station.aliases ?? []).map((alias) => alias.toLowerCase());

  if (name === keyword) return 100;
  if (aliases.includes(keyword)) return 95;
  if (name.startsWith(keyword)) return 90;
  if (aliases.some((alias) => alias.startsWith(keyword))) return 80;
  if (name.includes(keyword)) return 70;
  if (aliases.some((alias) => alias.includes(keyword))) return 60;
  return 0;
};

export const searchStations = (stations, query, limit = 8) => {
  const keyword = `${query ?? ''}`.trim().toLowerCase();
  if (!keyword) {
    return [];
  }

  const scored = [];
  const seen = new Set();

  for (const station of stations) {
    if (seen.has(station.id)) continue;
    const score = calcScore(station, keyword);
    if (score <= 0) continue;
    seen.add(station.id);
    scored.push({ station, score });
  }

  scored.sort((a, b) => b.score - a.score || a.station.name.localeCompare(b.station.name, 'zh-CN'));

  return scored.slice(0, limit).map(({ station }) => ({
    id: station.id,
    name: station.name,
    aliases: station.aliases ?? [],
    lng: station.lng,
    lat: station.lat,
    city: station.city,
    province: station.province
  }));
};

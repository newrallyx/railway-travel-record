export const searchStations = (stations, query, limit = 8) => {
  const keyword = `${query ?? ''}`.trim().toLowerCase();
  if (!keyword) {
    return [];
  }

  const uniq = new Map();
  for (const station of stations) {
    const haystack = [station.name, ...(station.aliases ?? [])].join('|').toLowerCase();
    if (haystack.includes(keyword) && !uniq.has(station.id)) {
      uniq.set(station.id, {
        id: station.id,
        name: station.name,
        aliases: station.aliases ?? [],
        lng: station.lng,
        lat: station.lat
      });
    }
  }

  return Array.from(uniq.values()).slice(0, limit);
};

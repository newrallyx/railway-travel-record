export const buildGraph = (segments, filter) => {
  const adjacency = new Map();

  for (const segment of segments) {
    if (filter && !filter(segment)) {
      continue;
    }

    const addEdge = (from, to, reversed) => {
      const list = adjacency.get(from) ?? [];
      list.push({
        to,
        segment,
        reversed
      });
      adjacency.set(from, list);
    };

    addEdge(segment.fromStationId, segment.toStationId, false);
    addEdge(segment.toStationId, segment.fromStationId, true);
  }

  return adjacency;
};

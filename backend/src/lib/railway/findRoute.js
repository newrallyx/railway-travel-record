import { buildGraph } from './buildGraph.js';

const MODE_WEIGHTERS = {
  auto: (segment) => segment.distanceKm ?? 1,
  hsr_only: (segment) => segment.distanceKm ?? 1,
  conventional_only: (segment) => segment.distanceKm ?? 1,
  hsr_preferred: (segment) => (segment.distanceKm ?? 1) * (segment.railType === 'hsr' ? 1 : 1.8),
  conventional_preferred: (segment) => (segment.distanceKm ?? 1) * (segment.railType === 'conventional' ? 1 : 1.8)
};

const MODE_FILTERS = {
  auto: () => true,
  hsr_only: (segment) => segment.railType === 'hsr',
  conventional_only: (segment) => segment.railType === 'conventional',
  hsr_preferred: () => true,
  conventional_preferred: () => true
};

const dijkstra = ({ adjacency, startId, endId, weightFn }) => {
  const dist = new Map([[startId, 0]]);
  const prev = new Map();
  const visited = new Set();

  while (true) {
    let current = null;
    let bestDistance = Number.POSITIVE_INFINITY;

    for (const [node, d] of dist.entries()) {
      if (!visited.has(node) && d < bestDistance) {
        bestDistance = d;
        current = node;
      }
    }

    if (!current) {
      return null;
    }

    if (current === endId) {
      break;
    }

    visited.add(current);
    const neighbors = adjacency.get(current) ?? [];
    for (const neighbor of neighbors) {
      if (visited.has(neighbor.to)) {
        continue;
      }

      const nextDistance = bestDistance + weightFn(neighbor.segment);
      const currentBest = dist.get(neighbor.to);
      if (currentBest === undefined || nextDistance < currentBest) {
        dist.set(neighbor.to, nextDistance);
        prev.set(neighbor.to, { node: current, edge: neighbor });
      }
    }
  }

  const edges = [];
  let cursor = endId;
  while (cursor !== startId) {
    const meta = prev.get(cursor);
    if (!meta) {
      return null;
    }
    edges.push(meta.edge);
    cursor = meta.node;
  }

  edges.reverse();
  return edges;
};

const mergeStationPath = (base, next) => {
  if (base.length === 0) {
    return [...next];
  }

  if (base[base.length - 1] === next[0]) {
    return [...base, ...next.slice(1)];
  }

  return [...base, ...next];
};

export const findRoute = ({ stations, segments, fromStationId, toStationId, viaStationIds = [], mode = 'auto' }) => {
  const filter = MODE_FILTERS[mode] ?? MODE_FILTERS.auto;
  const weightFn = MODE_WEIGHTERS[mode] ?? MODE_WEIGHTERS.auto;

  const allTargets = [fromStationId, ...viaStationIds, toStationId].filter(Boolean);
  if (allTargets.length < 2) {
    return { ok: false, reason: '起点和终点不能为空。' };
  }

  const stationMap = new Map(stations.map((station) => [station.id, station]));
  for (const stationId of allTargets) {
    if (!stationMap.has(stationId)) {
      return { ok: false, reason: `未找到站点：${stationId}` };
    }
  }

  const adjacency = buildGraph(segments, filter);

  const mergedSegments = [];
  let mergedStations = [];
  let totalDistanceKm = 0;

  for (let i = 0; i < allTargets.length - 1; i += 1) {
    const start = allTargets[i];
    const end = allTargets[i + 1];
    const pathEdges = dijkstra({ adjacency, startId: start, endId: end, weightFn });

    if (!pathEdges) {
      return {
        ok: false,
        reason: '当前筛选条件下未找到可达路径。',
        failedLeg: { fromStationId: start, toStationId: end }
      };
    }

    const stationSeq = [start, ...pathEdges.map((edge) => edge.to)];
    mergedStations = mergeStationPath(mergedStations, stationSeq);

    for (const edge of pathEdges) {
      mergedSegments.push({
        ...edge.segment,
        direction: edge.reversed ? 'reverse' : 'forward',
        renderGeometry: edge.reversed ? [...edge.segment.geometry].reverse() : edge.segment.geometry
      });
      totalDistanceKm += edge.segment.distanceKm ?? 0;
    }
  }

  const uniqueLineNames = [...new Set(mergedSegments.map((segment) => segment.lineName))];
  const usedRailTypes = [...new Set(mergedSegments.map((segment) => segment.railType))];

  return {
    ok: true,
    fromStation: stationMap.get(fromStationId),
    toStation: stationMap.get(toStationId),
    viaStations: viaStationIds.map((id) => stationMap.get(id)),
    mode,
    usedRailTypes,
    lines: uniqueLineNames,
    totalDistanceKm,
    stationPath: mergedStations.map((stationId) => stationMap.get(stationId)),
    segments: mergedSegments
  };
};

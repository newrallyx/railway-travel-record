import express from 'express';
import cors from 'cors';
import { loadBaseData, saveTrips } from './dataStore.js';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

let stations = [];
let lines = [];
let segments = [];
let trips = [];

const stationMap = () => new Map(stations.map((station) => [station.id, station]));
const lineMap = () => new Map(lines.map((line) => [line.id, line]));
const segmentMap = () => new Map(segments.map((segment) => [segment.id, segment]));

const ok = (res, data, status = 200) => res.status(status).json({ success: true, data });

const fail = (res, status, message, details) =>
  res.status(status).json({ success: false, error: { message, details } });

const sortTrips = (targetTrips) =>
  [...targetTrips].sort((a, b) => {
    const aDate = a.travelDate ?? a.createdAt;
    const bDate = b.travelDate ?? b.createdAt;
    return String(bDate).localeCompare(String(aDate));
  });

const findLineSegmentsBetweenStations = (line, fromStationId, toStationId) => {
  const fromIndex = line.stationIds.indexOf(fromStationId);
  const toIndex = line.stationIds.indexOf(toStationId);

  if (fromIndex < 0 || toIndex < 0) {
    throw new Error('起点站或终点站不在线路上');
  }
  if (fromIndex === toIndex) {
    throw new Error('起点站和终点站不能相同');
  }

  const forward = fromIndex < toIndex;
  const start = Math.min(fromIndex, toIndex);
  const end = Math.max(fromIndex, toIndex);

  const targetSegments = [];
  for (let i = start; i < end; i += 1) {
    const startStation = line.stationIds[i];
    const endStation = line.stationIds[i + 1];

    const matched = segments.find(
      (segment) =>
        segment.lineId === line.id &&
        ((segment.fromStationId === startStation && segment.toStationId === endStation) ||
          (segment.fromStationId === endStation && segment.toStationId === startStation))
    );

    if (!matched) {
      throw new Error('线路区段数据缺失，无法生成旅程');
    }

    targetSegments.push(matched);
  }

  return forward ? targetSegments : targetSegments.reverse();
};

const orientSegmentCoordinates = (segment, fromStationId, toStationId) => {
  if (segment.fromStationId === fromStationId && segment.toStationId === toStationId) {
    return segment.coordinates;
  }
  return [...segment.coordinates].reverse();
};

const buildTripSummary = (trip) => {
  const stationsById = stationMap();
  const linesById = lineMap();
  const line = linesById.get(trip.lineId);
  const fromStation = stationsById.get(trip.fromStationId);
  const toStation = stationsById.get(trip.toStationId);

  return {
    id: trip.id,
    lineId: trip.lineId,
    lineName: line?.name ?? '未知线路',
    fromStationId: trip.fromStationId,
    fromStationName: fromStation?.name ?? '未知车站',
    toStationId: trip.toStationId,
    toStationName: toStation?.name ?? '未知车站',
    trainNumber: trip.trainNumber,
    travelDate: trip.travelDate,
    segmentCount: trip.segmentIds.length,
    createdAt: trip.createdAt,
    updatedAt: trip.updatedAt
  };
};

const buildTripDetail = (trip) => {
  const stationsById = stationMap();
  const linesById = lineMap();
  const segmentsById = segmentMap();

  const line = linesById.get(trip.lineId);
  if (!line) {
    throw new Error('旅程线路不存在');
  }

  const segmentEntities = trip.segmentIds
    .map((segmentId) => segmentsById.get(segmentId))
    .filter(Boolean);

  const coordinates = [];
  let prevStationId = trip.fromStationId;

  segmentEntities.forEach((segment, index) => {
    const nextStationId =
      index === segmentEntities.length - 1
        ? trip.toStationId
        : line.stationIds.includes(segment.toStationId)
          ? segment.toStationId
          : segment.fromStationId;

    const oriented = orientSegmentCoordinates(segment, prevStationId, nextStationId);
    oriented.forEach((point, pointIndex) => {
      if (index > 0 && pointIndex === 0) {
        return;
      }
      coordinates.push(point);
    });

    prevStationId = nextStationId;
  });

  return {
    trip,
    line,
    fromStation: stationsById.get(trip.fromStationId) ?? null,
    toStation: stationsById.get(trip.toStationId) ?? null,
    segments: segmentEntities,
    coordinates
  };
};

app.get('/healthz', (_req, res) => {
  ok(res, { status: 'ok', service: 'railway-track-recorder-backend' });
});

app.get('/api/stations', (_req, res) => {
  ok(res, stations);
});

app.get('/api/lines', (_req, res) => {
  ok(res, lines);
});

app.get('/api/segments', (req, res) => {
  const { lineId } = req.query;
  const result = lineId ? segments.filter((segment) => segment.lineId === lineId) : segments;
  ok(res, result);
});

app.get('/api/trips', (_req, res) => {
  const summaries = sortTrips(trips).map(buildTripSummary);
  ok(res, summaries);
});

app.get('/api/trips/:id', (req, res) => {
  const trip = trips.find((item) => item.id === req.params.id);
  if (!trip) {
    return fail(res, 404, '旅程不存在');
  }

  try {
    return ok(res, buildTripDetail(trip));
  } catch (error) {
    return fail(res, 500, error.message);
  }
});

app.post('/api/trips', async (req, res) => {
  try {
    const { lineId, fromStationId, toStationId, trainNumber, travelDate, note } = req.body ?? {};

    if (!lineId || !fromStationId || !toStationId) {
      return fail(res, 400, 'lineId、fromStationId、toStationId 为必填字段');
    }

    const line = lines.find((item) => item.id === lineId);
    if (!line) {
      return fail(res, 400, 'lineId 不合法');
    }

    const orderedSegments = findLineSegmentsBetweenStations(line, fromStationId, toStationId);
    const now = new Date().toISOString();

    const trip = {
      id: `trip_${Date.now()}`,
      lineId,
      fromStationId,
      toStationId,
      trainNumber: trainNumber?.trim() || undefined,
      travelDate: travelDate || undefined,
      note: note?.trim() || undefined,
      segmentIds: orderedSegments.map((segment) => segment.id),
      createdAt: now,
      updatedAt: now
    };

    trips.push(trip);
    await saveTrips(trips);

    return ok(res, buildTripDetail(trip), 201);
  } catch (error) {
    return fail(res, 400, error.message);
  }
});

app.delete('/api/trips/:id', async (req, res) => {
  const index = trips.findIndex((trip) => trip.id === req.params.id);
  if (index < 0) {
    return fail(res, 404, '旅程不存在');
  }

  const [removed] = trips.splice(index, 1);
  await saveTrips(trips);
  return ok(res, { id: removed.id });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  fail(res, 500, '服务器内部错误');
});

const bootstrap = async () => {
  const loaded = await loadBaseData();
  stations = loaded.stations;
  lines = loaded.lines;
  segments = loaded.segments;
  trips = loaded.trips;

  app.listen(PORT, () => {
    console.log(`Backend listening on http://localhost:${PORT}`);
  });
};

bootstrap().catch((error) => {
  console.error('Failed to bootstrap backend', error);
  process.exit(1);
});

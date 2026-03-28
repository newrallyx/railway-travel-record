import express from 'express';
import cors from 'cors';
import { loadBaseData, saveTrips } from './dataStore.js';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

const state = {
  stations: [],
  lines: [],
  segments: [],
  trips: []
};

const asMap = (items) => new Map(items.map((item) => [item.id, item]));

const apiSuccess = (res, data) => res.json({ success: true, data, error: null });

const apiError = (res, status, message, details = null) =>
  res.status(status).json({
    success: false,
    data: null,
    error: { message, details }
  });

const parseTripSegments = (trip) => {
  const stationMap = asMap(state.stations);
  const lineMap = asMap(state.lines);
  const segmentMap = asMap(state.segments);

  const expandedTripSegments = trip.tripSegments.map((tripSegment) => {
    const segments = tripSegment.segmentIds
      .map((segmentId) => segmentMap.get(segmentId))
      .filter(Boolean)
      .sort((a, b) => a.sequence - b.sequence);

    return {
      ...tripSegment,
      line: lineMap.get(tripSegment.lineId) ?? null,
      fromStation: stationMap.get(tripSegment.fromStationId) ?? null,
      toStation: stationMap.get(tripSegment.toStationId) ?? null,
      segments
    };
  });

  const geometry = expandedTripSegments.flatMap((tripSegment, index) => {
    const points = tripSegment.segments.flatMap((segment) => segment.coordinates);

    if (index > 0 && points.length > 0) {
      return points.slice(1);
    }

    return points;
  });

  return {
    ...trip,
    fromStation: stationMap.get(trip.tripSegments[0]?.fromStationId) ?? null,
    toStation: stationMap.get(trip.tripSegments.at(-1)?.toStationId) ?? null,
    tripSegments: expandedTripSegments,
    geometry
  };
};

const getSegmentsBetweenStations = (lineId, fromStationId, toStationId) => {
  const lineSegments = state.segments
    .filter((segment) => segment.lineId === lineId)
    .sort((a, b) => a.sequence - b.sequence);

  const startIndex = lineSegments.findIndex((segment) => segment.fromStationId === fromStationId);
  const endIndex = lineSegments.findIndex((segment) => segment.toStationId === toStationId);

  if (startIndex < 0 || endIndex < 0 || startIndex > endIndex) {
    return [];
  }

  return lineSegments.slice(startIndex, endIndex + 1);
};

const validateTripInput = (payload) => {
  const errors = [];

  if (!payload || typeof payload !== 'object') {
    return ['Request body must be a JSON object.'];
  }

  if (!['manual', 'preset'].includes(payload.mode)) {
    errors.push('mode must be either "manual" or "preset".');
  }

  if (!Array.isArray(payload.tripSegments) || payload.tripSegments.length === 0) {
    errors.push('tripSegments must be a non-empty array.');
    return errors;
  }

  for (const [index, segment] of payload.tripSegments.entries()) {
    if (!segment.lineId || !segment.fromStationId || !segment.toStationId) {
      errors.push(`tripSegments[${index}] requires lineId, fromStationId, toStationId.`);
      continue;
    }

    if (!Array.isArray(segment.segmentIds) || segment.segmentIds.length === 0) {
      errors.push(`tripSegments[${index}] segmentIds must be a non-empty array.`);
    }
  }

  return errors;
};

app.get('/api/stations', (_req, res) => apiSuccess(res, state.stations));
app.get('/api/lines', (_req, res) => apiSuccess(res, state.lines));
app.get('/api/segments', (_req, res) => apiSuccess(res, state.segments));

app.get('/api/trips', (req, res) => {
  const sortOrder = req.query.sort === 'asc' ? 'asc' : 'desc';
  const sorted = [...state.trips].sort((a, b) => {
    const first = a.travelDate || a.createdAt;
    const second = b.travelDate || b.createdAt;
    return sortOrder === 'asc' ? first.localeCompare(second) : second.localeCompare(first);
  });

  apiSuccess(
    res,
    sorted.map((trip) => ({
      id: trip.id,
      title: trip.title,
      mode: trip.mode,
      trainNumber: trip.trainNumber ?? '',
      travelDate: trip.travelDate ?? null,
      note: trip.note ?? '',
      createdAt: trip.createdAt,
      updatedAt: trip.updatedAt
    }))
  );
});

app.get('/api/trips/:id', (req, res) => {
  const trip = state.trips.find((item) => item.id === req.params.id);

  if (!trip) {
    return apiError(res, 404, 'Trip not found.');
  }

  return apiSuccess(res, parseTripSegments(trip));
});

app.post('/api/trips', async (req, res) => {
  const validationErrors = validateTripInput(req.body);
  if (validationErrors.length > 0) {
    return apiError(res, 400, 'Invalid trip payload.', validationErrors);
  }

  for (const tripSegment of req.body.tripSegments) {
    const candidate = getSegmentsBetweenStations(
      tripSegment.lineId,
      tripSegment.fromStationId,
      tripSegment.toStationId
    );

    if (candidate.length === 0) {
      return apiError(res, 400, 'Invalid station range on selected line.', {
        lineId: tripSegment.lineId,
        fromStationId: tripSegment.fromStationId,
        toStationId: tripSegment.toStationId
      });
    }

    tripSegment.segmentIds = candidate.map((segment) => segment.id);
  }

  const now = new Date().toISOString();
  const newId = `trip_${Date.now()}`;
  const tripSegments = req.body.tripSegments.map((segment, index) => ({
    id: `trip_seg_${Date.now()}_${index}`,
    tripId: newId,
    lineId: segment.lineId,
    fromStationId: segment.fromStationId,
    toStationId: segment.toStationId,
    trainNumber: segment.trainNumber ?? req.body.trainNumber ?? '',
    travelDate: segment.travelDate ?? req.body.travelDate ?? null,
    note: segment.note ?? req.body.note ?? '',
    segmentIds: segment.segmentIds
  }));

  const created = {
    id: newId,
    title: req.body.title || `${tripSegments[0].fromStationId} - ${tripSegments.at(-1).toStationId}`,
    mode: req.body.mode,
    createdAt: now,
    updatedAt: now,
    travelDate: req.body.travelDate ?? null,
    note: req.body.note ?? '',
    trainNumber: req.body.trainNumber ?? '',
    tripSegments
  };

  state.trips.push(created);
  await saveTrips(state.trips);

  return apiSuccess(res, parseTripSegments(created));
});

app.delete('/api/trips/:id', async (req, res) => {
  const index = state.trips.findIndex((trip) => trip.id === req.params.id);
  if (index < 0) {
    return apiError(res, 404, 'Trip not found.');
  }

  const [deleted] = state.trips.splice(index, 1);
  await saveTrips(state.trips);
  return apiSuccess(res, { id: deleted.id });
});

app.use((_req, res) => apiError(res, 404, 'Route not found.'));

const bootstrap = async () => {
  const data = await loadBaseData();
  state.stations = data.stations;
  state.lines = data.lines;
  state.segments = data.segments;
  state.trips = data.trips;

  app.listen(PORT, () => {
    console.log(`Railway Track Recorder backend listening on http://localhost:${PORT}`);
  });
};

bootstrap().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

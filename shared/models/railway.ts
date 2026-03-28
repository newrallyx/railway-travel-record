export interface Station {
  id: string;
  name: string;
  city?: string;
}

export interface RailwayLine {
  id: string;
  name: string;
  code?: string;
}

export interface RailwaySegment {
  id: string;
  lineId: string;
  fromStationId: string;
  toStationId: string;
  coordinates: [number, number][];
  distanceKm?: number;
  sequence: number;
}

export interface RailwayTripSegment {
  id: string;
  tripId: string;
  lineId: string;
  fromStationId: string;
  toStationId: string;
  trainNumber?: string;
  travelDate?: string;
  note?: string;
  segmentIds: string[];
}

export interface RailwayTrip {
  id: string;
  title: string;
  mode: 'manual' | 'preset';
  trainNumber?: string;
  travelDate?: string;
  note?: string;
  tripSegments: RailwayTripSegment[];
  createdAt: string;
  updatedAt: string;
}

export interface Station {
  id: string;
  name: string;
  city?: string;
  latitude: number;
  longitude: number;
  lines?: string[];
}

export interface RailwayLine {
  id: string;
  name: string;
  code?: string;
  color?: string;
  stationIds: string[];
}

export interface RailwaySegment {
  id: string;
  lineId: string;
  fromStationId: string;
  toStationId: string;
  coordinates: [number, number][];
  sequence: number;
  distanceKm?: number;
}

export interface RailwayTrip {
  id: string;
  lineId: string;
  fromStationId: string;
  toStationId: string;
  trainNumber?: string;
  travelDate?: string;
  note?: string;
  segmentIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface RailwayTripSummary {
  id: string;
  lineId: string;
  lineName: string;
  fromStationId: string;
  fromStationName: string;
  toStationId: string;
  toStationName: string;
  trainNumber?: string;
  travelDate?: string;
  segmentCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface RailwayTripDetail {
  trip: RailwayTrip;
  line: RailwayLine;
  fromStation: Station;
  toStation: Station;
  segments: RailwaySegment[];
  coordinates: [number, number][];
}

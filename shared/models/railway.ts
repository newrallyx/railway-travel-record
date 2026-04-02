export type RailType = 'hsr' | 'conventional';

export interface Station {
  id: string;
  name: string;
  aliases?: string[];
  lng: number;
  lat: number;
}

export interface RailwaySegment {
  id: string;
  fromStationId: string;
  toStationId: string;
  lineName: string;
  railType: RailType;
  distanceKm?: number;
  geometry: [number, number][];
}

export interface RailwayLine {
  id: string;
  name: string;
  railType: RailType;
  segmentIds: string[];
}

export type RouteMode =
  | 'auto'
  | 'hsr_only'
  | 'conventional_only'
  | 'hsr_preferred'
  | 'conventional_preferred';

export interface RailwayTrip {
  id: string;
  title: string;
  inputMode: string;
  fromStationId: string;
  toStationId: string;
  viaStationIds: string[];
  routeMode: RouteMode;
  trainNumber?: string;
  travelDate?: string;
  note?: string;
  routeResult?: unknown;
  createdAt: string;
  updatedAt: string;
}

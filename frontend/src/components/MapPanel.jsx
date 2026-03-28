import { MapContainer, Polyline, TileLayer, useMap } from 'react-leaflet';
import { useEffect } from 'react';
import 'leaflet/dist/leaflet.css';

function FitBounds({ geometry }) {
  const map = useMap();

  useEffect(() => {
    if (!geometry?.length) return;
    const latLngs = geometry.map(([lng, lat]) => [lat, lng]);
    map.fitBounds(latLngs, { padding: [30, 30] });
  }, [geometry, map]);

  return null;
}

export default function MapPanel({ trip }) {
  const fallbackCenter = [35.8617, 104.1954];
  const latLngs = trip?.geometry?.map(([lng, lat]) => [lat, lng]) || [];

  return (
    <div className="map-wrapper">
      <MapContainer center={fallbackCenter} zoom={5} className="map-canvas">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {latLngs.length > 0 && <Polyline positions={latLngs} pathOptions={{ color: '#e03131', weight: 6 }} />}
        <FitBounds geometry={trip?.geometry} />
      </MapContainer>
      {!trip && <div className="map-empty">请选择一条旅程后在地图查看轨迹</div>}
    </div>
  );
}

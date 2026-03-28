import { useEffect } from 'react';
import { MapContainer, Polyline, TileLayer, useMap } from 'react-leaflet';

function FitToPolyline({ coordinates }) {
  const map = useMap();

  useEffect(() => {
    if (!coordinates?.length) {
      return;
    }

    map.fitBounds(coordinates, { padding: [32, 32] });
  }, [map, coordinates]);

  return null;
}

export default function MapPanel({ detail }) {
  const coordinates = detail?.coordinates ?? [];
  const lineColor = detail?.line?.color || '#dc2626';

  return (
    <section className="map-panel">
      <MapContainer center={[35.5, 112.5]} zoom={5} className="map-container" scrollWheelZoom>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {coordinates.length > 1 ? (
          <>
            <Polyline positions={coordinates} pathOptions={{ color: lineColor, weight: 6, opacity: 0.9 }} />
            <FitToPolyline coordinates={coordinates} />
          </>
        ) : null}
      </MapContainer>

      {!detail && <div className="map-tip">请选择一条旅程以显示轨迹。</div>}
      {detail && coordinates.length <= 1 && <div className="map-tip">该旅程暂无可展示轨迹。</div>}
    </section>
  );
}

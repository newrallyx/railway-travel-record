import L from 'leaflet';
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import marker2x from 'leaflet/dist/images/marker-icon-2x.png';
import marker1x from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const colors = { hsr: '#dc2626', conventional: '#2563eb' };

L.Icon.Default.mergeOptions({
  iconRetinaUrl: marker2x,
  iconUrl: marker1x,
  shadowUrl: markerShadow
});

function FitBounds({ routeResult }) {
  const map = useMap();

  if (!routeResult?.ok) {
    return null;
  }

  const points = routeResult.segments.flatMap((segment) => segment.renderGeometry ?? segment.geometry ?? []);
  if (!points.length) {
    return null;
  }

  const bounds = L.latLngBounds(points.map(([lng, lat]) => [lat, lng]));
  map.fitBounds(bounds, { padding: [30, 30] });
  return null;
}

export default function MapPanel({ routeResult }) {
  const center = [35.8617, 104.1954];

  return (
    <div className="panel map-panel">
      <h3>铁路路径地图</h3>
      <div className="map-container-wrap">
        <MapContainer center={center} zoom={5} className="leaflet-map" scrollWheelZoom>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {routeResult?.ok ? (
            <>
              <FitBounds routeResult={routeResult} />
              {routeResult.segments.map((segment, idx) => (
                <Polyline
                  key={`${segment.id}-${idx}`}
                  positions={(segment.renderGeometry ?? segment.geometry).map(([lng, lat]) => [lat, lng])}
                  pathOptions={{ color: colors[segment.railType] ?? '#111827', weight: 5 }}
                />
              ))}

              {routeResult.stationPath.map((station) => (
                <Marker key={station.id} position={[station.lat, station.lng]}>
                  <Popup>{station.name}</Popup>
                </Marker>
              ))}
            </>
          ) : null}
        </MapContainer>

        {!routeResult ? <div className="map-tip">请输入起点、终点和途经站后计算铁路路径。</div> : null}
        {routeResult && !routeResult.ok ? <div className="map-tip error">{routeResult.reason}</div> : null}
      </div>
      <div className="legend"><span className="dot hsr" />高铁 <span className="dot conv" />普速</div>
    </div>
  );
}

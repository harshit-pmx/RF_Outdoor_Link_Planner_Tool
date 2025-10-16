import { MapContainer, TileLayer, Marker, Polyline, Popup, Circle, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Tower, Link, FresnelZone } from '../types';
import { getTowerColor } from '../utils/calculations';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapViewProps {
  towers: Tower[];
  links: Link[];
  fresnelZone: FresnelZone | null;
  mode: 'add' | 'edit' | 'link' | 'delete' | null;
  selectedTowers: string[];
  onMapClick: (lat: number, lng: number) => void;
  onTowerClick: (towerId: string) => void;
  onLinkClick: (linkId: string) => void;
}

function MapClickHandler({ mode, onClick }: { mode: string | null; onClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => {
      if (mode === 'add') {
        onClick(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
}

export function MapView({
  towers,
  links,
  fresnelZone,
  mode,
  selectedTowers,
  onMapClick,
  onTowerClick,
  onLinkClick,
}: MapViewProps) {
  const createCustomIcon = (color: string, isSelected: boolean) => {
    return L.divIcon({
      className: 'custom-tower-marker',
      html: `<div style="width: 24px; height: 24px; background: ${color}; border: 3px solid ${
        isSelected ? '#fff' : color
      }; border-radius: 50%; box-shadow: 0 0 ${isSelected ? '20px' : '10px'} ${color};"></div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });
  };

  return (
    <MapContainer
      center={[37.7749, -122.4194]}
      zoom={10}
      style={{ height: '100vh', width: '100%' }}
      className="z-0"
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      <MapClickHandler mode={mode} onClick={onMapClick} />

      {towers.map((tower) => {
        const isSelected = selectedTowers.includes(tower.id);
        const color = getTowerColor(tower.frequency);
        return (
          <Marker
            key={tower.id}
            position={[tower.lat, tower.lng]}
            icon={createCustomIcon(color, isSelected)}
            eventHandlers={{
              click: () => onTowerClick(tower.id),
            }}
          >
            <Popup>
              <div className="text-slate-900">
                <p className="font-bold">Tower {tower.id}</p>
                <p className="text-sm">Frequency: {tower.frequency} GHz</p>
                <p className="text-sm">
                  Location: {tower.lat.toFixed(4)}, {tower.lng.toFixed(4)}
                </p>
              </div>
            </Popup>
          </Marker>
        );
      })}

      {links.map((link) => {
        const towerA = towers.find((t) => t.id === link.towerAId);
        const towerB = towers.find((t) => t.id === link.towerBId);
        if (!towerA || !towerB) return null;

        return (
          <Polyline
            key={link.id}
            positions={[
              [towerA.lat, towerA.lng],
              [towerB.lat, towerB.lng],
            ]}
            color="#06b6d4"
            weight={3}
            opacity={0.8}
            eventHandlers={{
              click: () => onLinkClick(link.id),
              mouseover: (e) => {
                const layer = e.target;
                layer.setStyle({ weight: 5, opacity: 1 });
              },
              mouseout: (e) => {
                const layer = e.target;
                layer.setStyle({ weight: 3, opacity: 0.8 });
              },
            }}
          >
            <Popup>
              <div className="text-slate-900">
                <p className="font-bold">Link {link.id}</p>
                <p className="text-sm">Distance: {link.distance.toFixed(2)} km</p>
                <p className="text-sm">Frequency: {link.frequency} GHz</p>
              </div>
            </Popup>
          </Polyline>
        );
      })}

      {fresnelZone && (
        <Circle
          center={[fresnelZone.centerLat, fresnelZone.centerLng]}
          radius={fresnelZone.radiusMeters}
          pathOptions={{
            color: '#22d3ee',
            fillColor: '#06b6d4',
            fillOpacity: 0.2,
            weight: 2,
          }}
        >
          <Popup>
            <div className="text-slate-900">
              <p className="font-bold">Fresnel Zone</p>
              <p className="text-sm">Radius: {fresnelZone.radiusMeters.toFixed(2)} m</p>
              <p className="text-sm">Distance: {fresnelZone.distance.toFixed(2)} km</p>
              <p className="text-sm">Frequency: {fresnelZone.frequency} GHz</p>
            </div>
          </Popup>
        </Circle>
      )}
    </MapContainer>
  );
}

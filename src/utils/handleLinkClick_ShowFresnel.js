import { fetchElevationData } from '../api/openElevation.js';
import { haversineDistanceMeters } from './geo.js';
import { fresnelRadiusAtMidpointMeters } from './fresnel.js';
import L from 'leaflet';

export async function handleLinkClick_ShowFresnel({ map, latlngA, latlngB, frequencyGHz, onError }) {
  if (!map) {
    if (onError) onError('Map instance unavailable.');
    return null;
  }

  try {
    const elevPoints = await fetchElevationData(latlngA.lat, latlngA.lng, latlngB.lat, latlngB.lng);
    const totalDistanceMeters = haversineDistanceMeters(latlngA.lat, latlngA.lng, latlngB.lat, latlngB.lng);
    const fresnelRadiusMeters = fresnelRadiusAtMidpointMeters(Number(frequencyGHz), totalDistanceMeters);

    const midLat = (latlngA.lat + latlngB.lat) / 2;
    const midLng = (latlngA.lng + latlngB.lng) / 2;
    const midLatLng = L.latLng(midLat, midLng);

    const pointA = map.latLngToLayerPoint(L.latLng(latlngA.lat, latlngA.lng));
    const pointB = map.latLngToLayerPoint(L.latLng(latlngB.lat, latlngB.lng));
    const pointMid = map.latLngToLayerPoint(midLatLng);

    const pxRight = L.point(pointMid.x + 1, pointMid.y);
    const latlngRight = map.layerPointToLatLng(pxRight);
    const metersPerPixel = map.distance(midLatLng, latlngRight);

    const semiMinorPx = fresnelRadiusMeters / metersPerPixel;
    const semiMajorPx = (totalDistanceMeters / 2) / metersPerPixel;

    const dx = pointB.x - pointA.x;
    const dy = pointB.y - pointA.y;
    const angleDeg = (Math.atan2(dy, dx) * 180) / Math.PI;

    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.style.position = 'absolute';
    svg.style.left = '0';
    svg.style.top = '0';
    svg.style.width = '100%';
    svg.style.height = '100%';
    svg.style.pointerEvents = 'none';
    svg.style.zIndex = '400';

    const ellipse = document.createElementNS(svgNS, 'ellipse');
    ellipse.setAttribute('cx', String(pointMid.x));
    ellipse.setAttribute('cy', String(pointMid.y));
    ellipse.setAttribute('rx', String(semiMajorPx));
    ellipse.setAttribute('ry', String(semiMinorPx));
    ellipse.setAttribute('transform', `rotate(${angleDeg} ${pointMid.x} ${pointMid.y})`);
    ellipse.setAttribute('fill', 'rgba(36, 199, 255, 0.08)');
    ellipse.setAttribute('stroke', 'rgba(36,199,255,0.7)');
    ellipse.setAttribute('stroke-width', '2');
    ellipse.style.filter = 'drop-shadow(0 0 8px rgba(36,199,255,0.45))';

    svg.appendChild(ellipse);
    map.getPanes().overlayPane.appendChild(svg);

    const updateEllipse = () => {
      const newPointA = map.latLngToLayerPoint(L.latLng(latlngA.lat, latlngA.lng));
      const newPointB = map.latLngToLayerPoint(L.latLng(latlngB.lat, latlngB.lng));
      const newPointMid = map.latLngToLayerPoint(midLatLng);

      const newPxRight = L.point(newPointMid.x + 1, newPointMid.y);
      const newLatlngRight = map.layerPointToLatLng(newPxRight);
      const newMetersPerPixel = map.distance(midLatLng, newLatlngRight);

      const newSemiMinorPx = fresnelRadiusMeters / newMetersPerPixel;
      const newSemiMajorPx = (totalDistanceMeters / 2) / newMetersPerPixel;

      const newDx = newPointB.x - newPointA.x;
      const newDy = newPointB.y - newPointA.y;
      const newAngleDeg = (Math.atan2(newDy, newDx) * 180) / Math.PI;

      ellipse.setAttribute('cx', String(newPointMid.x));
      ellipse.setAttribute('cy', String(newPointMid.y));
      ellipse.setAttribute('rx', String(newSemiMajorPx));
      ellipse.setAttribute('ry', String(newSemiMinorPx));
      ellipse.setAttribute('transform', `rotate(${newAngleDeg} ${newPointMid.x} ${newPointMid.y})`);
    };

    map.on('zoom', updateEllipse);
    map.on('move', updateEllipse);

    return {
      remove: () => {
        svg.remove();
        map.off('zoom', updateEllipse);
        map.off('move', updateEllipse);
      },
      meta: { fresnelRadiusMeters, elevPoints, totalDistanceMeters }
    };
  } catch (err) {
    console.error('Fresnel draw failed:', err);
    if (onError) onError(String(err));
    return null;
  }
}

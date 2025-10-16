import { Tower } from '../types';

export function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

export function calculateFresnelRadius(frequencyGHz: number, distanceKm: number): number {
  const c = 3e8;
  const frequencyHz = frequencyGHz * 1e9;
  const wavelength = c / frequencyHz;
  const distanceMeters = distanceKm * 1000;
  const d1 = distanceMeters / 2;
  const d2 = distanceMeters / 2;
  const radius = Math.sqrt((wavelength * d1 * d2) / (d1 + d2));
  return radius;
}

export function getTowerColor(frequency: number): string {
  if (frequency < 2) return '#3b82f6';
  if (frequency < 5) return '#10b981';
  if (frequency < 10) return '#f59e0b';
  if (frequency < 20) return '#ef4444';
  return '#8b5cf6';
}

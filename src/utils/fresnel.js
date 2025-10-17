const C = 3e8;

export function wavelengthMeters(ghz) {
  const fHz = ghz * 1e9;
  return C / fHz;
}

export function fresnelRadiusMeters(ghz, d1, d2) {
  const lambda = wavelengthMeters(ghz);
  if (d1 + d2 <= 0) return 0;
  return Math.sqrt((lambda * d1 * d2) / (d1 + d2));
}

export function fresnelRadiusAtMidpointMeters(ghz, totalDistanceMeters) {
  const half = totalDistanceMeters / 2;
  return fresnelRadiusMeters(ghz, half, half);
}

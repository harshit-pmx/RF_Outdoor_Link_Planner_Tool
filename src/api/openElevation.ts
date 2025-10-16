export interface ElevationPoint {
  latitude: number;
  longitude: number;
  elevation: number;
}

export async function fetchElevationData(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): Promise<[ElevationPoint, ElevationPoint]> {
  try {
    const url = `https://api.open-elevation.com/api/v1/lookup?locations=${lat1},${lng1}|${lat2},${lng2}`;

    const response = await fetch(url);

    if (!response.ok) {
      console.warn(`Open-Elevation API returned status ${response.status}, using fallback values`);
      return [
        { latitude: lat1, longitude: lng1, elevation: 0 },
        { latitude: lat2, longitude: lng2, elevation: 0 }
      ];
    }

    const data = await response.json();

    if (!data.results || data.results.length !== 2) {
      console.warn('Open-Elevation API returned incomplete data, using fallback values');
      return [
        { latitude: lat1, longitude: lng1, elevation: 0 },
        { latitude: lat2, longitude: lng2, elevation: 0 }
      ];
    }

    return [
      {
        latitude: data.results[0].latitude,
        longitude: data.results[0].longitude,
        elevation: data.results[0].elevation || 0
      },
      {
        latitude: data.results[1].latitude,
        longitude: data.results[1].longitude,
        elevation: data.results[1].elevation || 0
      }
    ];
  } catch (error) {
    console.warn('Failed to fetch elevation data, using fallback values:', error);
    return [
      { latitude: lat1, longitude: lng1, elevation: 0 },
      { latitude: lat2, longitude: lng2, elevation: 0 }
    ];
  }
}

// src/api/openElevation.js
export async function fetchElevationData(lat1, lng1, lat2, lng2) {
  const base = 'https://api.open-elevation.com/api/v1/lookup';
  const url = `${base}?locations=${lat1},${lng1}|${lat2},${lng2}`;

  function fallback() {
    return [
      { latitude: Number(lat1), longitude: Number(lng1), elevation: 0 },
      { latitude: Number(lat2), longitude: Number(lng2), elevation: 0 },
    ];
  }

  try {
    const resp = await fetch(url, { method: 'GET' });
    if (!resp.ok) {
      console.warn(`[openElevation] non-OK response: ${resp.status}`);
      return fallback();
    }
    const json = await resp.json();

    if (!json || !Array.isArray(json.results) || json.results.length < 2) {
      console.warn('[openElevation] incomplete data, returning fallback', json);
      return fallback();
    }

    const out = json.results.slice(0, 2).map((r) => ({
      latitude: Number(r.latitude),
      longitude: Number(r.longitude),
      elevation: typeof r.elevation === 'number' ? r.elevation : Number(r.elevation) || 0,
    }));

    return out;
  } catch (err) {
    console.warn('[openElevation] fetch failed, returning fallback:', err);
    return fallback();
  }
}

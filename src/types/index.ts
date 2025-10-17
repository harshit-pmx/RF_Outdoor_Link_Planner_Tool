export interface Tower {
  id: string;
  name: string;
  lat: number;
  lng: number;
  frequency: number;
}

export interface Link {
  id: string;
  towerAId: string;
  towerBId: string;
  frequency: number;
  distance: number;
}

export interface FresnelZone {
  linkId: string;
  centerLat: number;
  centerLng: number;
  radiusMeters: number;
  distance: number;
  frequency: number;
}

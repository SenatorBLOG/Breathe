// Shared Globe types. Extracted from the retired useGlobe hook (the old
// Three.js renderer) so the live Leaflet view doesn't depend on dead code.
export interface GlobePin {
  _id: string;
  lat: number;
  lng: number;
  username: string;
  city: string;
  country: string;
  title: string;
  note: string;
  technique: string;
  likeCount: number;
  userId?: string;
  createdAt: string;
  photoUrl?: string;
}

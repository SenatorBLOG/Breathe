// src/utils/resolveMapUrl.ts
import api from '../api';

export interface ResolvedPlace {
  lat:      number;
  lng:      number;
  name:     string;
  address:  string;
  city:     string;
  country:  string;
  photoUrl: string | null;
}

export async function resolveMapUrl(url: string): Promise<ResolvedPlace> {
  const res = await api.post<ResolvedPlace>('/globe/resolve-place', { url });
  return res.data;
}

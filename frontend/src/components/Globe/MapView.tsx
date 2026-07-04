/**
 * MapView — Leaflet-based world map showing meditation pins.
 * Uses CartoDB Dark Matter tiles (no API key needed).
 * Markers pulse with a CSS animation keyed to technique colour.
 */
import { useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { GlobePin } from './types';

// ── Technique colours ────────────────────────────────────────────────────────
const PIN_COLORS: Record<string, string> = {
  'box':       '#3A82F7',
  '4-7-8':     '#7AC4FF',
  'wim-hof':   '#FF9A5C',
  'coherent':  '#4AE8A0',
  'belly':     '#FFD97D',
  'alternate': '#C084FC',
  'other':     '#94A3B8',
};
function pinColor(technique: string): string {
  return PIN_COLORS[technique.toLowerCase()] ?? PIN_COLORS.other;
}

// ── Custom SVG marker factory ────────────────────────────────────────────────
function makeIcon(color: string, isSelected = false): L.DivIcon {
  const size    = isSelected ? 20 : 14;
  const pulse   = isSelected ? 36 : 28;
  return L.divIcon({
    className: '',
    iconAnchor: [size / 2, size / 2],
    html: `
      <div style="position:relative;width:${size}px;height:${size}px">
        <div style="
          position:absolute;inset:0;border-radius:50%;
          background:${color};opacity:0.25;
          animation:globe-pulse 2s ease-in-out infinite;
          width:${pulse}px;height:${pulse}px;
          top:${(size - pulse) / 2}px;left:${(size - pulse) / 2}px;
        "></div>
        <div style="
          position:absolute;inset:0;border-radius:50%;
          background:${color};
          box-shadow:0 0 8px ${color}88;
          border:2px solid rgba(255,255,255,0.6);
        "></div>
      </div>`,
  });
}

interface Props {
  pins:            GlobePin[];
  filterTechnique: string;
  selectedPin:     GlobePin | null;
  addPinMode:      boolean;
  onPinClick:      (pin: GlobePin) => void;
  onMapClick:      (lat: number, lng: number) => void;
}

export default function MapView({
  pins, filterTechnique, selectedPin, addPinMode, onPinClick, onMapClick,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef       = useRef<L.Map | null>(null);
  const markersRef   = useRef<Map<string, L.Marker>>(new Map());

  // ── Inject pulse keyframe once ───────────────────────────────────────────
  useEffect(() => {
    if (document.getElementById('globe-pulse-style')) return;
    const style = document.createElement('style');
    style.id = 'globe-pulse-style';
    style.textContent = `
      @keyframes globe-pulse {
        0%,100% { transform: scale(1);   opacity: 0.25; }
        50%      { transform: scale(1.5); opacity: 0.10; }
      }
    `;
    document.head.appendChild(style);
  }, []);

  // ── Init map ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [20, 0],
      zoom: 2,
      minZoom: 2,
      maxZoom: 10,
      zoomControl: false,
      attributionControl: false,
    });

    // Dark basemap — CartoDB DarkMatter, no API key
    L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      { subdomains: 'abcd', maxZoom: 19 },
    ).addTo(map);

    L.control.attribution({ prefix: false, position: 'bottomright' }).addTo(map);
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // ── Map click handler (for add-pin mode) ────────────────────────────────
  const stableOnMapClick = useCallback(onMapClick, [onMapClick]);
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const handler = (e: L.LeafletMouseEvent) => {
      if (addPinMode) stableOnMapClick(e.latlng.lat, e.latlng.lng);
    };
    map.on('click', handler);
    return () => { map.off('click', handler); };
  }, [addPinMode, stableOnMapClick]);

  // ── Cursor style in add-pin mode ─────────────────────────────────────────
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    container.style.cursor = addPinMode ? 'crosshair' : '';
  }, [addPinMode]);

  // ── Sync markers ──────────────────────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const filtered = filterTechnique === 'all'
      ? pins
      : pins.filter(p => p.technique.toLowerCase() === filterTechnique);

    const nextIds = new Set(filtered.map(p => p._id));

    // Remove stale markers
    markersRef.current.forEach((marker, id) => {
      if (!nextIds.has(id)) { marker.remove(); markersRef.current.delete(id); }
    });

    // Add / update markers
    filtered.forEach(pin => {
      const color    = pinColor(pin.technique);
      const selected = selectedPin?._id === pin._id;
      const existing = markersRef.current.get(pin._id);

      if (existing) {
        existing.setIcon(makeIcon(color, selected));
      } else {
        const marker = L.marker([pin.lat, pin.lng], {
          icon: makeIcon(color, selected),
          zIndexOffset: selected ? 1000 : 0,
        })
          .addTo(map)
          .on('click', (e) => {
            L.DomEvent.stopPropagation(e);
            onPinClick(pin);
          });
        markersRef.current.set(pin._id, marker);
      }
    });
  }, [pins, filterTechnique, selectedPin, onPinClick]);

  // ── Pan to selected pin ──────────────────────────────────────────────────
  useEffect(() => {
    if (selectedPin && mapRef.current) {
      mapRef.current.panTo([selectedPin.lat, selectedPin.lng], { animate: true });
    }
  }, [selectedPin]);

  return (
    <div
      ref={containerRef}
      style={{ position: 'absolute', inset: 0 }}
    />
  );
}

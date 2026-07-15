/**
 * Globe3D — meditative rotating WebGL globe (react-globe.gl / three.js).
 *
 * Aesthetic: dark sphere in space, continents rendered as a field of softly
 * glowing hex dots, a cyan atmosphere halo, pins as breathing points of
 * light. Slow auto-rotation that pauses while the visitor explores and
 * resumes after a few idle seconds.
 *
 * Same contract as the 2D MapView so GlobePage can swap them freely.
 */
import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import Globe, { GlobeMethods } from 'react-globe.gl';
import * as THREE from 'three';
import { feature } from 'topojson-client';
import { polygonToCells } from 'h3-js';
import type { Topology, GeometryCollection } from 'topojson-specification';
import { useTheme, type Theme } from '../../contexts/ThemeContext';
import { useThemeStyles } from '../../hooks/useThemeStyles';
import type { GlobePin } from './types';

const PIN_COLORS: Record<string, string> = {
  'box':       '#3A82F7',
  '4-7-8':     '#7AC4FF',
  'wim-hof':   '#FF9A5C',
  'coherent':  '#4AE8A0',
  'belly':     '#FFD97D',
  'alternate': '#C084FC',
  'other':     '#94A3B8',
};
const pinColor = (technique: string) => PIN_COLORS[technique?.toLowerCase()] ?? PIN_COLORS.other;

// Sphere/dot/halo palette per app theme. Dots carry an rgb triplet so the
// per-hex alpha jitter below can breathe a little life into the continents.
const GLOBE_THEME: Record<Theme, {
  sphere: string; emissive: string; dotRgb: string; dotAlpha: [number, number]; atmosphere: string;
}> = {
  night:  { sphere: '#0b1230', emissive: '#060a1c', dotRgb: '122,196,255', dotAlpha: [0.25, 0.6],  atmosphere: '#3A82F7' },
  day:    { sphere: '#EFE7D4', emissive: '#8A7A56', dotRgb: '139,94,8',    dotAlpha: [0.45, 0.85], atmosphere: '#C8860A' },
  nature: { sphere: '#0a2013', emissive: '#051108', dotRgb: '74,232,160',  dotAlpha: [0.25, 0.6],  atmosphere: '#2ECC71' },
};

interface Props {
  pins: GlobePin[];
  filterTechnique: string;
  selectedPin: GlobePin | null;
  addPinMode: boolean;
  onPinClick: (pin: GlobePin) => void;
  onMapClick: (lat: number, lng: number) => void;
  /** Called when WebGL isn't available so the parent can fall back to 2D. */
  onUnsupported: () => void;
}

function webglAvailable(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

export default function Globe3D({
  pins, filterTechnique, selectedPin, addPinMode, onPinClick, onMapClick, onUnsupported,
}: Props) {
  const { theme } = useTheme();
  const ts = useThemeStyles();
  const palette = GLOBE_THEME[theme];
  const globeRef = useRef<GlobeMethods | undefined>(undefined);
  const wrapRef = useRef<HTMLDivElement>(null);
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [size, setSize] = useState({ w: 0, h: 0 });
  const [landFeatures, setLandFeatures] = useState<object[]>([]);

  const reducedMotion = useMemo(
    () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false,
    [],
  );

  // WebGL guard — some old mobile browsers / forced-software environments
  useEffect(() => {
    if (!webglAvailable()) onUnsupported();
  }, [onUnsupported]);

  // Fill the parent container and follow its resizes
  useEffect(() => {
    const node = wrapRef.current;
    if (!node) return;
    const measure = () => setSize({ w: node.clientWidth, h: node.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(node);
    return () => ro.disconnect();
  }, []);

  // Country shapes for the hex-dot continents.
  //
  // The raw dataset needs three treatments before h3 can hex it safely:
  //  1. Degenerate rings (simplification artifacts — e.g. North Korea ships a
  //     zero-area ring of 4 identical points) make h3 throw and would take
  //     down every country processed after it. Rings are sanitized out.
  //  2. Antarctica's pole-crossing rings also crash h3 → excluded.
  //  3. One hex resolution can't fit all: at res 3 half of Europe (Belgium,
  //     Netherlands, Cyprus, Luxembourg…) yields 0–5 dots and vanishes.
  //     Each country gets the finest of res 3→4→5 that gives it enough dots,
  //     stored on the feature and read by the accessor below (~11.5k dots).
  useEffect(() => {
    let cancelled = false;

    const distinctPts = (ring: number[][]) =>
      new Set(ring.map(p => `${p[0]},${p[1]}`)).size;

    const cellCount = (polys: number[][][][], res: number): number => {
      try {
        let n = 0;
        for (const poly of polys) n += polygonToCells(poly, res, true).length;
        return n;
      } catch {
        return -1; // still degenerate — caller drops the feature
      }
    };

    fetch('/geo/countries-110m.json')
      .then(r => r.json())
      .then((topo: Topology<{ countries: GeometryCollection<{ name?: string }> }>) => {
        if (cancelled) return;
        const countries = feature(topo, topo.objects.countries);
        const raw = 'features' in countries ? countries.features : [countries];

        const prepared: object[] = [];
        for (const f of raw) {
          const props = (f.properties ?? {}) as { name?: string; __hexRes?: number };
          if (props.name === 'Antarctica') continue;

          // Normalize to MultiPolygon & drop degenerate rings
          const polys: number[][][][] =
            f.geometry.type === 'Polygon' ? [f.geometry.coordinates as number[][][]] :
            f.geometry.type === 'MultiPolygon' ? (f.geometry.coordinates as number[][][][]) : [];
          const clean = polys
            .map(poly => poly.filter(ring => distinctPts(ring) >= 4))
            .filter(poly => poly.length > 0);
          if (!clean.length) continue;

          // Finest-needed resolution: enough dots to be visible, no more
          let res = 3;
          let n = cellCount(clean, 3);
          if (n !== -1 && n < 6) { res = 4; n = cellCount(clean, 4); }
          if (n !== -1 && n < 3) { res = 5; n = cellCount(clean, 5); }
          if (n <= 0) continue; // unfixable geometry — skip, never crash the layer

          prepared.push({
            type: 'Feature',
            properties: { ...props, __hexRes: res },
            geometry: { type: 'MultiPolygon', coordinates: clean },
          });
        }
        setLandFeatures(prepared);
      })
      .catch(() => { /* globe still renders without continents */ });
    return () => { cancelled = true; };
  }, []);

  // Scene setup once the globe mounts
  useEffect(() => {
    const globe = globeRef.current;
    if (!globe) return;
    const controls = globe.controls();
    controls.autoRotate = !reducedMotion;
    controls.autoRotateSpeed = 0.55;        // one lap ≈ 2 minutes — meditative, not dizzy
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 160;
    controls.maxDistance = 480;
    globe.pointOfView({ lat: 25, lng: -30, altitude: 2.2 }, 0);

    // Pause the spin while the visitor drags/zooms; resume after 6s idle.
    const pause = () => {
      controls.autoRotate = false;
      if (resumeTimer.current) clearTimeout(resumeTimer.current);
    };
    const scheduleResume = () => {
      if (resumeTimer.current) clearTimeout(resumeTimer.current);
      resumeTimer.current = setTimeout(() => {
        if (!reducedMotion) controls.autoRotate = true;
      }, 6000);
    };
    controls.addEventListener('start', pause);
    controls.addEventListener('end', scheduleResume);
    return () => {
      controls.removeEventListener('start', pause);
      controls.removeEventListener('end', scheduleResume);
      if (resumeTimer.current) clearTimeout(resumeTimer.current);
    };
    // size dependency: globe remounts controls when canvas size flips from 0
  }, [reducedMotion, size.w > 0]);

  // Precision matters while placing a pin — stop the world
  useEffect(() => {
    const controls = globeRef.current?.controls();
    if (!controls) return;
    if (addPinMode) controls.autoRotate = false;
    else if (!reducedMotion) controls.autoRotate = true;
  }, [addPinMode, reducedMotion]);

  const globeMaterial = useMemo(
    () =>
      new THREE.MeshPhongMaterial({
        color: new THREE.Color(palette.sphere),
        emissive: new THREE.Color(palette.emissive),
        shininess: 6,
        transparent: false,
      }),
    [palette],
  );

  // New function identity per theme so globe.gl re-evaluates every hex color.
  const hexColor = useCallback(() => {
    const [lo, hi] = palette.dotAlpha;
    return `rgba(${palette.dotRgb}, ${lo + Math.random() * (hi - lo)})`;
  }, [palette]);

  const shownPins = useMemo(
    () => (filterTechnique === 'all' ? pins : pins.filter(p => p.technique === filterTechnique)),
    [pins, filterTechnique],
  );

  // Gentle ripple rings under the selected pin
  const ringsData = useMemo(
    () => (selectedPin ? [{ lat: selectedPin.lat, lng: selectedPin.lng, color: pinColor(selectedPin.technique) }] : []),
    [selectedPin],
  );

  const handleGlobeClick = useCallback(
    ({ lat, lng }: { lat: number; lng: number }) => {
      if (addPinMode) onMapClick(lat, lng);
    },
    [addPinMode, onMapClick],
  );

  return (
    <div
      ref={wrapRef}
      style={{ position: 'absolute', inset: 0, cursor: addPinMode ? 'crosshair' : 'grab' }}
      aria-label="3D meditation globe"
    >
      {size.w > 0 && (
        <Globe
          ref={globeRef}
          width={size.w}
          height={size.h}
          backgroundColor="rgba(0,0,0,0)"
          globeMaterial={globeMaterial}
          atmosphereColor={palette.atmosphere}
          atmosphereAltitude={0.16}
          // ── Continents as a field of glowing hex dots ──
          hexPolygonsData={landFeatures}
          hexPolygonResolution={(f) => (f as { properties: { __hexRes?: number } }).properties.__hexRes ?? 3}
          hexPolygonMargin={0.72}
          hexPolygonUseDots
          hexPolygonColor={hexColor}
          // ── Meditation pins ──
          pointsData={shownPins}
          pointLat={(p) => (p as GlobePin).lat}
          pointLng={(p) => (p as GlobePin).lng}
          pointColor={(p) => pinColor((p as GlobePin).technique)}
          pointAltitude={(p) => ((p as GlobePin)._id === selectedPin?._id ? 0.06 : 0.02)}
          pointRadius={(p) => ((p as GlobePin)._id === selectedPin?._id ? 0.95 : 0.55)}
          pointsMerge={false}
          onPointClick={(p) => onPinClick(p as GlobePin)}
          pointLabel={(p) => {
            const pin = p as GlobePin;
            const place = [pin.city, pin.country].filter(Boolean).join(', ');
            return `<div style="font-family:Montserrat,sans-serif;font-size:12px;padding:6px 10px;border-radius:10px;background:${ts.cardBg};border:1px solid ${ts.border};color:${ts.textPrimary}">
              <b style="color:${pinColor(pin.technique)}">${pin.technique}</b>${place ? ' · ' + place : ''}
            </div>`;
          }}
          // ── Ripple on the selected pin ──
          ringsData={ringsData}
          ringLat={(r) => (r as { lat: number }).lat}
          ringLng={(r) => (r as { lng: number }).lng}
          ringColor={(r) => (t: number) => {
            const c = (r as { color: string }).color;
            const alpha = Math.round((1 - t) * 160).toString(16).padStart(2, '0');
            return `${c}${alpha}`;
          }}
          ringMaxRadius={4.5}
          ringPropagationSpeed={1.6}
          ringRepeatPeriod={1300}
          onGlobeClick={handleGlobeClick}
        />
      )}
    </div>
  );
}

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
import type { Topology, GeometryCollection } from 'topojson-specification';
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

  // Country shapes for the hex-dot continents. Per-country features (not the
  // merged land MultiPolygon): h3's polyfill throws "operation failed" on the
  // land blob, and Antarctica's pole/antimeridian rings kill the whole hex
  // layer — so it's excluded.
  useEffect(() => {
    let cancelled = false;
    fetch('/geo/countries-110m.json')
      .then(r => r.json())
      .then((topo: Topology<{ countries: GeometryCollection<{ name?: string }> }>) => {
        if (cancelled) return;
        const countries = feature(topo, topo.objects.countries);
        const features = ('features' in countries ? countries.features : [countries])
          .filter(f => (f.properties as { name?: string } | null)?.name !== 'Antarctica');
        setLandFeatures(features as object[]);
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
        color: new THREE.Color('#0b1230'),
        emissive: new THREE.Color('#060a1c'),
        shininess: 6,
        transparent: false,
      }),
    [],
  );

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
          atmosphereColor="#00d4ff"
          atmosphereAltitude={0.16}
          // ── Continents as a field of glowing hex dots ──
          hexPolygonsData={landFeatures}
          hexPolygonResolution={3}
          hexPolygonMargin={0.72}
          hexPolygonUseDots
          hexPolygonColor={() => `rgba(0, 212, 255, ${0.22 + Math.random() * 0.3})`}
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
            return `<div style="font-family:Montserrat,sans-serif;font-size:12px;padding:6px 10px;border-radius:10px;background:rgba(8,12,30,0.92);border:1px solid rgba(0,212,255,0.3);color:#e8eaf0">
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

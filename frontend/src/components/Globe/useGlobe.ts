import { useEffect, useRef, useCallback, useState } from 'react';
import * as THREE from 'three';
import * as topojson from 'topojson-client';
import type { Topology } from 'topojson-specification';
import { WORLD_CITIES, type CityData } from './citiesData';
import worldAtlasData from 'world-atlas/countries-110m.json';

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
}

const PIN_COLORS: Record<string, string> = {
  'box':       '#3A82F7',
  '4-7-8':     '#7AC4FF',
  'wim-hof':   '#FF9A5C',
  'coherent':  '#4AE8A0',
  'belly':     '#FFD97D',
  'alternate': '#C084FC',
  'other':     '#94A3B8',
};

const GLOBE_THEMES = {
  night:  { wire: 0x1E3358, coast: 0x4A9EFF, border: 0x2A5CAA },
  day:    { wire: 0xB0C8E8, coast: 0x1A6FBF, border: 0x2A5FAF },
  nature: { wire: 0x1A4028, coast: 0x4AE8A0, border: 0x1A7A4A },
};

// Ocean and land colors (fixed, dark, contrasting blue vs green)
const OCEAN_COLOR = '#06122A';
const LAND_COLOR  = '#0E2414';

export function latLngToVector3(lat: number, lng: number, radius = 2.05): THREE.Vector3 {
  const phi   = (90 - lat)  * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
     radius * Math.cos(phi),
     radius * Math.sin(phi) * Math.sin(theta)
  );
}

export function vector3ToLatLng(point: THREE.Vector3): { lat: number; lng: number } {
  const n = point.clone().normalize();
  const lat = 90 - Math.acos(Math.max(-1, Math.min(1, n.y))) * (180 / Math.PI);
  const lng = Math.atan2(n.z, -n.x) * (180 / Math.PI) - 180;
  return { lat, lng: lng < -180 ? lng + 360 : lng };
}

function buildEarthTexture(world: Topology): THREE.CanvasTexture {
  const W = 2048, H = 1024;
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const ctx = c.getContext('2d')!;

  // Ocean fill
  ctx.fillStyle = OCEAN_COLOR;
  ctx.fillRect(0, 0, W, H);

  // Land fill — world.objects.land may be a GeometryCollection, so
  // topojson.feature returns a FeatureCollection; iterate over features
  const landResult = topojson.feature(world, (world.objects as any).land) as any;
  const landFeatures: any[] = landResult.type === 'FeatureCollection'
    ? landResult.features
    : [landResult];

  ctx.fillStyle = LAND_COLOR;
  for (const feat of landFeatures) {
    const geom = feat.geometry ?? feat;
    if (!geom) continue;
    const allPolys: number[][][][] = geom.type === 'Polygon'
      ? [geom.coordinates]
      : geom.type === 'MultiPolygon'
        ? geom.coordinates
        : [];
    for (const poly of allPolys) {
      ctx.beginPath();
      for (const ring of poly) {
        let first = true;
        for (const [lng, lat] of ring) {
          const x = (lng + 180) / 360 * W;
          const y = (90 - lat) / 180 * H;
          if (first) { ctx.moveTo(x, y); first = false; }
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
      }
      ctx.fill('evenodd');
    }
  }

  // Graticule grid (subtle lat/lng lines for orientation)
  ctx.strokeStyle = 'rgba(255,255,255,0.07)';
  ctx.lineWidth = 1;
  for (let lat = -60; lat <= 60; lat += 30) {
    const y = (90 - lat) / 180 * H;
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }
  for (let lng = -150; lng <= 180; lng += 30) {
    const x = (lng + 180) / 360 * W;
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
  }

  return new THREE.CanvasTexture(c);
}

interface UseGlobeOptions {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  pins: GlobePin[];
  theme: 'night' | 'day' | 'nature';
  filterTechnique: string;
  onPinClick: (pin: GlobePin | null) => void;
  onGlobeClick: (lat: number, lng: number) => void;
}

export function useGlobe({
  canvasRef,
  pins,
  theme,
  filterTechnique,
  onPinClick,
}: UseGlobeOptions) {
  const [hoveredPin,  setHoveredPin]  = useState<GlobePin | null>(null);
  const [hoveredCity, setHoveredCity] = useState<CityData | null>(null);
  const [addPinMode,  setAddPinMode]  = useState(false);
  const [hoveredPos,  setHoveredPos]  = useState<{ x: number; y: number } | null>(null);

  // Scene refs
  const sceneRef        = useRef<THREE.Scene | null>(null);
  const cameraRef       = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef     = useRef<THREE.WebGLRenderer | null>(null);
  const globeGroupRef   = useRef<THREE.Group | null>(null);
  const globeMeshRef    = useRef<THREE.Mesh | null>(null);
  const wireMeshRef     = useRef<THREE.LineSegments | null>(null);
  const pinMeshesRef    = useRef<THREE.Mesh[]>([]);
  const borderLinesRef  = useRef<THREE.Line[]>([]);
  const cityMeshesRef   = useRef<THREE.Mesh[]>([]);
  const rafRef          = useRef<number>(0);

  // Interaction refs
  const isDraggingRef      = useRef(false);
  const lastMouseRef       = useRef({ x: 0, y: 0 });
  const velocityRef        = useRef({ x: 0, y: 0 });
  const lastInteractionRef = useRef(0);
  const addPinModeRef      = useRef(false);
  const onPinClickRef      = useRef(onPinClick);

  // Hover refs declared at hook body level (not inside useEffect)
  const hoveredPinRef  = useRef<GlobePin | null>(null);
  const hoveredCityRef = useRef<CityData | null>(null);

  useEffect(() => { onPinClickRef.current = onPinClick; }, [onPinClick]);
  useEffect(() => { addPinModeRef.current = addPinMode; }, [addPinMode]);

  // ── Init ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const parent = canvas.parentElement ?? canvas;
    const w0 = parent.clientWidth  || 800;
    const h0 = parent.clientHeight || 600;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, w0 / h0, 0.1, 100);
    camera.position.z = 5;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(w0, h0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    rendererRef.current = renderer;

    const globeGroup = new THREE.Group();
    scene.add(globeGroup);
    globeGroupRef.current = globeGroup;

    // Globe sphere — starts with solid color, texture applied async
    const sphereGeo = new THREE.SphereGeometry(2, 64, 64);
    const sphereMat = new THREE.MeshPhongMaterial({
      color:     0x06122A,
      emissive:  0x010508,
      emissiveIntensity: 0.4,
      shininess: 25,
    });
    const globeMesh = new THREE.Mesh(sphereGeo, sphereMat);
    globeGroup.add(globeMesh);
    globeMeshRef.current = globeMesh;

    // Wireframe
    const wireGeo   = new THREE.WireframeGeometry(new THREE.SphereGeometry(2.01, 24, 24));
    const wireMat   = new THREE.LineBasicMaterial({ color: 0x1E3358, transparent: true, opacity: 0.08 });
    const wireLines = new THREE.LineSegments(wireGeo, wireMat);
    globeGroup.add(wireLines);
    wireMeshRef.current = wireLines;

    // Lights
    const ambient  = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambient);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.9);
    dirLight.position.set(5, 3, 5);
    scene.add(dirLight);
    const rimLight = new THREE.DirectionalLight(0x4A9EFF, 0.3);
    rimLight.position.set(-5, -2, -5);
    scene.add(rimLight);

    // Entry animation
    globeGroup.scale.setScalar(0);
    const animStart = performance.now();
    function entryAnim(now: number) {
      const t = Math.min((now - animStart) / 800, 1);
      globeGroup.scale.setScalar(1 - Math.pow(1 - t, 3));
      if (t < 1) requestAnimationFrame(entryAnim);
    }
    requestAnimationFrame(entryAnim);

    // Resize
    const ro = new ResizeObserver(() => {
      const w = parent.clientWidth;
      const h = parent.clientHeight;
      if (w === 0 || h === 0) return;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    });
    ro.observe(parent);

    // ── Async: earth texture + borders + cities ──────────────────────────────
    let cancelled = false;

    function addGeoLines(coords: number[][][], color: number, opacity: number, radius: number) {
      const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity });
      for (const line of coords) {
        if (line.length < 2) continue;
        const pts = line.map(([lng, lat]) => latLngToVector3(lat, lng, radius));
        const geo = new THREE.BufferGeometry().setFromPoints(pts);
        const l   = new THREE.Line(geo, mat);
        globeGroup.add(l);
        borderLinesRef.current.push(l);
      }
    }

    (async () => {
      try {
        const world = worldAtlasData as unknown as Topology;
        if (cancelled) return;

        // Earth texture (ocean + land)
        const texture = buildEarthTexture(world);
        const mat = globeMeshRef.current!.material as THREE.MeshPhongMaterial;
        mat.map   = texture;
        mat.color.setHex(0xFFFFFF);
        mat.emissive.setHex(0x000000);
        mat.emissiveIntensity = 0;
        mat.shininess = 20;
        mat.needsUpdate = true;

        // Coastlines
        const coast = topojson.mesh(world, (world.objects as any).land);
        addGeoLines(coast.coordinates as number[][][], 0x4A9EFF, 0.8, 2.025);

        // Country borders
        const borders = topojson.mesh(world, (world.objects as any).countries, (a: any, b: any) => a !== b);
        addGeoLines(borders.coordinates as number[][][], 0x2A5CAA, 0.45, 2.022);

        if (cancelled) return;

        // City dots
        for (const city of WORLD_CITIES) {
          const r     = city.tier === 1 ? 0.018 : 0.012;
          const color = city.tier === 1 ? 0xE8E8FF : 0xA0A8C0;
          const geo   = new THREE.SphereGeometry(r, 6, 6);
          const mat   = new THREE.MeshBasicMaterial({ color });
          const mesh  = new THREE.Mesh(geo, mat);
          mesh.position.copy(latLngToVector3(city.lat, city.lng, 2.03));
          mesh.userData = { __cityData: city };
          mesh.visible  = false; // shown based on zoom
          globeGroup.add(mesh);
          cityMeshesRef.current.push(mesh);
        }
      } catch (e) {
        console.warn('Globe assets failed to load', e);
      }
    })();

    // ── Input events ─────────────────────────────────────────────────────────
    const raycaster = new THREE.Raycaster();
    raycaster.params.Points = { threshold: 0.05 };

    function getNDC(cx: number, cy: number): THREE.Vector2 {
      const rect = canvas.getBoundingClientRect();
      return new THREE.Vector2(
        ((cx - rect.left) / rect.width)  * 2 - 1,
        -((cy - rect.top) / rect.height) * 2 + 1
      );
    }

    function handleRaycast(cx: number, cy: number) {
      const ndc = getNDC(cx, cy);
      raycaster.setFromCamera(ndc, camera);

      // Check pins
      const pinHits = raycaster.intersectObjects(pinMeshesRef.current);
      if (pinHits.length > 0) {
        const pin = pinHits[0].object.userData as GlobePin;
        if (hoveredPinRef.current?._id !== pin._id) {
          pinMeshesRef.current.forEach(m => m.scale.setScalar(1));
          (pinHits[0].object as THREE.Mesh).scale.setScalar(2.5);
          setHoveredPin(pin);
          hoveredPinRef.current = pin;
          setHoveredCity(null);
          hoveredCityRef.current = null;
        }
        setHoveredPos({ x: cx, y: cy });
        canvas.style.cursor = 'pointer';
        return;
      }

      // Check cities
      const visibleCities = cityMeshesRef.current.filter(m => m.visible);
      const cityHits = raycaster.intersectObjects(visibleCities);
      if (cityHits.length > 0) {
        const city = cityHits[0].object.userData.__cityData as CityData;
        if (hoveredCityRef.current?.name !== city.name) {
          setHoveredCity(city);
          hoveredCityRef.current = city;
          setHoveredPin(null);
          hoveredPinRef.current = null;
        }
        setHoveredPos({ x: cx, y: cy });
        canvas.style.cursor = 'pointer';
        return;
      }

      // Nothing hovered
      if (hoveredPinRef.current !== null || hoveredCityRef.current !== null) {
        pinMeshesRef.current.forEach(m => m.scale.setScalar(1));
        setHoveredPin(null);
        hoveredPinRef.current = null;
        setHoveredCity(null);
        hoveredCityRef.current = null;
        setHoveredPos(null);
      }
      canvas.style.cursor = addPinModeRef.current ? 'crosshair' : 'grab';
    }

    function handleClick(cx: number, cy: number) {
      const ndc = getNDC(cx, cy);
      raycaster.setFromCamera(ndc, camera);
      const pinHits = raycaster.intersectObjects(pinMeshesRef.current);
      if (pinHits.length > 0) {
        onPinClickRef.current(pinHits[0].object.userData as GlobePin);
      }
    }

    function onMouseDown(e: MouseEvent) {
      isDraggingRef.current = true;
      lastMouseRef.current  = { x: e.clientX, y: e.clientY };
      velocityRef.current   = { x: 0, y: 0 };
    }
    function onMouseMove(e: MouseEvent) {
      if (!isDraggingRef.current) { handleRaycast(e.clientX, e.clientY); return; }
      const dx = e.clientX - lastMouseRef.current.x;
      const dy = e.clientY - lastMouseRef.current.y;
      lastMouseRef.current = { x: e.clientX, y: e.clientY };
      velocityRef.current  = { x: dx, y: dy };
      globeGroup.rotation.y += dx * 0.005;
      globeGroup.rotation.x += dy * 0.005;
      globeGroup.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, globeGroup.rotation.x));
      lastInteractionRef.current = Date.now();
    }
    function onMouseUp(e: MouseEvent) {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;
      lastInteractionRef.current = Date.now();
      const dx = e.clientX - lastMouseRef.current.x;
      const dy = e.clientY - lastMouseRef.current.y;
      if (Math.abs(dx) < 3 && Math.abs(dy) < 3) handleClick(e.clientX, e.clientY);
    }
    function onMouseLeave() {
      isDraggingRef.current = false;
      setHoveredPin(null);
      setHoveredCity(null);
      setHoveredPos(null);
    }

    let lastTouchDist = 0;
    function getTouchDist(t: TouchList) {
      const dx = t[0].clientX - t[1].clientX;
      const dy = t[0].clientY - t[1].clientY;
      return Math.sqrt(dx * dx + dy * dy);
    }
    function onTouchStart(e: TouchEvent) {
      if (e.touches.length === 1) {
        isDraggingRef.current = true;
        lastMouseRef.current  = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        velocityRef.current   = { x: 0, y: 0 };
      } else if (e.touches.length === 2) lastTouchDist = getTouchDist(e.touches);
      lastInteractionRef.current = Date.now();
    }
    function onTouchMove(e: TouchEvent) {
      e.preventDefault();
      if (e.touches.length === 1 && isDraggingRef.current) {
        const dx = e.touches[0].clientX - lastMouseRef.current.x;
        const dy = e.touches[0].clientY - lastMouseRef.current.y;
        lastMouseRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        velocityRef.current  = { x: dx, y: dy };
        globeGroup.rotation.y += dx * 0.005;
        globeGroup.rotation.x += dy * 0.005;
        globeGroup.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, globeGroup.rotation.x));
        lastInteractionRef.current = Date.now();
      } else if (e.touches.length === 2) {
        const dist = getTouchDist(e.touches);
        camera.position.z = Math.max(2.3, Math.min(8, camera.position.z - (dist - lastTouchDist) * 0.01));
        lastTouchDist = dist;
        lastInteractionRef.current = Date.now();
      }
    }
    function onTouchEnd() { isDraggingRef.current = false; lastInteractionRef.current = Date.now(); }
    function onWheel(e: WheelEvent) {
      e.preventDefault();
      camera.position.z = Math.max(2.3, Math.min(8, camera.position.z + e.deltaY * 0.005));
      lastInteractionRef.current = Date.now();
    }

    canvas.addEventListener('mousedown',  onMouseDown);
    canvas.addEventListener('mousemove',  onMouseMove);
    canvas.addEventListener('mouseup',    onMouseUp);
    canvas.addEventListener('mouseleave', onMouseLeave);
    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    canvas.addEventListener('touchmove',  onTouchMove,  { passive: false });
    canvas.addEventListener('touchend',   onTouchEnd);
    canvas.addEventListener('wheel',      onWheel, { passive: false });

    // ── Animation loop ────────────────────────────────────────────────────────
    function animate() {
      rafRef.current = requestAnimationFrame(animate);

      const z    = camera.position.z;
      const idle = Date.now() - lastInteractionRef.current;

      // Velocity damping
      if (!isDraggingRef.current) {
        globeGroup.rotation.y += velocityRef.current.x * 0.003;
        globeGroup.rotation.x += velocityRef.current.y * 0.003;
        globeGroup.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, globeGroup.rotation.x));
        velocityRef.current.x *= 0.92;
        velocityRef.current.y *= 0.92;
      }

      // Auto-rotate when idle
      if (idle > 3000 && !isDraggingRef.current) globeGroup.rotation.y += 0.001;

      // City visibility based on zoom
      cityMeshesRef.current.forEach((mesh, i) => {
        const tier = WORLD_CITIES[i].tier;
        mesh.visible = (tier === 1 && z < 6) || (tier === 2 && z < 4.8) || (tier === 3 && z < 3.5);
        // Scale up city dots when deeply zoomed
        const s = z < 3 ? 2.5 : z < 4 ? 1.5 : 1;
        if (mesh.visible) mesh.scale.setScalar(s);
      });

      renderer.render(scene, camera);
    }
    animate();

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      canvas.removeEventListener('mousedown',  onMouseDown);
      canvas.removeEventListener('mousemove',  onMouseMove);
      canvas.removeEventListener('mouseup',    onMouseUp);
      canvas.removeEventListener('mouseleave', onMouseLeave);
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove',  onTouchMove);
      canvas.removeEventListener('touchend',   onTouchEnd);
      canvas.removeEventListener('wheel',      onWheel);
      borderLinesRef.current.forEach(l => { l.geometry.dispose(); (l.material as THREE.Material).dispose(); });
      borderLinesRef.current = [];
      cityMeshesRef.current.forEach(m => { m.geometry.dispose(); (m.material as THREE.Material).dispose(); });
      cityMeshesRef.current = [];
      renderer.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasRef]);

  // ── Update pins ────────────────────────────────────────────────────────────
  useEffect(() => {
    const globeGroup = globeGroupRef.current;
    if (!globeGroup) return;
    pinMeshesRef.current.forEach(m => {
      globeGroup.remove(m);
      m.geometry.dispose();
      (m.material as THREE.Material).dispose();
    });
    pinMeshesRef.current = [];
    const filtered = filterTechnique && filterTechnique !== 'all'
      ? pins.filter(p => p.technique === filterTechnique)
      : pins;
    for (const pin of filtered.slice(0, 500)) {
      const color = new THREE.Color(PIN_COLORS[pin.technique] ?? PIN_COLORS.other);
      const geo   = new THREE.SphereGeometry(0.018, 8, 8);
      const mat   = new THREE.MeshBasicMaterial({ color });
      const mesh  = new THREE.Mesh(geo, mat);
      mesh.position.copy(latLngToVector3(pin.lat, pin.lng, 2.05));
      mesh.userData = pin;
      globeGroup.add(mesh);
      pinMeshesRef.current.push(mesh);
    }
  }, [pins, filterTechnique]);

  // ── Update theme ───────────────────────────────────────────────────────────
  useEffect(() => {
    const wireMesh = wireMeshRef.current;
    if (!wireMesh) return;
    const tc = GLOBE_THEMES[theme] ?? GLOBE_THEMES.night;
    (wireMesh.material as THREE.LineBasicMaterial).color.setHex(tc.wire);
    const lines = borderLinesRef.current;
    const mid   = Math.floor(lines.length / 2);
    lines.slice(0, mid).forEach(l => (l.material as THREE.LineBasicMaterial).color.setHex(tc.coast));
    lines.slice(mid).forEach(l  => (l.material as THREE.LineBasicMaterial).color.setHex(tc.border));
  }, [theme]);

  const setAddPinModeCallback = useCallback((v: boolean) => {
    setAddPinMode(v);
    addPinModeRef.current = v;
    if (canvasRef.current) canvasRef.current.style.cursor = v ? 'crosshair' : 'grab';
  }, [canvasRef]);

  return { hoveredPin, hoveredCity, addPinMode, setAddPinMode: setAddPinModeCallback, hoveredPos };
}

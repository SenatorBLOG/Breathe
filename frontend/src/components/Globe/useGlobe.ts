import { useEffect, useRef, useCallback, useState } from 'react';
import * as THREE from 'three';
import * as topojson from 'topojson-client';
import type { Topology } from 'topojson-specification';
import { WORLD_CITIES, type CityData } from './citiesData';
import worldAtlasData from 'world-atlas/countries-50m.json';

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
  night:  { wire: 0x1E3358, coast: 0x4A9EFF, border: 0x2A7AFF },
  day:    { wire: 0xB0C8E8, coast: 0x1A6FBF, border: 0xD4920A },
  nature: { wire: 0x0E2A1A, coast: 0x4AE8A0, border: 0x22DD66 },
};

// Per-theme ocean + land fill colors
const GLOBE_FILLS = {
  night:  { ocean: '#0C1E38', land: '#243D68' }, // mid-navy ocean, dusty-blue land
  day:    { ocean: '#1E5C8A', land: '#A07848' }, // ocean blue, warm sand land
  nature: { ocean: '#0A1E12', land: '#1E4A2C' }, // deep teal ocean, muted forest land
};

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

// ── ISO 3166-1 numeric → country name (subset covering world-atlas ids) ───────
const ISO_COUNTRIES: Record<number, string> = {
  4:'Afghanistan',8:'Albania',12:'Algeria',24:'Angola',32:'Argentina',
  36:'Australia',40:'Austria',50:'Bangladesh',56:'Belgium',64:'Bhutan',
  68:'Bolivia',76:'Brazil',100:'Bulgaria',116:'Cambodia',120:'Cameroon',
  124:'Canada',144:'Sri Lanka',152:'Chile',156:'China',170:'Colombia',
  191:'Croatia',192:'Cuba',196:'Cyprus',203:'Czech Republic',208:'Denmark',
  218:'Ecuador',818:'Egypt',231:'Ethiopia',246:'Finland',250:'France',
  276:'Germany',288:'Ghana',300:'Greece',320:'Guatemala',340:'Honduras',
  348:'Hungary',356:'India',360:'Indonesia',364:'Iran',368:'Iraq',
  372:'Ireland',376:'Israel',380:'Italy',392:'Japan',400:'Jordan',
  398:'Kazakhstan',404:'Kenya',408:'North Korea',410:'South Korea',
  414:'Kuwait',418:'Laos',422:'Lebanon',440:'Lithuania',442:'Luxembourg',
  484:'Mexico',496:'Mongolia',504:'Morocco',516:'Namibia',524:'Nepal',
  528:'Netherlands',554:'New Zealand',566:'Nigeria',578:'Norway',
  586:'Pakistan',604:'Peru',608:'Philippines',616:'Poland',620:'Portugal',
  634:'Qatar',642:'Romania',643:'Russia',682:'Saudi Arabia',686:'Senegal',
  703:'Slovakia',705:'Slovenia',706:'Somalia',710:'South Africa',
  724:'Spain',729:'Sudan',752:'Sweden',756:'Switzerland',760:'Syria',
  764:'Thailand',788:'Tunisia',792:'Turkey',800:'Uganda',804:'Ukraine',
  784:'United Arab Emirates',826:'United Kingdom',840:'United States',
  858:'Uruguay',862:'Venezuela',704:'Vietnam',887:'Yemen',894:'Zambia',
  716:'Zimbabwe',70:'Bosnia and Herzegovina',807:'North Macedonia',
  499:'Montenegro',688:'Serbia',520:'Nauru',426:'Lesotho',748:'Eswatini',
  430:'Liberia',454:'Malawi',508:'Mozambique',646:'Rwanda',108:'Burundi',
  174:'Comoros',262:'Djibouti',232:'Eritrea',
};

// Ray-casting point-in-polygon (works in lng/lat space)
function pointInRing(lng: number, lat: number, ring: number[][]): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i], [xj, yj] = ring[j];
    if ((yi > lat) !== (yj > lat) && lng < (xj - xi) * (lat - yi) / (yj - yi) + xi)
      inside = !inside;
  }
  return inside;
}

function getCountryAtLatLng(lat: number, lng: number, features: any[]): string {
  for (const feat of features) {
    const geom = feat.geometry;
    if (!geom) continue;
    const polys: number[][][][] = geom.type === 'Polygon'
      ? [geom.coordinates] : geom.type === 'MultiPolygon' ? geom.coordinates : [];
    for (const poly of polys) {
      if (!pointInRing(lng, lat, poly[0])) continue;
      let inHole = false;
      for (let r = 1; r < poly.length; r++) {
        if (pointInRing(lng, lat, poly[r])) { inHole = true; break; }
      }
      if (!inHole) return ISO_COUNTRIES[feat.id as number] ?? '';
    }
  }
  return '';
}

// Same as getCountryAtLatLng but returns the feature object for highlight rendering
function getFeatureAtLatLng(lat: number, lng: number, features: any[]): any | null {
  for (const feat of features) {
    const geom = feat.geometry;
    if (!geom) continue;
    const polys: number[][][][] = geom.type === 'Polygon'
      ? [geom.coordinates] : geom.type === 'MultiPolygon' ? geom.coordinates : [];
    for (const poly of polys) {
      if (!pointInRing(lng, lat, poly[0])) continue;
      let inHole = false;
      for (let r = 1; r < poly.length; r++) {
        if (pointInRing(lng, lat, poly[r])) { inHole = true; break; }
      }
      if (!inHole) return feat;
    }
  }
  return null;
}

// Draw a single country fill into an existing canvas context (for hover highlight)
function drawCountryHighlight(
  ctx: CanvasRenderingContext2D, W: number, H: number,
  feat: any, fillColor: string
) {
  ctx.clearRect(0, 0, W, H);
  if (!feat) return;
  ctx.fillStyle = fillColor;
  const geom = feat.geometry;
  const polys: number[][][][] = geom.type === 'Polygon'
    ? [geom.coordinates] : geom.type === 'MultiPolygon' ? geom.coordinates : [];
  for (const poly of polys) {
    for (const outerVer of splitRingAtMeridian(poly[0])) {
      ctx.beginPath();
      let first = true;
      for (const [lng, lat] of outerVer) {
        const x = px(lng, W), y = py(lat, H);
        if (first) { ctx.moveTo(x, y); first = false; } else ctx.lineTo(x, y);
      }
      ctx.closePath();
      for (let r = 1; r < poly.length; r++) traceRing(ctx, poly[r], W, H);
      ctx.fill('evenodd');
    }
  }
}

// Project lng/lat to canvas pixel coordinates
function px(lng: number, W: number) { return (lng + 180) / 360 * W; }
function py(lat: number, H: number) { return (90 - lat)  / 180 * H; }

// Split a polygon ring at the antimeridian so it renders correctly in
// equirectangular projection. Returns 1 or 2 shifted copies of the ring.
function splitRingAtMeridian(ring: number[][]): number[][][] {
  let crosses = false;
  for (let i = 1; i < ring.length; i++) {
    if (Math.abs(ring[i][0] - ring[i - 1][0]) > 170) { crosses = true; break; }
  }
  if (!crosses) return [ring];
  // Right copy: shift negative longitudes to [0, 360]
  const right = ring.map(([lng, lat]) => [lng < 0 ? lng + 360 : lng, lat]);
  // Left copy: shift positive longitudes to [-360, 0]
  const left  = ring.map(([lng, lat]) => [lng > 0 ? lng - 360 : lng, lat]);
  return [right, left];
}

// Trace a ring onto the canvas path (one pass per antimeridian-split copy)
function traceRing(ctx: CanvasRenderingContext2D, ring: number[][], W: number, H: number) {
  for (const version of splitRingAtMeridian(ring)) {
    let first = true;
    for (const [lng, lat] of version) {
      const x = px(lng, W), y = py(lat, H);
      if (first) { ctx.moveTo(x, y); first = false; }
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
  }
}


function createGlowTexture(): THREE.CanvasTexture {
  const size = 64;
  const c = document.createElement('canvas');
  c.width = size; c.height = size;
  const ctx = c.getContext('2d')!;
  const half = size / 2;
  // Tight core so the halo doesn't spill past the globe silhouette
  const g = ctx.createRadialGradient(half, half, 0, half, half, half);
  g.addColorStop(0,    'rgba(255,255,255,1)');
  g.addColorStop(0.10, 'rgba(220,235,255,0.9)');
  g.addColorStop(0.28, 'rgba(140,190,255,0.3)');
  g.addColorStop(0.55, 'rgba(60,130,255,0.06)');
  g.addColorStop(1,    'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const t = new THREE.CanvasTexture(c);
  t.flipY = false; // radially symmetric — flip doesn't matter; avoids WebGL2 texImage3D warning
  return t;
}

// Land-only fill texture: transparent where ocean, LAND_COLOR where land.
// The sphere base provides the ocean color; this transparent overlay adds land.
function buildLandTexture(world: Topology): THREE.CanvasTexture {
  const W = 2048, H = 1024;
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const ctx = c.getContext('2d')!;

  // Fully transparent background — ocean pixels stay invisible
  ctx.clearRect(0, 0, W, H);

  // Land fill (solid, opaque) — alpha=1 makes these pixels visible on the land mesh
  const countriesResult = topojson.feature(world, (world.objects as any).countries) as any;
  ctx.fillStyle = '#FFFFFF'; // white mask — tinted at render time by material.color
  for (const feat of countriesResult.features) {
    const geom = feat.geometry;
    if (!geom) continue;
    const polys: number[][][][] = geom.type === 'Polygon'
      ? [geom.coordinates]
      : geom.type === 'MultiPolygon' ? geom.coordinates : [];
    for (const poly of polys) {
      const outerVersions = splitRingAtMeridian(poly[0]);
      for (const outerVer of outerVersions) {
        ctx.beginPath();
        let first = true;
        for (const [lng, lat] of outerVer) {
          const x = px(lng, W), y = py(lat, H);
          if (first) { ctx.moveTo(x, y); first = false; }
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        for (let r = 1; r < poly.length; r++) {
          traceRing(ctx, poly[r], W, H);
        }
        ctx.fill('evenodd');
      }
    }
  }

  const tex = new THREE.CanvasTexture(c);
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  return tex;
}

// ── 3-D country border lines from topojson MultiLineString ────────────────────
function buildCountryBorderLines(
  group: THREE.Group,
  world: Topology,
  themeColor: number
): { borderMat: THREE.LineBasicMaterial; borderGroup: THREE.Group } {
  const borderGroup = new THREE.Group();
  const borderMat   = new THREE.LineBasicMaterial({
    color:       themeColor,
    transparent: true,
    opacity:     0.75,
    depthWrite:  false,
  });

  const borders = topojson.mesh(world, (world.objects as any).countries, (a: any, b: any) => a !== b) as any;
  for (const line of borders.coordinates as number[][][]) {
    let segment: THREE.Vector3[] = [];
    let prevLng = line[0]?.[0] ?? 0;
    for (const [lng, lat] of line) {
      if (Math.abs(lng - prevLng) > 170) {
        if (segment.length >= 2) {
          borderGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(segment), borderMat));
        }
        segment = [];
      }
      segment.push(latLngToVector3(lat, lng, 2.003));
      prevLng = lng;
    }
    if (segment.length >= 2) {
      borderGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(segment), borderMat));
    }
  }
  group.add(borderGroup);
  return { borderMat, borderGroup };
}

// ── 3-D coastline lines from topojson land boundary ──────────────────────────
function buildCoastlineLines(
  group: THREE.Group,
  world: Topology,
  themeColor: number
): { coastMat: THREE.LineBasicMaterial; coastGroup: THREE.Group } {
  const coastGroup = new THREE.Group();
  const coastMat   = new THREE.LineBasicMaterial({
    color:       themeColor,
    transparent: true,
    opacity:     0.90,
    depthWrite:  false,
  });

  const coast = topojson.mesh(world, (world.objects as any).land) as any;
  for (const line of coast.coordinates as number[][][]) {
    let segment: THREE.Vector3[] = [];
    let prevLng = line[0]?.[0] ?? 0;
    for (const [lng, lat] of line) {
      if (Math.abs(lng - prevLng) > 170) {
        if (segment.length >= 2) {
          coastGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(segment), coastMat));
        }
        segment = [];
      }
      segment.push(latLngToVector3(lat, lng, 2.002));
      prevLng = lng;
    }
    if (segment.length >= 2) {
      coastGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(segment), coastMat));
    }
  }
  group.add(coastGroup);
  return { coastMat, coastGroup };
}

// ── Equator, tropics, polar circles ──────────────────────────────────────────
function buildLatitudeLines(group: THREE.Group, baseColor: THREE.Color): THREE.Group {
  const latGroup = new THREE.Group();
  const LATS = [
    { lat: 0,     opacity: 0.55 }, // equator
    { lat: 23.5,  opacity: 0.25 }, // tropic of cancer
    { lat: -23.5, opacity: 0.25 }, // tropic of capricorn
    { lat: 66.5,  opacity: 0.15 }, // arctic circle
    { lat: -66.5, opacity: 0.15 }, // antarctic circle
  ];
  for (const { lat, opacity } of LATS) {
    const mat    = new THREE.LineBasicMaterial({ color: baseColor, transparent: true, opacity, depthWrite: false });
    const points: THREE.Vector3[] = [];
    for (let lng = -180; lng <= 182; lng += 2) points.push(latLngToVector3(lat, lng, 2.002));
    latGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), mat));
  }
  group.add(latGroup);
  return latGroup;
}

export type GlobeStyle = 'neon' | 'terrain' | 'wire' | 'cesium';

interface UseGlobeOptions {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  pins: GlobePin[];
  theme: 'night' | 'day' | 'nature';
  style: GlobeStyle;
  filterTechnique: string;
  onPinClick: (pin: GlobePin | null) => void;
  onGlobeClick: (lat: number, lng: number, country: string) => void;
}

export function useGlobe({
  canvasRef,
  pins,
  theme,
  style,
  filterTechnique,
  onPinClick,
  onGlobeClick,
}: UseGlobeOptions) {
  const [hoveredPin,  setHoveredPin]  = useState<GlobePin | null>(null);
  const [hoveredCity, setHoveredCity] = useState<CityData | null>(null);
  const [addPinMode,  setAddPinMode]  = useState(false);
  const [hoveredPos,  setHoveredPos]  = useState<{ x: number; y: number } | null>(null);
  const [cityLabels, setCityLabels] = useState<{ name: string; x: number; y: number; tier: number }[]>([]);
  const labelFrameRef = useRef(0);

  // Scene refs
  const sceneRef        = useRef<THREE.Scene | null>(null);
  const cameraRef       = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef     = useRef<THREE.WebGLRenderer | null>(null);
  const globeGroupRef     = useRef<THREE.Group | null>(null);
  const globeMeshRef      = useRef<THREE.Mesh | null>(null);
  const landMaterialRef   = useRef<THREE.MeshBasicMaterial | null>(null);
  const landMeshRef       = useRef<THREE.Mesh | null>(null);
  const terrainTexRef       = useRef<THREE.Texture | null>(null);
  const hlCanvasRef         = useRef<HTMLCanvasElement | null>(null);
  const hlCtxRef            = useRef<CanvasRenderingContext2D | null>(null);
  const hlTexRef            = useRef<THREE.CanvasTexture | null>(null);
  const hoveredCountryIdRef = useRef<number | null>(null);
  const borderGroupRef      = useRef<THREE.Group | null>(null);
  const borderMaterialRef = useRef<THREE.LineBasicMaterial | null>(null);
  const coastGroupRef     = useRef<THREE.Group | null>(null);
  const coastMaterialRef  = useRef<THREE.LineBasicMaterial | null>(null);
  const latLineGroupRef   = useRef<THREE.Group | null>(null);
  const pinMeshesRef      = useRef<THREE.Mesh[]>([]);
  const pinGroupsRef      = useRef<THREE.Group[]>([]);
  const pinRingsRef       = useRef<THREE.Mesh[]>([]);
  const cityMeshesRef     = useRef<THREE.Mesh[]>([]);
  const cityStemsRef      = useRef<THREE.Line[]>([]);
  const rafRef            = useRef<number>(0);
  const glowTexRef        = useRef<THREE.CanvasTexture | null>(null);
  const countryFeaturesRef = useRef<any[]>([]);

  // Interaction refs
  const isDraggingRef      = useRef(false);
  const lastMouseRef       = useRef({ x: 0, y: 0 });
  const velocityRef        = useRef({ x: 0, y: 0 });
  const lastInteractionRef = useRef(0);
  const addPinModeRef      = useRef(false);
  const onPinClickRef      = useRef(onPinClick);
  const onGlobeClickRef    = useRef(onGlobeClick);

  // Hover refs declared at hook body level (not inside useEffect)
  const hoveredPinRef  = useRef<GlobePin | null>(null);
  const hoveredCityRef = useRef<CityData | null>(null);

  useEffect(() => { onPinClickRef.current   = onPinClick;   }, [onPinClick]);
  useEffect(() => { onGlobeClickRef.current = onGlobeClick; }, [onGlobeClick]);
  useEffect(() => { addPinModeRef.current = addPinMode; }, [addPinMode]);

  // ── Init ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // After the guard TypeScript narrows canvas, but not inside closures.
    // The cast lets nested functions use it without null-check complaints.
    const cv = canvas as HTMLCanvasElement;

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
    const gf0 = GLOBE_FILLS[theme] ?? GLOBE_FILLS.night;
    const sphereMat = new THREE.MeshPhongMaterial({
      color:     new THREE.Color(gf0.ocean),
      emissive:  new THREE.Color(gf0.ocean).multiplyScalar(0.4),
      emissiveIntensity: 0.5,
      shininess: 30,
    });
    const globeMesh = new THREE.Mesh(sphereGeo, sphereMat);
    globeGroup.add(globeMesh);
    globeMeshRef.current = globeMesh;


    // Lights
    const ambient  = new THREE.AmbientLight(0xffffff, 0.45);
    scene.add(ambient);
    const dirLight = new THREE.DirectionalLight(0xFFF8EE, 0.85);
    dirLight.position.set(5, 3, 5);
    scene.add(dirLight);
    const rimLight = new THREE.DirectionalLight(0x4A9EFF, 0.35);
    rimLight.position.set(-5, -2, -5);
    scene.add(rimLight);
    const bottomFill = new THREE.DirectionalLight(0x1A3366, 0.25);
    bottomFill.position.set(0, -5, 2);
    scene.add(bottomFill);

    // ── Atmosphere glow (BackSide — only the rim halo is visible) ──────────
    const atmosGeo = new THREE.SphereGeometry(2.3, 64, 64);
    const atmosMat = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float d = dot(vNormal, vec3(0.0, 0.0, 1.0));
          float intensity = pow(max(0.0, 0.6 - d), 4.0) * 0.35;
          gl_FragColor = vec4(0.3, 0.6, 1.0, 1.0) * intensity;
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      depthWrite: false,
    });
    globeGroup.add(new THREE.Mesh(atmosGeo, atmosMat));

    // ── Starfield ────────────────────────────────────────────────────────────
    const starCount = 2000;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const r = 25 + Math.random() * 75;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      starPositions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      starPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      starPositions[i * 3 + 2] = r * Math.cos(phi);
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0xFFFFFF, size: 0.12, transparent: true, opacity: 0.7, sizeAttenuation: true,
    });
    scene.add(new THREE.Points(starGeo, starMat));

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

    (async () => {
      try {
        const world = worldAtlasData as unknown as Topology;
        if (cancelled) return;

        // Land fill overlay — transparent where ocean, LAND_COLOR where land.
        // Sits just outside the ocean sphere so land areas are colored separately.
        const gf      = GLOBE_FILLS[theme] ?? GLOBE_FILLS.night;
        const landTex = buildLandTexture(world);
        const landMat = new THREE.MeshBasicMaterial({
          map:         landTex,
          color:       new THREE.Color(gf.land),
          transparent: true,
          depthWrite:  false,
        });
        landMaterialRef.current = landMat;
        const landMesh = new THREE.Mesh(new THREE.SphereGeometry(2.001, 64, 64), landMat);
        landMeshRef.current = landMesh;
        globeGroup.add(landMesh);

        // Highlight sphere — transparent canvas updated on country hover
        const hlCanvas = document.createElement('canvas');
        hlCanvas.width = 2048; hlCanvas.height = 1024;
        hlCanvasRef.current = hlCanvas;
        hlCtxRef.current    = hlCanvas.getContext('2d')!;
        const hlTex = new THREE.CanvasTexture(hlCanvas);
        hlTex.minFilter = THREE.LinearFilter;
        hlTex.magFilter = THREE.LinearFilter;
        hlTexRef.current = hlTex;
        const hlMat  = new THREE.MeshBasicMaterial({ map: hlTex, transparent: true, depthWrite: false });
        const hlMesh = new THREE.Mesh(new THREE.SphereGeometry(2.004, 64, 64), hlMat);
        globeGroup.add(hlMesh);

        // 3-D country border lines + latitude reference lines
        const tc = GLOBE_THEMES[theme] ?? GLOBE_THEMES.night;
        const { borderMat, borderGroup } = buildCountryBorderLines(globeGroup, world, tc.border);
        borderGroupRef.current    = borderGroup;
        borderMaterialRef.current = borderMat;

        const { coastMat, coastGroup } = buildCoastlineLines(globeGroup, world, tc.coast);
        coastGroupRef.current    = coastGroup;
        coastMaterialRef.current = coastMat;

        latLineGroupRef.current   = buildLatitudeLines(globeGroup, borderMat.color);

        // Store decoded country features for click → country name lookup
        const countriesGeo = topojson.feature(world, (world.objects as any).countries) as any;
        countryFeaturesRef.current = countriesGeo.type === 'FeatureCollection'
          ? countriesGeo.features
          : [countriesGeo];

        if (cancelled) return;

        // City dot markers + surface stems
        glowTexRef.current = createGlowTexture(); // still used for pin halos
        for (const city of WORLD_CITIES) {
          const r   = city.tier === 1 ? 0.022 : city.tier === 2 ? 0.015 : 0.010;
          const hex = city.tier === 1 ? 0xFFEDD5 : city.tier === 2 ? 0xFDD9A0 : 0xE8C070;
          const col = new THREE.Color(hex);
          const mat = new THREE.MeshPhongMaterial({
            color:             col,
            emissive:          col,
            emissiveIntensity: city.tier === 1 ? 1.2 : city.tier === 2 ? 0.9 : 0.6,
            shininess:         40,
          });
          const mesh = new THREE.Mesh(new THREE.SphereGeometry(r, 6, 6), mat);
          mesh.position.copy(latLngToVector3(city.lat, city.lng, 2.025));
          mesh.userData = { __cityData: city };
          mesh.visible  = false;
          globeGroup.add(mesh);
          cityMeshesRef.current.push(mesh);

          // Thin stem from globe surface to dot
          const stemMat = new THREE.LineBasicMaterial({
            color: col, transparent: true,
            opacity: city.tier === 1 ? 0.65 : 0.45, depthWrite: false,
          });
          const stem = new THREE.Line(
            new THREE.BufferGeometry().setFromPoints([
              latLngToVector3(city.lat, city.lng, 2.001),
              latLngToVector3(city.lat, city.lng, 2.024),
            ]),
            stemMat,
          );
          stem.visible = false;
          globeGroup.add(stem);
          cityStemsRef.current.push(stem);
        }
      } catch (e) {
        console.warn('Globe assets failed to load', e);
      }
    })();

    // ── Input events ─────────────────────────────────────────────────────────
    const raycaster = new THREE.Raycaster();
    raycaster.params.Points = { threshold: 0.05 };

    function getNDC(cx: number, cy: number): THREE.Vector2 {
      const rect = cv.getBoundingClientRect();
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
          // Scale the whole group for hover, not just the head mesh
          pinGroupsRef.current.forEach(g => g.scale.setScalar(1));
          const hitGroup = pinHits[0].object.parent as THREE.Group;
          if (hitGroup) hitGroup.scale.setScalar(1.6);
          setHoveredPin(pin);
          hoveredPinRef.current = pin;
          setHoveredCity(null);
          hoveredCityRef.current = null;
        }
        setHoveredPos({ x: cx, y: cy });
        cv.style.cursor = 'pointer';
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
        cv.style.cursor = 'pointer';
        return;
      }

      // Check globe surface for country hover highlight
      if (globeMeshRef.current) {
        const surfaceHits = raycaster.intersectObject(globeMeshRef.current);
        if (surfaceHits.length > 0) {
          const local = globeGroup.worldToLocal(surfaceHits[0].point.clone());
          const { lat, lng } = vector3ToLatLng(local);
          const feat   = getFeatureAtLatLng(lat, lng, countryFeaturesRef.current);
          const featId = (feat?.id ?? null) as number | null;
          if (featId !== hoveredCountryIdRef.current) {
            hoveredCountryIdRef.current = featId;
            const ctx = hlCtxRef.current; const tex = hlTexRef.current;
            if (ctx && tex) { drawCountryHighlight(ctx, 2048, 1024, feat, 'rgba(255,255,255,0.14)'); tex.needsUpdate = true; }
          }
        } else if (hoveredCountryIdRef.current !== null) {
          hoveredCountryIdRef.current = null;
          const ctx = hlCtxRef.current; const tex = hlTexRef.current;
          if (ctx && tex) { ctx.clearRect(0, 0, 2048, 1024); tex.needsUpdate = true; }
        }
      }

      // Nothing hovered
      if (hoveredPinRef.current !== null || hoveredCityRef.current !== null) {
        pinGroupsRef.current.forEach(g => g.scale.setScalar(1));
        setHoveredPin(null);
        hoveredPinRef.current = null;
        setHoveredCity(null);
        hoveredCityRef.current = null;
        setHoveredPos(null);
      }
      cv.style.cursor = addPinModeRef.current ? 'crosshair' : 'grab';
    }

    function handleClick(cx: number, cy: number) {
      const ndc = getNDC(cx, cy);
      raycaster.setFromCamera(ndc, camera);

      // Check pins first
      const pinHits = raycaster.intersectObjects(pinMeshesRef.current);
      if (pinHits.length > 0) {
        onPinClickRef.current(pinHits[0].object.userData as GlobePin);
        return;
      }

      // Click on globe surface → detect lat/lng + country name
      const globeHits = raycaster.intersectObject(globeMeshRef.current!);
      if (globeHits.length > 0) {
        const local = globeGroup.worldToLocal(globeHits[0].point.clone());
        const { lat, lng } = vector3ToLatLng(local);
        const country = getCountryAtLatLng(lat, lng, countryFeaturesRef.current);
        onGlobeClickRef.current(lat, lng, country);
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
      const dragSens = 0.005 * Math.pow(camera.position.z / 5, 2);
      globeGroup.rotation.y += dx * dragSens;
      globeGroup.rotation.x += dy * dragSens;
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
      hoveredCountryIdRef.current = null;
      const ctx = hlCtxRef.current; const tex = hlTexRef.current;
      if (ctx && tex) { ctx.clearRect(0, 0, 2048, 1024); tex.needsUpdate = true; }
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
        const touchSens = 0.005 * Math.pow(camera.position.z / 5, 2);
        globeGroup.rotation.y += dx * touchSens;
        globeGroup.rotation.x += dy * touchSens;
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
      const ndc = getNDC(e.clientX, e.clientY);
      raycaster.setFromCamera(ndc, camera);
      if (!globeMeshRef.current || raycaster.intersectObject(globeMeshRef.current).length === 0) return;
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

      // Auto-rotate when idle for 30 s (not 3 s — give user time to aim)
      if (idle > 30000 && !isDraggingRef.current) globeGroup.rotation.y += 0.001;

      // City visibility + back-face culling + pulse glow animation
      const dotScale = z / 5;
      const _wp = new THREE.Vector3();
      const time = performance.now() * 0.001;
      cityMeshesRef.current.forEach((mesh, i) => {
        const tier = WORLD_CITIES[i].tier;
        const zoomVis = (tier === 1 && z < 6) || (tier === 2 && z < 4.8) || (tier === 3 && z < 3.5);
        if (!zoomVis) {
          mesh.visible = false;
          if (cityStemsRef.current[i]) cityStemsRef.current[i].visible = false;
          return;
        }
        mesh.getWorldPosition(_wp);
        const isFront = _wp.dot(camera.position) > _wp.lengthSq();
        mesh.visible = isFront;
        if (cityStemsRef.current[i]) cityStemsRef.current[i].visible = isFront;
        if (isFront) {
          const pulse = 1 + 0.18 * Math.sin(time * 1.8 + i * 0.5);
          mesh.scale.setScalar(dotScale * pulse);
        }
      });

      // Pulse rings — expand and fade out from pin base
      pinRingsRef.current.forEach((ring, i) => {
        const period  = 2.4;
        const phase   = ((time / period + i * 0.37) % 1);
        const scale   = 0.6 + phase * 1.4;          // 0.6 → 2.0
        const opacity = 0.55 * (1 - phase);          // 0.55 → 0
        ring.scale.setScalar(scale);
        (ring.material as THREE.MeshBasicMaterial).opacity = opacity;
      });

      // City labels: project to screen when zoomed in closely
      labelFrameRef.current++;
      if (labelFrameRef.current % 4 === 0) {
        if (z < 3.5 && globeGroupRef.current) {
          const rect = cv.getBoundingClientRect();
          const newLabels: { name: string; x: number; y: number; tier: number }[] = [];
          for (const mesh of cityMeshesRef.current) {
            if (!mesh.visible) continue;
            const city = mesh.userData.__cityData as CityData;
            if (city.tier > 2) continue;
            const worldPos = mesh.position.clone();
            globeGroupRef.current.localToWorld(worldPos);
            const projected = worldPos.clone().project(camera);
            if (projected.z > 1) continue; // behind camera
            const sx = (projected.x + 1) / 2 * rect.width;
            const sy = (-projected.y + 1) / 2 * rect.height;
            newLabels.push({ name: city.name, x: sx, y: sy, tier: city.tier });
          }
          setCityLabels(newLabels);
        } else {
          setCityLabels(prev => prev.length === 0 ? prev : []);
        }
      }

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
      cityMeshesRef.current.forEach(m => { if (m instanceof THREE.Mesh) m.geometry.dispose(); (m.material as THREE.Material).dispose(); });
      cityMeshesRef.current = [];
      cityStemsRef.current.forEach(l => { l.geometry.dispose(); (l.material as THREE.Material).dispose(); });
      cityStemsRef.current = [];
      renderer.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasRef]);

  // ── Update pins ────────────────────────────────────────────────────────────
  useEffect(() => {
    const globeGroup = globeGroupRef.current;
    if (!globeGroup) return;

    // Remove old pin groups + rings from scene and dispose
    pinGroupsRef.current.forEach(g => {
      globeGroup.remove(g);
      g.traverse(child => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          (child.material as THREE.Material).dispose();
        }
      });
    });
    pinGroupsRef.current = [];
    pinMeshesRef.current = [];
    pinRingsRef.current  = [];

    const filtered = filterTechnique && filterTechnique !== 'all'
      ? pins.filter(p => p.technique === filterTechnique)
      : pins;

    // Shared geometry for all pins
    const headGeo   = new THREE.SphereGeometry(0.020, 16, 16);
    const needleGeo = new THREE.ConeGeometry(0.006, 0.050, 8);
    const ringGeo   = new THREE.RingGeometry(0.012, 0.032, 24);

    for (const pin of filtered.slice(0, 500)) {
      const hex   = PIN_COLORS[pin.technique] ?? PIN_COLORS.other;
      const color = new THREE.Color(hex);

      // Head — smooth, bright, with a small white inner core for "jewel" look
      const headMat  = new THREE.MeshPhongMaterial({
        color, emissive: color, emissiveIntensity: 0.55, shininess: 80,
      });
      const headMesh = new THREE.Mesh(headGeo, headMat);
      headMesh.position.set(0, 0.062, 0);
      headMesh.userData = pin;

      // Bright white core inside the head
      const coreMat  = new THREE.MeshBasicMaterial({ color: 0xFFFFFF, transparent: true, opacity: 0.55 });
      const coreMesh = new THREE.Mesh(new THREE.SphereGeometry(0.008, 8, 8), coreMat);
      coreMesh.position.set(0, 0.062, 0);

      // Needle — 8-sided for smoothness
      const needleMat  = new THREE.MeshPhongMaterial({
        color: color.clone().multiplyScalar(0.55), shininess: 30,
      });
      const needleMesh = new THREE.Mesh(needleGeo, needleMat);
      needleMesh.rotation.x = Math.PI;
      needleMesh.position.set(0, 0.025, 0);

      // Glow halo
      if (glowTexRef.current) {
        const glowMat = new THREE.SpriteMaterial({
          map: glowTexRef.current, color: color.clone(),
          transparent: true, blending: THREE.AdditiveBlending,
          depthWrite: false, opacity: 0.70,
        });
        const glowSprite = new THREE.Sprite(glowMat);
        glowSprite.scale.setScalar(0.14);
        glowSprite.position.set(0, 0.062, 0);
        headMesh.add(glowSprite);
      }

      // Pulse ring — lies flat on the surface, animated in loop
      const ringMat = new THREE.MeshBasicMaterial({
        color, transparent: true, opacity: 0.55,
        side: THREE.DoubleSide, depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = -Math.PI / 2; // face outward (+Y = outward in group space)
      ringMesh.position.set(0, 0.001, 0);
      pinRingsRef.current.push(ringMesh);

      // Group: oriented radially outward
      const group = new THREE.Group();
      group.add(headMesh, coreMesh, needleMesh, ringMesh);

      const surfacePos = latLngToVector3(pin.lat, pin.lng, 2.00);
      group.position.copy(surfacePos);
      group.quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        surfacePos.clone().normalize()
      );

      globeGroup.add(group);
      pinGroupsRef.current.push(group);
      pinMeshesRef.current.push(headMesh);
    }
  }, [pins, filterTechnique]);

  // ── Update theme + style ──────────────────────────────────────────────────
  useEffect(() => {
    const borderMat = borderMaterialRef.current;
    if (!borderMat) return;
    const tc = GLOBE_THEMES[theme] ?? GLOBE_THEMES.night;
    const gf = GLOBE_FILLS[theme]  ?? GLOBE_FILLS.night;
    const sph = globeMeshRef.current?.material as THREE.MeshPhongMaterial | undefined;
    const lm  = landMeshRef.current;

    // Line colors always follow theme
    borderMat.color.setHex(tc.border);
    coastMaterialRef.current?.color.setHex(tc.coast);
    latLineGroupRef.current?.children.forEach(c => {
      ((c as THREE.Line).material as THREE.LineBasicMaterial).color.setHex(tc.border);
    });

    if (style === 'terrain') {
      if (lm) lm.visible = false;
      borderMat.opacity = 0.30;
      if (coastMaterialRef.current) coastMaterialRef.current.opacity = 0.40;

      const applyTex = (tex: THREE.Texture) => {
        if (!sph) return;
        sph.map = tex;
        sph.color.setHex(0xffffff);
        sph.emissive.setHex(0x000000);
        sph.emissiveIntensity = 0;
        sph.needsUpdate = true;
      };
      if (terrainTexRef.current) {
        applyTex(terrainTexRef.current);
      } else {
        new THREE.TextureLoader().load(
          '/textures/earth-relief.jpg',
          (tex) => { terrainTexRef.current = tex; applyTex(tex); },
          undefined,
          () => { if (sph) { sph.color.set(gf.ocean); sph.needsUpdate = true; } }
        );
      }

    } else if (style === 'wire') {
      if (lm) lm.visible = false;
      if (sph) {
        sph.map = null;
        sph.color.set('#08061A');   // deep indigo — clearly ≠ neon's dark navy
        sph.emissive.set('#08061A');
        sph.emissiveIntensity = 0.4;
        sph.needsUpdate = true;
      }
      // Ice-white lines — blueprint / star-chart look
      const wireCol = 0xCCDDFF;
      borderMat.color.setHex(wireCol);
      borderMat.opacity = 0.85;
      if (coastMaterialRef.current) {
        coastMaterialRef.current.color.setHex(wireCol);
        coastMaterialRef.current.opacity = 0.95;
      }
      latLineGroupRef.current?.children.forEach(c => {
        ((c as THREE.Line).material as THREE.LineBasicMaterial).color.setHex(wireCol);
      });

    } else { // 'neon'
      if (lm) lm.visible = true;
      if (sph) {
        sph.map = null;
        sph.color.set(gf.ocean);
        sph.emissive.set(gf.ocean).multiplyScalar(0.4);
        sph.emissiveIntensity = 0.5;
        sph.needsUpdate = true;
      }
      landMaterialRef.current?.color.set(gf.land);
      borderMat.opacity = 0.75;
      if (coastMaterialRef.current) coastMaterialRef.current.opacity = 0.90;
    }
  }, [theme, style]);

  const setAddPinModeCallback = useCallback((v: boolean) => {
    setAddPinMode(v);
    addPinModeRef.current = v;
    if (canvasRef.current) canvasRef.current.style.cursor = v ? 'crosshair' : 'grab';
  }, [canvasRef]);

  return { hoveredPin, hoveredCity, addPinMode, setAddPinMode: setAddPinModeCallback, hoveredPos, cityLabels };
}






import { useEffect, useRef, useCallback, useState } from 'react';
import * as THREE from 'three';

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
  night:  { sphere: 0x020B1A, wire: 0x1E3358, glow: 0x4A9EFF },
  day:    { sphere: 0xD4E8FF, wire: 0xB0C8E8, glow: 0xE8A020 },
  nature: { sphere: 0x0A1F0E, wire: 0x1A4028, glow: 0x2ECC71 },
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
  onGlobeClick,
}: UseGlobeOptions) {
  const [hoveredPin, setHoveredPin]   = useState<GlobePin | null>(null);
  const [addPinMode, setAddPinMode]   = useState(false);
  const [hoveredPos, setHoveredPos]   = useState<{ x: number; y: number } | null>(null);

  // Scene refs
  const sceneRef        = useRef<THREE.Scene | null>(null);
  const cameraRef       = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef     = useRef<THREE.WebGLRenderer | null>(null);
  const globeGroupRef   = useRef<THREE.Group | null>(null);
  const globeMeshRef    = useRef<THREE.Mesh | null>(null);
  const wireMeshRef     = useRef<THREE.LineSegments | null>(null);
  const pinMeshesRef    = useRef<THREE.Mesh[]>([]);
  const rafRef          = useRef<number>(0);

  // Interaction state refs (avoid stale closures in event handlers)
  const isDraggingRef       = useRef(false);
  const lastMouseRef        = useRef({ x: 0, y: 0 });
  const velocityRef         = useRef({ x: 0, y: 0 });
  const lastInteractionRef  = useRef(0);
  const addPinModeRef       = useRef(false);
  const onPinClickRef       = useRef(onPinClick);
  const onGlobeClickRef     = useRef(onGlobeClick);
  const hoveredPinRef       = useRef<GlobePin | null>(null);

  // Keep callback refs fresh
  useEffect(() => { onPinClickRef.current  = onPinClick;  }, [onPinClick]);
  useEffect(() => { onGlobeClickRef.current = onGlobeClick; }, [onGlobeClick]);
  useEffect(() => { addPinModeRef.current  = addPinMode;  }, [addPinMode]);

  // ── Init effect ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const parent = canvas.parentElement ?? canvas;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    scene.background = null; // transparent
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(
      45,
      parent.clientWidth / parent.clientHeight,
      0.1,
      100
    );
    camera.position.z = 5;
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(parent.clientWidth, parent.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    rendererRef.current = renderer;

    // Globe group
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);
    globeGroupRef.current = globeGroup;

    // Globe sphere
    const themeColors = GLOBE_THEMES[theme] ?? GLOBE_THEMES.night;
    const sphereGeo   = new THREE.SphereGeometry(2, 64, 64);
    const sphereMat   = new THREE.MeshPhongMaterial({
      color:     themeColors.sphere,
      emissive:  themeColors.glow,
      emissiveIntensity: 0.06,
      shininess: 20,
      transparent: true,
      opacity: 0.95,
    });
    const globeMesh = new THREE.Mesh(sphereGeo, sphereMat);
    globeGroup.add(globeMesh);
    globeMeshRef.current = globeMesh;

    // Wireframe
    const wireGeo  = new THREE.WireframeGeometry(new THREE.SphereGeometry(2.01, 24, 24));
    const wireMat  = new THREE.LineBasicMaterial({
      color: themeColors.wire,
      transparent: true,
      opacity: 0.08,
    });
    const wireLines = new THREE.LineSegments(wireGeo, wireMat);
    globeGroup.add(wireLines);
    wireMeshRef.current = wireLines;

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambient);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 3, 5);
    scene.add(dirLight);

    // Entry animation: scale from 0 to 1 over 800ms
    globeGroup.scale.setScalar(0);
    const animStart = performance.now();
    const animDur   = 800;
    function entryAnim(now: number) {
      const t = Math.min((now - animStart) / animDur, 1);
      const ease = 1 - Math.pow(1 - t, 3); // ease-out-cubic
      globeGroup.scale.setScalar(ease);
      if (t < 1) requestAnimationFrame(entryAnim);
    }
    requestAnimationFrame(entryAnim);

    // ── Resize handling ──────────────────────────────────────────────────────
    const ro = new ResizeObserver(() => {
      const w = parent.clientWidth;
      const h = parent.clientHeight;
      if (w === 0 || h === 0) return;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    });
    ro.observe(parent);

    // ── Mouse drag rotation ──────────────────────────────────────────────────
    function onMouseDown(e: MouseEvent) {
      isDraggingRef.current = true;
      lastMouseRef.current  = { x: e.clientX, y: e.clientY };
      velocityRef.current   = { x: 0, y: 0 };
    }

    function onMouseMove(e: MouseEvent) {
      if (!isDraggingRef.current) {
        // Raycasting for hover
        handleRaycast(e.clientX, e.clientY);
        return;
      }
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

      // Check if it was a click (no significant drag)
      const dx = e.clientX - lastMouseRef.current.x;
      const dy = e.clientY - lastMouseRef.current.y;
      if (Math.abs(dx) < 3 && Math.abs(dy) < 3) {
        handleClick(e.clientX, e.clientY);
      }
    }

    function onMouseLeave() {
      isDraggingRef.current = false;
      setHoveredPin(null);
      hoveredPinRef.current = null;
      setHoveredPos(null);
    }

    // ── Touch events ─────────────────────────────────────────────────────────
    let lastTouchDist = 0;

    function getTouchDist(touches: TouchList) {
      const dx = touches[0].clientX - touches[1].clientX;
      const dy = touches[0].clientY - touches[1].clientY;
      return Math.sqrt(dx * dx + dy * dy);
    }

    function onTouchStart(e: TouchEvent) {
      if (e.touches.length === 1) {
        isDraggingRef.current = true;
        lastMouseRef.current  = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        velocityRef.current   = { x: 0, y: 0 };
      } else if (e.touches.length === 2) {
        lastTouchDist = getTouchDist(e.touches);
      }
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
        const dist  = getTouchDist(e.touches);
        const delta = dist - lastTouchDist;
        camera.position.z = Math.max(3.5, Math.min(8, camera.position.z - delta * 0.01));
        lastTouchDist = dist;
        lastInteractionRef.current = Date.now();
      }
    }

    function onTouchEnd() {
      isDraggingRef.current = false;
      lastInteractionRef.current = Date.now();
    }

    // ── Scroll / zoom ─────────────────────────────────────────────────────────
    function onWheel(e: WheelEvent) {
      e.preventDefault();
      camera.position.z = Math.max(3.5, Math.min(8, camera.position.z + e.deltaY * 0.005));
      lastInteractionRef.current = Date.now();
    }

    // ── Raycasting helpers ────────────────────────────────────────────────────
    const raycaster = new THREE.Raycaster();
    raycaster.params.Points = { threshold: 0.05 };

    function getNDC(clientX: number, clientY: number): THREE.Vector2 {
      const rect = canvas.getBoundingClientRect();
      return new THREE.Vector2(
        ((clientX - rect.left)  / rect.width)  * 2 - 1,
        -((clientY - rect.top) / rect.height) * 2 + 1
      );
    }

    function handleRaycast(clientX: number, clientY: number) {
      const ndc = getNDC(clientX, clientY);
      raycaster.setFromCamera(ndc, camera);

      const intersects = raycaster.intersectObjects(pinMeshesRef.current);
      if (intersects.length > 0) {
        const mesh = intersects[0].object as THREE.Mesh;
        const pin  = mesh.userData as GlobePin;
        if (hoveredPinRef.current?._id !== pin._id) {
          // Reset previous hovered scale
          pinMeshesRef.current.forEach(m => m.scale.setScalar(1));
          mesh.scale.setScalar(2.5);
          setHoveredPin(pin);
          hoveredPinRef.current = pin;
        }
        setHoveredPos({ x: clientX, y: clientY });
        canvas.style.cursor = 'pointer';
      } else {
        if (hoveredPinRef.current !== null) {
          pinMeshesRef.current.forEach(m => m.scale.setScalar(1));
          setHoveredPin(null);
          hoveredPinRef.current = null;
          setHoveredPos(null);
        }
        canvas.style.cursor = addPinModeRef.current ? 'crosshair' : 'grab';
      }
    }

    function handleClick(clientX: number, clientY: number) {
      const ndc = getNDC(clientX, clientY);
      raycaster.setFromCamera(ndc, camera);

      // Check pins first
      const pinHits = raycaster.intersectObjects(pinMeshesRef.current);
      if (pinHits.length > 0) {
        const pin = pinHits[0].object.userData as GlobePin;
        onPinClickRef.current(pin);
        return;
      }

      // If in add-pin mode, hit-test globe sphere
      if (addPinModeRef.current && globeMeshRef.current) {
        const globeHits = raycaster.intersectObject(globeMeshRef.current);
        if (globeHits.length > 0) {
          const point   = globeHits[0].point;
          // Transform from world space to globe-group local space
          const local   = globeGroup.worldToLocal(point.clone());
          const { lat, lng } = vector3ToLatLng(local);
          onGlobeClickRef.current(lat, lng);
        }
      }
    }

    // ── Register events ───────────────────────────────────────────────────────
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

      const timeSinceInteract = Date.now() - lastInteractionRef.current;
      const autoRotate        = timeSinceInteract > 3000 && !isDraggingRef.current;

      // Apply velocity damping
      if (!isDraggingRef.current) {
        globeGroup.rotation.y += velocityRef.current.x * 0.003;
        globeGroup.rotation.x += velocityRef.current.y * 0.003;
        globeGroup.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, globeGroup.rotation.x));
        velocityRef.current.x *= 0.92;
        velocityRef.current.y *= 0.92;
      }

      // Auto-rotation
      if (autoRotate) {
        globeGroup.rotation.y += 0.001;
      }

      renderer.render(scene, camera);
    }
    animate();

    // ── Cleanup ───────────────────────────────────────────────────────────────
    return () => {
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
      renderer.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasRef]);

  // ── Update pins ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const globeGroup = globeGroupRef.current;
    if (!globeGroup) return;

    // Remove old pin meshes
    pinMeshesRef.current.forEach(m => {
      globeGroup.remove(m);
      (m.geometry as THREE.BufferGeometry).dispose();
      ((m.material as THREE.Material)).dispose();
    });
    pinMeshesRef.current = [];

    const filtered = filterTechnique && filterTechnique !== 'all'
      ? pins.filter(p => p.technique === filterTechnique)
      : pins;

    const MAX_PINS = 500;
    const visible  = filtered.slice(0, MAX_PINS);

    for (const pin of visible) {
      const colorHex = PIN_COLORS[pin.technique] ?? PIN_COLORS.other;
      const color    = new THREE.Color(colorHex);
      const geo      = new THREE.SphereGeometry(0.015, 8, 8);
      const mat      = new THREE.MeshBasicMaterial({ color });
      const mesh     = new THREE.Mesh(geo, mat);

      const pos = latLngToVector3(pin.lat, pin.lng);
      mesh.position.copy(pos);
      mesh.userData = pin;

      globeGroup.add(mesh);
      pinMeshesRef.current.push(mesh);
    }
  }, [pins, filterTechnique]);

  // ── Update theme ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const globeMesh = globeMeshRef.current;
    const wireMesh  = wireMeshRef.current;
    if (!globeMesh || !wireMesh) return;

    const themeColors = GLOBE_THEMES[theme] ?? GLOBE_THEMES.night;
    (globeMesh.material as THREE.MeshPhongMaterial).color.setHex(themeColors.sphere);
    (globeMesh.material as THREE.MeshPhongMaterial).emissive.setHex(themeColors.glow);
    (wireMesh.material  as THREE.LineBasicMaterial).color.setHex(themeColors.wire);
  }, [theme]);

  const setAddPinModeCallback = useCallback((v: boolean) => {
    setAddPinMode(v);
    addPinModeRef.current = v;
    if (canvasRef.current) {
      canvasRef.current.style.cursor = v ? 'crosshair' : 'grab';
    }
  }, [canvasRef]);

  return { hoveredPin, addPinMode, setAddPinMode: setAddPinModeCallback, hoveredPos };
}

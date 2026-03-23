// src/components/Globe/CesiumGlobe.tsx
// Cesium is lazy-imported so it doesn't bloat the main bundle.
import { useEffect, useRef } from 'react';
import type { GlobePin } from './useGlobe';

const PIN_COLORS: Record<string, string> = {
  'box':       '#3A82F7',
  '4-7-8':     '#7AC4FF',
  'wim-hof':   '#FF9A5C',
  'coherent':  '#4AE8A0',
  'belly':     '#FFD97D',
  'alternate': '#C084FC',
  'other':     '#94A3B8',
};

// Build a tiny canvas billboard for each pin colour
function makePinImage(hex: string): string {
  const c = document.createElement('canvas');
  c.width = 24; c.height = 32;
  const ctx = c.getContext('2d')!;
  // Circle head
  ctx.beginPath();
  ctx.arc(12, 10, 9, 0, Math.PI * 2);
  ctx.fillStyle = hex;
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.7)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  // White core
  ctx.beginPath();
  ctx.arc(12, 10, 3.5, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.65)';
  ctx.fill();
  // Needle
  ctx.beginPath();
  ctx.moveTo(8, 17);
  ctx.lineTo(12, 31);
  ctx.lineTo(16, 17);
  ctx.fillStyle = hex;
  ctx.fill();
  return c.toDataURL();
}

interface Props {
  pins:         GlobePin[];
  filterTechnique: string;
  onPinClick:   (pin: GlobePin | null) => void;
  onGlobeClick: (lat: number, lng: number, country: string) => void;
}

export default function CesiumGlobe({ pins, filterTechnique, onPinClick, onGlobeClick }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef    = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    let destroyed = false;

    import('cesium').then(Cesium => {
      if (destroyed || !containerRef.current) return;

      Cesium.Ion.defaultAccessToken = import.meta.env.VITE_CESIUM_TOKEN ?? '';

      const viewer = new Cesium.Viewer(containerRef.current, {
        terrainProvider:    new Cesium.EllipsoidTerrainProvider(),
        baseLayer:          new Cesium.ImageryLayer(
                              new Cesium.OpenStreetMapImageryProvider({ url: 'https://a.tile.openstreetmap.org/' })
                            ),
        animation:          false,
        baseLayerPicker:    false,
        fullscreenButton:   false,
        geocoder:           false,
        homeButton:         false,
        infoBox:            false,
        sceneModePicker:    false,
        selectionIndicator: false,
        timeline:           false,
        navigationHelpButton: false,
      });

      // Dark sky & space
      viewer.scene.backgroundColor        = Cesium.Color.fromCssColorString('#010814');
      if (viewer.scene.skyBox)  viewer.scene.skyBox.show  = true;
      if (viewer.scene.sun)     viewer.scene.sun.show     = true;
      if (viewer.scene.moon)    viewer.scene.moon.show    = false;
      viewer.scene.fog.enabled            = false;
      viewer.scene.globe.enableLighting   = true;
      viewer.scene.globe.baseColor        = Cesium.Color.fromCssColorString('#0C1E38');
      viewer.scene.globe.showGroundAtmosphere = true;

      // Start view
      viewer.camera.setView({
        destination: Cesium.Cartesian3.fromDegrees(20, 20, 18_000_000),
        orientation: { heading: 0, pitch: -Math.PI / 2, roll: 0 },
      });

      // Add pins
      const filtered = filterTechnique && filterTechnique !== 'all'
        ? pins.filter(p => p.technique === filterTechnique)
        : pins;

      const imageCache: Record<string, string> = {};

      filtered.slice(0, 500).forEach(pin => {
        const hex = PIN_COLORS[pin.technique] ?? PIN_COLORS.other;
        if (!imageCache[hex]) imageCache[hex] = makePinImage(hex);

        viewer.entities.add({
          id:       pin._id,
          position: Cesium.Cartesian3.fromDegrees(pin.lng, pin.lat, 0),
          billboard: {
            image:           imageCache[hex],
            width:           28,
            height:          37,
            verticalOrigin:  Cesium.VerticalOrigin.BOTTOM,
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
            pixelOffset:     new Cesium.Cartesian2(0, 0),
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
          },
          properties: new Cesium.PropertyBag({ pin }),
        });
      });

      // Click handler
      const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);

      handler.setInputAction((e: any) => {
        const picked = viewer.scene.pick(e.position);
        if (Cesium.defined(picked) && picked.id?.properties?.pin) {
          const pinData = picked.id.properties.pin.getValue() as GlobePin;
          onPinClick(pinData);
          viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(pinData.lng, pinData.lat, 800_000),
            duration: 1.8,
          });
          return;
        }

        const ray = viewer.camera.getPickRay(e.position);
        if (!ray) return;
        const pos = viewer.scene.globe.pick(ray, viewer.scene);
        if (pos) {
          const carto = Cesium.Cartographic.fromCartesian(pos);
          const lat   = Cesium.Math.toDegrees(carto.latitude);
          const lng   = Cesium.Math.toDegrees(carto.longitude);
          onGlobeClick(lat, lng, '');
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

      viewerRef.current = { viewer, handler, Cesium };
    });

    return () => {
      destroyed = true;
      if (viewerRef.current) {
        viewerRef.current.handler.destroy();
        viewerRef.current.viewer.destroy();
        viewerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update entities when pins/filter change (after initial load)
  useEffect(() => {
    const v = viewerRef.current;
    if (!v) return;
    const { viewer, Cesium } = v;

    viewer.entities.removeAll();

    const filtered = filterTechnique && filterTechnique !== 'all'
      ? pins.filter(p => p.technique === filterTechnique)
      : pins;

    const imageCache: Record<string, string> = {};

    filtered.slice(0, 500).forEach(pin => {
      const hex = PIN_COLORS[pin.technique] ?? PIN_COLORS.other;
      if (!imageCache[hex]) imageCache[hex] = makePinImage(hex);

      viewer.entities.add({
        id:       pin._id,
        position: Cesium.Cartesian3.fromDegrees(pin.lng, pin.lat, 0),
        billboard: {
          image:           imageCache[hex],
          width:           28,
          height:          37,
          verticalOrigin:  Cesium.VerticalOrigin.BOTTOM,
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        },
        properties: new Cesium.PropertyBag({ pin }),
      });
    });
  }, [pins, filterTechnique]);

  return (
    <div
      ref={containerRef}
      style={{ position: 'absolute', inset: 0 }}
      // hide Cesium's default credit banner
      className="cesium-globe"
    />
  );
}

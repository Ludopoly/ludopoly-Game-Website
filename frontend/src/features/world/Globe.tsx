import * as React from "react";
import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import type { ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import earcut from "earcut";

// Yardımcı tipler
type Direction = "up" | "down" | "left" | "right";
type MousePos = { x: number; y: number };

export interface GlobeProps {
  onHoverCountry?: (country: string | null, pos: MousePos | null) => void;
  onSelectCountry?: (country: string) => void;
  selectedCountry?: string | null;
  // Pan fonksiyonunu üst componente vermek için: hazır olduğunda handler'ı geri yollar
  onPan?: (pan: ((direction: Direction) => void) | null) => void;
  onCameraUpdate?: (lookAt: THREE.Vector3) => void;
}

// Arkaplan yıldızları (lacivert, sarı, turuncu) — module scope (stable identity)
function StarField({ count = 900, radius = 60, size = 1.6 }: { count?: number; radius?: number; size?: number }) {
  const { positions, colors } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const palette = [
      new THREE.Color("#0b1b3a"), // lacivert (dark navy)
      new THREE.Color("#ffd700"), // sarı (gold)
      new THREE.Color("#ff8c00"), // turuncu (dark orange)
    ];
    for (let i = 0; i < count; i++) {
      // Rastgele birim vektör (uniform sphere)
      const u = Math.random();
      const v = Math.random();
      const theta = 2 * Math.PI * u;
      const phi = Math.acos(2 * v - 1);
      const r = radius + (Math.random() * 20 - 10); // küçük derinlik varyasyonu
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.cos(phi);
      const z = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 0] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      const c = palette[Math.floor(Math.random() * palette.length)];
      colors[i * 3 + 0] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    return { positions, colors };
  }, [count, radius]);

  return (
    <points
      frustumCulled={true}
      renderOrder={-1}
  // Raycasting'i kapatmak için typed no-op fonksiyon kullan
  raycast={() => { /* no-op */ }}
      onPointerDown={(e: ThreeEvent<PointerEvent>) => e.stopPropagation()}
    >
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial size={size} sizeAttenuation={false} vertexColors transparent opacity={0.9} depthWrite={false} depthTest />
    </points>
  );
}

// Easing fonksiyonu (yumuşak geçiş için)
function easeInOutQuad(t: number) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

// İki yön vektörü arasında küresel interpolasyon (slerp) — vektörler normalize olmalı
function slerpDirections(a: THREE.Vector3, b: THREE.Vector3, t: number) {
  const v0 = a.clone().normalize();
  const v1 = b.clone().normalize();
  const dot = THREE.MathUtils.clamp(v0.dot(v1), -1, 1);
  const omega = Math.acos(dot);
  if (omega < 1e-6) return v0; // neredeyse aynı yön
  const sinOmega = Math.sin(omega);
  const s0 = Math.sin((1 - t) * omega) / sinOmega;
  const s1 = Math.sin(t * omega) / sinOmega;
  return v0.multiplyScalar(s0).add(v1.multiplyScalar(s1)).normalize();
}

function normalizeCountryName(name: string | null | undefined) {
  return (name || "").trim().toLowerCase();
}

function closeRing(ring: number[][]) {
  if (ring.length < 2) return ring;
  const first = ring[0];
  const last = ring[ring.length - 1];
  if (first[0] !== last[0] || first[1] !== last[1]) {
    return [...ring, first];
  }
  return ring;
}

// Longitude wrapping için yardımcı fonksiyonlar
function detectLongitudeWrap(ring: number[][]) {
  for (let i = 0; i < ring.length - 1; i++) {
    const diff = Math.abs(ring[i + 1][0] - ring[i][0]);
    if (diff > 180) {
      return true;
    }
  }
  return false;
}

function splitPolygonAtDateline(ring: number[][]) {
  if (!detectLongitudeWrap(ring)) {
    return [ring];
  }

  const parts: number[][][] = [];
  let currentPart: number[][] = [];

  for (let i = 0; i < ring.length - 1; i++) {
    currentPart.push(ring[i]);

    const diff = ring[i + 1][0] - ring[i][0];
    if (Math.abs(diff) > 180) {
      // Dateline'ı geçiyor
      if (currentPart.length > 2) {
        parts.push([...currentPart]);
      }
      currentPart = [];
    }
  }

  if (currentPart.length > 2) {
    currentPart.push(ring[ring.length - 1]);
    parts.push(currentPart);
  }

  return parts.filter((part) => part.length > 2);
}

function normalizeLongitude(lon: number) {
  while (lon > 180) lon -= 360;
  while (lon < -180) lon += 360;
  return lon;
}

// Bir poligonun (dış halka) yaklaşık alan ve centroidini hesapla (equirectangular projeksiyon)
// Girdi: ring = [[lon, lat], ...] (derece)
// Çıktı: { area: A (radyan^2 ölçekli), lon: derece, lat: derece }
function centroidOfRingEquirect(ring: number[][]): { area: number; lon: number; lat: number } {
  if (!ring || ring.length < 3) return { area: 0, lon: ring?.[0]?.[0] ?? 0, lat: ring?.[0]?.[1] ?? 0 };
  // Dateline etkisini azaltmak için longitudes'u unwrap et
  const unwrapped: number[][] = [];
  let prevLon = normalizeLongitude(ring[0][0]);
  let accShift = 0;
  const lat0 = ring.reduce((s, p) => s + p[1], 0) / ring.length; // referans enlem
  for (let i = 0; i < ring.length; i++) {
    const lon = normalizeLongitude(ring[i][0]);
    const d = lon - prevLon;
    if (d > 180) accShift -= 360;
    else if (d < -180) accShift += 360;
    const adjLon = lon + accShift;
    unwrapped.push([adjLon, ring[i][1]]);
    prevLon = lon;
  }
  // Radyana çevir ve equirect projeksiyon uygula: x = lon * cos(lat0), y = lat
  const lat0Rad = THREE.MathUtils.degToRad(lat0);
  const cosLat0 = Math.cos(lat0Rad);
  const pts = unwrapped.map(([lon, lat]) => {
    const lonR = THREE.MathUtils.degToRad(lon);
    const latR = THREE.MathUtils.degToRad(lat);
    return [lonR * cosLat0, latR];
  });
  let A = 0, Cx = 0, Cy = 0;
  for (let i = 0, n = pts.length; i < n; i++) {
    const [x0, y0] = pts[i] as [number, number];
    const [x1, y1] = pts[(i + 1) % n] as [number, number];
    const cross = x0 * y1 - x1 * y0;
    A += cross;
    Cx += (x0 + x1) * cross;
    Cy += (y0 + y1) * cross;
  }
  if (Math.abs(A) < 1e-12) {
    // Alan çok küçük: basit ortalama
    const m = unwrapped.reduce((s, p) => [s[0] + p[0], s[1] + p[1]], [0, 0]);
    const lonAvg = m[0] / unwrapped.length;
    const latAvg = m[1] / unwrapped.length;
    return { area: 0, lon: lonAvg, lat: latAvg };
  }
  A *= 0.5;
  const cx = Cx / (6 * A);
  const cy = Cy / (6 * A);
  // Geri dönüş: lon = cx / cos(lat0), lat = cy
  const lonR = cx / (cosLat0 || 1e-9);
  const latR = cy;
  const lonDeg = THREE.MathUtils.radToDeg(lonR);
  const latDeg = THREE.MathUtils.radToDeg(latR);
  return { area: Math.abs(A), lon: lonDeg, lat: latDeg };
}

// FOV yardımcıları
function getHorizontalFov(camera: THREE.PerspectiveCamera, aspect: number) {
  const fovV = THREE.MathUtils.degToRad(camera.fov);
  const fovH = 2 * Math.atan(Math.tan(fovV / 2) * aspect);
  return fovH;
}

// Küreyi sağ/sol kenarlara değdirecek mesafe (küre silüetini referans alır)
function distanceToTouchSides(radius: number, camera: THREE.PerspectiveCamera, aspect: number) {
  const fovH = getHorizontalFov(camera, aspect);
  // Küre teğet konisi: sin(alpha) = R / d  =>  d = R / sin(alpha), alpha = fovH/2
  const alpha = fovH / 2;
  return radius / Math.sin(alpha);
}

// Group'u tilt bilgisi ile genişlet
interface ExtendedGroup extends THREE.Group {
  __tiltApplied?: number;
  __tiltAxis?: [number, number, number] | null;
}

interface TargetState {
  position: THREE.Vector3;
  lookAt: THREE.Vector3;
  startPosition: THREE.Vector3;
  startLookAt: THREE.Vector3;
  centerDir?: THREE.Vector3;
}

export default function Globe({
  onHoverCountry,
  onSelectCountry,
  selectedCountry,
  onPan,
  onCameraUpdate,
}: GlobeProps) {
  const globeRef = useRef<ExtendedGroup | null>(null);
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const size = useThree((s) => s.size);
  const [borders, setBorders] = useState<React.ReactNode[]>([]);
  const [fills, setFills] = useState<React.ReactNode[]>([]);
  const [countryColors, setCountryColors] = useState<Record<string, THREE.Color>>({});
  const [target, setTarget] = useState<TargetState | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationStartTime, setAnimationStartTime] = useState<number | null>(null);
  // Seçim animasyonu sonrasında hafif yukarı doğru dönme efekti (pitch/tilt)
  const [postTilt, setPostTilt] = useState<
    | { start: number; duration: number; delta: number; axis: [number, number, number] }
    | null
  >(null);
  const lastTiltKeyRef = useRef<string | null>(null);
  
  // Pan state'leri
  const [cameraTarget, setCameraTarget] = useState(new THREE.Vector3(0, 0, 0));
  // Seçim açıkken diğer ülke etkileşimlerini devre dışı bırakmak için ref
  const selectedRef = useRef<string | null>(null);
  useEffect(() => {
    selectedRef.current = selectedCountry ? normalizeCountryName(selectedCountry) : null;
  }, [selectedCountry]);
  // cameraTarget'ı effects içinde bağımlılık eklemeden okuyabilmek için ref
  const cameraTargetRef = useRef(new THREE.Vector3(0, 0, 0));
  useEffect(() => {
    cameraTargetRef.current.copy(cameraTarget);
  }, [cameraTarget]);
  
  // Stable references for functions
  const panRef = useRef<((direction: Direction) => void) | null>(null);
  // Aynı seçim/aspect için animasyonun tekrar tetiklenmesini engelle
  const lastFrameKeyRef = useRef<string | null>(null);
  // Sabit hedef mesafe (tüm ülkeler için aynı yakınlık) — viewport değiştikçe güncellenir
  const targetDistanceRef = useRef<number | null>(null);
  
  const radius = 4.05;
  const extrusion = 0.22;
  const ANIMATION_DURATION = 1500; // 1.5 saniye
  // Seçilen ülkeyi ekranda biraz daha yukarı göstermek için küçük bir dikey ofset
  const VERTICAL_BIAS = 0.06; // NDC biriminde (~%6 ekran yüksekliği)

  // İlk mount'ta kamera pozisyonunu ayarla
  useEffect(() => {
    camera.position.set(0, 0, 12);
    camera.lookAt(0, 0, 0);
    setCameraTarget(new THREE.Vector3(0, 0, 0));
    // OrbitControls hedefini de başlangıca çek
    if (onCameraUpdate) {
      onCameraUpdate(new THREE.Vector3(0, 0, 0));
    }
  }, [camera, onCameraUpdate]); // setCameraTarget'ı dependency'den çıkar

  // Viewport'a göre sabit yakınlık mesafesini hesapla (Suudi Arabistan yakınlığıyla aynı)
  useEffect(() => {
    const aspect = Math.round((size.width / size.height) * 1000) / 1000;
    const R_out = radius + extrusion;
    const d = distanceToTouchSides(R_out, camera, aspect) * 1.02; // mevcut kompozisyon ile aynı
    targetDistanceRef.current = d;
  }, [camera, size, radius, extrusion]);

  // Pan fonksiyonu
  const handlePan = useCallback(
    (direction: Direction) => {
      const panDistance = 0.5 * (camera.position.length() / 10);
      let panVector = new THREE.Vector3();
      
      const cameraRight = new THREE.Vector3();
      const cameraUp = new THREE.Vector3();
      camera.getWorldDirection(cameraRight);
      cameraRight.cross(camera.up).normalize();
      cameraUp.copy(camera.up);
      
      switch (direction) {
        case "up":
          panVector = cameraUp.clone().multiplyScalar(panDistance);
          break;
        case "down":
          panVector = cameraUp.clone().multiplyScalar(-panDistance);
          break;
        case "left":
          panVector = cameraRight.clone().multiplyScalar(-panDistance);
          break;
        case "right":
          panVector = cameraRight.clone().multiplyScalar(panDistance);
          break;
      }
      
      camera.position.add(panVector);
      const newTarget = cameraTarget.clone().add(panVector);
      setCameraTarget(newTarget);
      camera.lookAt(newTarget);
    },
    [camera, cameraTarget]
  );

  // Ref’e ata
  panRef.current = handlePan;

  // Ülke seçimi reset (seçim iptal edilince başlangıca dön)
  useEffect(() => {
    if (selectedCountry) return;
    const initialPosition = new THREE.Vector3(0, 0, 12);
    const initialLookAt = new THREE.Vector3(0, 0, 0);
    const startPos = camera.position.clone();
    const startLookAt = cameraTargetRef.current.clone();
    // Önce varsa uygulanan tilt'i sıfırla (akümülasyonu önle)
    if (globeRef.current) {
      const appliedTilt = globeRef.current.__tiltApplied || 0;
      const axisArr = globeRef.current.__tiltAxis || null;
      if (appliedTilt !== 0 && axisArr) {
        const axis = new THREE.Vector3(axisArr[0], axisArr[1], axisArr[2]).normalize();
        globeRef.current.rotateOnWorldAxis(axis, -appliedTilt);
      }
      globeRef.current.__tiltApplied = 0;
      globeRef.current.__tiltAxis = null;
    }
    setAnimationStartTime(Date.now());
    setTarget({
      position: initialPosition,
      lookAt: initialLookAt,
      startPosition: startPos,
      startLookAt,
    });
    setIsAnimating(true);
    // Seçim key'ini sıfırla ki yeni seçimde tekrar çalışsın
    lastFrameKeyRef.current = null;
  }, [selectedCountry, camera, onCameraUpdate]);

  // Ülke seçimi (yakınlaşma ve kadrajlama)
  useEffect(() => {
    if (!selectedCountry) return;

    type GeoJSONFeature = {
      properties?: { name_en?: string };
      geometry: { type: "Polygon" | "MultiPolygon"; coordinates: number[][][] | number[][][][] };
    };
    type FeatureCollection = { features: GeoJSONFeature[] };
    fetch("/map.geo-2.json")
      .then((res) => res.json())
      .then((data: FeatureCollection) => {
        const selected = normalizeCountryName(selectedCountry);
        const feature = data.features.find((f) => normalizeCountryName(f.properties?.name_en) === selected);

        if (!feature) return;

    const coords = feature.geometry.coordinates;
        // Daha iyi merkez: En büyük poligonun (outer ring) equirectangular centroid'i
        let centerLon = 0,
          centerLat = 0;
        if (feature.geometry.type === "Polygon") {
          const ring = coords[0] as number[][];
          const c = centroidOfRingEquirect(ring);
          centerLon = c.lon;
          centerLat = c.lat;
        } else if (feature.geometry.type === "MultiPolygon") {
          let best = { area: -1, lon: 0, lat: 0 } as { area: number; lon: number; lat: number };
          (coords as number[][][][]).forEach((poly) => {
            const ring = poly[0] as number[][];
            const c = centroidOfRingEquirect(ring);
            if (c.area > best.area) best = c;
          });
          centerLon = best.lon;
          centerLat = best.lat;
        }

        const phi = ((90 - centerLat) * Math.PI) / 180;
        const theta = ((-centerLon + 180) * Math.PI) / 180;

        const centerPoint = new THREE.Vector3(
          radius * Math.sin(phi) * Math.cos(theta),
          radius * Math.cos(phi),
          radius * Math.sin(phi) * Math.sin(theta)
        );

        // Ülkeye doğru doğrultu
        const dir = centerPoint.clone().normalize();

        // 1) Genişliğe sığacak mesafe (küre yan kenarlara değsin)
        // Ekran oranını 1e-3 duyarlılıkla yuvarla; ufak dalgalanmalarda tekrar tetiklenmesin
        const aspect = Math.round((size.width / size.height) * 1000) / 1000;
        const fovV = THREE.MathUtils.degToRad(camera.fov);
        const fovH = getHorizontalFov(camera, aspect);
        const alpha = fovH / 2;

        // Silüet için dış yarıçapı (ekstrüzyonu da dahil ederek) referans al
        const R_out = radius + extrusion;
        // Tüm ülkeler için sabit hedef mesafe kullan
        const d = targetDistanceRef.current ?? distanceToTouchSides(R_out, camera, aspect) * 1.02;

        // 2) Üst kenara değecek kadraj (merkez NDC Y)
        //    Dikey NDC yarıçap: r_ndc = tan(alpha) / tan(fovV/2)
        const r_ndc = Math.tan(alpha) / Math.tan(fovV / 2);
        // Ülkeyi biraz daha yukarı taşı: üst kenar temas değerine küçük bir ofset ekle
        const centerY_ndc = Math.min(0.999, 1 - r_ndc + VERTICAL_BIAS);

        // 3) Kamerayı yerleştir (ülkeye doğru, yanlar temas)
        const targetPos = dir.clone().multiplyScalar(d);

        // 4) Kadrajı aşağıya eğ (küre tepe noktası üst kenara değsin)
        const forwardToCountry = centerPoint.clone().sub(targetPos).normalize();
        const worldUp = new THREE.Vector3(0, 1, 0);
        let right = new THREE.Vector3().crossVectors(forwardToCountry, worldUp);
        if (right.lengthSq() < 1e-8) {
          // Kutup yakınında ise alternatif bir up ile üret
          right = new THREE.Vector3(1, 0, 0);
        } else {
          right.normalize();
        }

        // centerY_ndc -> pitch (NDC'den açıya)
        const pitch = Math.atan(centerY_ndc * Math.tan(fovV / 2));
        // center aşağı insin (üst kenar temas): ileri vektörü yukarı çevir => -pitch
        const qPitch = new THREE.Quaternion().setFromAxisAngle(right, -pitch);
        const forwardWithPitch = forwardToCountry.clone().applyQuaternion(qPitch).normalize();

        let lookAtPoint = targetPos.clone().add(forwardWithPitch);

        // Antarctica için özel kadraj: ülkenin merkezi ekranın üst bölgesine sabit NDC-Y ile gelsin
        if (selected === "antarctica") {
          // Alt bölgede kadraj: NDC-Y negatif (ekranın alt tarafı)
          const ANT_NDC_Y = -0.5; // geri alındı (bir önceki değer)
          // Kameradan ülke merkezine mesafe (doğrusal): |d - R|
          const L = Math.abs(d - radius);
          // Bu NDC-Y'yi elde etmek için gerekli küçük açı
          const phi2 = Math.atan(ANT_NDC_Y * Math.tan(fovV / 2));
          // Görüş 'up' yönü: right × forward
          const viewUp = new THREE.Vector3().crossVectors(right, forwardToCountry).normalize();
          const k = phi2 * L; // küçük açı yaklaşımıyla ofset uzunluğu
          // lookAt'ı merkezin biraz altına taşı (böylece merkez ekranın üstüne çıkar)
          lookAtPoint = centerPoint.clone().sub(viewUp.multiplyScalar(k));
        }

        // Aynı çerçeve daha önce uygulandıysa animasyonu tekrarlama
        const frameKey = `${selectedCountry}:${aspect}`;
        const alreadyApplied = lastFrameKeyRef.current === frameKey;

        // Kamera zaten hedefe çok yakınsa yeniden animasyon başlatma
        const alreadyNear =
          camera.position.distanceTo(targetPos) < 0.05 &&
          cameraTargetRef.current.distanceTo(centerPoint) < 0.1;

        if (alreadyApplied || alreadyNear) {
          // Mevcut görünümü koru
          return;
        }

        const startPos = camera.position.clone();
        const startLookAt = cameraTargetRef.current.clone();
        setAnimationStartTime(Date.now());
        setTarget({
          position: targetPos,
          lookAt: lookAtPoint,
          startPosition: startPos,
          startLookAt,
          centerDir: centerPoint.clone().normalize(),
        });
        setIsAnimating(true);
        lastFrameKeyRef.current = frameKey;
      });
  }, [selectedCountry, camera, size, onCameraUpdate]);

  // Kamera animasyonu
  useFrame(() => {
    // Kamera animasyonu
    if (target && isAnimating && animationStartTime !== null) {
      const elapsed = Date.now() - animationStartTime;
      const progress = Math.min(elapsed / ANIMATION_DURATION, 1);
      const eased = easeInOutQuad(progress);

      if (progress === 1) {
        camera.position.copy(target.position);
        camera.lookAt(target.lookAt);
        if (onCameraUpdate) {
          onCameraUpdate(target.lookAt.clone());
        }
        setIsAnimating(false);
        setTarget(null);
        // State ve ref senkronu
        setCameraTarget(target.lookAt.clone());
        // Yalnızca seçim animasyonu tamamlandığında yukarı tilt uygula (ekran yukarısına doğru)
        if (selectedRef.current) {
          const tiltKey = `${selectedRef.current}:${size.width}x${size.height}`;
          if (lastTiltKeyRef.current !== tiltKey) {
            // Ekran-yukarı yönü için kamera-sağ ekseni etrafında dön
            const camForward = new THREE.Vector3();
            camera.getWorldDirection(camForward).normalize();
            const camRight = new THREE.Vector3().crossVectors(camForward, camera.up).normalize();
            const axisArr: [number, number, number] = [camRight.x, camRight.y, camRight.z];
            // Seçilen ülke merkezi yönünü yukarı taşıyacak açı işareti seç
            const v = (target.centerDir || new THREE.Vector3(0, 0, 1)).clone();
            const deltaVec = new THREE.Vector3().crossVectors(camRight, v); // d(v)/dθ at θ=0
            const sign = Math.sign(deltaVec.dot(camera.up)) || 1; // pozitifse yukarı çıkar
            // Antarktika için biraz daha fazla yukarı tilt uygula
            const baseTilt = 0.26; // ~14.9°
            const extraTilt = selectedRef.current === "antarctica" ? 0.12 : 0; // +~6.9°
            const delta = sign * (baseTilt + extraTilt);
            setPostTilt({ start: Date.now(), duration: 520, delta, axis: axisArr });
            lastTiltKeyRef.current = tiltKey;
          }
        }
        return;
      }

      // Doğrusal yerine küresel interpolasyon: Kamerayı kürenin dışından bir yay üzerinde taşı
      const fromDir = target.startPosition.clone().normalize();
      const toDir = target.position.clone().normalize();
      const dir = slerpDirections(fromDir, toDir, eased);
      const fromDist = target.startPosition.length();
      const toDist = target.position.length();
      const dist = THREE.MathUtils.lerp(fromDist, toDist, eased);
      camera.position.copy(dir.multiplyScalar(dist));
      // lookAt'i de yumuşat: başlangıç bakış noktasından hedefe doğru lerp
      const startLookAt = (target.startLookAt || cameraTargetRef.current).clone();
      const lookAtNow = startLookAt.lerp(target.lookAt, eased);
      camera.lookAt(lookAtNow);
      if (onCameraUpdate) {
        onCameraUpdate(lookAtNow.clone());
      }
    }
  });

  // Post tilt animasyonu: globeRef'i kamera-sağ ekseni (screen-X) etrafında döndür
  useFrame(() => {
    if (!postTilt || !globeRef.current) return;
    const { start, duration, delta, axis } = postTilt;
    const t = (Date.now() - start) / duration;
    const axisVec = new THREE.Vector3(axis[0], axis[1], axis[2]).normalize();
    if (t >= 1) {
      const applied = globeRef.current.__tiltApplied || 0;
      // Son değere düzeltme yaparak bitir (world-axis rotation)
      const step = delta - applied;
      if (Math.abs(step) > 1e-6) globeRef.current.rotateOnWorldAxis(axisVec, step);
      globeRef.current.__tiltApplied = delta;
      globeRef.current.__tiltAxis = axis;
      setPostTilt(null);
      return;
    }
    const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    const appliedNow = delta * eased;
    const prev = globeRef.current.__tiltApplied || 0;
    const step = appliedNow - prev;
    if (Math.abs(step) > 1e-6) globeRef.current.rotateOnWorldAxis(axisVec, step);
    globeRef.current.__tiltApplied = appliedNow;
    globeRef.current.__tiltAxis = axis;
  });

  // Ülkeleri yükle
  useEffect(() => {
    type GeoJSONFeature2 = {
      properties?: { name_en?: string };
      geometry: { type: "Polygon" | "MultiPolygon"; coordinates: number[][][] | number[][][][] };
    };
    type FeatureCollection2 = { features: GeoJSONFeature2[] };
    fetch("/map.geo-2.json")
      .then((res) => res.json())
      .then((data: FeatureCollection2) => {
        const lines: React.ReactNode[] = [];
        const fillMeshes: React.ReactNode[] = [];
        const colors: Record<string, THREE.Color> = { ...countryColors };

        data.features.forEach((feature: GeoJSONFeature2, featureIndex: number) => {
          const geometryType = feature.geometry.type;
          const coords = feature.geometry.coordinates;
          const polygons = geometryType === "Polygon" ? [coords as number[][][]] : (coords as number[][][][]);
          const originalName: string = feature.properties?.name_en ?? "";
          const countryName = normalizeCountryName(originalName);

          if (!colors[countryName]) {
            colors[countryName] = new THREE.Color(Math.random(), Math.random(), Math.random());
          }

          polygons.forEach((polygon: number[][][], polygonIndex: number) => {
            if (polygon.length > 0 && polygon[0].length >= 3) {
              const contour = polygon[0];
              const holes = polygon.slice(1);

              // Contour'u dateline'da böl
              const contourParts = splitPolygonAtDateline(closeRing(contour));

              contourParts.forEach((contourPart, partIndex) => {
                // Her parça için ayrı geometri oluştur
                const allRings = [contourPart, ...holes.map(closeRing)];

                const points2D: number[] = [];
                allRings.forEach((ring) => {
                  ring.forEach(([lon, lat]) => {
                    points2D.push(normalizeLongitude(lon), lat);
                  });
                });

                const holeIndices: number[] = [];
                let holeIndex = contourPart.length;
                holes.forEach((hole) => {
                  holeIndices.push(holeIndex);
                  holeIndex += hole.length;
                });

                const triangles = earcut(points2D, holeIndices, 2);
                if (triangles.length < 3) return;

                const basePoints3D: number[][] = [];
                const topPoints3D: number[][] = [];
                for (let i = 0; i < points2D.length; i += 2) {
                  const lon = points2D[i];
                  const lat = points2D[i + 1];
                  const phi = ((90 - lat) * Math.PI) / 180;
                  const theta = ((-lon + 180) * Math.PI) / 180;
                  basePoints3D.push([
                    radius * Math.sin(phi) * Math.cos(theta),
                    radius * Math.cos(phi),
                    radius * Math.sin(phi) * Math.sin(theta),
                  ]);
                  topPoints3D.push([
                    (radius + extrusion) * Math.sin(phi) * Math.cos(theta),
                    (radius + extrusion) * Math.cos(phi),
                    (radius + extrusion) * Math.sin(phi) * Math.sin(theta),
                  ]);
                }

                const vertices: number[] = [];
                for (let i = 0; i < triangles.length; i += 3) {
                  vertices.push(...basePoints3D[triangles[i]]);
                  vertices.push(...basePoints3D[triangles[i + 1]]);
                  vertices.push(...basePoints3D[triangles[i + 2]]);

                  vertices.push(...topPoints3D[triangles[i]]);
                  vertices.push(...topPoints3D[triangles[i + 2]]);
                  vertices.push(...topPoints3D[triangles[i + 1]]);
                }

                // Yan duvarlar
                for (let r = 0; r < allRings.length; r++) {
                  const ring = allRings[r];
                  let offset = 0;
                  for (let j = 0; j < r; j++) offset += allRings[j].length;

                  for (let i = 0; i < ring.length - 1; i++) {
                    const a = offset + i;
                    const b = offset + i + 1;

                    vertices.push(...basePoints3D[a]);
                    vertices.push(...basePoints3D[b]);
                    vertices.push(...topPoints3D[a]);

                    vertices.push(...topPoints3D[a]);
                    vertices.push(...basePoints3D[b]);
                    vertices.push(...topPoints3D[b]);
                  }
                }

                const geometry = new THREE.BufferGeometry();
                geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));

                const meshKey = `fill-${countryName}-${featureIndex}-${polygonIndex}-${partIndex}`;

                fillMeshes.push(
                  <mesh
                    key={meshKey}
                    geometry={geometry}
                    userData={{ countryName, originalName }}
                    onPointerOver={(e: ThreeEvent<PointerEvent>) => {
                      e.stopPropagation();
                      // Seçim aktifken hover devre dışı
                      if (selectedRef.current) return;
                      if (onHoverCountry) {
                        onHoverCountry(originalName, {
                          x: e.clientX,
                          y: e.clientY,
                        });
                      }
                    }}
                    onPointerMove={(e: ThreeEvent<PointerEvent>) => {
                      e.stopPropagation();
                      if (selectedRef.current) return;
                      if (onHoverCountry) {
                        onHoverCountry(originalName, {
                          x: e.clientX,
                          y: e.clientY,
                        });
                      }
                    }}
                    onPointerOut={(e: ThreeEvent<PointerEvent>) => {
                      e.stopPropagation();
                      if (selectedRef.current) return;
                      if (onHoverCountry) {
                        onHoverCountry(null, null);
                      }
                    }}
                    onClick={(e: ThreeEvent<MouseEvent>) => {
                      e.stopPropagation();
                      // Seçim aktifken başka ülke seçimine izin verme
                      if (selectedRef.current) return;
                      if (onSelectCountry) {
                        onSelectCountry(originalName);
                      }
                    }}
                  >
                    <meshStandardMaterial
                      color={colors[countryName]}
                      opacity={1}
                      transparent={false}
                      side={THREE.DoubleSide}
                      depthTest
                      depthWrite
                      polygonOffset
                      polygonOffsetFactor={1}
                      polygonOffsetUnits={1}
                      flatShading
                    />
                  </mesh>
                );

                const lineGeometry = new THREE.BufferGeometry().setFromPoints(
                  allRings.flatMap((ring) => {
                    const points = ring.map(([lon, lat]) => {
                      const phi = ((90 - lat) * Math.PI) / 180;
                      const theta = ((-normalizeLongitude(lon) + 180) * Math.PI) / 180;
                      const r = radius + extrusion + 0.001;
                      return new THREE.Vector3(
                        r * Math.sin(phi) * Math.cos(theta),
                        r * Math.cos(phi),
                        r * Math.sin(phi) * Math.sin(theta)
                      );
                    });
                    if (points.length > 1) points.push(points[0]);
                    return points;
                  })
                );

                const lineObj = new THREE.Line(
                  lineGeometry,
                  new THREE.LineBasicMaterial({ color: "black" })
                );
                lines.push(<primitive key={`line-${meshKey}`} object={lineObj} />);
              });
            }
          });
        });

        setCountryColors(colors);
        setBorders(lines);
        setFills(fillMeshes);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Pan fonksiyonunu parent'a gönder
  useEffect(() => {
    if (onPan) onPan(panRef.current);
  }, [onPan]);

  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight position={[10, 10, 5]} intensity={0.8} />
      <directionalLight position={[-10, -10, -5]} intensity={0.8} />
      <pointLight position={[15, 0, 0]} intensity={0.5} />
      <pointLight position={[-15, 0, 0]} intensity={0.5} />
      <pointLight position={[0, 15, 0]} intensity={0.5} />
      <pointLight position={[0, -15, 0]} intensity={0.5} />

  <group ref={globeRef as React.MutableRefObject<ExtendedGroup | null>}>
        {/* Arkaplan yıldız alanı: dünya ile birlikte döner */}
        {/* Küçük yıldızlar */}
        <StarField count={1200} radius={62} size={1.0} />
        {/* Orta yıldızlar */}
        <StarField count={650} radius={60} size={1.6} />
        {/* Büyük yıldızlar */}
        <StarField count={240} radius={58} size={2.2} />
        <mesh>
          {/* Küreyi çok az küçült: ülke dolgularının tabanıyla z-fighting olmasın */}
          <icosahedronGeometry args={[radius - 0.03, 8]} />
          <meshPhongMaterial
            color="#1c6f74"
            flatShading
            shininess={10}
            specular={new THREE.Color("#1c6f74")}
            depthTest
            depthWrite
          />
        </mesh>
        {/* Görünmez okyanus küresi: su bölgelerinde olayları yakalar */}
        <mesh
          onPointerOver={(e: ThreeEvent<PointerEvent>) => {
            e.stopPropagation();
            if (onHoverCountry) onHoverCountry(null, null);
          }}
          onPointerMove={(e: ThreeEvent<PointerEvent>) => {
            e.stopPropagation();
            if (onHoverCountry) onHoverCountry(null, null);
          }}
          onPointerDown={(e: ThreeEvent<PointerEvent>) => {
            e.stopPropagation();
          }}
          onClick={(e: ThreeEvent<MouseEvent>) => {
            e.stopPropagation();
          }}
        >
          {/* Okyanus küresi: z-fighting engellemek için yüzeyin biraz üstünde */}
          <sphereGeometry args={[radius + extrusion * 0.55, 64, 64]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
        {fills}
        {borders}
      </group>
    </>
  );
}

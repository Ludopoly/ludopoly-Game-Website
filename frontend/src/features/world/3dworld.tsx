// 3D Dünya sahnesi: Tüm deneyimi tek bileşende toplayan dosya (TypeScript)
// Bu dosyada hover etiketi (Split-Flap) ve seçili ülke paneli dahili olarak tanımlıdır.
import { useState, useRef, useCallback, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import Globe from "./Globe.tsx";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";
import * as React from "react";
// import "../../index.css";

// Globe props'ları için yerel tip (Globe.jsx JS olduğu için tip güvencesi sağlamak adına)
type MousePos = { x: number; y: number };
interface GlobeProps {
  onHoverCountry: (country: string | null, pos: MousePos | null) => void;
  onSelectCountry: (country: string) => void;
  selectedCountry: string | null;
  onCameraUpdate: (lookAt: THREE.Vector3) => void;
}

// SplitFlapLabel: Havaalanı tabelası benzeri hover etiketi
// Props:
// - text: Gösterilecek metin
// - uppercase: Metni büyük harfe çevir (varsayılan true)
// - className: Ek CSS sınıfları
// - tileSize: Karakter kutusu boyutu (px)
// - variant: "terminal" seçilirse terminal teması uygulanır
type SplitFlapLabelProps = {
  text?: string;
  uppercase?: boolean;
  className?: string;
  tileSize?: number;
  variant?: "default" | "terminal";
};

function SplitFlapLabel({ text = "", uppercase = true, className = "", tileSize = 36, variant = "default" }: SplitFlapLabelProps) {
  const chars = useMemo(() => {
    const t = uppercase ? String(text).toUpperCase() : String(text);
    return t.split("").map((ch) => (ch === " " ? "\u00A0" : ch));
  }, [text, uppercase]);

  // Boyut ve tipografi hesapları (tileSize'a göre)
  const height = tileSize;
  const width = Math.round(tileSize * 0.72);
  const fontSize = Math.round(tileSize * 0.55);
  const radius = Math.round(tileSize * 0.18);

  return (
    <div
      className={`splitflap ${variant === "terminal" ? "splitflap-terminal" : ""} ${className}`.trim()}
      style={{ gap: Math.max(4, Math.round(tileSize * 0.18)) }}
    >
      {chars.map((ch, idx) => (
        <div
          key={`${idx}-${ch}`}
          className="splitflap-tile"
          style={{
            width: `${width}px`,
            height: `${height}px`,
            borderRadius: `${radius}px`,
            fontSize: `${fontSize}px`,
            lineHeight: `${height}px`,
          }}
        >
          <span className="splitflap-char">{ch}</span>
          <span className="splitflap-mid" />
        </div>
      ))}
    </div>
  );
}

// SelectedPanel: Sol üstte görünen, seçili ülke için terminal temalı bilgi kartı
// Props:
// - selectedCountry: Seçili ülke adı (null ise panel görünmez)
// - onClose: Paneli kapatan handler (Back ve X butonları)
type SelectedPanelProps = {
  selectedCountry: string | null;
  onClose: () => void;
};

function SelectedPanel({ selectedCountry, onClose }: SelectedPanelProps) {
  if (!selectedCountry) return null;
  return (
    <div className="absolute top-4 left-4 z-10">
      <div className="relative rounded-lg border border-emerald-500/30 bg-black/80 shadow-[0_0_0_1px_rgba(16,185,129,0.15),0_20px_60px_-20px_rgba(0,0,0,0.6)] p-3 md:p-4">
        <div
          className="pointer-events-none absolute inset-0 rounded-lg opacity-[0.12]"
          style={{
            backgroundImage: "linear-gradient(rgba(16,185,129,0.12) 1px, transparent 1px)",
            backgroundSize: "100% 3px",
          }}
        />
        <div className="flex items-center justify-between px-4 py-2 border-b border-emerald-500/20">
          <div className="font-mono text-emerald-300 text-xs tracking-widest">
            TARGET: <span className="text-emerald-400">{selectedCountry?.toUpperCase()}</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="text-emerald-400/80 hover:text-emerald-300 transition-colors p-1" aria-label="Close">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        <div className="px-4 py-3 font-mono text-[12px] text-emerald-300 space-y-3">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            STATUS: ONLINE
          </div>
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="inline-flex items-center justify-center px-4 py-2 md:px-5 md:py-2.5 rounded-md border border-emerald-500/40 text-emerald-200 hover:text-emerald-100 bg-emerald-500/5 hover:bg-emerald-500/15 transition-colors text-sm md:text-base font-medium min-w-[120px]">
              Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ThreeDWorld: Tüm sahne, hover etiketi ve seçili panelin birleşimi
export default function ThreeDWorld() {
  // Hover ve seçim için durumlar
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState<MousePos>({ x: 0, y: 0 });
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  // Kamera kontrol referansı (OrbitControls hedefini güncellemek için)
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  // Globe tarafından bildirilen bakış noktasını (lookAt) OrbitControls'a uygula
  const handleCameraUpdate = useCallback((lookAt: THREE.Vector3) => {
    const controls = controlsRef.current;
    if (controls) {
      controls.target.copy(lookAt);
      controls.update();
    }
  }, []);

  // Globe.jsx JS dosyası olduğundan, tip güvenliği için yerel tip ile kullan
  const GlobeComponent = Globe as React.ComponentType<GlobeProps>;

  return (
    // Ana kapsayıcı: tam ekran boyut ve degrade arkaplan
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950">
      <div className="absolute inset-0">
        <Canvas camera={{ position: [0, 0, 12], fov: 45 }}>
          {/* Sahne ışıkları */}
          <ambientLight intensity={0.7} />
          <directionalLight position={[10, 10, 5]} intensity={1.5} />
          {/* Dünya bileşeni: hover ve seçim olaylarını bildirir */}
          <GlobeComponent
            onHoverCountry={(country, pos) => {
              setHoveredCountry(country);
              if (pos) setMousePos(pos);
            }}
            onSelectCountry={setSelectedCountry}
            selectedCountry={selectedCountry}
            onCameraUpdate={handleCameraUpdate}
          />
          {/* OrbitControls: Zoom kapalı, seçim aktifken kontrol devre dışı */}
          <OrbitControls ref={controlsRef} enableZoom={false} enabled={!selectedCountry} />
        </Canvas>
      </div>
      {/* Hover etiketi: fare konumuna göre konumlanır, terminal temalı split-flap */}
      {hoveredCountry && (
        <div className="fixed z-50 pointer-events-none" style={{ left: mousePos.x + 14, top: mousePos.y + 14 }}>
          <SplitFlapLabel text={hoveredCountry} tileSize={40} variant="terminal" />
        </div>
      )}
      {/* Seçili ülke paneli: sol üstte görünür */}
      <SelectedPanel selectedCountry={selectedCountry} onClose={() => setSelectedCountry(null)} />
    </div>
  );
}

import React, { useRef, Suspense, useEffect } from 'react'
import { useGLTF, useAnimations } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { TemporaryWorld } from './TemporaryWorld'

interface WorldModelProps {
  modelPath?: string
  scale?: number
  rotation?: [number, number, number]
  position?: [number, number, number]
  useTemporary?: boolean
}

// Single Responsibility: Sadece 3D model yükleme ve gösterimi
export const WorldModel: React.FC<WorldModelProps> = ({
  modelPath = '/assets/models/earth_cartoon.glb',
  scale = 1,
  rotation = [0, 0, 0],
  position = [0, 0, 0],
  useTemporary = false
}) => {
  const groupRef = useRef<THREE.Group>(null)
  
  // Geçici dünya kullan
  if (useTemporary) {
    return <TemporaryWorld />
  }
  
  // GLB modelini ve animasyonlarını yükle
  const { scene, animations } = useGLTF(modelPath)
  const { actions } = useAnimations(animations, groupRef)
  
  // Animasyonları kontrol et
  useEffect(() => {
    console.log('🌍 GLB Modeli Yüklendi!')
    console.log('📽️ Mevcut Animasyonlar:', Object.keys(actions))
    console.log('🎬 Animasyon Detayları:', animations)
    
    // Tüm animasyonları çalıştır
    Object.entries(actions).forEach(([name, action]) => {
      if (action) {
        console.log(`🎭 Animasyon başlatılıyor: ${name}`)
        
        // Animasyonu sonsuz loop yap
        action.setLoop(2201, Infinity) // LoopRepeat = 2201
        action.reset() // Baştan başlat
        
        // Animasyon hızını ayarla
        if (name.toLowerCase().includes('animaci') || name.toLowerCase().includes('animation')) {
          action.timeScale = 0.5 // Dünya rotasyonu yavaş
          console.log(`🌍 Dünya animasyonu yavaşlatıldı: ${name}`)
        } else if (name.toLowerCase().includes('armature') || name.toLowerCase().includes('action')) {
          action.timeScale = 1.0 // Uçak animasyonu normal hız
          console.log(`✈️ Uçak animasyonu normal hızda: ${name}`)
        }
        
        // Animasyonu başlat
        action.play()
        console.log(`▶️ ${name} animasyonu başlatıldı`)
      }
    })
    
    // Cleanup fonksiyonunu kaldırdık - animasyonların durmasına neden oluyordu
  }, [actions]) // animations dependency'sini kaldırdık

  // Manuel rotasyon animasyonu (GLB animasyonuna ek olarak)
  useFrame((_, delta) => {
    if (groupRef.current) {
      // Çok yavaş bir rotasyon ekle
      groupRef.current.rotation.y += delta * 0.05
    }
  })

  return (
    <Suspense fallback={<TemporaryWorld />}>
      <group 
        ref={groupRef}
        scale={scale}
        rotation={rotation}
        position={position}
      >
        <primitive object={scene} />
      </group>
    </Suspense>
  )
}

// Model preload - performans için
export const preloadWorldModel = (modelPath: string = '/assets/models/earth_cartoon.glb') => {
  useGLTF.preload(modelPath)
}

// Earth cartoon model'i preload et
preloadWorldModel('/assets/models/earth_cartoon.glb')

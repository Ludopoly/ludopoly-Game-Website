import React, { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { Box } from '@mui/material'
import { Lighting } from './Lighting'
import { CameraController } from './CameraController'
import { WorldModel } from './WorldModel'

interface Scene3DProps {
  children?: React.ReactNode
  useTemporary?: boolean
  modelPath?: string
}

// Single Responsibility: Sadece 3D canvas'ı yönetir
export const Scene3D: React.FC<Scene3DProps> = ({ 
  children, 
  useTemporary = false,
  modelPath = '/assets/models/world.glb'
}) => {
  return (
    <>
      {/* 3D Canvas - Arka planda */}
      <Canvas
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0, // UI'dan hemen önce
          pointerEvents: 'none', // Mouse etkileşimini engeller
        }}
        camera={{
          position: [0, 5.3, 8.8], 
          fov: 50, // Biraz daha geniş açı
        }}
        gl={{
          antialias: true,
          alpha: true, // Şeffaflık için
        }}
      >
        <Suspense fallback={null}>
          {/* 3D Işıklandırma */}
          <Lighting />
          
          {/* Kamera kontrolü */}
          <CameraController />
          
          {/* 3D Dünya */}
          <WorldModel 
            useTemporary={useTemporary}
            modelPath={modelPath}
            scale={2.8} // %12 daha büyük ölçek
            position={[0, 0, 0]}
          />
          
          {/* Ek 3D içerik */}
          {children}
        </Suspense>
      </Canvas>

      {/* Fallback loading overlay */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: -2,
          background: 'linear-gradient(135deg, #1a1b2e 0%, #16213e 50%, #0f3460 100%)',
        }}
      />
    </>
  )
}

import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useMediaQuery } from '@mui/material'
import * as THREE from 'three'

// Single Responsibility: Sadece kamera hareketlerini yönetir
export const CameraController: React.FC = () => {
  const cameraRef = useRef<THREE.Camera>()
  const isMobile = useMediaQuery('(max-width: 768px)')
  
  useFrame(({ camera, clock }) => {
    if (cameraRef.current) {
      // Yavaş dairesel hareket
      const time = clock.getElapsedTime() * 0.1
      const radius = isMobile ? 13.2 : 15.8 // %12 daha yakın kamera hareketi
      const height = isMobile ? 7 : 8.8 // %12 daha yakın yükseklik
      
      camera.position.x = Math.sin(time) * radius
      camera.position.z = Math.cos(time) * radius
      camera.position.y = height + Math.sin(time * 0.5) * 2
      
      // Merkeze bak
      camera.lookAt(0, 0, 0)
    }
  })

  return null // Bu component görsel bir şey render etmez
}

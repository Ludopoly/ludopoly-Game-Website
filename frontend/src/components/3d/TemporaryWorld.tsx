import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sphere, Plane } from '@react-three/drei'
import * as THREE from 'three'

// Geçici 3D dünya - GLB dosya olmadığında kullanılır
export const TemporaryWorld: React.FC = () => {
  const planetRef = useRef<THREE.Mesh>(null)
  const moonRef = useRef<THREE.Mesh>(null)
  
  useFrame((state, delta) => {
    if (planetRef.current) {
      planetRef.current.rotation.y += delta * 0.2
    }
    if (moonRef.current) {
      moonRef.current.rotation.y += delta * 0.5
      const time = state.clock.getElapsedTime()
      moonRef.current.position.x = Math.sin(time) * 8
      moonRef.current.position.z = Math.cos(time) * 8
    }
  })

  return (
    <group>
      {/* Ana gezegen */}
      <Sphere ref={planetRef} args={[4, 32, 32]} position={[0, 0, 0]}>
        <meshStandardMaterial
          color="#4338ca"
          roughness={0.3}
          metalness={0.1}
          wireframe={false}
        />
      </Sphere>
      
      {/* Ay */}
      <Sphere ref={moonRef} args={[1, 16, 16]} position={[8, 2, 0]}>
        <meshStandardMaterial
          color="#e2e8f0"
          roughness={0.8}
          metalness={0.1}
        />
      </Sphere>
      
      {/* Yıldızlar */}
      {Array.from({ length: 50 }).map((_, i) => (
        <Sphere
          key={i}
          args={[0.1, 8, 8]}
          position={[
            (Math.random() - 0.5) * 100,
            (Math.random() - 0.5) * 100,
            (Math.random() - 0.5) * 100
          ]}
        >
          <meshBasicMaterial color="#ffffff" />
        </Sphere>
      ))}
      
      {/* Zemin (isteğe bağlı) */}
      <Plane args={[100, 100]} rotation={[-Math.PI / 2, 0, 0]} position={[0, -10, 0]}>
        <meshStandardMaterial
          color="#1e293b"
          transparent
          opacity={0.3}
        />
      </Plane>
    </group>
  )
}

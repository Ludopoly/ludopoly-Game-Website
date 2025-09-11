import React from 'react'

// Yeni Lighting komponenti - TypeScript cache sorununu çözmek için
export const LightingNew: React.FC = () => {
  return (
    <>
      {/* Temel aydınlatma */}
      <ambientLight intensity={0.5} color="#ffffff" />
      
      {/* Directional ışık */}
      <directionalLight
        position={[10, 10, 5]}
        intensity={1.5}
        color="#ffffff"
        castShadow
      />
      
      {/* Point ışık */}
      <pointLight
        position={[0, 15, 0]}
        intensity={0.8}
        color="#6366f1"
      />
    </>
  )
}

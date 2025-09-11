import React from 'react'

// Single Responsibility: Sadece 3D sahne ışıklandırmasını yönetir
export const Lighting: React.FC = () => {
  return (
    <>
      {/* Ambient ışık - genel aydınlatma */}
      <ambientLight intensity={0.3} color="#4a5568" />
      
      {/* Directional ışık - güneş ışığı gibi */}
      <directionalLight
        position={[10, 10, 5]}
        intensity={1}
        color="#ffffff"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      
      {/* Point ışık - odak noktası */}
      <pointLight
        position={[0, 15, 0]}
        intensity={0.5}
        color="#6366f1"
        distance={50}
      />
      
      {/* Hemisphere ışık - gökyüzü ışığı */}
      <hemisphereLight
        skyColor="#87ceeb"
        groundColor="#362d59"
        intensity={0.4}
      />
    </>
  )
}

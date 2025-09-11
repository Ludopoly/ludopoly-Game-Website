import React, { createContext, useContext } from 'react'
import type { ReactNode } from 'react'
import { useRooms } from '../hooks/useRooms'
import type { RoomContextType } from '../types'

// Create context
const RoomContext = createContext<RoomContextType | undefined>(undefined)

// Room provider props
interface RoomProviderProps {
  children: ReactNode
}

// Room provider component
const RoomProvider: React.FC<RoomProviderProps> = ({ children }) => {
  const roomsData = useRooms()

  return (
    <RoomContext.Provider value={roomsData}>
      {children}
    </RoomContext.Provider>
  )
}

// Custom hook to use room context
export const useRoomContext = (): RoomContextType => {
  const context = useContext(RoomContext)
  if (context === undefined) {
    throw new Error('useRoomContext must be used within a RoomProvider')
  }
  return context
}

export default RoomProvider

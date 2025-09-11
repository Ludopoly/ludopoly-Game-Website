import { useState, useCallback } from 'react'
import type { Room, RoomState, CreateRoomForm, Player } from '../types'

export const useRooms = () => {
  const [roomState, setRoomState] = useState<RoomState>({
    rooms: [],
    currentRoom: null,
    isLoading: false,
    error: undefined
  })

  // Mock data for Treasure Hunt Game
  const generateMockRooms = (): Room[] => [
    {
      id: 'th1',
      name: 'Treasure Hunters',
      maxPlayers: 4,
      currentPlayers: [
        {
          id: 'u1',
          name: 'Explorer1',
          address: '0x123...',
          avatar: '',
          isReady: true,
          isHost: true,
          displayName: 'Explorer1'
        },
        {
          id: 'u2',
          name: 'Explorer2',
          address: '0x456...',
          avatar: '',
          isReady: false,
          isHost: false,
          displayName: 'Explorer2'
        }
      ],
      status: 'waiting',
      createdBy: 'u1',
      createdAt: new Date(Date.now() - 300000),
      gameMode: 'quick',
      isPrivate: false,
      creator: {
        address: '0x123...',
        displayName: 'Explorer1',
        avatar: ''
      },
      entryFee: 0.01,
      prizePool: 0.04
    }
  ]

  const loadRooms = useCallback(async () => {
    setRoomState(prev => ({ ...prev, isLoading: true, error: undefined }))
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const rooms = generateMockRooms()
      setRoomState(prev => ({
        ...prev,
        rooms,
        isLoading: false
      }))
    } catch (error) {
      setRoomState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Odalar yüklenirken hata oluştu'
      }))
    }
  }, [])

  const createRoom = useCallback(async (roomData: CreateRoomForm): Promise<void> => {
    setRoomState(prev => ({ ...prev, isLoading: true, error: undefined }))
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const newRoom: Room = {
        id: Math.random().toString(36).substr(2, 9),
        name: roomData.name,
        maxPlayers: roomData.maxPlayers,
        currentPlayers: [{
          id: 'current-user',
          name: 'Sen', // This should come from auth context
          isReady: false,
          isHost: true
        }],
        status: 'waiting',
        createdBy: 'current-user',
        createdAt: new Date(),
        gameMode: roomData.gameMode,
        isPrivate: roomData.isPrivate,
        password: roomData.password
      }
      
      setRoomState(prev => ({
        ...prev,
        rooms: [newRoom, ...prev.rooms],
        currentRoom: newRoom,
        isLoading: false
      }))
    } catch (error) {
      setRoomState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Oda oluşturulurken hata oluştu'
      }))
      throw error
    }
  }, [])

  const joinRoom = useCallback(async (roomId: string, password?: string): Promise<void> => {
    setRoomState(prev => ({ ...prev, isLoading: true, error: undefined }))
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const room = roomState.rooms.find(r => r.id === roomId)
      if (!room) {
        throw new Error('Oda bulunamadı')
      }
      
      if (room.isPrivate && room.password !== password) {
        throw new Error('Yanlış şifre')
      }
      
      if (room.currentPlayers.length >= room.maxPlayers) {
        throw new Error('Oda dolu')
      }
      
      const newPlayer: Player = {
        id: 'current-user',
        name: 'Sen',
        isReady: false,
        isHost: false
      }
      
      const updatedRoom = {
        ...room,
        currentPlayers: [...room.currentPlayers, newPlayer]
      }
      
      setRoomState(prev => ({
        ...prev,
        rooms: prev.rooms.map(r => r.id === roomId ? updatedRoom : r),
        currentRoom: updatedRoom,
        isLoading: false
      }))
    } catch (error) {
      setRoomState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Odaya katılırken hata oluştu'
      }))
      throw error
    }
  }, [roomState.rooms])

  const leaveRoom = useCallback(() => {
    setRoomState(prev => ({ ...prev, currentRoom: null }))
  }, [])

  const updateRoom = useCallback((roomId: string, updates: Partial<Room>) => {
    setRoomState(prev => ({
      ...prev,
      rooms: prev.rooms.map(room => 
        room.id === roomId ? { ...room, ...updates } : room
      ),
      currentRoom: prev.currentRoom?.id === roomId 
        ? { ...prev.currentRoom, ...updates } 
        : prev.currentRoom
    }))
  }, [])

  const deleteRoom = useCallback((roomId: string) => {
    setRoomState(prev => ({
      ...prev,
      rooms: prev.rooms.filter(room => room.id !== roomId),
      currentRoom: prev.currentRoom?.id === roomId ? null : prev.currentRoom
    }))
  }, [])

  const setPlayerReady = useCallback((playerId: string, isReady: boolean) => {
    if (!roomState.currentRoom) return
    
    const updatedRoom = {
      ...roomState.currentRoom,
      currentPlayers: roomState.currentRoom.currentPlayers.map(player =>
        player.id === playerId ? { ...player, isReady } : player
      )
    }
    
    updateRoom(roomState.currentRoom.id, { currentPlayers: updatedRoom.currentPlayers })
  }, [roomState.currentRoom, updateRoom])

  return {
    ...roomState,
    loadRooms,
    createRoom,
    joinRoom,
    leaveRoom,
    updateRoom,
    deleteRoom,
    setPlayerReady
  }
}

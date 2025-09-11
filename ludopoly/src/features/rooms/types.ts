// Room types for Treasure Hunt Game
export interface Room {
  id: string
  name: string
  maxPlayers: number
  currentPlayers: Player[]
  status: 'waiting' | 'playing' | 'finished'
  createdBy: string
  createdAt: Date
  gameMode: 'quick' | 'standard' | 'hardcore'
  isPrivate: boolean
  password?: string
  entryFee?: number // Wei cinsinden
  prizePool?: number // ETH cinsinden
  creator: {
    address: string
    displayName: string
    avatar?: string
  }
}

export interface Player {
  id: string
  name: string
  address: string
  avatar?: string
  isReady: boolean
  isHost: boolean
  displayName: string
}

// Room creation form for treasure hunt
export interface CreateRoomForm {
  name: string
  maxPlayers: number
  gameMode: 'quick' | 'standard' | 'hardcore'
  isPrivate: boolean
  password?: string
  entryFee?: number
}

// Room state
export interface RoomState {
  rooms: Room[]
  currentRoom: Room | null
  isLoading: boolean
  error?: string
}

// Room context type
export interface RoomContextType extends RoomState {
  loadRooms: () => Promise<void>
  createRoom: (roomData: CreateRoomForm) => Promise<void>
  joinRoom: (roomId: string, password?: string) => Promise<void>
  leaveRoom: () => void
  updateRoom: (roomId: string, updates: Partial<Room>) => void
  deleteRoom: (roomId: string) => void
  setPlayerReady: (playerId: string, isReady: boolean) => void
}

// Room actions
export type RoomAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'SET_ROOMS'; payload: Room[] }
  | { type: 'ADD_ROOM'; payload: Room }
  | { type: 'UPDATE_ROOM'; payload: { id: string; updates: Partial<Room> } }
  | { type: 'DELETE_ROOM'; payload: string }
  | { type: 'JOIN_ROOM'; payload: Room }
  | { type: 'LEAVE_ROOM' }
  | { type: 'PLAYER_JOIN'; payload: { roomId: string; player: Player } }
  | { type: 'PLAYER_LEAVE'; payload: { roomId: string; playerId: string } }
  | { type: 'PLAYER_READY'; payload: { roomId: string; playerId: string; isReady: boolean } }

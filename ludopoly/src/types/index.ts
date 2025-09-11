// Global type definitions
// Contract types
export * from './contracts';

export interface GameState {
  status: 'idle' | 'waiting' | 'playing' | 'finished'
  currentPlayer: string | null
  players: Player[]
  board: BoardCell[]
  dice: DiceState
}

export interface Player {
  id: string
  name: string
  position: number
  money: number
  properties: Property[]
  color: string
  avatar?: string
}

export interface BoardCell {
  id: number
  type: 'property' | 'special' | 'corner'
  name: string
  price?: number
  owner?: string
  rent?: number
}

export interface Property {
  id: string
  name: string
  price: number
  rent: number
  type: string
}

export interface DiceState {
  value1: number
  value2: number
  isRolling: boolean
}

export interface Room {
  id: string
  name: string
  maxPlayers: number
  currentPlayers: number
  status: 'waiting' | 'playing' | 'finished'
  createdBy: string
  createdAt: Date
}

export interface ChatMessage {
  id: string
  senderId: string
  senderName: string
  message: string
  timestamp: Date
  type: 'text' | 'system' | 'emoji'
}

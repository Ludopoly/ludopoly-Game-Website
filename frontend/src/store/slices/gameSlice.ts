import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'

// Game interfaces
interface Room {
  id: string
  name: string
  playerCount: number
  maxPlayers: number
  isPrivate: boolean
  gameStatus: 'waiting' | 'playing' | 'finished'
  createdBy: string
  entryFee?: number
}

interface Player {
  id: string
  username: string
  avatar?: string
  position: number
  balance: number
  properties: string[]
  isActive: boolean
}

interface GameState {
  // Room management
  availableRooms: Room[]
  currentRoom: Room | null
  
  // Game state
  players: Player[]
  currentPlayerId: string | null
  gameStatus: 'waiting' | 'playing' | 'paused' | 'finished'
  
  // Game mechanics
  diceValue: number | null
  lastMove: {
    playerId: string
    from: number
    to: number
    timestamp: number
  } | null
  
  // UI state
  isLoading: boolean
  error: string | null
}

// Async thunk'lar
export const fetchRooms = createAsyncThunk(
  'game/fetchRooms',
  async (_, { rejectWithValue }) => {
    try {
      // Mock data - gerçek API çağrısı yapılacak
      const rooms: Room[] = [
        {
          id: '1',
          name: 'Başlangıç Odası',
          playerCount: 2,
          maxPlayers: 4,
          isPrivate: false,
          gameStatus: 'waiting',
          createdBy: 'user1',
          entryFee: 0.01
        },
        {
          id: '2',
          name: 'Pro Oyuncular',
          playerCount: 3,
          maxPlayers: 6,
          isPrivate: false,
          gameStatus: 'playing',
          createdBy: 'user2',
          entryFee: 0.05
        }
      ]
      
      return rooms
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

export const joinRoom = createAsyncThunk(
  'game/joinRoom',
  async (roomId: string, { rejectWithValue }) => {
    try {
      // Mock room join - gerçek API çağrısı yapılacak
      const room: Room = {
        id: roomId,
        name: 'Test Room',
        playerCount: 1,
        maxPlayers: 4,
        isPrivate: false,
        gameStatus: 'waiting',
        createdBy: 'user1',
        entryFee: 0.01
      }
      
      return room
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

export const createRoom = createAsyncThunk(
  'game/createRoom',
  async (roomData: { name: string; maxPlayers: number; isPrivate: boolean; entryFee?: number }, { rejectWithValue }) => {
    try {
      const room: Room = {
        id: Date.now().toString(),
        name: roomData.name,
        playerCount: 1,
        maxPlayers: roomData.maxPlayers,
        isPrivate: roomData.isPrivate,
        gameStatus: 'waiting',
        createdBy: 'current-user',
        entryFee: roomData.entryFee
      }
      
      return room
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

export const rollDice = createAsyncThunk(
  'game/rollDice',
  async (_, { getState }) => {
    const diceValue = Math.floor(Math.random() * 6) + 1
    
    // Game state'ini güncelle
    const state = getState() as { game: GameState }
    const currentPlayer = state.game.players.find(p => p.id === state.game.currentPlayerId)
    
    if (currentPlayer) {
      const newPosition = (currentPlayer.position + diceValue) % 40 // Monopoly board has 40 positions
      
      return {
        diceValue,
        move: {
          playerId: currentPlayer.id,
          from: currentPlayer.position,
          to: newPosition,
          timestamp: Date.now()
        }
      }
    }
    
    return { diceValue, move: null }
  }
)

// Initial state
const initialState: GameState = {
  availableRooms: [],
  currentRoom: null,
  players: [],
  currentPlayerId: null,
  gameStatus: 'waiting',
  diceValue: null,
  lastMove: null,
  isLoading: false,
  error: null
}

// Slice tanımı
const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    // Room'dan ayrıl
    leaveRoom: (state) => {
      state.currentRoom = null
      state.players = []
      state.gameStatus = 'waiting'
      state.currentPlayerId = null
      state.diceValue = null
      state.lastMove = null
    },
    
    // Oyuncuları güncelle
    updatePlayers: (state, action: PayloadAction<Player[]>) => {
      state.players = action.payload
    },
    
    // Aktif oyuncuyu değiştir
    setCurrentPlayer: (state, action: PayloadAction<string>) => {
      state.currentPlayerId = action.payload
    },
    
    // Oyun durumunu güncelle
    setGameStatus: (state, action: PayloadAction<GameState['gameStatus']>) => {
      state.gameStatus = action.payload
    },
    
    // Oyuncu pozisyonunu güncelle
    updatePlayerPosition: (state, action: PayloadAction<{ playerId: string; position: number }>) => {
      const player = state.players.find(p => p.id === action.payload.playerId)
      if (player) {
        player.position = action.payload.position
      }
    },
    
    // Oyuncu bakiyesini güncelle
    updatePlayerBalance: (state, action: PayloadAction<{ playerId: string; balance: number }>) => {
      const player = state.players.find(p => p.id === action.payload.playerId)
      if (player) {
        player.balance = action.payload.balance
      }
    },
    
    // Error temizle
    clearGameError: (state) => {
      state.error = null
    },
    
    // Zar sonucunu temizle
    clearDice: (state) => {
      state.diceValue = null
    }
  },
  extraReducers: (builder) => {
    // Fetch rooms
    builder
      .addCase(fetchRooms.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchRooms.fulfilled, (state, action) => {
        state.isLoading = false
        state.availableRooms = action.payload
      })
      .addCase(fetchRooms.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
    
    // Join room
    builder
      .addCase(joinRoom.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(joinRoom.fulfilled, (state, action) => {
        state.isLoading = false
        state.currentRoom = action.payload
        state.gameStatus = 'waiting'
      })
      .addCase(joinRoom.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
    
    // Create room
    builder
      .addCase(createRoom.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createRoom.fulfilled, (state, action) => {
        state.isLoading = false
        state.currentRoom = action.payload
        state.gameStatus = 'waiting'
      })
      .addCase(createRoom.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
    
    // Roll dice
    builder.addCase(rollDice.fulfilled, (state, action) => {
      state.diceValue = action.payload.diceValue
      if (action.payload.move) {
        state.lastMove = action.payload.move
        // Update player position
        const player = state.players.find(p => p.id === action.payload.move!.playerId)
        if (player) {
          player.position = action.payload.move.to
        }
      }
    })
  }
})

// Export actions
export const {
  leaveRoom,
  updatePlayers,
  setCurrentPlayer,
  setGameStatus,
  updatePlayerPosition,
  updatePlayerBalance,
  clearGameError,
  clearDice
} = gameSlice.actions

// Export reducer
export default gameSlice.reducer

// Selectors
export const selectGameState = (state: { game: GameState }) => state.game
export const selectAvailableRooms = (state: { game: GameState }) => state.game.availableRooms
export const selectCurrentRoom = (state: { game: GameState }) => state.game.currentRoom
export const selectPlayers = (state: { game: GameState }) => state.game.players
export const selectCurrentPlayer = (state: { game: GameState }) => 
  state.game.players.find(p => p.id === state.game.currentPlayerId)
export const selectGameStatus = (state: { game: GameState }) => state.game.gameStatus
export const selectDiceValue = (state: { game: GameState }) => state.game.diceValue
export const selectLastMove = (state: { game: GameState }) => state.game.lastMove
export const selectGameLoading = (state: { game: GameState }) => state.game.isLoading
export const selectGameError = (state: { game: GameState }) => state.game.error

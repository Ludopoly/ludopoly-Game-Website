// Application routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  GAME: '/game',
  ROOMS: '/rooms',
  PROFILE: '/profile',
  LEADERBOARD: '/leaderboard'
} as const

// Game configuration
export const GAME_CONFIG = {
  MAX_PLAYERS: 4,
  MIN_PLAYERS: 2,
  STARTING_MONEY: 1500,
  BOARD_SIZE: 40,
  DICE_COUNT: 2,
  TURN_TIMEOUT: 30000 // 30 seconds
} as const

// Network configuration
export const NETWORK_CONFIG = {
  ETHEREUM_MAINNET: 1,
  ETHEREUM_SEPOLIA: 11155111,
  POLYGON_MAINNET: 137,
  POLYGON_MUMBAI: 80001
} as const

// API endpoints
export const API_ENDPOINTS = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  WEBSOCKET_URL: import.meta.env.VITE_WS_URL || 'ws://localhost:3001'
} as const

// UI Constants
export const UI_CONFIG = {
  ANIMATION_DURATION: 300,
  TOAST_DURATION: 3000,
  MODAL_BACKDROP_OPACITY: 0.8
} as const

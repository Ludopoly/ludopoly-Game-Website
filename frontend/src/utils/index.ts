// ABIs
export * from './abis/accountFacetAbi';
export * from './abis/profileFacetAbi';

// Format functions
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('tr-TR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

// Game utility functions
export const rollDice = (): [number, number] => {
  const dice1 = Math.floor(Math.random() * 6) + 1
  const dice2 = Math.floor(Math.random() * 6) + 1
  return [dice1, dice2]
}

export const calculateNewPosition = (currentPosition: number, diceSum: number, boardSize: number = 40): number => {
  return (currentPosition + diceSum) % boardSize
}

export const generateRandomId = (length: number = 8): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// Validation functions
export const validatePlayerName = (name: string): boolean => {
  return name.trim().length >= 2 && name.trim().length <= 20
}

export const validateWalletAddress = (address: string): boolean => {
  return /^0x[a-fA-F0-9]{40}$/.test(address)
}

// Delay function for animations
export const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

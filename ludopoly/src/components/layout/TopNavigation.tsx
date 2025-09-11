import React from 'react'
import { Box } from '@mui/material'
import { 
  Home as HomeIcon,
  SportsEsports as GamesIcon,
  Leaderboard as LeaderboardIcon
} from '@mui/icons-material'
import { UserProfileContainer } from '../dashboard/UserProfileContainer'
import { NavigationButton } from '../../theme/components/NavigationButton'

// Single Responsibility: Üst navigasyon menüsünü yönetir
export const TopNavigation: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState('home')

  const handleTabClick = (tab: string) => {
    setActiveTab(tab)
  }

  return (
    <Box sx={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '2rem',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
    }}>
      {/* Sol boş alan */}
      <Box sx={{ flex: 1 }} />
      
      {/* Orta - Navigation Butonları */}
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 4,
      }}>
        <NavigationButton 
          variant="default"
          active={activeTab === 'home'}
          icon={<HomeIcon />}
          onClick={() => handleTabClick('home')}
        >
          Home
        </NavigationButton>
        
        <NavigationButton 
          variant="default"
          active={activeTab === 'games'}
          icon={<GamesIcon />}
          onClick={() => handleTabClick('games')}
        >
          Games
        </NavigationButton>
        
        <NavigationButton 
          variant="default"
          active={activeTab === 'leaderboard'}
          icon={<LeaderboardIcon />}
          onClick={() => handleTabClick('leaderboard')}
        >
          Leaderboard
        </NavigationButton>
      </Box>
      
      {/* Sağ - User Profile */}
      <Box sx={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
        <UserProfileContainer variant="compact"  />
      </Box>
    </Box>
  )
}

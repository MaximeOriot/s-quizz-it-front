import { useContext } from 'react';
import { PlayerContext } from './PlayerContext';

export const usePlayerContext = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayerContext doit être utilisé dans un PlayerProvider');
  }
  return context;
}; 
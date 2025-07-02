import React, { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

interface PlayerContextType {
  playerName: string;
  setPlayerName: (name: string) => void;
}

const PlayerContext = createContext<PlayerContextType | null>(null);

interface PlayerProviderProps {
  children: ReactNode;
}

export const PlayerProvider: React.FC<PlayerProviderProps> = ({ children }) => {
  const [playerName, setPlayerNameState] = useState<string>('Invité');

  useEffect(() => {
    // Récupérer le nom du joueur depuis localStorage au chargement
    const storedName = localStorage.getItem('username');
    if (storedName) {
      setPlayerNameState(storedName);
    }
  }, []);

  const setPlayerName = (name: string) => {
    setPlayerNameState(name);
    localStorage.setItem('username', name);
  };

  const value: PlayerContextType = {
    playerName,
    setPlayerName
  };

  return (
    <PlayerContext.Provider value={value}>
      {children}
    </PlayerContext.Provider>
  );
};

export { PlayerContext }; 
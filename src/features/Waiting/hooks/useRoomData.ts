import { useState } from 'react';
import type { WaitingPlayer } from '../models/waitingPlayer';
import type { Quizz } from '../../../models/quizz';

interface RoomData {
  players: WaitingPlayer[];
  quizz: Quizz;
  isQuickPlay: boolean;
  roomId: string;
}

export const useRoomData = (roomId: string | null) => {
  const [roomData, setRoomData] = useState<RoomData>({
    players: [],
    quizz: {
      id: 1,
      label: 'Chargement...',
      description: 'Chargement du quiz...',
    },
    isQuickPlay: true,
    roomId: roomId || ''
  });

  const updateRoomInfo = (quizz: Quizz, isQuickPlay: boolean) => {
    setRoomData(prev => ({
      ...prev,
      quizz,
      isQuickPlay
    }));
  };

  const updatePlayers = (players: WaitingPlayer[]) => {
    setRoomData(prev => ({
      ...prev,
      players
    }));
  };

  const updatePlayerReady = (playerId: string, isReady: boolean) => {
    setRoomData(prev => ({
      ...prev,
      players: prev.players.map(player => 
        player.id.toString() === playerId 
          ? { ...player, isReady }
          : player
      )
    }));
  };

  const updateFromSalon = (salon: { id: number; label: string; type: string; difficulte: number }) => {
    setRoomData(prev => ({
      ...prev,
      quizz: {
        id: salon.id,
        label: salon.label,
        description: `Salle ${salon.type} - Difficulté: ${salon.difficulte}`,
        themes: []
      },
      isQuickPlay: salon.type === 'rapide'
    }));
  };

  return {
    roomData,
    updateRoomInfo,
    updatePlayers,
    updatePlayerReady,
    updateFromSalon
  };
}; 
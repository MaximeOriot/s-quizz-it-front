import { useCallback } from 'react';
import type { WaitingPlayer } from '../models/waitingPlayer';
import type { Quizz } from '../../../models/quizz';

interface MessageHandlersProps {
  roomId: string | null;
  onRoomInfo: (quizz: Quizz, isQuickPlay: boolean) => void;
  onPlayersUpdate: (players: WaitingPlayer[]) => void;
  onPlayerReady: (playerId: string, isReady: boolean) => void;
  onSalonInit: (salon: { id: number; label: string; type: string; difficulte: number }) => void;
  onGameStart: () => void;
  onLoadingComplete: () => void;
}

export const useMessageHandlers = ({
  roomId,
  onRoomInfo,
  onPlayersUpdate,
  onPlayerReady,
  onSalonInit,
  onGameStart,
  onLoadingComplete
}: MessageHandlersProps) => {
  
  const handleMessage = useCallback((data: unknown) => {
    if (data && typeof data === 'object' && 'type' in data) {
      const messageData = data as { type: string; [key: string]: unknown };
      
      switch (messageData.type) {
        case 'room_info':
          if ('quizz' in messageData && 'isQuickPlay' in messageData) {
            onRoomInfo(messageData.quizz as Quizz, messageData.isQuickPlay as boolean);
            onLoadingComplete();
          }
          break;
          
        case 'room_players':
          if ('players' in messageData) {
            onPlayersUpdate(messageData.players as WaitingPlayer[]);
          }
          break;
          
        case 'salons_init':
          if ('salons' in messageData && Array.isArray(messageData.salons)) {
            const currentRoom = messageData.salons.find((salon: { id: number; label: string; type: string; difficulte: number }) => 
              salon.id.toString() === roomId
            );
            if (currentRoom) {
              onSalonInit(currentRoom);
              onLoadingComplete();
            }
          }
          break;
          
        case 'player_ready':
          if ('playerId' in messageData && 'isReady' in messageData) {
            onPlayerReady(messageData.playerId as string, messageData.isReady as boolean);
          }
          break;
          
        case 'game_start':
          onGameStart();
          break;
      }
    }
  }, [roomId, onRoomInfo, onPlayersUpdate, onPlayerReady, onSalonInit, onGameStart, onLoadingComplete]);

  const handleError = useCallback((error: Event) => {
    console.error("Erreur WebSocket dans WaitingRoom:", error);
    onLoadingComplete();
  }, [onLoadingComplete]);

  const handleTimeout = useCallback(() => {
    console.log("Timeout: Aucune réponse du serveur");
    onLoadingComplete();
  }, [onLoadingComplete]);

  return {
    handleMessage,
    handleError,
    handleTimeout
  };
}; 
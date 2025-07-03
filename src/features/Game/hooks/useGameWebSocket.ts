import { useCallback, useMemo } from 'react';
import { useWebSocket } from '../../../hooks/useWebSocket';

interface UseGameWebSocketProps {
  gameId: string | null;
  onWaitingPlayers?: (playersAnswered: string[], totalPlayers: number) => void;
  onNextQuestion?: (questionIndex: number, scores: {[key: string]: number}) => void;
  onGameEnd?: (finalScores: {[key: string]: number}) => void;
}

export const useGameWebSocket = ({ 
  gameId, 
  onWaitingPlayers, 
  onNextQuestion, 
  onGameEnd 
}: UseGameWebSocketProps) => {
  
  const handleMessage = useCallback((data: unknown) => {
    if (data && typeof data === 'object' && 'type' in data) {
      const messageData = data as { type: string; payload?: Record<string, unknown> };
      
      switch (messageData.type) {
        case 'waiting_players':
          onWaitingPlayers?.(
            (messageData.payload?.playersAnswered as string[]) || [],
            (messageData.payload?.totalPlayers as number) || 0
          );
          break;
          
        case 'next_question':
          onNextQuestion?.(
            (messageData.payload?.questionIndex as number) || 0,
            (messageData.payload?.scores as {[key: string]: number}) || {}
          );
          break;
          
        case 'game_end':
          onGameEnd?.((messageData.payload?.finalScores as {[key: string]: number}) || {});
          break;
      }
    }
  }, [onWaitingPlayers, onNextQuestion, onGameEnd]);

  const handleError = useCallback((error: Event) => {
    console.error("Erreur WebSocket dans GamePage:", error);
  }, []);

  const handleOpen = useCallback(() => {
    console.log("WebSocket connecté pour GamePage");
  }, []);

  const handleClose = useCallback((event: CloseEvent) => {
    console.log("WebSocket fermé pour GamePage:", event.code);
  }, []);

  // Stabiliser les callbacks
  const stableCallbacks = useMemo(() => ({
    onMessage: handleMessage,
    onError: handleError,
    onOpen: handleOpen,
    onClose: handleClose
  }), [handleMessage, handleError, handleOpen, handleClose]);

  const { socket, sendWebSocketMessage } = useWebSocket({
    id: `game-${gameId}`,
    callbacks: stableCallbacks,
    autoConnect: !!gameId // Ne se connecte que s'il y a un gameId
  });

  return { socket, sendWebSocketMessage };
}; 
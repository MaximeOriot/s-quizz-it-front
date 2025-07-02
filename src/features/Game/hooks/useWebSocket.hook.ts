import { useRef, useEffect, useCallback } from 'react';
import type { WebSocketMessage, AnswerData } from '../types/game.types';

interface UseWebSocketProps {
  gameType: string;
  gameId: string | null;
  user: string | null;
  playerName: string | null;
  onMessage: (message: WebSocketMessage) => void;
}

export const useWebSocket = ({ gameType, gameId, user, playerName, onMessage }: UseWebSocketProps) => {
  const wsRef = useRef<WebSocket | null>(null);

  const initializeWebSocket = useCallback(() => {
    if (gameType !== 'MULTIPLAYER' || !gameId) return;

    const wsUrl = `wss://your-websocket-url/game/${gameId}`;
    wsRef.current = new WebSocket(wsUrl);
    
    wsRef.current.onopen = () => {
      console.log('WebSocket connecté');
      sendMessage({
        type: 'player_joined',
        payload: {
          playerId: user || playerName,
          playerName: playerName,
          gameId: gameId
        }
      });
    };
    
    wsRef.current.onmessage = (event) => {
      const message: WebSocketMessage = JSON.parse(event.data);
      onMessage(message);
    };
    
    wsRef.current.onclose = () => {
      console.log('WebSocket fermé');
    };
    
    wsRef.current.onerror = (error) => {
      console.error('Erreur WebSocket:', error);
    };
  }, [gameType, gameId, user, playerName, onMessage]);

  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  }, []);

  const sendAnswer = useCallback((answerData: AnswerData) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const message = `answer:${JSON.stringify(answerData)}`;
      wsRef.current.send(message);
    }
  }, []);

  const closeConnection = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
    }
  }, []);

  useEffect(() => {
    initializeWebSocket();
    return closeConnection;
  }, [initializeWebSocket, closeConnection]);

  return { sendMessage, sendAnswer, closeConnection };
};

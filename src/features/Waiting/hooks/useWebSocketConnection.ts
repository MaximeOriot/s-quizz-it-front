import { useEffect, useRef, useCallback } from 'react';
import { useWebSocket } from '../../../hooks/useWebSocket';
import type { WebSocketCallbacks } from '../../../util/WebSocket/types';

interface UseWebSocketConnectionProps {
  roomId: string | null;
  callbacks: WebSocketCallbacks;
  onTimeout?: () => void;
  enableTimeout?: boolean;
}

export const useWebSocketConnection = ({ 
  roomId, 
  callbacks, 
  onTimeout, 
  enableTimeout = true 
}: UseWebSocketConnectionProps) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMessage = useCallback((data: unknown) => {
    // Si on reçoit un message, on peut annuler le timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    callbacks.onMessage?.(data);
  }, [callbacks.onMessage]);

  const { socket, sendWebSocketMessage } = useWebSocket({
    id: `waiting-room-${roomId}`,
    callbacks: {
      ...callbacks,
      onMessage: handleMessage
    },
    autoConnect: !!roomId
  });

  useEffect(() => {
    if (!roomId || !socket) return;

    // Rejoindre la salle une fois connecté
    if (socket.readyState === WebSocket.OPEN) {
      sendWebSocketMessage({ type: 'join_room', roomId });
    }

    // Configurer le timeout si activé
    if (enableTimeout) {
      timeoutRef.current = setTimeout(() => {
        console.log("Timeout: Aucune réponse du serveur pour la salle", roomId);
        onTimeout?.();
      }, 10000);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [roomId, socket, enableTimeout, onTimeout, sendWebSocketMessage]);

  return { socket, sendWebSocketMessage };
}; 
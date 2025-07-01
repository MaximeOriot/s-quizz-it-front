import { useEffect, useRef, useCallback, useMemo } from 'react';
import { joinRoom } from '../../../util/WebSocket';
import { useWebSocket } from '../../../util/hooks/useWebSocket';
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

  const handleOpen = useCallback(() => {
    if (roomId) {
      // Le socket sera disponible via le hook useWebSocket
      console.log("WebSocket connecté pour la salle:", roomId);
    }
  }, [roomId]);

  const handleMessage = useCallback((data: unknown) => {
    // Si on reçoit un message, on peut annuler le timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    callbacks.onMessage?.(data);
  }, [callbacks.onMessage]);

  const handleError = useCallback((error: Event) => {
    callbacks.onError?.(error);
  }, [callbacks.onError]);

  const handleClose = useCallback((event: CloseEvent) => {
    callbacks.onClose?.(event);
  }, [callbacks.onClose]);

  // Stabiliser les callbacks pour éviter les reconnexions
  const stableCallbacks = useMemo(() => ({
    onMessage: handleMessage,
    onError: handleError,
    onClose: handleClose,
    onOpen: handleOpen
  }), [handleMessage, handleError, handleClose, handleOpen]);

  const socket = useWebSocket({
    callbacks: stableCallbacks,
    autoConnect: !!roomId // Ne se connecte que s'il y a un roomId
  });

  useEffect(() => {
    if (!roomId || !socket) return;

    // Rejoindre la salle une fois connecté
    if (socket.readyState === WebSocket.OPEN) {
      joinRoom(socket, roomId);
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
  }, [roomId, socket, enableTimeout, onTimeout]);

  return socket;
}; 
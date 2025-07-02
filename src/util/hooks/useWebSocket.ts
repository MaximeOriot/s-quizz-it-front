import { useEffect, useRef, useCallback } from 'react';
import { createWebSocket } from '../WebSocket';
import type { WebSocketCallbacks } from '../WebSocket/types';

interface UseWebSocketProps {
  callbacks: WebSocketCallbacks;
  autoConnect?: boolean;
}

export const useWebSocket = ({ callbacks, autoConnect = true }: UseWebSocketProps) => {
  const socketRef = useRef<WebSocket | null>(null);
  const callbacksRef = useRef(callbacks);

  // Mettre à jour les callbacks sans recréer la connexion
  callbacksRef.current = callbacks;

  const createConnection = useCallback(() => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      return socketRef.current;
    }

    try {
      const socket = createWebSocket({
        onMessage: (data) => callbacksRef.current.onMessage?.(data),
        onError: (error) => callbacksRef.current.onError?.(error),
        onClose: (event) => callbacksRef.current.onClose?.(event),
        onOpen: () => callbacksRef.current.onOpen?.()
      });
      
      socketRef.current = socket;
      return socket;
    } catch (error) {
      console.error("Erreur lors de la création du WebSocket:", error);
      return null;
    }
  }, []);

  useEffect(() => {
    if (!autoConnect) return;

    const socket = createConnection();

    return () => {
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
      socketRef.current = null;
    };
  }, [autoConnect, createConnection]);

  return socketRef.current;
}; 
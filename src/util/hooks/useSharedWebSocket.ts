import { useEffect, useRef, useCallback, useMemo } from 'react';
import { useWebSocketContext } from '../../contexts/useWebSocketContext';
import type { WebSocketCallbacks } from '../WebSocket/types';

interface UseSharedWebSocketProps {
  id: string;
  callbacks: WebSocketCallbacks;
  autoConnect?: boolean;
}

export const useSharedWebSocket = ({ id, callbacks, autoConnect = true }: UseSharedWebSocketProps) => {
  const { socket, addListener, removeListener, sendMessage } = useWebSocketContext();
  const callbacksRef = useRef(callbacks);

  // Mettre à jour les callbacks sans recréer la connexion
  callbacksRef.current = callbacks;

  // Stabiliser les callbacks pour éviter les reconnexions
  const stableCallbacks = useMemo(() => ({
    onMessage: (data: unknown) => callbacksRef.current.onMessage?.(data),
    onError: (error: Event) => callbacksRef.current.onError?.(error),
    onClose: (event: CloseEvent) => callbacksRef.current.onClose?.(event),
    onOpen: () => callbacksRef.current.onOpen?.()
  }), []);

  useEffect(() => {
    if (!autoConnect) return;

    addListener(id, stableCallbacks);

    return () => {
      removeListener(id);
    };
  }, [id, autoConnect, addListener, removeListener, stableCallbacks]);

  const sendWebSocketMessage = useCallback((message: unknown) => {
    sendMessage(message);
  }, [sendMessage]);

  return { socket, sendWebSocketMessage };
}; 
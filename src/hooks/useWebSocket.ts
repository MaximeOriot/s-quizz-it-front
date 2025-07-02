import { useCallback, useMemo, useEffect } from 'react';
import { useWebSocketContext } from '../contexts/useWebSocketContext';
import type { WebSocketCallbacks } from '../util/WebSocket/types';

interface UseWebSocketProps {
  id: string;
  callbacks: WebSocketCallbacks;
  autoConnect?: boolean;
}

/**
 * Hook unifié pour utiliser le WebSocket global
 * Gère automatiquement l'ajout/suppression des listeners
 */
export const useWebSocket = ({ id, callbacks, autoConnect = true }: UseWebSocketProps) => {
  const { socket, addListener, removeListener, sendMessage } = useWebSocketContext();

  // Stabiliser les callbacks pour éviter les reconnexions
  const stableCallbacks = useMemo(() => ({
    onMessage: callbacks.onMessage,
    onError: callbacks.onError,
    onOpen: callbacks.onOpen,
    onClose: callbacks.onClose
  }), [callbacks.onMessage, callbacks.onError, callbacks.onOpen, callbacks.onClose]);

  // Ajouter le listener au montage
  useEffect(() => {
    if (autoConnect) {
      addListener(id, stableCallbacks);
    }

    return () => {
      removeListener(id);
    };
  }, [id, autoConnect, addListener, removeListener, stableCallbacks]);

  const sendWebSocketMessage = useCallback((message: unknown) => {
    sendMessage(message);
  }, [sendMessage]);

  return { socket, sendWebSocketMessage };
}; 
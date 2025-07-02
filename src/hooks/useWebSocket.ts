import { useCallback, useRef, useEffect } from 'react';
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
 * Utilise des refs pour éviter les problèmes de synchronisation des callbacks
 */
export const useWebSocket = ({ id, callbacks, autoConnect = true }: UseWebSocketProps) => {
  const { socket, addListener, removeListener, sendMessage } = useWebSocketContext();
  
  // Utiliser des refs pour les callbacks pour éviter les problèmes de synchronisation
  const callbacksRef = useRef(callbacks);
  callbacksRef.current = callbacks;

  // Créer des callbacks stables qui utilisent les refs
  const stableCallbacks: WebSocketCallbacks = {
    onMessage: (data: unknown) => {
      callbacksRef.current.onMessage?.(data);
    },
    onError: (error: Event) => {
      callbacksRef.current.onError?.(error);
    },
    onOpen: () => {
      callbacksRef.current.onOpen?.();
    },
    onClose: (event: CloseEvent) => {
      callbacksRef.current.onClose?.(event);
    }
  };

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
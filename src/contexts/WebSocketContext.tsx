import React, { createContext, useRef, useCallback, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { globalWebSocket } from '../util/GlobalWebSocket';
import type { WebSocketCallbacks } from '../util/WebSocket/types';

interface WebSocketContextType {
  socket: WebSocket | null;
  addListener: (id: string, callbacks: WebSocketCallbacks) => void;
  removeListener: (id: string) => void;
  sendMessage: (message: unknown) => void;
  forceUpdate: () => void;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

interface WebSocketProviderProps {
  children: ReactNode;
}

function WebSocketProvider({ children }: WebSocketProviderProps) {
  const listenersRef = useRef<Map<string, WebSocketCallbacks>>(new Map());
  const [, forceUpdate] = useState({});

  const addListener = useCallback((id: string, callbacks: WebSocketCallbacks) => {
    listenersRef.current.set(id, callbacks);
    globalWebSocket.addListener(id, callbacks);
  }, []);

  const removeListener = useCallback((id: string) => {
    listenersRef.current.delete(id);
    globalWebSocket.removeListener(id);
  }, []);

  const sendMessage = useCallback((message: unknown) => {
    globalWebSocket.sendMessage(message);
  }, []);

  const forceUpdateContext = useCallback(() => {
    forceUpdate({});
  }, []);

  // La connexion est déjà initialisée au niveau de l'application
  // Pas besoin de la réinitialiser ici

  // Cleanup au démontage
  useEffect(() => {
    return () => {
      // Supprimer tous les listeners de ce provider
      listenersRef.current.forEach((_, id) => {
        globalWebSocket.removeListener(id);
      });
      listenersRef.current.clear();
    };
  }, []);

  const value: WebSocketContextType = {
    socket: globalWebSocket.getSocket(),
    addListener,
    removeListener,
    sendMessage,
    forceUpdate: forceUpdateContext
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
}

export { WebSocketProvider };

export { WebSocketContext }; 
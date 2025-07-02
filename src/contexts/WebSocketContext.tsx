import React, { createContext, useRef, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import { createWebSocket } from '../util/WebSocket';
import type { WebSocketCallbacks } from '../util/WebSocket/types';

interface WebSocketContextType {
  socket: WebSocket | null;
  addListener: (id: string, callbacks: WebSocketCallbacks) => void;
  removeListener: (id: string) => void;
  sendMessage: (message: unknown) => void;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

interface WebSocketProviderProps {
  children: ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
  const socketRef = useRef<WebSocket | null>(null);
  const listenersRef = useRef<Map<string, WebSocketCallbacks>>(new Map());

  const createConnection = useCallback(() => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      return socketRef.current;
    }

    try {
      const socket = createWebSocket({
        onMessage: (data) => {
          // Notifier tous les listeners
          listenersRef.current.forEach((callbacks) => {
            callbacks.onMessage?.(data);
          });
        },
        onError: (error) => {
          console.error("Erreur WebSocket:", error);
          listenersRef.current.forEach((callbacks) => {
            callbacks.onError?.(error);
          });
        },
        onClose: (event) => {
          console.log("WebSocket fermé:", event.code, event.reason);
          // Réinitialiser la référence
          socketRef.current = null;
          listenersRef.current.forEach((callbacks) => {
            callbacks.onClose?.(event);
          });
        },
        onOpen: () => {
          console.log("WebSocket connecté");
          listenersRef.current.forEach((callbacks) => {
            callbacks.onOpen?.();
          });
        }
      });
      
      socketRef.current = socket;
      return socket;
    } catch (error) {
      console.error("Erreur lors de la création du WebSocket:", error);
      return null;
    }
  }, []);

  const addListener = useCallback((id: string, callbacks: WebSocketCallbacks) => {
    listenersRef.current.set(id, callbacks);
    
    // Créer la connexion si elle n'existe pas encore
    if (!socketRef.current) {
      createConnection();
    }
  }, [createConnection]);

  const removeListener = useCallback((id: string) => {
    listenersRef.current.delete(id);
    
    // Ne pas fermer la connexion immédiatement pour éviter les reconnexions fréquentes
    // La connexion sera fermée seulement au démontage du provider
  }, []);

  const sendMessage = useCallback((message: unknown) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(message));
    } else {
      console.warn("WebSocket n'est pas ouvert, tentative de reconnexion...");
      // Tenter de recréer la connexion si elle n'existe pas
      if (!socketRef.current) {
        createConnection();
      }
      // Attendre un peu et réessayer
      setTimeout(() => {
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
          socketRef.current.send(JSON.stringify(message));
        } else {
          console.error("Impossible d'envoyer le message, WebSocket toujours fermé");
        }
      }, 1000);
    }
  }, [createConnection]);

  // Cleanup au démontage
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
      listenersRef.current.clear();
    };
  }, []);

  const value: WebSocketContextType = {
    socket: socketRef.current,
    addListener,
    removeListener,
    sendMessage
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};

export { WebSocketContext }; 
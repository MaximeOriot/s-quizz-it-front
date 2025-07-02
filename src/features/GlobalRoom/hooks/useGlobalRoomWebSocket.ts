import { useCallback, useMemo } from 'react';
import { useWebSocket } from '../../../hooks/useWebSocket';
import type { Room } from './useRoomsData';

interface UseGlobalRoomWebSocketProps {
  onRoomsUpdate: (rooms: Room[]) => void;
  onCreateRoomSuccess?: (roomId: number) => void;
  onModalSuccess?: (roomId: number) => void;
}

export const useGlobalRoomWebSocket = ({ onRoomsUpdate, onCreateRoomSuccess, onModalSuccess }: UseGlobalRoomWebSocketProps) => {
  const handleMessage = useCallback((data: unknown) => {
    if (data && typeof data === 'object' && 'type' in data) {
      const messageData = data as { type: string; [key: string]: unknown };
      
      if (messageData.type === "salons_init" && 'salons' in messageData) {
        onRoomsUpdate(messageData.salons as Room[]);
      }
      
      // Gérer la création de salon réussie
      if (messageData.type === 'salon_created' && 'roomId' in messageData) {
        const roomId = messageData.roomId as number;
        console.log('Salle créée avec succès, roomId:', roomId);
        onCreateRoomSuccess?.(roomId);
        onModalSuccess?.(roomId);
      }
    }
  }, [onRoomsUpdate, onCreateRoomSuccess, onModalSuccess]);

  const handleError = useCallback((error: Event) => {
    console.error("Erreur WebSocket dans GlobalRoom:", error);
  }, []);

  const handleOpen = useCallback(() => {
    console.log("WebSocket connecté pour GlobalRoom");
  }, []);

  const handleClose = useCallback((event: CloseEvent) => {
    console.log("WebSocket fermé pour GlobalRoom:", event.code);
  }, []);

  // Stabiliser les callbacks
  const stableCallbacks = useMemo(() => ({
    onMessage: handleMessage,
    onError: handleError,
    onOpen: handleOpen,
    onClose: handleClose
  }), [handleMessage, handleError, handleOpen, handleClose]);

  const { socket, sendWebSocketMessage } = useWebSocket({
    id: 'global-room',
    callbacks: stableCallbacks
  });

  return { socket, sendWebSocketMessage };
}; 
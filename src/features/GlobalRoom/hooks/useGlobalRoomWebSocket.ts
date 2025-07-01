import { useCallback, useMemo } from 'react';
import { useWebSocket } from '../../../util/hooks/useWebSocket';
import type { Room } from './useRoomsData';

interface UseGlobalRoomWebSocketProps {
  onRoomsUpdate: (rooms: Room[]) => void;
}

export const useGlobalRoomWebSocket = ({ onRoomsUpdate }: UseGlobalRoomWebSocketProps) => {
  const handleMessage = useCallback((data: unknown) => {
    if (data && typeof data === 'object' && 'type' in data && data.type === "salons_init" && 'salons' in data) {
      onRoomsUpdate(data.salons as Room[]);
    }
  }, [onRoomsUpdate]);

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

  const socket = useWebSocket({
    callbacks: stableCallbacks
  });

  return socket;
}; 
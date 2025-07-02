import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useWebSocket } from './useWebSocket';
import {
  setConnected,
  setHasReceivedData,
  setRooms,
  setRoomsLoading,
  setCurrentRoom,
  updateRoomPlayers,
  updatePlayerReady,
  updateRoomInfo,
  setRoomLoading,
  setError,
  resetRoom,
  type Room,
  type WaitingPlayer,
  type Quizz
} from '../store/websocketSlice';
import type { RootState } from '../store/types';

interface UseWebSocketStoreProps {
  roomId?: string | null;
}

export const useWebSocketStore = ({ roomId }: UseWebSocketStoreProps = {}) => {
  const dispatch = useDispatch();
  
  // Sélecteurs Redux
  const {
    isConnected,
    hasReceivedData,
    rooms,
    roomsLoading,
    currentRoom,
    roomLoading,
    error
  } = useSelector((state: RootState) => state.websocket);

  // Gestionnaire de messages centralisé
  const handleMessage = useCallback((data: unknown) => {
    if (data && typeof data === 'object' && 'type' in data) {
      const messageData = data as { type: string; [key: string]: unknown };
      
      switch (messageData.type) {
        case 'salons_init':
          if ('salons' in messageData) {
            console.log('Données des salons reçues:', messageData.salons);
            dispatch(setRooms(messageData.salons as Room[]));
          }
          break;
          
        case 'room_info':
          if ('quizz' in messageData && 'isQuickPlay' in messageData) {
            console.log('Informations de salle reçues:', messageData.quizz);
            dispatch(updateRoomInfo({
              quizz: messageData.quizz as Quizz,
              isQuickPlay: messageData.isQuickPlay as boolean
            }));
            dispatch(setRoomLoading(false));
          }
          break;
          
        case 'room_players':
          if ('players' in messageData) {
            console.log('Joueurs de la salle reçus:', messageData.players);
            dispatch(updateRoomPlayers(messageData.players as WaitingPlayer[]));
          }
          break;
          
        case 'player_ready':
          if ('playerId' in messageData && 'isReady' in messageData) {
            console.log('Statut prêt du joueur:', messageData.playerId, messageData.isReady);
            dispatch(updatePlayerReady({
              playerId: messageData.playerId as string,
              isReady: messageData.isReady as boolean
            }));
          }
          break;
          
        case 'salon_created':
          if ('roomId' in messageData) {
            console.log('Salle créée avec succès:', messageData.roomId);
            // La liste des salles sera mise à jour par le prochain salons_init
          }
          break;
          
        case 'game_start':
          console.log('Le jeu commence !');
          break;
      }
    }
  }, [dispatch]);

  // Gestionnaire d'erreur
  const handleError = useCallback((error: Event) => {
    console.error("Erreur WebSocket:", error);
    dispatch(setError('Erreur de connexion WebSocket'));
  }, [dispatch]);

  // Gestionnaire de connexion
  const handleOpen = useCallback(() => {
    console.log("WebSocket connecté");
    dispatch(setConnected(true));
  }, [dispatch]);

  // Gestionnaire de déconnexion
  const handleClose = useCallback((event: CloseEvent) => {
    console.log("WebSocket fermé:", event.code);
    dispatch(setConnected(false));
  }, [dispatch]);

  // Hook WebSocket
  const { sendWebSocketMessage } = useWebSocket({
    id: roomId ? `room-${roomId}` : 'global',
    callbacks: {
      onMessage: handleMessage,
      onError: handleError,
      onOpen: handleOpen,
      onClose: handleClose
    }
  });

  // Effet pour rejoindre une salle
  useEffect(() => {
    if (roomId && isConnected) {
      console.log(`Rejoindre la salle ${roomId}...`);
      dispatch(setRoomLoading(true));
      dispatch(resetRoom());
      
      // Petit délai pour s'assurer que la connexion est stable
      const timeout = setTimeout(() => {
        sendWebSocketMessage({ type: 'join_room', roomId });
      }, 500);

      return () => clearTimeout(timeout);
    }
  }, [roomId, isConnected, sendWebSocketMessage, dispatch]);

  // Actions
  const createRoom = useCallback((roomData: { label: string; difficulte: number; j_max: number }) => {
    const message = `create:${JSON.stringify(roomData)}`;
    sendWebSocketMessage(message);
  }, [sendWebSocketMessage]);

  const setPlayerReady = useCallback((isReady: boolean) => {
    if (roomId) {
      sendWebSocketMessage({ type: 'player_ready', roomId, isReady });
    }
  }, [roomId, sendWebSocketMessage]);

  const refreshRooms = useCallback(() => {
    dispatch(setRoomsLoading(true));
    sendWebSocketMessage({ type: 'get_salons' });
  }, [sendWebSocketMessage, dispatch]);

  return {
    // État
    isConnected,
    hasReceivedData,
    rooms,
    roomsLoading,
    currentRoom,
    roomLoading,
    error,
    
    // Actions
    sendWebSocketMessage,
    createRoom,
    setPlayerReady,
    refreshRooms
  };
}; 
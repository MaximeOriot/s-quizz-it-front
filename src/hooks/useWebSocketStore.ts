import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useWebSocket } from './useWebSocket';
import {
  setConnected,
  setRooms,
  setRoomsLoading,
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
    console.log('Message WebSocket reçu dans useWebSocketStore:', data);
    
    // Gérer les messages avec format user/message
    if (data && typeof data === 'object' && 'user' in data && 'message' in data) {
      const userMessage = data as { user: string; message: string };
      console.log('Message utilisateur reçu:', userMessage);
      
      try {
        // Essayer de parser le message JSON
        const parsedMessage = JSON.parse(userMessage.message);
        console.log('Message parsé:', parsedMessage);
        
        // Traiter le message parsé
        if (parsedMessage && typeof parsedMessage === 'object' && 'type' in parsedMessage) {
          const messageData = parsedMessage as { type: string; [key: string]: unknown };
          
          switch (messageData.type) {
            case 'join_room':
              console.log('Confirmation de rejoindre la salle');
              // Marquer que nous avons rejoint la salle
              dispatch(setRoomLoading(false));
              break;
              
            case 'get_room_info':
            case 'get_room_players':
              console.log('Confirmation de demande de données:', messageData.type);
              // Ces messages sont juste des confirmations, on attend les vraies données
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
              
            case 'game_start':
              console.log('Le jeu commence !');
              break;
              
                    default:
          console.log('Message parsé non géré:', messageData.type, messageData);
          // Si on reçoit un message avec des données de salle, on les traite
          if (messageData.type === 'room_info' || messageData.type === 'room_players') {
            console.log('Traitement des données de salle reçues:', messageData);
            // Traiter les données même si elles ne sont pas dans le format attendu
            if (messageData.type === 'room_info' && 'quizz' in messageData) {
              dispatch(updateRoomInfo({
                quizz: messageData.quizz as Quizz,
                isQuickPlay: messageData.isQuickPlay as boolean || false
              }));
              dispatch(setRoomLoading(false));
            }
            if (messageData.type === 'room_players' && 'players' in messageData) {
              dispatch(updateRoomPlayers(messageData.players as WaitingPlayer[]));
            }
          }
          }
        }
      } catch (error) {
        console.log('Erreur lors du parsing du message:', error);
      }
      return;
    }
    
    // Gérer les messages avec format type direct
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
          
        case 'join_room_success':
        case 'room_joined':
          console.log('Salle rejoint avec succès');
          dispatch(setRoomLoading(false));
          break;
          
        default:
          console.log('Message non géré:', messageData.type, messageData);
      }
    } else {
      console.log('Message non structuré reçu:', data);
      
      // Essayer de détecter les données de salle dans n'importe quel format
      if (data && typeof data === 'object') {
        const dataObj = data as Record<string, unknown>;
        
        // Détecter les données de quiz
        if ('quizz' in dataObj || 'quiz' in dataObj) {
          console.log('Données de quiz détectées:', dataObj);
          const quizz = dataObj.quizz || dataObj.quiz;
          if (quizz && typeof quizz === 'object') {
            dispatch(updateRoomInfo({
              quizz: quizz as Quizz,
              isQuickPlay: dataObj.isQuickPlay as boolean || false
            }));
            dispatch(setRoomLoading(false));
          }
        }
        
        // Détecter les données de joueurs
        if ('players' in dataObj && Array.isArray(dataObj.players)) {
          console.log('Données de joueurs détectées:', dataObj.players);
          dispatch(updateRoomPlayers(dataObj.players as WaitingPlayer[]));
        }
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

  // Effet pour demander les données de la salle après avoir rejoint
  useEffect(() => {
    if (roomId && isConnected && !roomLoading && !currentRoom) {
      console.log('Demande des données de la salle après avoir rejoint...');
      
      let retryCount = 0;
      const maxRetries = 3;
      
      const requestRoomData = () => {
        console.log(`Tentative ${retryCount + 1}/${maxRetries} de récupération des données de la salle...`);
        sendWebSocketMessage({ type: 'get_room_info', roomId });
        sendWebSocketMessage({ type: 'get_room_players', roomId });
        
        retryCount++;
        
        if (retryCount < maxRetries) {
          // Retry après 2 secondes si pas de données
          setTimeout(() => {
            if (!currentRoom) {
              requestRoomData();
            }
          }, 2000);
        } else {
          console.warn('Impossible de récupérer les données de la salle après', maxRetries, 'tentatives');
          dispatch(setError('Impossible de récupérer les données de la salle'));
        }
      };
      
      // Première tentative après 1 seconde
      const timeout = setTimeout(requestRoomData, 1000);

      return () => clearTimeout(timeout);
    }
  }, [roomId, isConnected, roomLoading, currentRoom, sendWebSocketMessage, dispatch]);

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
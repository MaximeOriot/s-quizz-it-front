import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useWebSocket } from './useWebSocket';
import {
  setConnected,
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
  onRoomCreated?: (roomId: number) => void;
}

export const useWebSocketStore = ({ roomId, onRoomCreated }: UseWebSocketStoreProps = {}) => {
  const dispatch = useDispatch();
  const { isConnected, hasReceivedData, rooms, roomsLoading, currentRoom, roomLoading, error } = useSelector(
    (state: RootState) => state.websocket
  );

  // Gestionnaire principal des messages WebSocket
  const handleMessage = useCallback((data: unknown) => {
    console.log('Message WebSocket reçu:', data);
    
    if (!data || typeof data !== 'object') {
      return;
    }

    const dataObj = data as Record<string, unknown>;
    console.log('Type de data:', typeof data);
    console.log('Est-ce un objet?', typeof data === 'object');
    console.log('Clés de data:', Object.keys(dataObj));

    // Traitement des messages avec format user/message
    if ('user' in dataObj && 'message' in dataObj) {
      const userMessage = dataObj as { user: string; message: string };
      console.log('Message utilisateur reçu:', userMessage);
      
      let parsedMessage: unknown;
      try {
        parsedMessage = JSON.parse(userMessage.message);
        console.log('Message parsé:', parsedMessage);
      } catch {
        parsedMessage = userMessage.message;
        console.log('Message utilisé tel quel:', userMessage.message);
      }

      // Ignorer les messages de commande
      if (typeof parsedMessage === 'string' && ['fetch', 'get_salons', 'get_players'].includes(parsedMessage)) {
        console.log('Message de commande reçu (user/message):', parsedMessage);
        return;
      }

      // Traitement des messages de création de salle
      if (typeof parsedMessage === 'string' && parsedMessage.startsWith('create:')) {
        console.log('Message de création confirmé par le serveur:', parsedMessage);
        try {
          const createData = JSON.parse(parsedMessage.substring(7));
          console.log('Données de création:', createData);
          
          dispatch(setRoomsLoading(true));
          sendWebSocketMessage('fetch');
          
          if (onRoomCreated) {
            onRoomCreated(Date.now());
          }
        } catch (error) {
          console.error('Erreur lors du parsing des données de création:', error);
        }
        return;
      }

             // Traitement des messages de statut prêt
       if (typeof parsedMessage === 'string' && parsedMessage.startsWith('player_ready-')) {
         console.log('Message de statut prêt reçu:', parsedMessage);
         const parts = parsedMessage.split('-');
         if (parts.length === 3) {
           const [, roomIdFromMessage] = parts;
           
           if (roomIdFromMessage === roomId) {
             setTimeout(() => {
               sendWebSocketMessage(`get_players-${roomId}`);
             }, 100);
           }
         }
         return;
       }

      // Traitement des messages de déconnexion/départ
      if (typeof parsedMessage === 'string' && 
          (parsedMessage.includes('quitté le salon') || parsedMessage.includes('a quitté') || parsedMessage.includes('disconnected'))) {
        console.log('Message de déconnexion/départ détecté:', parsedMessage);
        
        setTimeout(() => {
          if (roomId) {
            sendWebSocketMessage(`get_players-${roomId}`);
          }
        }, 100);
        return;
      }

      // Traitement des messages d'erreur
      if (typeof parsedMessage === 'string' && parsedMessage.includes('Salon introuvable')) {
        console.log('Erreur: salon introuvable');
        dispatch(setRoomLoading(false));
        dispatch(setError('Salon introuvable. Veuillez retourner à la liste des salles.'));
        return;
      }

      if (typeof parsedMessage === 'string' && parsedMessage.includes('Vous êtes déjà dans ce salon')) {
        console.log('Erreur: déjà dans la salle');
        dispatch(setRoomLoading(false));
        return;
      }

      // Traitement des messages de connexion réussie
      if (typeof parsedMessage === 'string' && parsedMessage.includes('rejoint le salon')) {
        console.log('Message de connexion réussie:', parsedMessage);
        
        // Traitement des données de joueurs si présentes
        if (dataObj.players) {
          console.log('Données de joueurs reçues lors de la connexion:', dataObj.players);
          
          const playersArray = Object.values(dataObj.players as Record<string, unknown>).map((player: unknown) => {
            const playerData = player as { userId: string; profile: { pseudo: string; avatar?: string }; isReady?: boolean };
            return {
              id: playerData.userId,
              pseudo: playerData.profile.pseudo,
              avatar: playerData.profile.avatar || '/default-avatar.png',
              isReady: playerData.isReady || false
            };
          });
          
          console.log('Joueurs convertis lors de la connexion:', playersArray);
          
          if (!currentRoom) {
            console.log('Initialisation de currentRoom avec les joueurs lors de la connexion');
            dispatch(setCurrentRoom({
              players: playersArray,
              quizz: {} as Quizz,
              isQuickPlay: false,
              roomId: roomId || ''
            }));
          } else {
            console.log('Mise à jour des joueurs dans currentRoom lors de la connexion');
            dispatch(updateRoomPlayers(playersArray));
          }
        }
        
        dispatch(setRoomLoading(false));
        
        setTimeout(() => {
          if (roomId) {
            sendWebSocketMessage(`get_salon_info-${roomId}`);
            sendWebSocketMessage(`get_players-${roomId}`);
          }
        }, 500);
        return;
      }

      // Traitement des données de quiz et joueurs
      if (parsedMessage && typeof parsedMessage === 'object') {
        const parsedObj = parsedMessage as Record<string, unknown>;
        
        if ('quizz' in parsedObj || 'quiz' in parsedObj) {
          console.log('Données de quiz détectées:', parsedObj);
          const quizz = parsedObj.quizz || parsedObj.quiz;
          if (quizz && typeof quizz === 'object') {
            dispatch(updateRoomInfo({
              quizz: quizz as Quizz,
              isQuickPlay: parsedObj.isQuickPlay as boolean || false
            }));
            dispatch(setRoomLoading(false));
          }
        }
        
        if ('players' in parsedObj && Array.isArray(parsedObj.players)) {
          console.log('Données de joueurs détectées:', parsedObj.players);
          dispatch(updateRoomPlayers(parsedObj.players as WaitingPlayer[]));
        }
        
                 if ('salon' in parsedObj && typeof parsedObj.salon === 'object') {
           console.log('Données de salon détectées:', parsedObj.salon);
           
           if ((parsedObj.salon as Record<string, unknown>).j_actuelle !== undefined) {
             console.log('Mise à jour j_actuelle:', (parsedObj.salon as Record<string, unknown>).j_actuelle);
             dispatch(setRoomsLoading(true));
             sendWebSocketMessage('fetch');
           }
         }
      }
      return;
    }

    // Traitement des messages avec format type direct
    if (dataObj.type) {
      const messageData = dataObj as { type: string; [key: string]: unknown };
      
      switch (messageData.type) {
        case 'salons_init':
          if ('salons' in messageData) {
            console.log('Données des salons reçues:', messageData.salons);
            dispatch(setRooms(messageData.salons as Room[]));
          }
          break;
          
        case 'salon_info':
          if ('salon' in messageData) {
            console.log('Informations de salon reçues (format direct):', messageData.salon);
            
            dispatch(setRoomsLoading(true));
            sendWebSocketMessage('fetch');
            
            setTimeout(() => {
              if (roomId) {
                sendWebSocketMessage(`get_players-${roomId}`);
              }
            }, 500);
            
            dispatch(setRoomLoading(false));
          }
          break;
          
        case 'join_room':
          console.log('Confirmation de rejoindre la salle');
          dispatch(setRoomLoading(false));
          break;
          
        case 'get_room_info':
        case 'get_room_players':
          console.log('Confirmation de demande de données:', messageData.type);
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
            
            const playersArray = Object.values(messageData.players as Record<string, unknown>).map((player: unknown) => {
              const playerData = player as { userId: string; profile: { pseudo: string; avatar?: string }; isReady?: boolean };
              return {
                id: playerData.userId,
                pseudo: playerData.profile.pseudo,
                avatar: playerData.profile.avatar || '/default-avatar.png',
                isReady: playerData.isReady || false
              };
            });
            
            console.log('Joueurs convertis (format direct):', playersArray);
            
            if (!currentRoom) {
              console.log('Initialisation de currentRoom avec les joueurs (format direct)');
              dispatch(setCurrentRoom({
                players: playersArray,
                quizz: {} as Quizz,
                isQuickPlay: false,
                roomId: roomId || ''
              }));
            } else {
              dispatch(updateRoomPlayers(playersArray));
            }
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
          
        case 'success':
          console.log('Message de succès reçu:', messageData);
          
          if ('message' in messageData && typeof messageData.message === 'string') {
            const message = messageData.message as string;
            if (message.includes('créé avec succès')) {
              console.log('Confirmation de création de salle détectée');
              
              setTimeout(() => {
                console.log('Rafraîchissement de la liste des salles après création...');
                dispatch(setRoomsLoading(true));
                sendWebSocketMessage('fetch');
              }, 1000);
              
              if (onRoomCreated) {
                console.log('Appel du callback onRoomCreated');
                onRoomCreated(Date.now());
              }
            }
          }
          break;
          
        case 'join_room_success':
        case 'room_joined':
        case 'connected':
        case 'join':
          console.log('Salle rejoint avec succès (type direct):', messageData);
          
          if ('players' in messageData) {
            console.log('Données de joueurs reçues lors de la connexion (type direct):', messageData.players);
            
            const playersArray = Object.values(messageData.players as Record<string, unknown>).map((player: unknown) => {
              const playerData = player as { userId: string; profile: { pseudo: string; avatar?: string }; isReady?: boolean };
              return {
                id: playerData.userId,
                pseudo: playerData.profile.pseudo,
                avatar: playerData.profile.avatar || '/default-avatar.png',
                isReady: playerData.isReady || false
              };
            });
            
            console.log('Joueurs convertis lors de la connexion (type direct):', playersArray);
            
            if (!currentRoom) {
              console.log('Initialisation de currentRoom avec les joueurs lors de la connexion (type direct)');
              dispatch(setCurrentRoom({
                players: playersArray,
                quizz: {} as Quizz,
                isQuickPlay: false,
                roomId: roomId || ''
              }));
            } else {
              console.log('Mise à jour des joueurs dans currentRoom (type direct)');
              dispatch(updateRoomPlayers(playersArray));
            }
          }
          
          dispatch(setRoomLoading(false));
          break;
          
        case 'game_start':
          console.log('Le jeu commence !');
          break;
          
        default:
          console.log('Message non géré:', messageData.type, messageData);
      }
    } else {
      console.log('Message non structuré reçu:', data);
      
      // Traitement des données de quiz et joueurs dans n'importe quel format
      if (data && typeof data === 'object') {
        const dataObj = data as Record<string, unknown>;
        
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
        
        if ('players' in dataObj && Array.isArray(dataObj.players)) {
          console.log('Données de joueurs détectées:', dataObj.players);
          dispatch(updateRoomPlayers(dataObj.players as WaitingPlayer[]));
        }
      }
    }
  }, [dispatch, onRoomCreated, currentRoom, roomId]);

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
  const { sendWebSocketMessage, forceUpdate } = useWebSocket({
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
      
      // Ne pas réinitialiser la room si elle existe déjà avec des joueurs
      if (!currentRoom || !currentRoom.players || currentRoom.players.length === 0) {
        console.log('Réinitialisation de la room car pas de joueurs...');
        dispatch(resetRoom());
      } else {
        console.log('Préservation de la room existante avec joueurs:', currentRoom.players.length);
      }
      
      // Petit délai pour s'assurer que la connexion est stable
      const timeout = setTimeout(() => {
        sendWebSocketMessage(`connect-${roomId}`);
      }, 500);

      return () => clearTimeout(timeout);
    }
  }, [roomId, isConnected, sendWebSocketMessage, dispatch, currentRoom]);

  // Effet pour demander les données de la salle après avoir rejoint
  useEffect(() => {
    if (roomId && isConnected && !roomLoading && !currentRoom) {
      console.log('Demande des données de la salle après avoir rejoint...');
      
      let retryCount = 0;
      const maxRetries = 3;
      
      const requestRoomData = () => {
        console.log(`Tentative ${retryCount + 1}/${maxRetries} de récupération des données de la salle...`);
        sendWebSocketMessage(`get_salon_info-${roomId}`);
        sendWebSocketMessage(`get_players-${roomId}`);
        
        retryCount++;
        
        if (retryCount < maxRetries) {
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
      
      const timeout = setTimeout(requestRoomData, 1000);
      return () => clearTimeout(timeout);
    }
  }, [roomId, isConnected, roomLoading, currentRoom, sendWebSocketMessage, dispatch]);

  // Actions
  const createRoom = useCallback((roomData: { label: string; difficulte: number; j_max: number }) => {
    const message = `create:${JSON.stringify(roomData)}`;
    console.log('Envoi du message de création:', message);
    sendWebSocketMessage(message);
  }, [sendWebSocketMessage]);

  const createQuickRoom = useCallback(() => {
    sendWebSocketMessage('rapide');
  }, [sendWebSocketMessage]);

     const setPlayerReady = useCallback(() => {
     if (roomId) {
       sendWebSocketMessage(`ready-${roomId}`);
     }
   }, [roomId, sendWebSocketMessage]);

  const refreshRooms = useCallback(() => {
    dispatch(setRoomsLoading(true));
    sendWebSocketMessage('fetch');
    forceUpdate();
  }, [sendWebSocketMessage, dispatch, forceUpdate]);

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
    createQuickRoom,
    setPlayerReady,
    refreshRooms
  };
}; 
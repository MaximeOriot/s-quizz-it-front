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
    console.log('Message WebSocket reçu:', data);
    console.log('🔍 Type de data:', typeof data);
    console.log('🔍 Est-ce un objet?', typeof data === 'object');
    console.log('🔍 Clés de data:', data && typeof data === 'object' ? Object.keys(data as object) : 'N/A');

    // Gérer les messages avec format user/message (format du serveur)
    if (data && typeof data === 'object' && 'user' in data && 'message' in data) {
      console.log('✅ Message reconnu comme format user/message');
      const userMessage = data as { user: string; message: string };
      console.log('Message utilisateur reçu:', userMessage);
      
              // Traitement simplifié pour diagnostiquer
        try {
          // Vérifier si c'est un message de broadcast avec type direct
          const messageObj = userMessage as Record<string, unknown>;
          if (messageObj.type === 'room_players_update' && 'players' in messageObj) {
            console.log('Joueurs de la salle reçus (broadcast):', messageObj.players);
            
            // Convertir le format du serveur en format attendu par le frontend
            const playersArray = Object.values(messageObj.players as Record<string, unknown>).map((player: unknown) => {
              const playerData = player as { userId: string; profile: { pseudo: string; avatar?: string }; isReady?: boolean };
              return {
                id: playerData.userId,
                pseudo: playerData.profile.pseudo,
                avatar: playerData.profile.avatar || '/default-avatar.png',
                isReady: playerData.isReady || false
              };
            });
            
            console.log('Joueurs convertis (broadcast):', playersArray);
            dispatch(updateRoomPlayers(playersArray));
            return;
          }
          
          // Traiter les messages salon_info avec format user/message
          if (messageObj.type === 'salon_info' && 'salon' in messageObj) {
            console.log('Informations de salon reçues (user/message):', messageObj.salon);
            const salonData = messageObj.salon as Record<string, unknown>;
            console.log('Données du salon:', salonData);
            
            // Mettre à jour les informations de la salle dans le state global
            // Cela permettra de mettre à jour j_actuelle dans roomInfo
            dispatch(setRoomsLoading(true));
            sendWebSocketMessage('fetch');
            
            // Forcer la demande des joueurs après avoir mis à jour les infos de la salle
            setTimeout(() => {
              if (roomId) {
                console.log('Demande des joueurs après mise à jour salon_info');
                sendWebSocketMessage(`get_players-${roomId}`);
              }
            }, 500);
            
            dispatch(setRoomLoading(false));
            return;
          }
          
          // Traiter les messages room_players avec format user/message
          if (messageObj.type === 'room_players' && 'players' in messageObj) {
            console.log('Joueurs de la salle reçus (user/message):', messageObj.players);
            
            // Convertir le format du serveur en format attendu par le frontend
            const playersArray = Object.values(messageObj.players as Record<string, unknown>).map((player: unknown) => {
              const playerData = player as { userId: string; profile: { pseudo: string; avatar?: string }; isReady?: boolean };
              return {
                id: playerData.userId,
                pseudo: playerData.profile.pseudo,
                avatar: playerData.profile.avatar || '/default-avatar.png',
                isReady: playerData.isReady || false
              };
            });
            
            console.log('Joueurs convertis (user/message):', playersArray);
            
            // Si currentRoom n'existe pas encore, l'initialiser
            if (!currentRoom) {
              console.log('Initialisation de currentRoom avec les joueurs (user/message)');
              dispatch(setCurrentRoom({
                players: playersArray,
                quizz: {} as Quizz,
                isQuickPlay: false,
                roomId: roomId || ''
              }));
            } else {
              dispatch(updateRoomPlayers(playersArray));
            }
            
            return;
          }
          
          // Essayer de parser le message JSON
          let parsedMessage: unknown = null;
          
          if (typeof userMessage.message === 'string') {
            // Essayer de parser directement
            try {
              parsedMessage = JSON.parse(userMessage.message);
              console.log('✅ Message parsé:', parsedMessage);
            } catch {
              // Si ça échoue, utiliser le message tel quel
              parsedMessage = userMessage.message;
              console.log('✅ Message utilisé tel quel:', parsedMessage);
            }
          } else {
            parsedMessage = userMessage.message;
          }
        
        // Traiter le message parsé
        if (parsedMessage && typeof parsedMessage === 'object' && 'type' in parsedMessage) {
          const messageData = parsedMessage as { type: string; [key: string]: unknown };
          
          switch (messageData.type) {
            case 'salons_init':
              if ('salons' in messageData) {
                console.log('Données des salons reçues:', messageData.salons);
                dispatch(setRooms(messageData.salons as Room[]));
              }
              break;
              
            case 'salon_info':
              if ('salon' in messageData) {
                console.log('Informations de salon reçues (parsed):', messageData.salon);
                const salonData = messageData.salon as Record<string, unknown>;
                
                // Mettre à jour les informations de la salle dans le state global
                if (salonData.j_actuelle !== undefined) {
                  console.log('Mise à jour j_actuelle (parsed):', salonData.j_actuelle);
                  // Forcer la mise à jour de la liste des salles pour refléter les changements
                  dispatch(setRoomsLoading(true));
                  sendWebSocketMessage('fetch');
                }
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
            case 'room_players_update':
              if ('players' in messageData) {
                console.log('Joueurs de la salle reçus:', messageData.players);
                
                // Convertir le format du serveur en format attendu par le frontend
                const playersArray = Object.values(messageData.players as Record<string, unknown>).map((player: unknown) => {
                  const playerData = player as { userId: string; profile: { pseudo: string; avatar?: string }; isReady?: boolean };
                  return {
                    id: playerData.userId,
                    pseudo: playerData.profile.pseudo,
                    avatar: playerData.profile.avatar || '/default-avatar.png',
                    isReady: playerData.isReady || false
                  };
                });
                
                console.log('Joueurs convertis:', playersArray);
                console.log('Dispatch updateRoomPlayers avec:', playersArray);
                
                // Si currentRoom n'existe pas encore, l'initialiser
                if (!currentRoom) {
                  console.log('Initialisation de currentRoom avec les joueurs');
                  dispatch(setCurrentRoom({
                    players: playersArray,
                    quizz: {} as Quizz,
                    isQuickPlay: false,
                    roomId: roomId || ''
                  }));
                } else {
                  dispatch(updateRoomPlayers(playersArray));
                }
                
                console.log('Dispatch terminé');
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
            case 'created':
              if ('roomId' in messageData) {
                console.log('Salle créée avec succès:', messageData.roomId);
                if (onRoomCreated && typeof messageData.roomId === 'number') {
                  onRoomCreated(messageData.roomId);
                }
              } else {
                console.log('Salle créée avec succès');
                dispatch(setRoomsLoading(true));
                sendWebSocketMessage('fetch');
              }
              break;
              
            case 'game_start':
              console.log('Le jeu commence !');
              break;
              
            case 'join_room_success':
            case 'room_joined':
            case 'connected':
              console.log('Salle rejoint avec succès');
              dispatch(setRoomLoading(false));
              break;
              
            default:
              console.log('Message parsé non géré:', messageData.type, messageData);
          }
        } else {
          console.log('Message sans type, traitement direct:', parsedMessage);
          
          // Détecter si c'est un message de création renvoyé par le serveur
          if (typeof parsedMessage === 'string' && parsedMessage.startsWith('create:')) {
            console.log('🎉 Message de création confirmé par le serveur:', parsedMessage);
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
          
          // Détecter les messages de statut prêt (format: "player_ready-{roomId}-{isReady}")
          if (typeof parsedMessage === 'string' && parsedMessage.startsWith('player_ready-')) {
            console.log('🎉 Message de statut prêt reçu:', parsedMessage);
            const parts = parsedMessage.split('-');
            if (parts.length === 3) {
              const [, roomIdFromMessage, isReadyStr] = parts;
              const isReady = isReadyStr === 'true';
              console.log('Statut prêt extrait:', { roomIdFromMessage, isReady, currentRoomId: roomId });
              
              if (roomIdFromMessage === roomId) {
                console.log('✅ RoomId correspond, traitement du statut prêt');
                // Demander une mise à jour de la liste des joueurs pour refléter le changement
                setTimeout(() => {
                  console.log('Demande de mise à jour des joueurs après changement de statut prêt');
                  sendWebSocketMessage(`get_players-${roomId}`);
                }, 100);
              }
            }
            return;
          }
          
          // Détecter les messages de déconnexion/départ
          if (typeof parsedMessage === 'string' && (parsedMessage.includes('quitté le salon') || parsedMessage.includes('a quitté') || parsedMessage.includes('disconnected'))) {
            console.log('🚪 Message de déconnexion/départ détecté:', parsedMessage);
            
            // Demander une mise à jour immédiate de la liste des joueurs
            setTimeout(() => {
              if (roomId) {
                console.log('Demande de mise à jour des joueurs après déconnexion...');
                sendWebSocketMessage(`get_players-${roomId}`);
              }
            }, 100);
            return;
          }
          
          // Détecter les messages de succès de connexion (format: "Vous avez rejoint le salon...")
          if (typeof parsedMessage === 'string' && parsedMessage.includes('rejoint le salon')) {
            console.log('🎉 Message de connexion réussie:', parsedMessage);
            dispatch(setRoomLoading(false));
            
            // Demander les données de la salle après avoir rejoint
            setTimeout(() => {
              if (roomId) {
                console.log('Demande des données de la salle après connexion...');
                sendWebSocketMessage(`get_salon_info-${roomId}`);
                sendWebSocketMessage(`get_players-${roomId}`);
              }
            }, 500);
            return;
          }
          
          // Détecter les données de quiz
          if (parsedMessage && typeof parsedMessage === 'object') {
            const dataObj = parsedMessage as Record<string, unknown>;
            
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
            
            // Détecter les données de salon
            if ('salon' in dataObj && typeof dataObj.salon === 'object') {
              console.log('Données de salon détectées:', dataObj.salon);
              const salonData = dataObj.salon as Record<string, unknown>;
              
              // Mettre à jour les informations de la salle dans le state global
              if (salonData.j_actuelle !== undefined) {
                console.log('Mise à jour j_actuelle:', salonData.j_actuelle);
                // Forcer la mise à jour de la liste des salles pour refléter les changements
                dispatch(setRoomsLoading(true));
                sendWebSocketMessage('fetch');
              }
            }
          }
        }
      } catch (error) {
        console.log('Erreur lors du parsing du message:', error);
      }
      return;
    }
    
    // Gérer les messages avec format type direct (fallback)
    if (data && typeof data === 'object' && 'type' in data) {
      const messageData = data as { type: string; [key: string]: unknown };
      
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
            const salonData = messageData.salon as Record<string, unknown>;
            console.log('Données du salon:', salonData);
            
            // Mettre à jour les informations de la salle dans le state global
            // Cela permettra de mettre à jour j_actuelle dans roomInfo
            dispatch(setRoomsLoading(true));
            sendWebSocketMessage('fetch');
            
            // Forcer la demande des joueurs après avoir mis à jour les infos de la salle
            setTimeout(() => {
              if (roomId) {
                console.log('Demande des joueurs après mise à jour salon_info (format direct)');
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
            
            // Convertir le format du serveur en format attendu par le frontend
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
            
            // Si currentRoom n'existe pas encore, l'initialiser
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
          
        case 'salon_created':
        case 'created':
          if ('roomId' in messageData) {
            console.log('Salle créée avec succès:', messageData.roomId);
            if (onRoomCreated && typeof messageData.roomId === 'number') {
              onRoomCreated(messageData.roomId);
            }
          } else {
            console.log('Salle créée avec succès');
            dispatch(setRoomsLoading(true));
            sendWebSocketMessage('get_salons');
          }
          break;
          
        case 'game_start':
          console.log('Le jeu commence !');
          break;
          
        case 'join_room_success':
        case 'room_joined':
        case 'connected':
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
  }, [dispatch, onRoomCreated]);

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
        // Utiliser le format attendu par le backend: connect-{salonId}
        sendWebSocketMessage(`connect-${roomId}`);
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
        // Demander les informations de la salle avec le bon format
        sendWebSocketMessage(`get_salon_info-${roomId}`);
        sendWebSocketMessage(`get_players-${roomId}`);
        
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
    // Utiliser le format attendu par le backend: create:{"label":"Mon Salon","difficulte":2,"j_max":4}
    // Éviter le double JSON.stringify qui cause l'échappement
    const message = `create:${JSON.stringify(roomData)}`;
    console.log('📤 Envoi du message de création:', message);
    sendWebSocketMessage(message);
  }, [sendWebSocketMessage]);

  const createQuickRoom = useCallback(() => {
    // Utiliser le format attendu par le backend pour un salon rapide
    sendWebSocketMessage('rapide');
  }, [sendWebSocketMessage]);

  const setPlayerReady = useCallback((isReady: boolean) => {
    if (roomId) {
      // Utiliser le format attendu par le backend pour le statut prêt
      sendWebSocketMessage(`player_ready-${roomId}-${isReady}`);
    }
  }, [roomId, sendWebSocketMessage]);

  const refreshRooms = useCallback(() => {
    dispatch(setRoomsLoading(true));
    sendWebSocketMessage('get_salons');
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
    createQuickRoom,
    setPlayerReady,
    refreshRooms
  };
}; 
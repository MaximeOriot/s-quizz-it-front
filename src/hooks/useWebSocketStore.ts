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
  setAllPlayersReady,
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
  const { isConnected, hasReceivedData, rooms, roomsLoading, currentRoom, roomLoading, allPlayersReady, error } = useSelector(
    (state: RootState) => state.websocket
  );

  // Gestionnaire principal des messages WebSocket
  const handleMessage = useCallback((data: unknown) => {
    if (!data || typeof data !== 'object') {
      return;
    }

    const dataObj = data as Record<string, unknown>;

    // Stocker le userId seulement du message de bienvenue initial
    if ('user' in dataObj && typeof dataObj.user === 'string' && dataObj.user !== 'server' && !dataObj.user.startsWith('salon-')) {
      const userId = dataObj.user;
      if ('message' in dataObj && typeof dataObj.message === 'string') {
        const message = dataObj.message;
        const isCommand = message === 'fetch' || 
                         message.startsWith('get_salon_info-') || 
                         message.startsWith('get_players-') || 
                         message.startsWith('ready-');
        
        if (!isCommand) {
          localStorage.setItem('userId', userId);
        }
      }
    }
    
    // Extraire le userId du message de bienvenue du serveur
    if ('user' in dataObj && dataObj.user === 'server' && 'message' in dataObj && typeof dataObj.message === 'string') {
      const message = dataObj.message;
      if (message.includes('userId:')) {
        const userIdMatch = message.match(/userId:\s*([a-f0-9-]+)/);
        if (userIdMatch) {
          localStorage.setItem('userId', userIdMatch[1]);
        }
      }
    }

    // Traitement des messages avec format user/message
    if ('user' in dataObj && 'message' in dataObj) {
      const userMessage = dataObj as { user: string; message: string };
      
      let parsedMessage: unknown;
      try {
        parsedMessage = JSON.parse(userMessage.message);
      } catch {
        parsedMessage = userMessage.message;
      }

      // Ignorer les messages de commande
      if (typeof parsedMessage === 'string' && ['fetch', 'get_salons', 'get_players'].includes(parsedMessage)) {
        return;
      }

      // Traitement des messages de création de salle
      if (typeof parsedMessage === 'string' && parsedMessage.startsWith('create:')) {
        try {
          JSON.parse(parsedMessage.substring(7));
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
        setTimeout(() => {
          if (roomId) {
            sendWebSocketMessage(`get_players-${roomId}`);
          }
        }, 100);
        return;
      }
          
      // Traitement des messages d'erreur
      if (typeof parsedMessage === 'string' && parsedMessage.includes('Salon introuvable')) {
        dispatch(setRoomLoading(false));
        dispatch(setError('Salon introuvable. Veuillez retourner à la liste des salles.'));
        return;
      }

      if (typeof parsedMessage === 'string' && parsedMessage.includes('Vous êtes déjà dans ce salon')) {
        dispatch(setRoomLoading(false));
        return;
      }
          
      // Traitement des messages de connexion réussie
      if (typeof parsedMessage === 'string' && parsedMessage.includes('rejoint le salon')) {
        // Traitement des données de joueurs si présentes
        if (dataObj.players) {
          const playersArray = Object.values(dataObj.players as Record<string, unknown>).map((player: unknown) => {
            const playerData = player as { userId: string; profile: { pseudo: string; avatar?: string | { idAvatar: number; urlavatar: string } }; isReady?: boolean };
            
            // Traiter l'avatar pour s'assurer qu'il est toujours une URL
            let avatarUrl = '/default-avatar.png';
            if (playerData.profile.avatar) {
              if (typeof playerData.profile.avatar === 'string') {
                avatarUrl = playerData.profile.avatar;
              } else if (typeof playerData.profile.avatar === 'object' && 'urlavatar' in playerData.profile.avatar) {
                avatarUrl = playerData.profile.avatar.urlavatar;
              }
            }
            
            return {
              id: playerData.userId,
              pseudo: playerData.profile.pseudo,
              avatar: avatarUrl,
              isReady: playerData.isReady || false
            };
          });
          
          if (!currentRoom) {
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
        
        dispatch(setRoomLoading(false));
        
        setTimeout(() => {
          if (roomId) {
            sendWebSocketMessage(`get_salon_info-${roomId}`);
            sendWebSocketMessage(`get_players-${roomId}`);
          }
        }, 500);
        return;
      }
          
      // Traitement des messages avec type dans le format user/message
      if (dataObj.type) {
        const messageData = dataObj as { type: string; [key: string]: unknown };
        console.log('🔍 Message avec type détecté (format user/message):', messageData.type);
        
        switch (messageData.type) {
          case 'all_players_ready':
            console.log('🎮 Tous les joueurs sont prêts ! Le jeu peut commencer.');
            dispatch(setAllPlayersReady(true));
            
            // Mettre à jour le statut de tous les joueurs comme prêts
            if ('readyPlayers' in messageData && Array.isArray(messageData.readyPlayers)) {
              console.log('🎮 Joueurs prêts reçus:', messageData.readyPlayers);
              
              // Si on a la liste des joueurs prêts, on peut les marquer individuellement
              // Pour l'instant, on marque tous les joueurs de la salle comme prêts
              if (currentRoom && currentRoom.players) {
                const updatedPlayers = currentRoom.players.map(player => ({
                  ...player,
                  isReady: true
                }));
                dispatch(updateRoomPlayers(updatedPlayers));
                console.log('🎮 Tous les joueurs marqués comme prêts');
              }
            }
            break;
            
          case 'ready_status_update':
            console.log('Mise à jour du statut prêt reçue:', messageData);
            if ('playerId' in messageData && 'isReady' in messageData) {
              console.log('Mise à jour du statut prêt pour le joueur:', messageData.playerId, messageData.isReady);
              dispatch(updatePlayerReady({
                playerId: messageData.playerId as string,
                isReady: messageData.isReady as boolean
              }));
            }
            break;
        }
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
            dispatch(setRooms(messageData.salons as Room[]));
          }
          break;
          
        case 'salon_info':
          if ('salon' in messageData) {
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
          dispatch(setRoomLoading(false));
          break;
          
        case 'get_room_info':
        case 'get_room_players':
          break;
          
        case 'room_info':
          if ('quizz' in messageData && 'isQuickPlay' in messageData) {
            dispatch(updateRoomInfo({
              quizz: messageData.quizz as Quizz,
              isQuickPlay: messageData.isQuickPlay as boolean
            }));
            dispatch(setRoomLoading(false));
          }
          break;
          
        case 'room_players':
          if ('players' in messageData) {
            const playersArray = Object.values(messageData.players as Record<string, unknown>).map((player: unknown) => {
              const playerData = player as { 
                id: string; 
                pseudo: string; 
                avatar: string | { idAvatar: number; urlavatar: string }; 
                isReady?: boolean 
              };
              
              // Gérer les deux formats d'avatar possibles
              let avatarUrl = '/default-avatar.png';
              if (playerData.avatar) {
                if (typeof playerData.avatar === 'string') {
                  avatarUrl = playerData.avatar;
                } else if (typeof playerData.avatar === 'object' && 'urlavatar' in playerData.avatar) {
                  avatarUrl = playerData.avatar.urlavatar;
                }
              }
              
              return {
                id: playerData.id,
                pseudo: playerData.pseudo,
                avatar: avatarUrl,
                isReady: playerData.isReady || false
              };
            });
            
            // Fusionner avec les données existantes pour préserver le contexte
            if (currentRoom) {
              const existingPlayers = currentRoom.players || [];
              const mergedPlayers = playersArray.map(newPlayer => {
                const existingPlayer = existingPlayers.find(p => p.id === newPlayer.id);
                
                // S'assurer que l'avatar est bien une URL
                let avatarUrl = newPlayer.avatar;
                if (typeof avatarUrl === 'object' && avatarUrl && 'urlavatar' in (avatarUrl as { urlavatar: string })) {
                  avatarUrl = (avatarUrl as { urlavatar: string }).urlavatar;
                }
                
                return {
                  ...existingPlayer, // Préserver les données existantes
                  ...newPlayer, // Mettre à jour avec les nouvelles données
                  avatar: avatarUrl, // Forcer l'avatar en URL
                  isReady: newPlayer.isReady !== undefined ? newPlayer.isReady : (existingPlayer?.isReady || false)
                };
              });
              
              dispatch(updateRoomPlayers(mergedPlayers));
            } else {
              dispatch(setCurrentRoom({
                players: playersArray,
                quizz: {} as Quizz,
                isQuickPlay: false,
                roomId: roomId || ''
              }));
            }
          }
          break;
          
        case 'player_ready':
          if ('playerId' in messageData && 'isReady' in messageData) {
            dispatch(updatePlayerReady({
              playerId: messageData.playerId as string,
              isReady: messageData.isReady as boolean
            }));
          }
          break;
          
        case 'ready_status_update':
          if ('playerId' in messageData && 'isReady' in messageData) {
            dispatch(updatePlayerReady({
              playerId: messageData.playerId as string,
              isReady: messageData.isReady as boolean
            }));
          }
          break;
          
        case 'all_players_ready':
          dispatch(setAllPlayersReady(true));
          break;
          
        case 'est prêt':
        case 'est pas prêt':
          break;
          
        case 'success':
          if ('message' in messageData && typeof messageData.message === 'string') {
            const message = messageData.message as string;
            if (message.includes('créé avec succès')) {
              setTimeout(() => {
                dispatch(setRoomsLoading(true));
                sendWebSocketMessage('fetch');
              }, 1000);
              
              if (onRoomCreated) {
                onRoomCreated(Date.now());
              }
            }
          }
          break;
          
        case 'game_started':
        case 'start_game':
          console.log('🎮 Jeu démarré, redirection vers la page de jeu...');
          // Rediriger vers la page de jeu
          if (roomId) {
            window.location.href = `/game?roomId=${roomId}`;
          }
          break;
          
        case 'error':
          if ('message' in messageData) {
            console.error('❌ Erreur du serveur:', messageData.message);
            
            // Gérer spécifiquement l'erreur "Salon introuvable"
            if (messageData.message === 'Salon introuvable') {
              console.log('🚪 Salon introuvable, nettoyage de la salle...');
              dispatch(resetRoom());
              dispatch(setError('La salle n\'existe plus ou a été fermée'));
              return;
            }
            
            // Pour les autres erreurs, ne pas rediriger automatiquement
            dispatch(setError(messageData.message as string));
          }
          break;
          
        case 'join_room_success':
        case 'room_joined':
        case 'connected':
        case 'join':
          console.log('🎮 Salle rejoint avec succès (type direct):', messageData);
          
          if ('players' in messageData) {
            console.log('Données de joueurs reçues lors de la connexion (type direct):', messageData.players);
            
            const playersArray = Object.values(messageData.players as Record<string, unknown>).map((player: unknown) => {
              const playerData = player as { 
                id: string; 
                pseudo: string; 
                avatar: string | { idAvatar: number; urlavatar: string }; 
                isReady?: boolean 
              };
              
              // Gérer les deux formats d'avatar possibles
              let avatarUrl = '/default-avatar.png';
              if (playerData.avatar) {
                if (typeof playerData.avatar === 'string') {
                  avatarUrl = playerData.avatar;
                } else if (typeof playerData.avatar === 'object' && 'urlavatar' in playerData.avatar) {
                  avatarUrl = playerData.avatar.urlavatar;
                }
              }
              
              return {
                id: playerData.id,
                pseudo: playerData.pseudo,
                avatar: avatarUrl,
                isReady: playerData.isReady || false
              };
            });
            
            console.log('Joueurs convertis lors de la connexion (type direct):', playersArray);
            
            // Fusionner avec les données existantes pour préserver le contexte
            if (currentRoom) {
              console.log('Fusion des joueurs lors de la connexion avec les données existantes');
              const existingPlayers = currentRoom.players || [];
              const mergedPlayers = playersArray.map(newPlayer => {
                const existingPlayer = existingPlayers.find(p => p.id === newPlayer.id);
                return {
                  ...existingPlayer, // Préserver les données existantes
                  ...newPlayer, // Mettre à jour avec les nouvelles données
                  isReady: newPlayer.isReady !== undefined ? newPlayer.isReady : (existingPlayer?.isReady || false)
                };
              });
              
              dispatch(updateRoomPlayers(mergedPlayers));
            } else {
              console.log('Initialisation de currentRoom avec les joueurs lors de la connexion (type direct)');
              dispatch(setCurrentRoom({
                players: playersArray,
                quizz: {} as Quizz,
                isQuickPlay: false,
                roomId: roomId || ''
              }));
            }
          }
          
          dispatch(setRoomLoading(false));
          break;
          
        case 'leave':
        case 'room_left':
          console.log('🚪 Déconnexion de la salle:', messageData);
          // Ne pas se reconnecter automatiquement si on quitte volontairement
          if (roomId) {
            console.log('🚪 Nettoyage de la salle après déconnexion...');
            dispatch(resetRoom());
          }
          break;
          
        case 'game_start':
        case 'broadcast_game_start':
          console.log('🎮 Le jeu commence ! Redirection vers la page de jeu...');
          if (roomId) {
            // Rediriger vers la page de jeu avec l'ID de la salle
            window.location.href = `/game?roomId=${roomId}`;
          }
          break;
          
        case 'room_status_changed': {
          console.log('🎮 Statut de la salle changé:', messageData.payload);
          const payload = messageData.payload as Record<string, unknown>;
          if (roomId && payload?.status === 'started') {
            console.log('🎮 La salle a commencé ! Redirection automatique...');
            window.location.href = `/game?roomId=${roomId}`;
          }
          break;
        }
          
        default:
          console.log('Message non géré:', messageData.type, messageData);
      }
    } else {
      console.log('🔍 Message non structuré reçu:', data);
      
      // Traitement des données de quiz et joueurs dans n'importe quel format
      if (data && typeof data === 'object') {
        const dataObj = data as Record<string, unknown>;
        
        // Traitement spécial pour les données de joueurs reçues directement comme tableau
        if (Array.isArray(data)) {
          console.log('🎮 Données reçues comme tableau direct:', data);
          
          // Vérifier si c'est un tableau de joueurs
          if (data.length > 0 && typeof data[0] === 'object' && 'id' in data[0] && 'pseudo' in data[0]) {
            console.log('🎮 Tableau de joueurs détecté:', data);
            
            // Traiter les joueurs pour convertir les avatars
            const processedPlayers = data.map((player: Record<string, unknown>) => {
              let avatarUrl = '/default-avatar.png';
              if (player.avatar) {
                if (typeof player.avatar === 'string') {
                  avatarUrl = player.avatar;
                } else if (typeof player.avatar === 'object' && player.avatar && 'urlavatar' in (player.avatar as Record<string, unknown>)) {
                  avatarUrl = (player.avatar as { urlavatar: string }).urlavatar;
                }
              }
              
              return {
                id: player.id as string,
                pseudo: player.pseudo as string,
                avatar: avatarUrl,
                isReady: (player.isReady as boolean) || false
              };
            });
            
            console.log('🎮 Joueurs traités:', processedPlayers);
            
            // Initialiser ou mettre à jour currentRoom
            if (currentRoom) {
              console.log('🎮 Mise à jour des joueurs dans currentRoom existant');
              dispatch(updateRoomPlayers(processedPlayers));
            } else {
              console.log('🎮 Initialisation de currentRoom avec les joueurs');
              dispatch(setCurrentRoom({
                players: processedPlayers,
                quizz: {} as Quizz,
                isQuickPlay: false,
                roomId: roomId || ''
              }));
            }
            
            // Arrêter le chargement
            dispatch(setRoomLoading(false));
            return;
          }
        }
        
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
          
          // Traiter les joueurs pour convertir les avatars
          const processedPlayers = (dataObj.players as Array<{
            id: string;
            pseudo: string;
            avatar: string | { idAvatar: number; urlavatar: string };
            isReady?: boolean;
          }>).map(player => {
            let avatarUrl = '/default-avatar.png';
            if (player.avatar) {
              if (typeof player.avatar === 'string') {
                avatarUrl = player.avatar;
              } else if (typeof player.avatar === 'object' && 'urlavatar' in player.avatar) {
                avatarUrl = player.avatar.urlavatar;
              }
            }
            
            return {
              id: player.id,
              pseudo: player.pseudo,
              avatar: avatarUrl,
              isReady: player.isReady || false
            };
          });
          
          // Fusionner avec les données existantes pour préserver le contexte
          if (currentRoom) {
            console.log('Fusion des joueurs (format non structuré) avec les données existantes');
            const existingPlayers = currentRoom.players || [];
            
            const mergedPlayers = processedPlayers.map(newPlayer => {
              const existingPlayer = existingPlayers.find(p => p.id === newPlayer.id);
              return {
                ...existingPlayer, // Préserver les données existantes
                ...newPlayer, // Mettre à jour avec les nouvelles données
                isReady: newPlayer.isReady !== undefined ? newPlayer.isReady : (existingPlayer?.isReady || false)
              };
            });
            
            dispatch(updateRoomPlayers(mergedPlayers));
          } else {
            dispatch(updateRoomPlayers(processedPlayers));
          }
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
    dispatch(setConnected(true));
  }, [dispatch]);

  // Gestionnaire de déconnexion
  const handleClose = useCallback(() => {
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
      console.log(`🚪 Rejoindre la salle ${roomId}...`);
      console.log(`🚪 État de connexion:`, isConnected);
      console.log(`🚪 CurrentRoom actuel:`, currentRoom);
      
      // Vérifier si on est déjà dans cette salle
      if (currentRoom && currentRoom.roomId === roomId && currentRoom.players && currentRoom.players.length > 0) {
        console.log('🚪 Déjà dans cette salle, pas de reconnexion nécessaire');
        return;
      }
      
      dispatch(setRoomLoading(true));
      
      // Ne pas réinitialiser la room si elle existe déjà avec des joueurs
      if (!currentRoom || !currentRoom.players || currentRoom.players.length === 0) {
        console.log('🚪 Réinitialisation de la room car pas de joueurs...');
        dispatch(resetRoom());
      } else {
        console.log('🚪 Préservation de la room existante avec joueurs:', currentRoom.players.length);
      }
      
      // Petit délai pour s'assurer que la connexion est stable
      const timeout = setTimeout(() => {
        console.log(`🚪 Envoi de connect-${roomId}...`);
        sendWebSocketMessage(`connect-${roomId}`);
      }, 500);

      return () => clearTimeout(timeout);
    }
  }, [roomId, isConnected, sendWebSocketMessage, dispatch]);

  // Effet pour demander les salles globales quand connecté et pas dans une salle
  useEffect(() => {
    if (isConnected && !roomId && !hasReceivedData) {
      console.log('🚀 Demande des salles globales...');
      console.log('🚀 État de connexion:', isConnected);
      console.log('🚀 RoomId:', roomId);
      console.log('🚀 HasReceivedData:', hasReceivedData);
      dispatch(setRoomsLoading(true));
      console.log('🚀 Envoi du message "fetch"...');
      sendWebSocketMessage('fetch');
    }
  }, [isConnected, roomId, hasReceivedData, sendWebSocketMessage, dispatch]);

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
    sendWebSocketMessage('normal');
  }, [sendWebSocketMessage]);

  const setPlayerReady = useCallback(() => {
    if (roomId) {
      console.log('🎮 Envoi du statut ready au backend...');
      
      // Utiliser le format simple que le backend comprend
      sendWebSocketMessage(`ready-${roomId}`);
      
      // Demander les données mises à jour des joueurs après un délai
      setTimeout(() => {
        console.log('🔄 Demande des données mises à jour des joueurs...');
        sendWebSocketMessage(`get_players-${roomId}`);
      }, 1000); // Délai plus long pour laisser le temps au backend de traiter
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
    allPlayersReady,
    error,
    
    // Actions
    sendWebSocketMessage,
    createRoom,
    createQuickRoom,
    setPlayerReady,
    refreshRooms
  };
}; 
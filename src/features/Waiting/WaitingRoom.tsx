import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "../../components/ui/Header";
import Button from "../../components/ui/Button";
import LoadingAnimation from "../../components/ui/LoadingAnimation";
import { useWebSocketStore } from "../../hooks/useWebSocketStore";

interface Player {
  id: string;
  pseudo: string;
  avatar: string;
  isReady: boolean;
}

function WaitingRoom() {
  const [searchParams] = useSearchParams();
  const roomId = searchParams.get('roomId');

  const { 
    isConnected, 
    hasReceivedData, 
    rooms, 
    currentRoom, 
    roomLoading, 
    allPlayersReady,
    setPlayerReady,
    refreshRooms,
    sendWebSocketMessage
  } = useWebSocketStore({ roomId });

  // Trouver la salle actuelle dans la liste des salles
  const roomInfo = rooms.find(room => room.id.toString() === roomId);

  useEffect(() => {
    if (roomInfo) {
      console.log('Données de la salle mises à jour:', roomInfo);
    }
  }, [roomInfo]);

  // Timeout de sécurité pour éviter de rester bloqué en chargement
  useEffect(() => {
    if (roomLoading) {
      const timeout = setTimeout(() => {
        console.warn('⚠️ Timeout de sécurité: Chargement de la salle depuis plus de 30 secondes');
        console.warn('⚠️ État actuel:', { isConnected, hasReceivedData, roomLoading, currentRoom });
      }, 30000); // 30 secondes

      return () => clearTimeout(timeout);
    }
  }, [roomLoading, isConnected, hasReceivedData, currentRoom]);

  // Effet pour demander périodiquement les données mises à jour
  useEffect(() => {
    if (roomId && isConnected && currentRoom) {
      const interval = setInterval(() => {
        console.log('🔄 Demande périodique des données mises à jour...');
        sendWebSocketMessage(`get_players-${roomId}`);
      }, 5000); // Toutes les 5 secondes

      return () => clearInterval(interval);
    }
  }, [roomId, isConnected, currentRoom, sendWebSocketMessage]);

  // Récupérer l'id du joueur courant depuis localStorage (défini à la connexion WebSocket)
  const userId = localStorage.getItem('userId');
  const userProfile = localStorage.getItem('userProfile');
  
  // Utiliser l'ID du profil plutôt que l'ID utilisateur pour la correspondance
  let currentPlayerId = userId;
  if (userProfile) {
    try {
      const profile = JSON.parse(userProfile);
      currentPlayerId = profile.idUser || userId; // Utiliser l'ID du profil
    } catch (error) {
      console.error('Erreur parsing profile:', error);
    }
  }
  
  // Trouver le joueur actuel dans la liste des joueurs
  const currentPlayer = currentRoom?.players.find(player => player.id === currentPlayerId);
  
  // État local pour le statut "prêt" (optimiste)
  const [localIsReady, setLocalIsReady] = useState(false);
  
  // Synchroniser l'état local avec les données du serveur
  useEffect(() => {
    if (currentPlayer) {
      setLocalIsReady(currentPlayer.isReady);
    }
  }, [currentPlayer]);
  
  // Déterminer si le joueur est prêt (local ou serveur)
  const isReady = currentPlayer ? currentPlayer.isReady : localIsReady;
  const actualTotalPlayers = currentRoom?.players.length || 0;
  const maxPlayers = roomInfo?.j_max || 10;
  const missingPlayers = Math.max(0, maxPlayers - actualTotalPlayers);

  const getLoadingMessage = () => {
    if (!isConnected) {
      return "Connexion au serveur...";
    }
    if (!hasReceivedData) {
      return "Rejoindre la salle...";
    }
    return "Récupération des informations de la salle";
  };

  const getReady = () => {
    // Basculement du statut local (prêt ↔ pas prêt)
    setLocalIsReady(!localIsReady);
    // Envoyer la commande au serveur
    setPlayerReady();
  };

  // Debug: afficher les données des joueurs
  console.log('Current room players:', currentRoom?.players);
  console.log('Current player:', currentPlayer);
  console.log('Is ready:', isReady);
  console.log('userId:', userId);
  console.log('currentPlayerId:', currentPlayerId);
  console.log('Player IDs in room:', currentRoom?.players?.map(p => p.id));
  console.log('Looking for userId:', currentPlayerId);
  console.log('User profile:', userProfile);

  // Fonction de test pour simuler la réponse du backend
  const testBackendResponse = () => {
    console.log('🧪 Test: Simulation de la réponse du backend');
    
    // Afficher les données utilisateur stockées
    const userId = localStorage.getItem('userId');
    const userProfile = localStorage.getItem('userProfile');
    const token = localStorage.getItem('token');
    
    console.log('🧪 Données utilisateur stockées:');
    console.log('  - userId:', userId);
    console.log('  - userProfile:', userProfile);
    console.log('  - token:', token ? 'Présent' : 'Absent');
    
    if (userProfile) {
      try {
        const profile = JSON.parse(userProfile);
        console.log('  - profile parsé:', profile);
      } catch (error) {
        console.error('  - Erreur parsing profile:', error);
      }
    }
    
    // Simuler l'envoi du statut ready avec le format simple
    if (roomId) {
      console.log('🧪 Envoi du message ready-{roomId}...');
      sendWebSocketMessage(`ready-${roomId}`);
    }
  };

  // Fonction pour forcer la mise à jour des données de la salle
  const forceUpdateRoomData = () => {
    console.log('🔄 Force mise à jour des données de la salle...');
    if (roomId) {
      sendWebSocketMessage(`get_salon_info-${roomId}`);
      sendWebSocketMessage(`get_players-${roomId}`);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      {roomLoading ? (
        <div className="flex flex-col flex-1 gap-4 justify-center items-center">
          <LoadingAnimation
            message="Connexion à la salle"
            subMessage={getLoadingMessage()}
            variant="dots"
            size="lg"
          />
          <div className="text-center">
            <p className="mb-2 text-sm text-secondary">
              Si le chargement persiste, vérifiez la connexion WebSocket
            </p>
            <Button
              variant="secondary"
              onClick={() => {
                console.log('🔧 Forçage de la sortie du chargement...');
                console.log('🔧 État actuel:', { isConnected, hasReceivedData, roomLoading, currentRoom });
                // Forcer la sortie du chargement en cas de problème
                window.location.reload();
              }}
            >
              Recharger la page
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-row flex-1 gap-10 mt-6">
          <div className="w-1/2">
            {/* Carte d'informations de la salle */}
            <div className="p-4 mb-6 rounded-xl backdrop-blur-sm border-secondary-foreground bg-secondary-foreground">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="flex gap-2 items-center mb-1 text-lg font-bold text-primary">
                    Salle {roomId} 
                    <span className="px-2 py-1 text-xs text-white bg-green-500 rounded-full">
                      {roomInfo?.type}
                    </span>
                  </h3>
                  <div className="items-center mb-1">
                    {roomInfo?.label && (
                      <span className="text-sm text-primary">
                        {roomInfo.label}
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-sm font-semibold text-green-500">
                  En attente
                </span>
              </div>

              <div className="flex justify-between items-center mb-4">
                <div className="text-sm text-primary">
                  <span className="font-semibold">{actualTotalPlayers}</span>
                  <span className="mx-1">/</span>
                  <span>{maxPlayers} joueurs</span>
                </div>
              </div>

              <div className="mb-4 w-full h-2 bg-gray-200 rounded-full">
                <div
                  className="h-2 bg-blue-500 rounded-full"
                  style={{ width: `${(actualTotalPlayers / maxPlayers) * 100}%` }}
                />
              </div>
            </div>

                          <h2 className="mb-4 text-xl font-semibold">En attente de joueurs :</h2>
              {currentRoom?.players && currentRoom.players.length > 0 ? (
                <ul>
                  {currentRoom.players.map((player: Player, index: number) => {
                  // Pour le joueur courant, utiliser l'état local optimiste
                  const playerIsReady = player.id === currentPlayerId 
                    ? (localIsReady || player.isReady)
                    : player.isReady;

                  return (
                    <li key={index} className="flex items-center mb-2">
                      <img
                        src={player.avatar}
                        alt={`Avatar de ${player.pseudo}`}
                        className="object-cover mr-3 w-8 h-8 rounded-full border-2 border-thirdary"
                      />
                      <span className={`text-secondary ${player.id === currentPlayerId ? 'font-bold' : ''}`}>
                        {player.id === currentPlayerId ? `${player.pseudo} (Vous)` : player.pseudo}
                      </span>
                      <input
                        type="checkbox"
                        checked={playerIsReady}
                        readOnly
                        className="ml-2 w-4 h-4 accent-thirdary"
                      />
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-sm italic text-secondary">
                Aucun joueur dans la salle pour le moment...
              </p>
            )}

            {allPlayersReady ? (
              <div className="p-4 mt-6 bg-green-100 rounded-lg border border-green-400">
                <p className="font-semibold text-center text-green-800">
                  🎉 Tous les joueurs sont prêts ! Le jeu peut commencer.
                </p>
              </div>
            ) : (
              <p className="mt-6 text-sm text-secondary">
                {missingPlayers} joueurs manquants ou pas prêt avant le lancement
              </p>
            )}

            <div className="mt-4 space-y-2">
              <Button
                variant={isReady ? "secondary" : "primary"}
                textSize="lg"
                width="6xl"
                onClick={getReady}
              >
                {isReady ? "Prêt ✅" : "Prêt"}
              </Button>
              <Button
                variant="secondary"
                textSize="sm"
                width="6xl"
                onClick={() => {
                  console.log('Actualisation de la liste des salles...');
                  refreshRooms();
                }}
              >
                Actualiser la liste des salles
              </Button>
              
              {/* Boutons de test pour le développement */}
              <Button
                variant="secondary"
                textSize="sm"
                width="6xl"
                onClick={testBackendResponse}
                className="text-white bg-yellow-500 hover:bg-yellow-600"
              >
                🧪 Test Backend Response
              </Button>
              
              <Button
                variant="secondary"
                textSize="sm"
                width="6xl"
                onClick={forceUpdateRoomData}
                className="text-white bg-blue-500 hover:bg-blue-600"
              >
                🔄 Force Update Room Data
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default WaitingRoom;
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "../../components/ui/Header";
import Button from "../../components/ui/Button";
import LoadingAnimation from "../../components/ui/LoadingAnimation";
import { useWebSocketStore } from "../../hooks/useWebSocketStore";

interface Player {
  pseudo: string;
  avatar: string;
  isReady: boolean;
}

interface Theme {
  label: string;
}

function WaitingRoom() {
  const [searchParams] = useSearchParams();
  const roomId = searchParams.get('roomId');
  const [isReady, setIsReady] = useState(false);

  const { 
    isConnected, 
    hasReceivedData, 
    rooms, 
    currentRoom, 
    roomLoading, 
    setPlayerReady,
    refreshRooms
  } = useWebSocketStore({ roomId });

  // Trouver la salle actuelle dans la liste des salles
  const roomInfo = rooms.find(room => room.id.toString() === roomId);
  
  // Effet pour surveiller les changements dans les données de la salle
  useEffect(() => {
    if (roomInfo) {
      console.log('Données de la salle mises à jour:', roomInfo);
    }
  }, [roomInfo]);

  const getReady = () => {
    setIsReady(!isReady);
    setPlayerReady(!isReady);
  };

  // Utiliser les données de roomInfo pour les joueurs de base
  const totalPlayers = roomInfo?.j_actuelle || 1; // Au moins 1 joueur (vous)
  
  // Créer une liste de joueurs par défaut basée sur roomInfo
  const defaultPlayers: Player[] = [];
  
  // Si on est dans une salle, on ajoute au moins le joueur actuel
  if (roomInfo) {
    // Ajouter le joueur actuel
    defaultPlayers.push({
      pseudo: 'Vous',
      avatar: '/default-avatar.png',
      isReady: isReady
    });
    
    // Ajouter d'autres joueurs si il y en a dans la salle
    if (roomInfo.j_actuelle > 1) {
      for (let i = 1; i < roomInfo.j_actuelle; i++) {
        defaultPlayers.push({
          pseudo: `Joueur ${i + 1}`,
          avatar: '/default-avatar.png',
          isReady: false
        });
      }
    }
  }
  
  // Utiliser les joueurs de currentRoom s'ils existent, sinon les joueurs par défaut
  const players = currentRoom?.players || defaultPlayers;
  
  // Debug: afficher les données des joueurs
  console.log('Current room players:', currentRoom?.players);
  console.log('Current room full:', currentRoom);
  console.log('Room info:', roomInfo);
  console.log('Room info j_actuelle:', roomInfo?.j_actuelle);
  console.log('Room info j_max:', roomInfo?.j_max);
  console.log('Default players:', defaultPlayers);
  console.log('Final players:', players);
  console.log('Total players:', totalPlayers);
  const maxPlayers = roomInfo?.j_max || 10;
  const missingPlayers = Math.max(0, maxPlayers - totalPlayers);

  // Déterminer le message de chargement en fonction de l'état de connexion
  const getLoadingMessage = () => {
    if (!isConnected) {
      return "Connexion au serveur...";
    }
    if (!hasReceivedData) {
      return "Rejoindre la salle...";
    }
    return "Récupération des informations de la salle";
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      {roomLoading ? (
        <div className="flex flex-1 justify-center items-center">
          <LoadingAnimation
            message="Connexion à la salle"
            subMessage={getLoadingMessage()}
            variant="dots"
            size="lg"
          />
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
                  <span className="font-semibold">{totalPlayers}</span>
                  <span className="mx-1">/</span>
                  <span>{maxPlayers} joueurs</span>
                </div>
              </div>

              <div className="mb-4 w-full h-2 bg-gray-200 rounded-full">
                <div
                  className="h-2 bg-blue-500 rounded-full"
                  style={{ width: `${(totalPlayers / maxPlayers) * 100}%` }}
                />
              </div>
            </div>

            <h2 className="mb-4 text-xl font-semibold">En attente de joueurs :</h2>
            {players && players.length > 0 ? (
              <ul>
                {players.map((player: Player, index: number) => (
                  <li key={index} className="flex items-center mb-2">
                    <img
                      src={player.avatar}
                      alt={`Avatar de ${player.pseudo}`}
                      className="object-cover mr-3 w-8 h-8 rounded-full border-2 border-thirdary"
                    />
                    <span className="text-secondary">{player.pseudo}</span>
                    <input
                      type="checkbox"
                      checked={player.isReady}
                      readOnly
                      className="ml-2 w-4 h-4 accent-thirdary"
                    />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm italic text-secondary">
                Aucun joueur dans la salle pour le moment...
              </p>
            )}

            <p className="mt-6 text-sm text-secondary">
              {missingPlayers} joueurs manquants ou pas prêt avant le lancement
            </p>

            <div className="mt-4 space-y-2">
              <Button
                variant="primary"
                textSize="lg"
                width="6xl"
                onClick={getReady}
              >
                {isReady ? "Prêt ✅" : "Prêt"}
              </Button>
              
              {/* Bouton de debug pour forcer la demande des données */}
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
            </div>
          </div>

          {currentRoom?.quizz && (
            <div className="flex justify-center items-center w-1/2">
              <div className="px-10 py-8 w-full max-w-xl text-center rounded-2xl bg-secondary">
                <h2 className="mb-2 text-2xl font-bold text-primary">{currentRoom.quizz.label}</h2>
                <p className="mb-6 text-primary">{currentRoom.quizz.description}</p>
                <div className="flex gap-4 justify-center">
                  {currentRoom.quizz?.themes && currentRoom.quizz.themes.map((theme: Theme, idx: number) => (
                    <span
                      key={idx}
                      className="px-4 py-1 text-sm font-semibold bg-sky-400 rounded-full"
                    >
                      {theme.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default WaitingRoom;

import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "../../components/ui/Header";
import Button from "../../components/ui/Button";
import { createWebSocket, sendWebSocketMessage } from "../../util/WebSocket";
import type { WaitingPlayer } from "./models/waitingPlayer";
import type { Quizz } from "../../models/quizz";

interface RoomData {
  players: WaitingPlayer[];
  quizz: Quizz;
  isQuickPlay: boolean;
  roomId: string;
}

function WaitingRoom() {
  const [searchParams] = useSearchParams();
  const roomId = searchParams.get('roomId');
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [roomData, setRoomData] = useState<RoomData>({
    players: [],
    quizz: {
      id: 1,
      label: 'Chargement...',
      description: 'Chargement du quiz...',
    },
    isQuickPlay: true,
    roomId: roomId || ''
  });

  const getReady = () => {
    setIsReady(!isReady);
    // TODO: Envoyer l'état "prêt" via WebSocket
  };

  useEffect(() => {
    if (!roomId) {
      console.error("Aucun roomId fourni");
      return;
    }

    let socket: WebSocket;
    let timeoutId: NodeJS.Timeout;
    
    try {
      socket = createWebSocket({
        onMessage: (data) => {
          console.log("Message reçu:", data);
          if (data && typeof data === 'object') {
            // Gestion des différents types de messages
            if ('type' in data) {
              switch (data.type) {
                case 'room_info':
                  // Informations de base de la salle
                  if ('quizz' in data && 'isQuickPlay' in data) {
                    setRoomData(prev => ({
                      ...prev,
                      quizz: data.quizz as Quizz,
                      isQuickPlay: data.isQuickPlay as boolean
                    }));
                    setIsLoading(false);
                    clearTimeout(timeoutId);
                  }
                  break;
                case 'room_players':
                  // Liste des joueurs dans la salle
                  if ('players' in data) {
                    setRoomData(prev => ({
                      ...prev,
                      players: data.players as WaitingPlayer[]
                    }));
                  }
                  break;
                case 'salons_init':
                  // Le serveur renvoie la liste des salons, essayons de récupérer les infos de notre salle
                  if ('salons' in data && Array.isArray(data.salons)) {
                    const currentRoom = data.salons.find((salon: { id: number; label: string; type: string; difficulte: number }) => salon.id.toString() === roomId);
                    if (currentRoom) {
                      console.log("Salle trouvée:", currentRoom);
                      // Créer des données de quiz basées sur la salle
                      setRoomData(prev => ({
                        ...prev,
                        quizz: {
                          id: currentRoom.id,
                          label: currentRoom.label,
                          description: `Salle ${currentRoom.type} - Difficulté: ${currentRoom.difficulte}`,
                          themes: []
                        },
                        isQuickPlay: currentRoom.type === 'rapide'
                      }));
                      setIsLoading(false);
                      clearTimeout(timeoutId);
                    }
                  }
                  break;
                case 'player_ready':
                  // Mise à jour du statut d'un joueur
                  if ('playerId' in data && 'isReady' in data) {
                    setRoomData(prev => ({
                      ...prev,
                      players: prev.players.map(player => 
                        player.id === data.playerId 
                          ? { ...player, isReady: data.isReady as boolean }
                          : player
                      )
                    }));
                  }
                  break;
                case 'game_start':
                  // Redirection vers le jeu
                  console.log("Le jeu commence !");
                  break;
              }
            } else if ('user' in data && 'message' in data) {
              // Message de bienvenue ou autre message du serveur
              const message = data.message as string;
              console.log("Message du serveur:", message);
              if (message.includes('joined!')) {
                // Un joueur a rejoint, on pourrait mettre à jour la liste des joueurs
                console.log("Un joueur a rejoint la salle");
              }
            }
          }
        },
        onError: (error) => {
          console.error("Erreur WebSocket dans WaitingRoom:", error);
          setIsLoading(false);
        },
        onOpen: () => {
          console.log("WebSocket ouvert, envoi du message join_room");
          sendWebSocketMessage(socket, {
            type: 'join_room',
            roomId: roomId
          });
          
          // Timeout de 10 secondes pour désactiver le chargement
          timeoutId = setTimeout(() => {
            console.log("Timeout: Aucune réponse du serveur");
            setIsLoading(false);
          }, 10000);
        }
      });

    } catch (error) {
      console.error("Erreur lors de la création du WebSocket:", error);
      setIsLoading(false);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    };
  }, [roomId]);

  const totalPlayers = roomData.players.length;
  const missingPlayers = Math.max(0, 10 - totalPlayers);

    return (
    <div className="flex flex-col min-h-screen">
        <Header playerName= {localStorage.getItem('username')} />

      {isLoading ? (
        <div className="flex flex-1 justify-center items-center">
          <div className="text-center">
            <div className="mb-4 text-xl font-semibold text-primary">Connexion à la salle...</div>
            <div className="text-secondary">Récupération des informations de la salle</div>
          </div>
        </div>
      ) : (
        <div className="flex flex-row flex-1 gap-10 mt-6">
        <div className="w-1/2">
          <h2 className="mb-4 text-xl font-semibold">En attente de joueurs :</h2>
          <ul>
              {roomData.players.map((player, index) => (
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

          <p className="mt-6 text-sm text-secondary">
            {missingPlayers} joueurs manquants ou pas prêt avant le lancement
          </p>

          {!roomData.isQuickPlay && (
            <div className="mt-4">
              <Button
                variant={isReady ? "primary" : "disabled"}
                textSize="lg"
                width="6xl"
                onClick={getReady}
              >
                {isReady ? "Prêt ✅" : "Prêt"}
              </Button>
            </div>
          )}
        </div>

        {roomData.quizz && (
          <div className="flex justify-center items-center w-1/2">
          <div className="px-10 py-8 w-full max-w-xl text-center rounded-2xl bg-secondary">
            <h2 className="mb-2 text-2xl font-bold text-primary">{roomData.quizz.label}</h2>
            <p className="mb-6 text-primary">{roomData.quizz.description}</p>
            <div className="flex gap-4 justify-center">

              {roomData.quizz?.themes && roomData.quizz.themes.map((theme, idx) => (
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

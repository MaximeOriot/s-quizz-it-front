import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "../../components/ui/Header";
import Button from "../../components/ui/Button";
import LoadingAnimation from "../../components/ui/LoadingAnimation";
import { useWebSocketStore } from "../../hooks/useWebSocketStore";

function WaitingRoom() {
  const [searchParams] = useSearchParams();
  const roomId = searchParams.get('roomId');
  const [isReady, setIsReady] = useState(false);

  const { 
    isConnected, 
    hasReceivedData, 
    currentRoom, 
    roomLoading, 
    setPlayerReady 
  } = useWebSocketStore({ roomId });

  const getReady = () => {
    setIsReady(!isReady);
    setPlayerReady(!isReady);
  };

  const totalPlayers = currentRoom?.players.length || 0;
  const missingPlayers = Math.max(0, 10 - totalPlayers);

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
            <h2 className="mb-4 text-xl font-semibold">En attente de joueurs :</h2>
            <ul>
              {currentRoom?.players.map((player, index) => (
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

            <div className="mt-4">
              <Button
                variant="primary"
                textSize="lg"
                width="6xl"
                onClick={getReady}
              >
                {isReady ? "Prêt ✅" : "Prêt"}
              </Button>
            </div>
          </div>

          {currentRoom?.quizz && (
            <div className="flex justify-center items-center w-1/2">
              <div className="px-10 py-8 w-full max-w-xl text-center rounded-2xl bg-secondary">
                <h2 className="mb-2 text-2xl font-bold text-primary">{currentRoom.quizz.label}</h2>
                <p className="mb-6 text-primary">{currentRoom.quizz.description}</p>
                <div className="flex gap-4 justify-center">
                  {currentRoom.quizz?.themes && currentRoom.quizz.themes.map((theme, idx) => (
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

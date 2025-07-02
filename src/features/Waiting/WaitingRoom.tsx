import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "../../components/ui/Header";
import Button from "../../components/ui/Button";
import LoadingAnimation from "../../components/ui/LoadingAnimation";
import { useWebSocketConnection, useRoomData, useMessageHandlers } from "./hooks";

function WaitingRoom() {
  const [searchParams] = useSearchParams();
  const roomId = searchParams.get('roomId');
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const {
    roomData,
    updateRoomInfo,
    updatePlayers,
    updatePlayerReady,
    updateFromSalon
  } = useRoomData(roomId);

  const {
    handleMessage,
    handleError,
    handleTimeout
  } = useMessageHandlers({
    roomId,
    onRoomInfo: updateRoomInfo,
    onPlayersUpdate: updatePlayers,
    onPlayerReady: updatePlayerReady,
    onSalonInit: updateFromSalon,
    onGameStart: () => console.log("Le jeu commence !"),
    onLoadingComplete: () => setIsLoading(false)
  });

  // Stabiliser les callbacks pour éviter les reconnexions
  const stableCallbacks = useMemo(() => ({
    onMessage: handleMessage,
    onError: handleError
  }), [handleMessage, handleError]);

  useWebSocketConnection({
    roomId,
    callbacks: stableCallbacks,
    onTimeout: handleTimeout
  });

  const getReady = () => {
    setIsReady(!isReady);
    // TODO: Utiliser sendPlayerReady quand le socket sera disponible
  };

  const totalPlayers = roomData.players.length;
  const missingPlayers = Math.max(0, 10 - totalPlayers);

  return (
    <div className="flex flex-col min-h-screen">
      <Header playerName={localStorage.getItem('username')} />

      {isLoading ? (
        <div className="flex items-center justify-center flex-1">
          <LoadingAnimation
            message="Connexion à la salle"
            subMessage="Récupération des informations de la salle"
            variant="dots"
            size="lg"
          />
        </div>
      ) : (
        <div className="flex flex-row flex-1 gap-10 mt-6">
          <div className="w-1/2">
            <h2 className="mb-4 text-xl font-semibold">En attente de joueurs :</h2>
            <ul>
              {roomData.players.map((player, index) => (
                <li key={index} className="flex items-center mb-2">
                  <img
                    src={player.avatar.urlavatar}
                    alt={`Avatar de ${player.pseudo}`}
                    className="object-cover w-8 h-8 mr-3 border-2 rounded-full border-thirdary"
                  />
                  <span className="text-secondary">{player.pseudo}</span>
                  <input
                    type="checkbox"
                    checked={player.isReady}
                    readOnly
                    className="w-4 h-4 ml-2 accent-thirdary"
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

          {roomData.quizz && (
            <div className="flex items-center justify-center w-1/2">
              <div className="w-full max-w-xl px-10 py-8 text-center rounded-2xl bg-secondary">
                <h2 className="mb-2 text-2xl font-bold text-primary">{roomData.quizz.label}</h2>
                <p className="mb-6 text-primary">{roomData.quizz.description}</p>
                <div className="flex justify-center gap-4">
                  {roomData.quizz?.themes && roomData.quizz.themes.map((theme, idx) => (
                    <span
                      key={idx}
                      className="px-4 py-1 text-sm font-semibold rounded-full bg-sky-400"
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

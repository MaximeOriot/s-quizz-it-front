import { useState } from "react";
import Header from "../../components/ui/Header";
import Button from "../../components/ui/Button";
import type { WaitingPlayer } from "./models/waitingPlayer";
import type { Quizz } from "../../models/quizz";

interface WaitingRoomProps {
  isQuickPlay: boolean;
  players: WaitingPlayer[];
  quizz?: Quizz;
}

function WaitingRoom({ isQuickPlay, players, quizz }: WaitingRoomProps) {
  const [isReady, setIsReady] = useState(false);

  const getReady = () => {
    setIsReady(!isReady)
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header playerName="Nom" />

      <div className="flex flex-row flex-1 gap-10 mt-6">
        <div className="w-1/2">
          <h2 className="mb-4 text-xl font-semibold">En attente de joueurs :</h2>
          <ul>
              {players.map((player, index) => (
                <li key={index} className="flex items-center mb-2">
                  <img
                    src={player.avatar}
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

          <p className="mt-6 text-sm text-secondary">10 joueurs manquants ou pas prêt avant le lancement</p>

          {!isQuickPlay && (
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

        {quizz  && (
          <div className="flex items-center justify-center w-1/2">
          <div className="w-full max-w-xl px-10 py-8 text-center bg-secondary rounded-2xl">
            <h2 className="mb-2 text-2xl font-bold text-primary">{quizz.label}</h2>
            <p className="mb-6 text-primary">{quizz.description}</p>
            <div className="flex justify-center gap-4">
              {quizz.themes.map((theme, idx) => (
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
    </div>
  );
}

export default WaitingRoom;

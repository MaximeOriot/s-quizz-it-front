import React from "react";
import ScoreGraph from "../../components/ui/ScoreGraph";
import Header from "../../components/ui/Header";
import LoadingAnimation from "../../components/ui/LoadingAnimation";
import { useScoreData } from "./hooks";

const ScorePage: React.FC = () => {
  const { scores, isLoading, error } = useScoreData({ profileId: '1' });

  if (isLoading) {
    return (
      <div>
        <Header />
        <div className="flex flex-1 justify-center items-center min-h-[400px]">
          <LoadingAnimation
            message="Chargement des scores"
            subMessage="Récupération de l'historique"
            variant="pulse"
            size="lg"
          />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Header />
        <div className="flex flex-1 justify-center items-center min-h-[400px]">
          <div className="text-center">
            <p className="mb-4 text-red-500">Erreur lors du chargement des scores</p>
            <p className="text-sm text-gray-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header />
      <div className="my-4 text-lg font-bold lg:text-2xl">Score de la semaine</div>
      <ScoreGraph scores={scores} />
    </div>
  );
};

export default ScorePage;
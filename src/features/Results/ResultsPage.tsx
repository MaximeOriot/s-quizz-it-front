import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Button from '../../components/ui/Button';

interface ResultsState {
  score: number;
  totalQuestions: number;
  playersScores?: { [key: string]: number };
  isMultiplayer?: boolean;
}

const ResultsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as ResultsState;

  // Valeurs par défaut si pas de state
  const score = state?.score || 0;
  const totalQuestions = state?.totalQuestions || 0;
  const playersScores = state?.playersScores || {};
  const isMultiplayer = state?.isMultiplayer || false;

  const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

  // Trier les joueurs par score (du plus haut au plus bas)
  const sortedPlayers = Object.entries(playersScores)
    .sort(([, a], [, b]) => b - a)
    .map(([name, score], index) => ({ name, score, rank: index + 1 }));

  const getScoreColor = (score: number, total: number) => {
    const percentage = (score / total) * 100;
    if (percentage >= 80) return 'text-green-500';
    if (percentage >= 60) return 'text-yellow-500';
    if (percentage >= 40) return 'text-orange-500';
    return 'text-red-500';
  };

  const getScoreMessage = (score: number, total: number) => {
    const percentage = (score / total) * 100;
    if (percentage >= 90) return 'Excellent ! 🏆';
    if (percentage >= 80) return 'Très bien ! 🎉';
    if (percentage >= 70) return 'Bien joué ! 👍';
    if (percentage >= 60) return 'Pas mal ! 😊';
    if (percentage >= 50) return 'Correct ! 🙂';
    if (percentage >= 40) return 'Peut mieux faire ! 🤔';
    return 'Continuez à vous entraîner ! 💪';
  };

  return (
    <div className="min-h-screen">
      <Header />
      
      <div className="container px-4 py-8 mx-auto">
        <div className="mx-auto max-w-2xl">
          {/* Titre */}
          <div className="mb-8 text-center">
            <h1 className="mb-4 text-3xl font-bold text-primary">
              {isMultiplayer ? '🎮 Résultats de la partie' : '🏆 Résultats'}
            </h1>
            <p className="text-secondary">
              {isMultiplayer 
                ? 'Voici les scores de tous les joueurs !' 
                : 'Voici votre performance !'
              }
            </p>
          </div>

          {/* Score principal */}
          <div className="p-6 mb-8 text-center rounded-xl bg-secondary">
            <div className="mb-4">
              <h2 className="mb-2 text-2xl font-bold text-primary">Votre score</h2>
              <div className={`text-4xl font-bold ${getScoreColor(score, totalQuestions)}`}>
                {score} / {totalQuestions}
              </div>
              <div className="mt-2 text-lg text-secondary">
                {percentage}% de réussite
              </div>
            </div>
            
            <div className="mb-4">
              <p className="text-lg font-semibold text-primary">
                {getScoreMessage(score, totalQuestions)}
              </p>
            </div>

            {/* Barre de progression */}
            <div className="w-full h-3 bg-gray-200 rounded-full">
              <div 
                className={`h-3 rounded-full transition-all duration-1000 ${
                  percentage >= 80 ? 'bg-green-500' : 
                  percentage >= 60 ? 'bg-yellow-500' : 
                  percentage >= 40 ? 'bg-orange-500' : 'bg-red-500'
                }`}
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
          </div>

          {/* Classement des joueurs (multijoueur uniquement) */}
          {isMultiplayer && sortedPlayers.length > 0 && (
            <div className="p-6 mb-8 rounded-xl bg-secondary">
              <h3 className="mb-4 text-xl font-bold text-center text-primary">
                🏅 Classement des joueurs
              </h3>
              
              <div className="space-y-3">
                {sortedPlayers.map((player, index) => (
                  <div 
                    key={player.name}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      index === 0 ? 'bg-yellow-100 border-2 border-yellow-400' :
                      index === 1 ? 'bg-gray-100 border-2 border-gray-400' :
                      index === 2 ? 'bg-orange-100 border-2 border-orange-400' :
                      'bg-secondary-foreground'
                    }`}
                  >
                    <div className="flex items-center">
                      <span className="mr-3 text-lg font-bold">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${player.rank}.`}
                      </span>
                      <span className="font-semibold text-primary">
                        {player.name}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className={`font-bold ${getScoreColor(player.score, totalQuestions)}`}>
                        {player.score} / {totalQuestions}
                      </div>
                      <div className="text-sm text-secondary">
                        {Math.round((player.score / totalQuestions) * 100)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button
              onClick={() => navigate('/play')}
              variant="primary"
              className="flex-1 sm:flex-none"
            >
              🎮 Nouvelle partie
            </Button>
            
            {isMultiplayer && (
              <Button
                onClick={() => navigate('/globalRoom')}
                variant="secondary"
                className="flex-1 sm:flex-none"
              >
                🌍 Rejoindre une salle
              </Button>
            )}
            
            <Button
              onClick={() => navigate('/')}
              variant="secondary"
              className="flex-1 sm:flex-none"
            >
              🏠 Accueil
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsPage; 
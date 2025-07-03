import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import Header from '../../components/ui/Header';

interface ResultsState {
  score: number;
  totalQuestions: number;
  correctAnswers?: number; // Nombre de questions correctes
  playersScores?: { [key: string]: number };
  isMultiplayer?: boolean;
}

export default function ResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as ResultsState;

  // Rediriger si pas de données de résultats
  useEffect(() => {
    if (!state || typeof state.score !== 'number' || typeof state.totalQuestions !== 'number') {
      navigate('/play');
    }
  }, [state, navigate]);

  if (!state) {
    return null;
  }

  const { score, totalQuestions, correctAnswers, playersScores, isMultiplayer } = state;
  
  // Maintenant on utilise directement correctAnswers qui devrait être fourni
  const actualCorrectAnswers = correctAnswers ?? 0;
  const percentage = Math.round((actualCorrectAnswers / totalQuestions) * 100);

  const getScoreColor = () => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreMessage = () => {
    if (percentage >= 90) return 'Excellent ! 🎉';
    if (percentage >= 80) return 'Très bien ! 👏';
    if (percentage >= 60) return 'Bien joué ! 👍';
    if (percentage >= 40) return 'Pas mal ! 🙂';
    return 'Il faut encore s\'entraîner ! 💪';
  };

  const handlePlayAgain = () => {
    navigate('/play');
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header playerName={localStorage.getItem('username') || 'Joueur'} />
      
      <div className="container px-4 py-8 mx-auto max-w-2xl">
        <div className="text-center">
          {/* Titre principal */}
          <h1 className="text-4xl font-bold text-primary mb-8">
            {isMultiplayer ? 'Résultats de la partie' : 'Quiz terminé !'}
          </h1>

          {/* Score principal */}
          <div className="bg-secondary rounded-xl p-8 mb-8 shadow-lg">
            <div className="mb-6">
              {/* Score total */}
              <div className="text-5xl font-bold text-blue-600 mb-2">
                {score} points
              </div>
              
              {/* Questions correctes */}
              <div className={`text-3xl font-bold mb-4 ${getScoreColor()}`}>
                {actualCorrectAnswers}/{totalQuestions} correctes
              </div>
              
              <div className="text-xl text-primary mb-2">
                {percentage}% de réussite
              </div>
              <div className="text-lg text-secondary-foreground">
                {getScoreMessage()}
              </div>
            </div>

            {/* Barre de progression visuelle */}
            <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
              <div 
                className={`h-4 rounded-full transition-all duration-1000 ${
                  percentage >= 80 ? 'bg-green-500' : 
                  percentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
          </div>

          {/* Scores multijoueur */}
          {isMultiplayer && playersScores && Object.keys(playersScores).length > 0 && (
            <div className="bg-secondary rounded-xl p-6 mb-8 shadow-lg">
              <h2 className="text-2xl font-bold text-primary mb-4">Classement final</h2>
              <div className="space-y-3">
                {Object.entries(playersScores)
                  .sort(([,a], [,b]) => b - a)
                  .map(([playerName, playerScore], index) => (
                    <div 
                      key={playerName} 
                      className={`flex justify-between items-center p-3 rounded-lg ${
                        index === 0 ? 'bg-yellow-100 border-2 border-yellow-400' : 'bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`}
                        </span>
                        <span className="font-medium text-primary">{playerName}</span>
                      </div>
                      <span className="font-bold text-lg text-primary">{playerScore} pts</span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Statistiques détaillées */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-blue-100 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600">{score}</div>
              <div className="text-sm text-blue-800">Score total</div>
            </div>
            <div className="bg-green-100 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600">{actualCorrectAnswers}</div>
              <div className="text-sm text-green-800">Bonnes réponses</div>
            </div>
            <div className="bg-red-100 rounded-lg p-4">
              <div className="text-2xl font-bold text-red-600">{totalQuestions - actualCorrectAnswers}</div>
              <div className="text-sm text-red-800">Mauvaises réponses</div>
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handlePlayAgain}
              className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
            >
              🎮 Rejouer
            </button>
            <button
              onClick={handleBackToHome}
              className="px-8 py-3 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
            >
              🏠 Accueil
            </button>
          </div>

          {/* Message d'encouragement */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <p className="text-blue-800">
              {percentage >= 80 
                ? "Vous maîtrisez bien le sujet ! Continuez comme ça !" 
                : percentage >= 60 
                ? "Bon travail ! Quelques révisions et ce sera parfait !"
                : "N'abandonnez pas ! Chaque tentative vous fait progresser !"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

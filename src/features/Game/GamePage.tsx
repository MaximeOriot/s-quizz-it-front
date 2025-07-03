import { useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "../../components/ui/Header";
import type { AppDispatch } from '../../store';
import type { RootState as GameRootState } from './types/game.types';
import { useGameLogic } from './hooks/useGameLogic.hook';
import { getAnswerButtonClass } from './utils/gameStyles.utils';
import { fetchQuestionsThunk } from './gameThunks';
import { startGame } from './gameSlice';

export default function GamePage() {
  const dispatch = useDispatch<AppDispatch>();
  const [searchParams] = useSearchParams();
  const roomId = searchParams.get('roomId');
  
  // Sélecteurs Redux
  const { user } = useSelector((state: GameRootState) => state.auth);
  const { questions, playerName, isGameStarted, gameId, gameType } = useSelector((state: GameRootState) => state.game);

  const { gameState, handleAnswerClick, startTimer } = useGameLogic({
    questions,
    gameType,
    gameId,
    user,
    playerName
  });

  // Détecter le mode multijoueur et récupérer les questions si nécessaire
  useEffect(() => {
    const isMultiplayerMode = roomId !== null;
    
    if (isMultiplayerMode && (!questions || questions.length === 0)) {
      console.log('🎮 Mode multijoueur détecté, récupération des questions...');
      
      // Récupérer les questions pour le mode multijoueur
      dispatch(fetchQuestionsThunk())
        .unwrap()
        .then(() => {
          console.log('✅ Questions récupérées pour le mode multijoueur');
          // Démarrer le jeu une fois les questions récupérées
          dispatch(startGame());
        })
        .catch((error) => {
          console.error('❌ Erreur lors de la récupération des questions:', error);
        });
    } else if (!isMultiplayerMode && !isGameStarted && (!questions || questions.length === 0)) {
      console.log('🎮 Mode solo détecté, récupération des questions...');
      
      // Récupérer les questions pour le mode solo
      dispatch(fetchQuestionsThunk())
        .unwrap()
        .then(() => {
          console.log('✅ Questions récupérées pour le mode solo');
          dispatch(startGame());
        })
        .catch((error) => {
          console.error('❌ Erreur lors de la récupération des questions:', error);
        });
    }
  }, [roomId, questions, isGameStarted, dispatch]);

  // Démarrer le timer au montage du composant
  useEffect(() => {
    if (isGameStarted && questions && questions.length > 0) {
      startTimer();
    }
  }, [isGameStarted, startTimer, gameState.currentQuestionIndex, questions]);

  // Affichage de chargement
  if (!questions || questions.length === 0 || !isGameStarted) {
    const gameMode = roomId ? 'multijoueur' : 'solo';
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="mx-auto mb-4 w-8 h-8 rounded-full border-b-2 border-blue-500 animate-spin"></div>
          <p className="mb-2">Chargement des questions...</p>
          <p className="text-sm text-secondary">Mode {gameMode}</p>
          {roomId && (
            <p className="mt-1 text-xs text-secondary">Salle {roomId}</p>
          )}
        </div>
      </div>
    );
  }

  const currentQuestion = questions[gameState.currentQuestionIndex];

  return (
    <div className="min-h-screen">
      <Header />
      
      <div className="container px-4 py-8 mx-auto">
        {/* En-tête de la question */}
        <div className="p-6 mb-6 rounded-lg shadow-md bg-secondary">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-primary">
              Question {gameState.currentQuestionIndex + 1} / {questions.length}
            </h2>
            <div className="flex gap-4 items-center">
              <span className="text-sm text-primary">Score: {gameState.score}</span>
              {gameType === 'MULTIPLAYER' && (
                <span className="text-sm text-primary">
                  Joueurs: {gameState.totalPlayers}
                </span>
              )}
              <span className={`text-lg font-bold ${gameState.timeLeft <= 5 ? 'text-red-500' : 'text-blue-400'}`}>
                {gameState.timeLeft}s
              </span>
            </div>
          </div>
          
          {/* Barre de progression */}
          <div className="w-full h-2 rounded-full bg-primary">
            <div 
              className="h-2 bg-blue-400 rounded-full transition-all duration-1000"
              style={{ width: `${(gameState.timeLeft / 20) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Indicateur d'attente multijoueur */}
        {gameState.waitingForPlayers && gameType === 'MULTIPLAYER' && (
          <div className="p-4 mb-6 text-center bg-yellow-100 rounded-lg border border-yellow-400">
            <p className="text-yellow-800">
              En attente des autres joueurs... ({gameState.playersAnswered.length}/{gameState.totalPlayers})
            </p>
            <div className="flex justify-center mt-2">
              <div className="w-6 h-6 rounded-full border-b-2 border-yellow-800 animate-spin"></div>
            </div>
          </div>
        )}

        {/* Indicateur de vérification en cours */}
        {gameState.answerStatus === 'pending' && (
          <div className="p-4 mb-6 text-center bg-gray-100 rounded-lg border border-gray-300">
            <p className="text-gray-700">
              Vérification de votre réponse...
            </p>
            <div className="flex justify-center mt-2">
              <div className="w-4 h-4 rounded-full border-b-2 border-gray-600 animate-spin"></div>
            </div>
          </div>
        )}

        {/* Question */}
        <div className="p-6 mb-6 rounded-lg shadow-md bg-secondary-foreground">
          <h3 className="mb-6 text-lg font-medium text-primary">{currentQuestion.label}</h3>
          
          {/* Réponses */}
          <div className="grid gap-3">
            {currentQuestion.reponses.map((reponse, index) => (
              <button
                key={reponse.id}
                onClick={() => handleAnswerClick(index)}
                disabled={gameState.selectedAnswer !== null || gameState.isAnswering || gameState.waitingForPlayers}
                className={getAnswerButtonClass(
                  index,
                  gameState.selectedAnswer,
                  gameState.answerStatus,
                  gameState.correctAnswerIndex,
                  gameState.isAnswering,
                  gameState.waitingForPlayers
                )}
              >
                <span className="font-medium">{String.fromCharCode(65 + index)}.</span>
                <span className="ml-2">{reponse.label}</span>
                {gameState.selectedAnswer === index && gameState.answerStatus === 'pending' && (
                  <span className="ml-2">
                    <div className="inline-block w-4 h-4 rounded-full border-b-2 border-gray-600 animate-spin"></div>
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Scores des autres joueurs (multijoueur uniquement) */}
        {gameType === 'MULTIPLAYER' && Object.keys(gameState.playersScores).length > 0 && (
          <div className="p-4 bg-gray-100 rounded-lg">
            <h4 className="mb-2 font-bold">Scores actuels :</h4>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(gameState.playersScores).map(([playerName, score]) => (
                <div key={playerName} className="flex justify-between">
                  <span>{playerName}</span>
                  <span className="font-bold">{score}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
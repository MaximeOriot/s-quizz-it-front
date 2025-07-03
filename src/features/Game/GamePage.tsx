import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState, useCallback, useRef } from "react";
import Header from "../../components/ui/Header";
import { useGameWebSocket } from "./hooks";
import { setQuestions } from "./gameSlice";

// Types pour le state Redux
interface RootState {
  auth: {
    isAuthenticated: boolean;
    user: string | null;
  };
  game: {
    questions: Array<{
      id: string;
      label: string;
      reponses: Array<{
        id: string;
        label: string;
        isCorrect?: boolean;
      }>;
    }>;
    playerName: string | null;
    gameId: string | null;
    isGameStarted: boolean;
    gameType: 'SOLO' | 'MULTIPLAYER' | 'CATEGORY' | 'FRIENDS' | 'NONE';
  };
}

// Types pour les messages WebSocket
interface WebSocketMessage {
  type: string;
  payload: Record<string, unknown>;
}

interface PlayerAnswer {
  playerId: string;
  playerName: string;
  questionIndex: number;
  answerIndex: number;
  timeToAnswer: number;
}

export default function GamePage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const roomId = searchParams.get('roomId');
  
  // Déterminer le type de jeu
  const isMultiplayer = roomId !== null;
  
  // État local du composant
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [isAnswering, setIsAnswering] = useState(false);
  
  // États pour le multijoueur (collecte de scores uniquement)
  const [playersScores, setPlayersScores] = useState<{[key: string]: number}>({});
  
  // Refs
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const timeLeftRef = useRef(20);
  const selectedAnswerRef = useRef<number | null>(null);

  // Sélecteurs Redux
  const { user } = useSelector((state: RootState) => state.auth);
  const { questions, playerName, isGameStarted, gameId } = useSelector((state: RootState) => state.game);

  // Charger les questions en mode multijoueur si elles ne sont pas encore chargées
  useEffect(() => {
    if (isMultiplayer && (!questions || questions.length === 0)) {
      console.log('🎮 Mode multijoueur: Chargement des questions...');
      // En mode multijoueur, on attend que le serveur envoie les questions via WebSocket
      // ou on peut les charger depuis l'API
      fetch('https://backend-squizzit.dreadex.dev/api/normal/aleatoire/question?niveauDifficulte=2')
        .then(response => response.json())
        .then(data => {
          console.log('🎮 Questions chargées pour le multijoueur:', data);
          // Dispatch les questions dans le store Redux
          dispatch(setQuestions(data));
        })
        .catch(error => {
          console.error('Erreur lors du chargement des questions:', error);
        });
    }
  }, [isMultiplayer, questions]);

  // WebSocket partagé pour le multijoueur (collecte de scores uniquement)
  const { socket } = useGameWebSocket({
    gameId: isMultiplayer ? roomId : gameId,
    onNextQuestion: (questionIndex, scores) => {
      setCurrentQuestionIndex(questionIndex);
      setTimeLeft(20);
      setSelectedAnswer(null);
      setIsAnswering(false);
      setPlayersScores(scores);
    },
    onGameEnd: (finalScores) => {
      navigate('/results', { 
        state: { 
          score, 
          totalQuestions: questions.length,
          playersScores: finalScores,
          isMultiplayer: true
        } 
      });
    }
  });

  const sendGameMessage = (message: WebSocketMessage) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message));
    }
  };

  // Mettre à jour les refs quand les states changent
  useEffect(() => {
    timeLeftRef.current = timeLeft;
  }, [timeLeft]);

  useEffect(() => {
    selectedAnswerRef.current = selectedAnswer;
  }, [selectedAnswer]);

  // Fonction pour nettoyer le timer
  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Gestion du passage à la question suivante
  const handleNextQuestion = useCallback(() => {
    if (isAnswering) return;
    
    setIsAnswering(true);
    clearTimer();
    
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setTimeLeft(20);
      setSelectedAnswer(null);
      setIsAnswering(false);
    } else {
      // Fin du jeu
      if (isMultiplayer) {
        // En multijoueur, envoyer le score final au serveur
        sendGameMessage({
          type: 'game_completed',
          payload: {
            playerId: user || playerName || 'unknown',
            playerName: playerName || 'Joueur',
            finalScore: score,
            totalQuestions: questions.length
          }
        });
        
        // Attendre la réponse du serveur pour les scores finaux
        // La navigation se fera via onGameEnd du WebSocket
      } else {
        // Mode solo : naviguer directement vers les résultats
        navigate('/results', { state: { score, totalQuestions: questions.length } });
      }
    }
  }, [currentQuestionIndex, questions.length, navigate, score, clearTimer, isAnswering, isMultiplayer, user, playerName, sendGameMessage]);

  // Timer pour chaque question
  useEffect(() => {
    clearTimer();
    
    timerRef.current = setInterval(() => {
      setTimeLeft((prevTime) => {
        const newTime = prevTime - 1;
        
        if (newTime <= 0 && selectedAnswerRef.current === null) {
          clearTimer();
          
          // Temps écoulé sans réponse
          setTimeout(() => {
            handleNextQuestion();
          }, 0);
          return 0;
        }
        
        return newTime;
      });
    }, 1000);

    return () => {
      clearTimer();
    };
  }, [currentQuestionIndex, clearTimer, handleNextQuestion]);

  // Fonction pour envoyer la réponse du joueur
  const sendPlayerAnswer = (answerIndex: number) => {
    if (isMultiplayer) {
      const playerAnswer: PlayerAnswer = {
        playerId: user || playerName || 'unknown',
        playerName: playerName || 'Joueur',
        questionIndex: currentQuestionIndex,
        answerIndex: answerIndex,
        timeToAnswer: 20 - timeLeft
      };
      
      sendGameMessage({
        type: 'player_answer',
        payload: playerAnswer as unknown as Record<string, unknown>
      });
    }
  };

  // Gestion du clic sur une réponse
  const handleAnswerClick = (answerIndex: number) => {
    if (selectedAnswer !== null || isAnswering) return;

    clearTimer();
    setSelectedAnswer(answerIndex);
    
    // Vérifier si la réponse est correcte
    const currentQuestion = questions[currentQuestionIndex];
    if (currentQuestion.reponses[answerIndex].isCorrect) {
      setScore(prev => prev + 1);
    }

    if (isMultiplayer) {
      // Envoyer la réponse au serveur
      sendPlayerAnswer(answerIndex);
    }
    
    // Passer à la question suivante après un délai
    setTimeout(() => {
      handleNextQuestion();
    }, 1500);
  };

  // Cleanup au démontage du composant
  useEffect(() => {
    return () => {
      clearTimer();
    };
  }, [clearTimer]);

  // Affichage de chargement
  if (!questions || questions.length === 0 || (!isGameStarted && !isMultiplayer)) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Chargement des questions...</p>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="min-h-screen">
      <Header />
      
      <div className="container px-4 py-8 mx-auto">
        {/* En-tête de la question */}
        <div className="p-6 mb-6 rounded-lg shadow-md bg-secondary">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-primary">
              Question {currentQuestionIndex + 1} / {questions.length}
            </h2>
            <div className="flex gap-4 items-center">
              <span className="text-sm text-primary">Score: {score}</span>
              {isMultiplayer && (
                <span className="text-sm text-primary">
                  Salle: {roomId}
                </span>
              )}
              <span className={`text-lg font-bold ${timeLeft <= 5 ? 'text-red-500' : 'text-blue-400'}`}>
                {timeLeft}s
              </span>
            </div>
          </div>
          
          {/* Barre de progression */}
          <div className="w-full h-2 rounded-full bg-primary">
            <div 
              className="h-2 bg-blue-400 rounded-full transition-all duration-1000"
              style={{ width: `${(timeLeft / 20) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Question */}
        <div className="p-6 mb-6 rounded-lg shadow-md bg-secondary-foreground">
          <h3 className="mb-6 text-lg font-medium text-primary">{currentQuestion.label}</h3>
          
          {/* Réponses */}
          <div className="grid gap-3">
            {currentQuestion.reponses.map((reponse, index) => (
              <button
                key={reponse.id}
                onClick={() => handleAnswerClick(index)}
                disabled={selectedAnswer !== null || isAnswering}
                className={`
                  p-4 text-left rounded-lg border-2 transition-all duration-200
                  ${selectedAnswer === index 
                    ? reponse.isCorrect 
                      ? 'bg-green-500 text-white border-green-500' 
                      : 'bg-red-500 text-white border-red-500'
                    : selectedAnswer !== null && reponse.isCorrect
                      ? 'bg-green-100 border-green-500'
                      : 'text-primary bg-secondary border-secondary-foreground hover:bg-secondary-foreground'
                  }
                  ${selectedAnswer !== null || isAnswering ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:border-blue-300'}
                `}
              >
                <span className="font-medium">{String.fromCharCode(65 + index)}.</span>
                <span className="ml-2">{reponse.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Scores des autres joueurs (multijoueur) */}
        {isMultiplayer && Object.keys(playersScores).length > 0 && (
          <div className="p-4 bg-gray-100 rounded-lg">
            <h4 className="mb-2 font-bold">Scores actuels :</h4>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(playersScores).map(([playerName, score]) => (
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
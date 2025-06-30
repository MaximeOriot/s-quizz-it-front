import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback, useRef } from "react";
import Header from "../../components/ui/Header";

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
  };
}

export default function GamePage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // État local du composant
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [isAnswering, setIsAnswering] = useState(false); // Nouveau state pour éviter les doubles actions
  
  // Refs pour éviter les problèmes de closure
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const timeLeftRef = useRef(20);
  const selectedAnswerRef = useRef<number | null>(null);

  // Sélecteurs Redux
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const { questions, playerName, isGameStarted } = useSelector((state: RootState) => state.game);

  // Mettre à jour les refs quand les states changent
  useEffect(() => {
    timeLeftRef.current = timeLeft;
  }, [timeLeft]);

  useEffect(() => {
    selectedAnswerRef.current = selectedAnswer;
  }, [selectedAnswer]);

  // Redirection si pas authentifié ou pas de jeu en cours
  useEffect(() => {
    if (!isAuthenticated && !playerName) {
      navigate('/play');
    }
    if (!isGameStarted || !questions || questions.length === 0) {
      navigate('/play');
    }
  }, [isAuthenticated, playerName, isGameStarted, questions, navigate]);

  // Fonction pour nettoyer le timer
  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Gestion du passage à la question suivante
  const handleNextQuestion = useCallback(() => {
    if (isAnswering) return; // Éviter les appels multiples
    
    setIsAnswering(true);
    clearTimer();
    
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setTimeLeft(20);
      setSelectedAnswer(null);
      setIsAnswering(false);
    } else {
      // Fin du jeu - redirection vers les résultats
      navigate('/results', { state: { score, totalQuestions: questions.length } });
    }
  }, [currentQuestionIndex, questions.length, navigate, score, clearTimer, isAnswering]);

  // Timer pour chaque question - version améliorée
  useEffect(() => {
    // Nettoyer le timer précédent
    clearTimer();
    
    // Démarrer un nouveau timer
    timerRef.current = setInterval(() => {
      setTimeLeft((prevTime) => {
        const newTime = prevTime - 1;
        
        // Si le temps est écoulé ET qu'aucune réponse n'a été sélectionnée
        if (newTime <= 0 && selectedAnswerRef.current === null) {
          clearTimer();
          // Utiliser setTimeout pour éviter les conflits de state
          setTimeout(() => {
            handleNextQuestion();
          }, 0);
          return 0;
        }
        
        return newTime;
      });
    }, 1000);

    // Cleanup function
    return () => {
      clearTimer();
    };
  }, [currentQuestionIndex]); // Seulement se déclencher quand la question change

  // Gestion du clic sur une réponse
  const handleAnswerClick = (answerIndex: number) => {
    if (selectedAnswer !== null || isAnswering) return; // Empêche la double sélection

    clearTimer(); // Arrêter le timer immédiatement
    setSelectedAnswer(answerIndex);
    
    // Vérifier si la réponse est correcte
    const currentQuestion = questions[currentQuestionIndex];
    if (currentQuestion.reponses[answerIndex].isCorrect) {
      setScore(prev => prev + 1);
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
  if (!questions || questions.length === 0 || !isGameStarted) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Chargement des questions...</p>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-gray-100">
      <Header playerName={user || playerName || localStorage.getItem('username') || 'Joueur'} />
      
      <div className="container mx-auto px-4 py-8">
        {/* En-tête de la question */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">
              Question {currentQuestionIndex + 1} / {questions.length}
            </h2>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Score: {score}</span>
              <span className={`text-lg font-bold ${timeLeft <= 5 ? 'text-red-500' : 'text-blue-500'}`}>
                {timeLeft}s
              </span>
            </div>
          </div>
          
          {/* Barre de progression */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-1000"
              style={{ width: `${(timeLeft / 20) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Question */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-medium mb-6">{currentQuestion.label}</h3>
          
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
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }
                  ${selectedAnswer !== null || isAnswering ? 'cursor-not-allowed' : 'cursor-pointer hover:border-blue-300'}
                `}
              >
                <span className="font-medium">{String.fromCharCode(65 + index)}.</span>
                <span className="ml-2">{reponse.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
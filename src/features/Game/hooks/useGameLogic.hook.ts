import { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import type { GameState, VerifyAnswerRequest, WebSocketMessage, AnswerData } from '../types/game.types';
import { AnswerVerificationService } from '../services/answerVerification.service';
import { useGameTimer } from './useGameTimer.hook';
import { useWebSocket } from './useWebSocket.hook';

interface UseGameLogicProps {
  questions: any[];
  gameType: string;
  gameId: string | null;
  user: string | null;
  playerName: string | null;
}

export const useGameLogic = ({ questions, gameType, gameId, user, playerName }: UseGameLogicProps) => {
  const navigate = useNavigate();
  const selectedAnswerRef = useRef<number | null>(null);

  const [gameState, setGameState] = useState<GameState>({
    currentQuestionIndex: 0,
    timeLeft: 20,
    selectedAnswer: null,
    score: 0,
    isAnswering: false,
    answerStatus: null,
    correctAnswerIndex: null,
    waitingForPlayers: false,
    playersAnswered: [],
    totalPlayers: 0,
    playersScores: {}
  });

  // Ajouter un état pour compter les bonnes réponses
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);

  // Déclarer les fonctions qui vont être utilisées dans les callbacks
  let timerActions: {
    timeLeft: number;
    startTimer: () => void;
    resetTimer: () => void;
    clearTimer: () => void;
  };

  const handleNextQuestion = useCallback(() => {
    if (gameType === 'MULTIPLAYER') return;
    
    setGameState(prev => ({
      ...prev,
      isAnswering: true
    }));
    
    if (gameState.currentQuestionIndex < questions.length - 1) {
      setGameState(prev => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex + 1,
        selectedAnswer: null,
        isAnswering: false,
        answerStatus: null,
        correctAnswerIndex: null
      }));
      selectedAnswerRef.current = null;
      if (timerActions) {
        timerActions.resetTimer();
        timerActions.startTimer();
      }
    } else {
      // Quiz terminé - redirection vers les résultats avec le vrai nombre de bonnes réponses
      navigate('/results', { 
        state: { 
          score: gameState.score, 
          totalQuestions: questions.length,
          correctAnswers: correctAnswersCount,
          isMultiplayer: false
        } 
      });
    }
  }, [gameType, gameState.currentQuestionIndex, gameState.score, questions.length, navigate, correctAnswersCount]);

  const handleWebSocketMessage = useCallback((message: WebSocketMessage) => {
    switch (message.type) {
      case 'waiting_players':
        setGameState(prev => ({
          ...prev,
          waitingForPlayers: true,
          playersAnswered: message.payload?.playersAnswered || [],
          totalPlayers: message.payload?.totalPlayers || 0
        }));
        break;
        
      case 'answer_result':
        const result = message.payload;
        if (result?.playerId === (user || playerName)) {
          setGameState(prev => ({
            ...prev,
            answerStatus: result.isCorrect ? 'correct' : 'incorrect',
            correctAnswerIndex: result.correctAnswerIndex || null,
            score: result.isCorrect ? prev.score + 1 : prev.score
          }));
        }
        break;
        
      case 'next_question':
        setGameState(prev => ({
          ...prev,
          waitingForPlayers: false,
          playersAnswered: [],
          currentQuestionIndex: message.payload?.questionIndex || 0,
          selectedAnswer: null,
          isAnswering: false,
          answerStatus: null,
          correctAnswerIndex: null,
          playersScores: message.payload?.scores || {}
        }));
        selectedAnswerRef.current = null;
        if (timerActions) {
          timerActions.resetTimer();
          timerActions.startTimer();
        }
        break;
        
      case 'game_end':
        // Multijoueur - redirection vers les résultats avec scores des joueurs
        navigate('/results', { 
          state: { 
            score: gameState.score, 
            totalQuestions: questions.length,
            playersScores: message.payload?.finalScores,
            isMultiplayer: gameType === 'MULTIPLAYER'
          } 
        });
        break;
        
      case 'error':
        console.error('Erreur WebSocket:', message.message);
        setGameState(prev => ({
          ...prev,
          answerStatus: null,
          isAnswering: false
        }));
        break;
    }
  }, [user, playerName, navigate, gameState.score, questions.length, gameType]);

  const handleTimeUp = useCallback(() => {
    if (selectedAnswerRef.current === null) {
      selectedAnswerRef.current = -1;
      setGameState(prev => ({
        ...prev,
        answerStatus: 'incorrect',
        isAnswering: true,
        selectedAnswer: -1
      }));

      if (gameType === 'MULTIPLAYER') {
        const currentQuestion = questions[gameState.currentQuestionIndex];
        const answerData: AnswerData = {
          salonId: gameId || '',
          questionId: currentQuestion.id,
          tempsReponse: 20,
          answerId: '',
          answerText: ''
        };
        // sendWebSocketAnswer sera disponible après la déclaration du hook
      } else {
        const currentQuestion = questions[gameState.currentQuestionIndex];
        const correctIndex = currentQuestion.reponses.findIndex(r => r.isCorrect);
        setGameState(prev => ({
          ...prev,
          correctAnswerIndex: correctIndex !== -1 ? correctIndex : null
        }));
        
        setTimeout(() => {
          handleNextQuestion();
        }, 1500);
      }
    }
  }, [gameType, gameState.currentQuestionIndex, questions, gameId, handleNextQuestion]);

  const { timeLeft, startTimer, resetTimer, clearTimer } = useGameTimer({
    initialTime: 20,
    waitingForPlayers: gameState.waitingForPlayers,
    onTimeUp: handleTimeUp
  });

  // Assigner les actions du timer après leur déclaration
  timerActions = { timeLeft, startTimer, resetTimer, clearTimer };

  const { sendAnswer: sendWebSocketAnswer } = useWebSocket({
    gameType,
    gameId,
    user,
    playerName,
    onMessage: handleWebSocketMessage
  });

  const verifyAnswerAPI = useCallback(async (answerIndex: number) => {
    // Ne pas appeler l'API REST en mode multijoueur
    if (gameType === 'MULTIPLAYER') {
      console.log('🎮 Mode multijoueur: API REST ignorée, utilisation WebSocket uniquement');
      return;
    }
    
    try {
      const currentQuestion = questions[gameState.currentQuestionIndex];
      const selectedResponse = currentQuestion.reponses[answerIndex];
      
      // Gérer les différents formats de user (string, object, ou null)
      let userId = '0';
      if (user) {
        if (typeof user === 'string') {
          userId = user;
        } else if (typeof user === 'object' && user !== null && 'id' in user) {
          userId = (user as { id: string }).id;
        }
      }
      
      // Utiliser playerName comme fallback si user n'est pas disponible
      if (userId === '0' && playerName) {
        userId = playerName;
      }
      
      console.log('🎮 Mode solo: Envoi à l\'API REST avec userId:', userId);
      
      // Gérer l'ID utilisateur : si c'est un UUID (chaîne), utiliser 1, sinon convertir en nombre
      let idJoueur: number;
      if (typeof userId === 'string' && userId.includes('-')) {
        // C'est un UUID, utiliser un ID par défaut
        idJoueur = 1;
        console.log('🎮 UUID détecté, utilisation de l\'ID par défaut:', idJoueur);
      } else {
        // C'est un nombre, le convertir
        idJoueur = parseInt(userId) || 1;
        console.log('🎮 ID numérique converti:', idJoueur);
      }
      
      const requestData: VerifyAnswerRequest = {
        idQuestion: parseInt(currentQuestion.id),
        idReponse: parseInt(selectedResponse.id),
        idJoueur: idJoueur,
        tempsReponse: 20 - timeLeft,
        type: "qcm",
        reponseJoueur: selectedResponse.label
      };

      const result = await AnswerVerificationService.verifyAnswer(requestData);
      
      const isCorrect = result.correcte === true;
      setGameState(prev => ({
        ...prev,
        answerStatus: isCorrect ? 'correct' : 'incorrect',
        score: isCorrect ? prev.score + (result.pointsGagnes || 1) : prev.score
      }));
      
      // Incrémenter le compteur de bonnes réponses
      if (isCorrect) {
        setCorrectAnswersCount(prev => prev + 1);
      }
      
      if (!isCorrect && result.bonneReponse) {
        const correctIndex = currentQuestion.reponses.findIndex(r => 
          r.label.toLowerCase() === result.bonneReponse.toLowerCase()
        );
        setGameState(prev => ({
          ...prev,
          correctAnswerIndex: correctIndex !== -1 ? correctIndex : null
        }));
      }
      
      setTimeout(() => {
        resetTimer();
        handleNextQuestion();
      }, 1500);
      
    } catch (error) {
      console.error('Erreur lors de la vérification:', error);
      // Fallback logic
      const currentQuestion = questions[gameState.currentQuestionIndex];
      const isCorrect = currentQuestion.reponses[answerIndex].isCorrect;
      
      setGameState(prev => ({
        ...prev,
        answerStatus: isCorrect ? 'correct' : 'incorrect',
        score: isCorrect ? prev.score + 1 : prev.score,
        correctAnswerIndex: isCorrect ? null : currentQuestion.reponses.findIndex(r => r.isCorrect)
      }));
      
      // Incrémenter le compteur de bonnes réponses pour le fallback aussi
      if (isCorrect) {
        setCorrectAnswersCount(prev => prev + 1);
      }
      
      setTimeout(() => {
        resetTimer();
        handleNextQuestion();
      }, 1500);
    }
  }, [questions, gameState.currentQuestionIndex, user, playerName, timeLeft, handleNextQuestion, resetTimer]);

  const handleAnswerClick = useCallback((answerIndex: number) => {
    if (gameState.selectedAnswer !== null || gameState.isAnswering || gameState.waitingForPlayers) return;

    clearTimer();
    selectedAnswerRef.current = answerIndex;
    setGameState(prev => ({
      ...prev,
      selectedAnswer: answerIndex,
      isAnswering: true,
      answerStatus: 'pending'
    }));
    
    if (gameType === 'MULTIPLAYER') {
      const currentQuestion = questions[gameState.currentQuestionIndex];
      const selectedResponse = currentQuestion.reponses[answerIndex];
      
      console.log('🎮 Mode multijoueur: Envoi réponse via WebSocket');
      
      const answerData: AnswerData = {
        salonId: gameId || '',
        questionId: currentQuestion.id,
        tempsReponse: 20 - timeLeft,
        answerId: selectedResponse?.id || '',
        answerText: selectedResponse?.label || ''
      };
      
      sendWebSocketAnswer(answerData);
      setGameState(prev => ({ ...prev, waitingForPlayers: true }));
    } else {
      console.log('🎮 Mode solo: Envoi réponse via API REST');
      verifyAnswerAPI(answerIndex);
    }
  }, [gameState.selectedAnswer, gameState.isAnswering, gameState.waitingForPlayers, gameState.currentQuestionIndex, clearTimer, gameType, questions, gameId, timeLeft, sendWebSocketAnswer, verifyAnswerAPI]);

  return {
    gameState: { ...gameState, timeLeft },
    handleAnswerClick,
    startTimer,
    resetTimer
  };
};

export interface RootState {
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
    gameType: 'SOLO' | 'MULTIPLAYER' | 'CATEGORY' | 'FRIENDS';
  };
}

export interface WebSocketMessage {
  type: 'player_answer' | 'next_question' | 'game_end' | 'player_joined' | 'waiting_players' | 'answer_result' | 'error';
  payload?: any;
  user?: string;
  message?: string;
}

export interface AnswerData {
  salonId: string;
  questionId: string;
  tempsReponse: number;
  answerId: string;
  answerText: string;
}

export interface VerifyAnswerRequest {
  idQuestion: number;
  idReponse: number;
  idJoueur: number;
  tempsReponse: number;
  type: string;
  reponseJoueur: string;
}

export interface VerifyAnswerResponse {
  idJoueur: string;
  correcte: boolean;
  fautesOrthographe: boolean;
  distanceLevenshtein: number;
  malus: number;
  tempsReponse: string;
  pointsGagnes: number;
  bonneReponse: string;
}

export type AnswerStatus = 'pending' | 'correct' | 'incorrect' | null;

export interface GameState {
  currentQuestionIndex: number;
  timeLeft: number;
  selectedAnswer: number | null;
  score: number;
  isAnswering: boolean;
  answerStatus: AnswerStatus;
  correctAnswerIndex: number | null;
  waitingForPlayers: boolean;
  playersAnswered: string[];
  totalPlayers: number;
  playersScores: {[key: string]: number};
}

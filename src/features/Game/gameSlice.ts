import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export const GameTypeEnum = {
  SOLO: 'SOLO',
  MULTIPLAYER: 'MULTIPLAYER',
  CATEGORY: 'CATEGORY',
  FRIENDS: 'FRIEND',
  NONE: 'NONE',
} as const;

export type GameType = typeof GameTypeEnum[keyof typeof GameTypeEnum];

interface GameState {
  playerName: string | null; // Nom du joueur
  gameId: string | null; // ID de la partie en cours
  isGameStarted: boolean; // Indique si le jeu a commencé
  error: string | null; // Message d'erreur éventuel
  questions: Array<{ id: string; question: string; options: string[] }>; // Liste des questions du jeu
  countdown: number; // Compte à rebours pour le jeu
  gameType: GameType; // Type de jeu (SOLO, MULTIPLAYER, etc.)
}

const initialState: GameState = {
  playerName: null,
  gameId: null,
  isGameStarted: false,
  error: null,
  questions: [],
  countdown: 0, // Initialisation du compte à rebours
  gameType: GameTypeEnum.NONE, // Type de jeu par défaut
};

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    setPlayerName: (state, action: PayloadAction<string>) => {
      state.playerName = action.payload;
    },
    setGameId: (state, action: PayloadAction<string>) => {
      state.gameId = action.payload;
    },
    setCountdown: (state, action: PayloadAction<number>) => {
      state.countdown = action.payload;
    },
    resetCountdown: (state) => {
      state.countdown = 0; // Réinitialisation du compte à rebours
    },
    startGame: (state) => {
      state.isGameStarted = true;
      state.error = null;
    },
    endGame: (state) => {
      state.isGameStarted = false;
      state.gameId = null;
      state.questions = [];
      state.countdown = 0; // Réinitialisation du compte à rebours
      state.gameType = GameTypeEnum.NONE; // Réinitialisation du type de jeu
    },
    setQuestions: (state, action: PayloadAction<Array<{ id: string; question: string; options: string[] }>>) => {
      state.questions = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    prepareSoloGame: (state, action: PayloadAction<{ playerName: string; gameId: string }>) => {
      state.playerName = action.payload.playerName;
      state.gameId = action.payload.gameId;
      state.isGameStarted = true;
      state.countdown = 20;
      state.error = null;
      state.questions = [];
      state.gameType = GameTypeEnum.SOLO;
    }
  },
});

export const {
  setPlayerName,
  setGameId,
  startGame,
  endGame,
  setQuestions,
  setError,
} = gameSlice.actions;
export default gameSlice.reducer;
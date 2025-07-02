import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

// Types
export interface Room {
  id: number;
  label: string;
  type: "normal" | "rapide";
  difficulte: number;
  j_actuelle: number;
  j_max: number;
  commence: boolean;
  created_at: string;
}

export interface WaitingPlayer {
  id: string;
  pseudo: string;
  avatar: string;
  isReady: boolean;
}

export interface Quizz {
  id: number;
  label: string;
  description: string;
  themes?: Array<{ label: string }>;
}

export interface RoomData {
  players: WaitingPlayer[];
  quizz: Quizz;
  isQuickPlay: boolean;
  roomId: string;
}

interface WebSocketState {
  // État de connexion
  isConnected: boolean;
  hasReceivedData: boolean;
  
  // Données des salles globales
  rooms: Room[];
  roomsLoading: boolean;
  
  // Données de la salle d'attente
  currentRoom: RoomData | null;
  roomLoading: boolean;
  
  // Messages d'erreur
  error: string | null;
}

const initialState: WebSocketState = {
  isConnected: false,
  hasReceivedData: false,
  rooms: [],
  roomsLoading: true,
  currentRoom: null,
  roomLoading: true,
  error: null
};

const websocketSlice = createSlice({
  name: 'websocket',
  initialState,
  reducers: {
    // État de connexion
    setConnected: (state, action: PayloadAction<boolean>) => {
      state.isConnected = action.payload;
      if (!action.payload) {
        state.hasReceivedData = false;
      }
    },
    
    setHasReceivedData: (state, action: PayloadAction<boolean>) => {
      state.hasReceivedData = action.payload;
    },
    
    // Salles globales
    setRooms: (state, action: PayloadAction<Room[]>) => {
      state.rooms = action.payload;
      state.roomsLoading = false;
      state.hasReceivedData = true;
    },
    
    setRoomsLoading: (state, action: PayloadAction<boolean>) => {
      state.roomsLoading = action.payload;
    },
    
    // Salle d'attente
    setCurrentRoom: (state, action: PayloadAction<RoomData>) => {
      state.currentRoom = action.payload;
      state.roomLoading = false;
    },
    
    updateRoomPlayers: (state, action: PayloadAction<WaitingPlayer[]>) => {
      if (state.currentRoom) {
        state.currentRoom.players = action.payload;
      }
    },
    
    updatePlayerReady: (state, action: PayloadAction<{ playerId: string; isReady: boolean }>) => {
      if (state.currentRoom) {
        state.currentRoom.players = state.currentRoom.players.map(player => 
          player.id.toString() === action.payload.playerId 
            ? { ...player, isReady: action.payload.isReady }
            : player
        );
      }
    },
    
    updateRoomInfo: (state, action: PayloadAction<{ quizz: Quizz; isQuickPlay: boolean }>) => {
      if (state.currentRoom) {
        state.currentRoom.quizz = action.payload.quizz;
        state.currentRoom.isQuickPlay = action.payload.isQuickPlay;
      }
    },
    
    setRoomLoading: (state, action: PayloadAction<boolean>) => {
      state.roomLoading = action.payload;
    },
    
    // Erreurs
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    
    // Reset
    resetRoom: (state) => {
      state.currentRoom = null;
      state.roomLoading = true;
    },
    
    resetAll: (state) => {
      state.rooms = [];
      state.roomsLoading = true;
      state.currentRoom = null;
      state.roomLoading = true;
      state.hasReceivedData = false;
      state.error = null;
    }
  }
});

export const {
  setConnected,
  setHasReceivedData,
  setRooms,
  setRoomsLoading,
  setCurrentRoom,
  updateRoomPlayers,
  updatePlayerReady,
  updateRoomInfo,
  setRoomLoading,
  setError,
  resetRoom,
  resetAll
} = websocketSlice.actions;

export default websocketSlice.reducer; 
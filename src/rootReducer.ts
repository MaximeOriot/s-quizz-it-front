import { combineReducers } from '@reduxjs/toolkit';
import authReducer from './features/auth/authSlice';
import gameReducer from './features/Game/gameSlice';
import websocketReducer from './store/websocketSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  game: gameReducer,
  websocket: websocketReducer,
});

export default rootReducer;
import { combineReducers } from '@reduxjs/toolkit';
import authReducer from './features/auth/authSlice';
import gameReducer from './features/Game/gameSlice';


const rootReducer = combineReducers({
  auth: authReducer,
  game: gameReducer,
});

export default rootReducer;
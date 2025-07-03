import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  user: string | null; // Nom ou ID de l'utilisateur connecté
  email: string | null; // Adresse email pour la tentative de connexion
  password: string | null; // Mot de passe pour la tentative de connexion (temporaire)
  isAuthenticated: boolean; // Statut de connexion
  loading: boolean; // Indique si une action d'authentification est en cours
  error: string | null; // Message d'erreur éventuel
}

const initialState: AuthState = {
  user: null,
  email: null,
  password: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state, action: PayloadAction<{ email: string; password: string }>) => {
      state.loading = true;
      state.error = null;
      state.email = action.payload.email;
      state.password = action.payload.password;
      console.log('Tentative de connexion avec les données :', action.payload);
    },
    loginSuccess: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload;
      state.email = null;
      state.password = null;
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
      state.email = null;
      state.password = null;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      state.email = null;
      state.password = null;
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      console.log('Utilisateur déconnecté, état réinitialisé.');
    },
    setGuestUser: (state) => {
      state.user = 'Invité';
      state.email = '';
      state.isAuthenticated = false;
    },
  },
});

export const { loginStart, loginSuccess, loginFailure, logout } = authSlice.actions;
export default authSlice.reducer;
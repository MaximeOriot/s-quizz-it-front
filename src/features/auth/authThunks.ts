import { createAsyncThunk } from '@reduxjs/toolkit';
import { loginStart, loginSuccess, loginFailure } from './authSlice';

// Thunk pour la connexion
export const loginThunk = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }, { dispatch, rejectWithValue }) => {
    dispatch(loginStart({ email, password }));
    try {
      const response = await fetch('https://backend-squizzit.dreadex.dev/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ email, password }).toString(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      localStorage.setItem('token', data.session.access_token);
      
      // Stocker les données du profil utilisateur
      if (data.profile) {
        localStorage.setItem('userProfile', JSON.stringify(data.profile));
        console.log('📋 Profil utilisateur stocké (login):', data.profile);
      }
      
      // Stocker l'ID utilisateur
      if (data.user && data.user.id) {
        localStorage.setItem('userId', data.user.id);
        console.log('🆔 ID utilisateur stocké (login):', data.user.id);
      }
      
      if(!data.profile || !data.profile.pseudo) {
        localStorage.setItem('username', 'meh'); // Valeur par défaut si pseudo non disponible
      } else {
        localStorage.setItem('username', data.profile.pseudo);
      }
      dispatch(loginSuccess(data.profile));
      return data; // Retourner les données en cas de succès
    } catch (error: any) {
      dispatch(loginFailure(error.message));
      return rejectWithValue(error.message); // Rejeter explicitement avec la valeur d'erreur
    }
  }
);

// Thunk pour l'inscription
export const registerThunk = createAsyncThunk(
    'auth/register',
    async ({ email, password, username }: { email: string; password: string; username: string }, { dispatch }) => {
        dispatch(loginStart({ email, password }));
        try {
            const response = await fetch('https://backend-squizzit.dreadex.dev/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({ email, password, username }).toString(),
              });
        if (!response.ok) {
            throw new Error('Erreur d\'inscription');
        }
        const data = await response.json();
        localStorage.setItem('token', data.session.access_token);
        
        // Stocker les données du profil utilisateur
        if (data.profile) {
          localStorage.setItem('userProfile', JSON.stringify(data.profile));
          console.log('📋 Profil utilisateur stocké (register):', data.profile);
        }
        
        // Stocker l'ID utilisateur
        if (data.user && data.user.id) {
          localStorage.setItem('userId', data.user.id);
          console.log('🆔 ID utilisateur stocké (register):', data.user.id);
        }
        
        localStorage.setItem('username', data.profile.pseudo);
        dispatch(loginSuccess(data.profile));
        } catch (error: any) {
        dispatch(loginFailure(error.message));
        }
    }
);

export const getAuthenticatedUserThunk = createAsyncThunk(
  'auth/getAuthenticatedUser',
  async (_, { dispatch, rejectWithValue }) => {
      try {
          const response = await fetch('https://backend-squizzit.dreadex.dev/api/auth', {
              method: 'GET',
              headers: {
                  'Content-Type': 'application/x-www-form-urlencoded',
                  'Authorization': `Bearer ${localStorage.getItem('token')}`
              },
          });
          if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          
          // Stocker les données du profil utilisateur
          if (data.profile) {
              localStorage.setItem('userProfile', JSON.stringify(data.profile));
              console.log('📋 Profil utilisateur stocké:', data.profile);
          }
          
          // Stocker l'ID utilisateur
          if (data.user && data.user.id) {
              localStorage.setItem('userId', data.user.id);
              console.log('🆔 ID utilisateur stocké:', data.user.id);
          }
          
          dispatch(loginSuccess(data.user));
          return data;
      } catch (error: any) {
          dispatch(loginFailure(error.message));
          return rejectWithValue(error.message);
      }
  }
);
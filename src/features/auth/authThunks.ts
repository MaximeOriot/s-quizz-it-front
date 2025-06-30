import { createAsyncThunk } from '@reduxjs/toolkit';
import { loginStart, loginSuccess, loginFailure } from './authSlice';

// Thunk pour la connexion
export const loginThunk = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }, { dispatch }) => {
    dispatch(loginStart({ email, password }));
    try {
      const response = await fetch('https://backend-squizzit.dreadex.dev/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({ email, password }).toString(),
      });
      if (!response.ok) {
        throw new Error('Erreur de connexion');
      }
      const data = await response.json();
      localStorage.setItem('token', data.session.access_token);
      dispatch(loginSuccess(data.user));
    } catch (error: any) {
      dispatch(loginFailure(error.message));
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
        dispatch(loginSuccess(data.user));
        } catch (error: any) {
        dispatch(loginFailure(error.message));
        }
    }
);

// Thunk pour récupérer l'utilisateur authentifié
export const getAuthenticatedUserThunk = createAsyncThunk(
    'auth/getAuthenticatedUser',
    async (_, { dispatch }) => {
        try {
            const response = await fetch('https://backend-squizzit.dreadex.dev/api/auth', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
            });
            if (!response.ok) {
                throw new Error('Erreur lors de la récupération de l\'utilisateur');
            }
            const data = await response.json();
            dispatch(loginSuccess(data.user));
        } catch (error: any) {
            dispatch(loginFailure(error.message));
        }
    });
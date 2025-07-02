import { createAsyncThunk } from "@reduxjs/toolkit";
import { setGameId, startGame, setQuestions, setError } from "./gameSlice";

// Thunk pour récupérer 20 questions
export const fetchQuestionsThunk = createAsyncThunk(
  "game/fetchQuestions",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const response = await fetch("https://backend-squizzit.dreadex.dev/api/normal/aleatoire/question?niveauDifficulte=2", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      dispatch(setQuestions(data));
      return data; // Retourner les données en cas de succès
    } catch (error: any) {
      dispatch(setError(error.message));
      return rejectWithValue(error.message); // Rejeter explicitement avec la valeur d'erreur
    }
  }
);

export const prepareSoloGameQuestionThunk = createAsyncThunk(
"game/prepareSoloGame",
async (_, { dispatch, rejectWithValue }) => {
    try {
        // Simuler un fetch avec un délai
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const questionMock = await import("../../../questionMock.json");
        const questions = questionMock.default || questionMock;
        
        dispatch(setQuestions(questions));
        return questions;
    } catch (error: any) {
        dispatch(setError(error.message));
        return rejectWithValue(error.message);
    }
}
);
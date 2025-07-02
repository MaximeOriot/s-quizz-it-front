import type { VerifyAnswerRequest, VerifyAnswerResponse } from '../types/game.types';

const API_BASE_URL = 'https://backend-squizzit.dreadex.dev/api';

export class AnswerVerificationService {
  static async verifyAnswer(requestData: VerifyAnswerRequest): Promise<VerifyAnswerResponse> {
    const response = await fetch(`${API_BASE_URL}/verifier-reponse`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: new URLSearchParams({
        idQuestion: requestData.idQuestion.toString(),
        idReponse: requestData.idReponse.toString(),
        idJoueur: requestData.idJoueur.toString(),
        tempsReponse: requestData.tempsReponse.toString(),
        type: requestData.type,
        reponseJoueur: requestData.reponseJoueur
      }).toString()
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la vérification');
    }

    return response.json();
  }
}

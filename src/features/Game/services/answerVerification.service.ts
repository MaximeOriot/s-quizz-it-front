import type { VerifyAnswerRequest, VerifyAnswerResponse } from '../types/game.types';

const API_BASE_URL = 'https://backend-squizzit.dreadex.dev/api';

export class AnswerVerificationService {
  static async verifyAnswer(requestData: VerifyAnswerRequest): Promise<VerifyAnswerResponse> {

    // Log des données envoyées pour debug
    console.log('🔍 Données envoyées à l\'API:', requestData);
    console.log('🔍 Type de idJoueur:', typeof requestData.idJoueur, requestData.idJoueur);
    console.log('🔍 Token présent:', !!localStorage.getItem('token'));
    
    const bodyParams = {
      idQuestion: requestData.idQuestion.toString(),
      idReponse: requestData.idReponse.toString(),
      idJoueur: requestData.idJoueur.toString(),
      tempsReponse: requestData.tempsReponse.toString(),
      type: requestData.type,
      reponseJoueur: requestData.reponseJoueur
    };
    
    console.log('🔍 Paramètres du body:', bodyParams);
    console.log('🔍 URLSearchParams:', new URLSearchParams(bodyParams).toString());
    
    const response = await fetch(`${API_BASE_URL}/verifier-reponse`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: new URLSearchParams(bodyParams).toString()
    });

    if (!response.ok) {
      console.error('❌ Erreur API:', response.status, response.statusText);
      
      // Essayer de récupérer le message d'erreur du serveur
      try {
        const errorData = await response.text();
        console.error('❌ Détails de l\'erreur:', errorData);
        throw new Error(`Erreur ${response.status}: ${errorData}`);
      } catch (textError) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }
    }

    return response.json();
  }
}

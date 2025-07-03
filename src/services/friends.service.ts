import type { Profile } from "../models/profile";
import { Api } from "./api";

export class FriendsService {
    static async getAll(): Promise<Profile[]> {
        try {
            return Api.get(`/amis`);
        } catch (error) {
            console.warn('Error fetching friends', error);
            return [];
        }
    }

    static async getRequests(): Promise<Profile[]> {
        return Api.get('/amis/demande');
    }

    static async answerRequest(idDemandeur: string, action: string) {
        return Api.post('/amis/demande', { idDemandeur, action });
    }

    static async sendRequest(pseudoProfileReceveur: string) {
        return Api.post('/amis', { pseudoProfileReceveur });
    }

    static async deleteFriend(idAmi: string) {
        return Api.delete('/amis', { idAmi });
    }
}
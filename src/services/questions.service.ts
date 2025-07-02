import type { Question } from "../models/question";
import { Api } from "./api";

export class QuestionsService {
    static async getRandom(): Promise<Question[]> {
        try {
            return Api.get(`/normal/aleatoire/question`);
        } catch (error) {
            console.warn(`Error fetching random question :`, error);
            return [];
        }
    }
}
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
}
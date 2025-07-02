import type { Avatar } from "../models/avatar";
import type { Profile } from "../models/profile";
import { Api } from "./api";

export class ProfileService {
    static getProfile(): Promise<Profile> {
        return Api.get('/profile');
    }

    static updateProfile(username: string, idAvatar: number) {
        return Api.post(`/profile`, { username, idAvatar });
    }

    static getAvatars(): Promise<Avatar[]> {
        return Api.get('/avatar');
    }
}
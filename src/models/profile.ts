import type { Avatar } from "./avatar";

export interface Profile {
    id: number;
    pseudo: string;
    idAvatar: number;
    elo: number;
    avatar: Avatar;
}
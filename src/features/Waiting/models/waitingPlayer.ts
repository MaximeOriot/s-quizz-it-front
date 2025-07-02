import type { Profile } from "../../../models/profile";

export interface WaitingPlayer extends Profile {
    isReady: boolean;
}
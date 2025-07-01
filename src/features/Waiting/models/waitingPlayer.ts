import type { User } from "../../../models/user";

export interface WaitingPlayer extends User {
    isReady: boolean;
}
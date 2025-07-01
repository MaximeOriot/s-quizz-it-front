import type { Question } from "./question";
import type { Theme } from "./theme";

export interface Quizz {
    id: number;
    label: string;
    description: string;
    niveauDifficulte?: number;
    questions: Question[];
    themes: Theme[];
    created_at: string;
    updated_at?: string;
}
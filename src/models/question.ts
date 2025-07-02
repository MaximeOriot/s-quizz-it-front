import type { QuestionTypeEnum } from "../enums/question-type.enum";
import type { Theme } from "./theme";

export interface Question {
    id: number;
    label: string;
    niveauDifficulte: number;
    type: QuestionTypeEnum;
    responses: Response[];
    idAuthor?: number;
    date_creation?: string;
    themes?: Theme[];
}
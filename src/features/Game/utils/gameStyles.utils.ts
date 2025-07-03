import type { AnswerStatus } from '../types/game.types';

export const getAnswerButtonClass = (
  index: number,
  selectedAnswer: number | null,
  answerStatus: AnswerStatus,
  correctAnswerIndex: number | null,
  isAnswering: boolean,
  waitingForPlayers: boolean
): string => {
  const baseClasses = "p-4 text-left rounded-lg border-2 transition-all duration-200";
  
  if (selectedAnswer === index) {
    if (answerStatus === 'pending') {
      return `${baseClasses} bg-gray-300 text-gray-700 border-gray-400 cursor-not-allowed`;
    } else if (answerStatus === 'correct') {
      return `${baseClasses} bg-green-500 text-white border-green-500`;
    } else if (answerStatus === 'incorrect') {
      return `${baseClasses} bg-red-500 text-white border-red-500`;
    }
  }
  
  if (answerStatus === 'incorrect' && correctAnswerIndex === index) {
    return `${baseClasses} bg-green-100 border-green-500 text-green-800`;
  }
  
  if (selectedAnswer !== null || isAnswering || waitingForPlayers) {
    return `${baseClasses} text-primary bg-secondary border-secondary-foreground cursor-not-allowed opacity-50`;
  }
  
  return `${baseClasses} text-primary bg-secondary border-secondary-foreground hover:bg-secondary-foreground cursor-pointer hover:border-blue-300`;
};

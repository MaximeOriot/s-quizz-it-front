import { useCallback } from 'react';
import type { Room } from './useRoomsData';

export const useRoomUtils = () => {
  const getStatusColor = useCallback((commence: boolean) => {
    return commence ? "text-blue-400" : "text-green-500";
  }, []);

  const getStatusText = useCallback((commence: boolean) => {
    return commence ? "En cours" : "En attente";
  }, []);

  const getDifficultyText = useCallback((difficulte: number) => {
    switch (difficulte) {
      case 1: return "Facile";
      case 2: return "Moyen";
      case 3: return "Difficile";
      default: return "Inconnu";
    }
  }, []);

  const getDifficultyColor = useCallback((difficulte: number) => {
    switch (difficulte) {
      case 1: return "bg-green-500";
      case 2: return "bg-yellow-500";
      case 3: return "bg-red-500";
      default: return "bg-gray-500";
    }
  }, []);

  const getButtonText = useCallback((room: Room) => {
    if (room.commence) return "En cours";
    if (room.j_actuelle >= room.j_max) return "Pleine";
    return "Rejoindre";
  }, []);

  const getRoomProgress = useCallback((room: Room) => {
    return (room.j_actuelle / room.j_max) * 100;
  }, []);

  return {
    getStatusColor,
    getStatusText,
    getDifficultyText,
    getDifficultyColor,
    getButtonText,
    getRoomProgress
  };
}; 
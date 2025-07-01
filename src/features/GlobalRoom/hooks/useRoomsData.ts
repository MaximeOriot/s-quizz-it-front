import { useState } from 'react';

export interface Room {
  id: number;
  label: string;
  type: "normal" | "rapide";
  difficulte: number;
  j_actuelle: number;
  j_max: number;
  commence: boolean;
  created_at: string;
}

export const useRoomsData = () => {
  const [rooms, setRooms] = useState<Room[]>([]);

  const updateRooms = (newRooms: Room[]) => {
    setRooms(newRooms);
  };

  return {
    rooms,
    updateRooms
  };
}; 
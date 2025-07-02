import { useNavigate } from "react-router-dom";
import Button from "../../../components/ui/Button";
import type { Room } from "../../../store/websocketSlice";

interface RoomCardProps {
  room: Room;
}

export const RoomCard = ({ room }: RoomCardProps) => {
  const navigate = useNavigate();

  const getStatusColor = (commence: boolean) => {
    return commence ? "text-blue-400" : "text-green-500";
  };

  const getStatusText = (commence: boolean) => {
    return commence ? "En cours" : "En attente";
  };

  const getDifficultyText = (difficulte: number) => {
    switch (difficulte) {
      case 1: return "Facile";
      case 2: return "Moyen";
      case 3: return "Difficile";
      default: return "Inconnu";
    }
  };

  const getDifficultyColor = (difficulte: number) => {
    switch (difficulte) {
      case 1: return "bg-green-500";
      case 2: return "bg-yellow-500";
      case 3: return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const getButtonText = (room: Room) => {
    if (room.commence) return "En cours";
    if (room.j_actuelle >= room.j_max) return "Pleine";
    return "Rejoindre";
  };

  const getRoomProgress = (room: Room) => {
    return (room.j_actuelle / room.j_max) * 100;
  };

  const handleJoinRoom = () => {
    navigate(`/waitingRoom?roomId=${room.id}`);
  };

  return (
    <div className="p-4 rounded-xl backdrop-blur-sm border-secondary-foreground bg-secondary-foreground">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="mb-1 text-lg font-bold text-primary">
            {room.label}
            <span className={`px-2 py-1 ml-2 text-xs text-white rounded-full ${getDifficultyColor(room.difficulte)}`}>
              {getDifficultyText(room.difficulte)}
            </span>
          </h3>
          <p className="text-sm capitalize text-primary">Type: {room.type}</p>
        </div>
        <span className={`text-sm font-semibold ${getStatusColor(room.commence)}`}>
          {getStatusText(room.commence)}
        </span>
      </div>

      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-primary">
          <span className="font-semibold">{room.j_actuelle}</span>
          <span className="mx-1">/</span>
          <span>{room.j_max} joueurs</span>
        </div>
        <span className="px-2 py-1 text-xs capitalize rounded-full bg-primary/20 text-primary">
          {room.type}
        </span>
      </div>

      <div className="mb-4 w-full h-2 bg-gray-200 rounded-full">
        <div
          className="h-2 bg-blue-500 rounded-full"
          style={{ width: `${getRoomProgress(room)}%` }}
        />
      </div>

      <Button
        variant="primary"
        onClick={handleJoinRoom}
        disabled={room.commence || room.j_actuelle >= room.j_max}
        className="w-full"
      >
        {getButtonText(room)}
      </Button>
    </div>
  );
}; 
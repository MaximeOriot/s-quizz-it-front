import Header from "../../components/ui/Header";
import Button from "../../components/ui/Button";
import { useNavigate } from "react-router-dom";
import { useSelector } from 'react-redux';
import { useEffect, useState } from "react";
import { createWebSocket } from "../../util/WebSocket";

interface Room {
  id: number;
  label: string;
  type: "normal" | "rapide";
  difficulte: number;
  j_actuelle: number;
  j_max: number;
  commence: boolean;
  created_at: string;
}

interface RootState {
  auth: {
    user: string | null;
    isAuthenticated: boolean;
  };
}

function GlobalRoom() {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const [rooms, setRooms] = useState<Room[]>([]);

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

  useEffect(() => {
    let socket: WebSocket;
    
    try {
      socket = createWebSocket({
        onMessage: (data) => {
          if (data && typeof data === 'object' && 'type' in data && data.type === "salons_init" && 'salons' in data) {
            setRooms(data.salons as Room[]);
          }
        },
        onError: (error) => {
          console.error("Erreur WebSocket:", error);
        }
      });
    } catch (error) {
      console.error("Erreur lors de la création du WebSocket:", error);
    }

    return () => {
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Header playerName={user ?? localStorage.getItem('username') ?? 'Joueur'} />
      
      <div className="flex flex-col gap-6 items-center p-4">
        <div className="text-center">
          <h1 className="mb-2 text-3xl font-bold text-foreground">
            Salles Globales
          </h1>
          <p className="text-foreground/80">
            Rejoins une salle ou crée la tienne
          </p>
        </div>

        <div className="flex gap-4 mb-6">
          <Button variant="primary" onClick={() => navigate("/createRoom")}>
            Créer une salle
          </Button>
          <Button variant="secondary" onClick={() => window.location.reload()}>
            Actualiser
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4 w-full max-w-6xl md:grid-cols-2 lg:grid-cols-3">
          {rooms.map((room) => (
            <div key={room.id} className="p-4 rounded-xl backdrop-blur-sm border-secondary-foreground bg-secondary-foreground">
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
                  style={{ width: `${(room.j_actuelle / room.j_max) * 100}%` }}
                />
              </div>

              <Button
                variant="primary"
                onClick={() => navigate(`/waitingRoom?roomId=${room.id}`)}
                disabled={room.commence || room.j_actuelle >= room.j_max}
                className="w-full"
              >
                {getButtonText(room)}
              </Button>
            </div>
          ))}
        </div>

        {rooms.length === 0 && (
          <div className="mt-8 text-center text-foreground/60">
            <p className="mb-4 text-lg">Aucune salle ouverte pour le moment</p>
            <Button variant="primary" onClick={() => navigate("/createRoom")}>
              Créer la première salle
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default GlobalRoom; 
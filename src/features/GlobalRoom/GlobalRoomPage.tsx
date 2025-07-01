import Header from "../../components/ui/Header";
import Button from "../../components/ui/Button";
import LoadingAnimation from "../../components/ui/LoadingAnimation";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from 'react';
import { useRoomsData, useGlobalRoomWebSocket } from "./hooks";
import { RoomCard } from "./components/RoomCard";


function GlobalRoom() {
  const navigate = useNavigate();
  const { rooms, updateRooms } = useRoomsData();
  const [isLoading, setIsLoading] = useState(true);

  useGlobalRoomWebSocket({
    onRoomsUpdate: (newRooms) => {
      updateRooms(newRooms);
      setIsLoading(false);
    }
  });

  // Timeout pour éviter un chargement infini
  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 10000);

    return () => clearTimeout(timeout);
  }, []);

  const handleCreateRoom = () => {
    navigate("/createRoom");
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleCreateFirstRoom = () => {
    navigate("/createRoom");
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
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
          <Button variant="primary" onClick={handleCreateRoom}>
            Créer une salle
          </Button>
          <Button variant="secondary" onClick={handleRefresh}>
            Actualiser
          </Button>
        </div>

        {isLoading ? (
          <div className="flex flex-1 justify-center items-center min-h-[400px]">
            <LoadingAnimation
              message="Chargement des salles"
              subMessage="Récupération des salles disponibles"
              variant="dots"
              size="lg"
            />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 w-full max-w-6xl md:grid-cols-2 lg:grid-cols-3">
              {rooms.map((room) => (
                <RoomCard key={room.id} room={room} />
              ))}
            </div>

            {rooms.length === 0 && (
              <div className="mt-8 text-center text-foreground/60">
                <p className="mb-4 text-lg">Aucune salle ouverte pour le moment</p>
                <Button variant="primary" onClick={handleCreateFirstRoom}>
                  Créer la première salle
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default GlobalRoom; 
import Header from "../../components/ui/Header";
import Button from "../../components/ui/Button";
import LoadingAnimation from "../../components/ui/LoadingAnimation";
import CreateRoomModal from "../../components/CreateRoomModal";
import { useState } from 'react';
import { useWebSocketStore } from "../../hooks/useWebSocketStore";
import { RoomCard } from "./components/RoomCard";

function GlobalRoom() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { 
    isConnected, 
    hasReceivedData, 
    rooms, 
    roomsLoading, 
    refreshRooms 
  } = useWebSocketStore();

  // Déterminer le message de chargement en fonction de l'état de connexion
  const getLoadingMessage = () => {
    if (!isConnected) {
      return "Connexion au serveur...";
    }
    if (!hasReceivedData) {
      return "Récupération des salles...";
    }
    return "Récupération des salles disponibles";
  };

  const handleCreateRoom = () => {
    setIsCreateModalOpen(true);
  };

  const handleRefresh = () => {
    refreshRooms();
  };

  const handleCreateFirstRoom = () => {
    setIsCreateModalOpen(true);
  };

  const handleCreateModalClose = () => {
    setIsCreateModalOpen(false);
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

        {roomsLoading ? (
          <div className="flex flex-1 justify-center items-center min-h-[400px]">
            <LoadingAnimation
              message="Chargement des salles"
              subMessage={getLoadingMessage()}
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
      
              {/* Modal de création de salle */}
        <CreateRoomModal
          isOpen={isCreateModalOpen}
          onClose={handleCreateModalClose}
        />
    </div>
  );
}

export default GlobalRoom; 
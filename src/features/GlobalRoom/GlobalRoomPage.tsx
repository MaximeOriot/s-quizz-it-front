import Header from "../../components/ui/Header";
import Button from "../../components/ui/Button";
import LoadingAnimation from "../../components/ui/LoadingAnimation";
import CreateRoomModal from "../../components/CreateRoomModal";
import { useState, useEffect } from 'react';
import { useRoomsData, useGlobalRoomWebSocket } from "./hooks";
import { RoomCard } from "./components/RoomCard";

function GlobalRoom() {
  const { rooms, updateRooms } = useRoomsData();
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [forceCloseModal, setForceCloseModal] = useState(false);

  useGlobalRoomWebSocket({
    onRoomsUpdate: (newRooms) => {
      updateRooms(newRooms);
      setIsLoading(false);
    },
    onCreateRoomSuccess: (roomId) => {
      handleCreateSuccess(roomId);
    },
    onModalSuccess: (roomId) => {
      // Forcer la fermeture du modal quand la création réussit
      console.log('Modal: Salle créée avec succès, roomId:', roomId);
      setForceCloseModal(true);
      setTimeout(() => {
        setIsCreateModalOpen(false);
        setForceCloseModal(false);
      }, 100);
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
    setIsCreateModalOpen(true);
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleCreateFirstRoom = () => {
    setIsCreateModalOpen(true);
  };

  const handleCreateModalClose = () => {
    setIsCreateModalOpen(false);
  };

  const handleCreateSuccess = (roomId?: number) => {
    console.log('Salle créée avec succès, roomId:', roomId);
    
    // Fermer le modal
    setIsCreateModalOpen(false);
    
    if (roomId) {
      // Rediriger vers la salle d'attente
      window.location.href = `/waitingRoom?roomId=${roomId}`;
    } else {
      // Si pas de roomId, on attend que la liste des salles soit mise à jour
      // par le message salons_init du serveur
      console.log('En attente de la mise à jour de la liste des salles...');
    }
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
      
              {/* Modal de création de salle */}
        <CreateRoomModal
          isOpen={isCreateModalOpen}
          onClose={handleCreateModalClose}
          forceClose={forceCloseModal}
        />
    </div>
  );
}

export default GlobalRoom; 
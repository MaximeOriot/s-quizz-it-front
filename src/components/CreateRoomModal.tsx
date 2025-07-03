import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from './ui/Button';
import { useWebSocketStore } from '../hooks/useWebSocketStore';

interface CreateRoomData {
  label: string;
  difficulte: number;
  j_max: number;
}

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  forceClose?: boolean;
}

function CreateRoomModal({ isOpen, onClose, forceClose }: CreateRoomModalProps) {
  const [formData, setFormData] = useState<CreateRoomData>({
    label: '',
    difficulte: 1,
    j_max: 10
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdRoomId, setCreatedRoomId] = useState<number | null>(null);

  const navigate = useNavigate();

  // Callback pour quand une salle est créée
  const handleRoomCreated = (roomId: number) => {
    console.log('🎉 Salle créée avec succès, redirection vers:', roomId);
    setCreatedRoomId(roomId);
    setIsLoading(false);
    
    // Fermer le modal et rediriger vers la salle après un délai plus long
    setTimeout(() => {
      console.log('🚀 Redirection vers la salle:', roomId);
      onClose();
      navigate(`/waitingRoom?roomId=${roomId}`);
    }, 1000); // Délai réduit
  };

  const { createRoom, rooms, refreshRooms } = useWebSocketStore({ onRoomCreated: handleRoomCreated });

  // Effet pour détecter quand une nouvelle salle apparaît dans la liste
  useEffect(() => {
    if (isLoading && rooms.length > 0) {
      // Chercher une salle qui correspond à nos critères de création
      const matchingRoom = rooms.find(room => 
        room.label === formData.label && 
        room.difficulte === formData.difficulte && 
        room.j_max === formData.j_max
      );
      
      if (matchingRoom && !createdRoomId) {
        console.log('🎯 Nouvelle salle détectée dans la liste:', matchingRoom.id);
        setCreatedRoomId(matchingRoom.id);
        setIsLoading(false);
        
        // Fermer le modal et rediriger vers la salle
        setTimeout(() => {
          console.log('🚀 Redirection vers la nouvelle salle:', matchingRoom.id);
          onClose();
          navigate(`/waitingRoom?roomId=${matchingRoom.id}`);
        }, 1000);
      }
    }
  }, [isLoading, rooms, formData, createdRoomId, navigate, onClose]);

  // Réinitialiser le formulaire quand le modal se ferme
  useEffect(() => {
    if (!isOpen || forceClose) {
      setFormData({
        label: '',
        difficulte: 1,
        j_max: 10
      });
      setError(null);
      setIsLoading(false);
      setCreatedRoomId(null);
    }
  }, [isOpen, forceClose]);

  // Effet pour détecter quand une salle a été créée et rediriger (fallback)
  useEffect(() => {
    if (isLoading && rooms.length > 0) {
      // Chercher la salle créée dans la liste mise à jour
      const createdRoom = rooms.find(room => 
        room.label === formData.label && 
        room.difficulte === formData.difficulte && 
        room.j_max === formData.j_max &&
        room.j_actuelle === 1 // Nouvelle salle avec le créateur
      );
      
      if (createdRoom && !createdRoomId) {
        console.log('🎯 Salle créée détectée dans la liste (fallback):', createdRoom.id);
        setCreatedRoomId(createdRoom.id);
        setIsLoading(false);
        
        // Fermer le modal et rediriger vers la salle
        setTimeout(() => {
          console.log('🚀 Redirection vers la salle (fallback):', createdRoom.id);
          onClose();
          navigate(`/waitingRoom?roomId=${createdRoom.id}`);
        }, 500);
      }
    }
  }, [isLoading, rooms, formData, createdRoomId, navigate, onClose]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'difficulte' || name === 'j_max' ? parseInt(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setCreatedRoomId(null);

    try {
      // Créer la salle via le hook centralisé
      createRoom(formData);
      console.log('Demande de création de salle envoyée:', formData);
      
      // Demander la mise à jour de la liste des salles après un délai
      setTimeout(() => {
        console.log('🔄 Demande de rafraîchissement de la liste des salles...');
        refreshRooms();
      }, 2000); // Attendre 2 secondes pour laisser le temps au serveur
      
      // Timeout de sécurité (10 secondes)
      setTimeout(() => {
        if (isLoading) {
          console.warn('Timeout: Aucune réponse du serveur pour la création de salle');
          setError('Timeout: Le serveur n\'a pas répondu. Veuillez réessayer.');
          setIsLoading(false);
        }
      }, 10000);
      
    } catch (err) {
      console.error('Erreur lors de la création de la salle:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    // Réinitialiser le formulaire et fermer
    setFormData({
      label: '',
      difficulte: 1,
      j_max: 10
    });
    setError(null);
    setCreatedRoomId(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="flex fixed inset-0 z-50 justify-center items-center backdrop-blur-sm bg-black/50">
      <div className="p-6 mx-4 w-full max-w-md rounded-xl shadow-xl bg-secondary">
        <div className="mb-6 text-center">
          <h2 className="mb-2 text-2xl font-bold text-primary">
            Créer une salle
          </h2>
          <p className="text-sm text-secondary">
            Configurez votre salle de quiz
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nom de la salle */}
          <div>
            <label htmlFor="label" className="block mb-2 text-sm font-medium text-primary">
              Nom de la salle *
            </label>
            <input
              type="text"
              id="label"
              name="label"
              value={formData.label}
              onChange={handleInputChange}
              required
              className="px-3 py-2 w-full rounded-lg border border-secondary-foreground bg-secondary-foreground text-primary placeholder-secondary focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: Le goatRoom"
              maxLength={50}
            />
          </div>

          {/* Difficulté */}
          <div>
            <label htmlFor="difficulte" className="block mb-2 text-sm font-medium text-primary">
              Difficulté *
            </label>
            <select
              id="difficulte"
              name="difficulte"
              value={formData.difficulte}
              onChange={handleInputChange}
              className="px-3 py-2 w-full rounded-lg border border-secondary-foreground bg-secondary-foreground text-primary focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={1}>Facile</option>
              <option value={2}>Moyen</option>
              <option value={3}>Difficile</option>
            </select>
          </div>

          {/* Nombre maximum de joueurs */}
          <div>
            <label htmlFor="j_max" className="block mb-2 text-sm font-medium text-primary">
              Nombre maximum de joueurs *
            </label>
            <input
              type="number"
              id="j_max"
              name="j_max"
              value={formData.j_max}
              onChange={handleInputChange}
              required
              min="2"
              max="10"
              className="px-3 py-2 w-full rounded-lg border border-secondary-foreground bg-secondary-foreground text-primary focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="mt-1 text-xs text-secondary">
              Entre 2 et 10 joueurs
            </p>
          </div>

          {/* Message d'erreur */}
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-100 rounded-lg border border-red-300">
              {error}
            </div>
          )}

          {/* Message de succès */}
          {createdRoomId && (
            <div className="p-3 text-sm text-green-600 bg-green-100 rounded-lg border border-green-300">
              Salle créée avec succès ! Redirection en cours...
            </div>
          )}

          {/* Boutons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={handleCancel}
              disabled={isLoading}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isLoading || !formData.label.trim()}
              className="flex-1"
            >
              {isLoading ? 'Création...' : 'Créer la salle'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateRoomModal; 
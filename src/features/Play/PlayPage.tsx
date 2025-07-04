import { useNavigate } from 'react-router-dom';
import Bento from '../../components/ui/Bento';
import Header from '../../components/ui/Header';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { getAuthenticatedUserThunk } from '../auth/authThunks';
import { fetchQuestionsThunk, prepareSoloGameQuestionThunk } from '../Game/gameThunks';
import { prepareSoloGame } from '../Game/gameSlice';
import Button from '../../components/ui/Button';
import type { RootState, AppDispatch } from '../../store';

function PlayPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    // Si on n'a pas de données utilisateur en state mais qu'on a un token
    if (!user && !isAuthenticated && token) {
      dispatch(getAuthenticatedUserThunk())
        .unwrap()
        .catch(() => {
          console.log('Token invalide ou expiré, nettoyage du localStorage');
          // Nettoyer le localStorage si l'authentification échoue
          localStorage.removeItem('token');
          localStorage.removeItem('username');
        });
    }
    
    // Si on n'a pas de token, l'utilisateur est en mode invité
    if (!token) {
      console.log('Utilisateur en mode invité');
      // Nettoyer le nom d'utilisateur si pas de token
      localStorage.removeItem('username');
    }
  }, [dispatch, user, isAuthenticated]);

  const handleSoloGame = async () => {
    // Récupérer le nom d'utilisateur depuis différentes sources
    let playerName = localStorage.getItem('username');
    
    // Si pas de nom dans localStorage, essayer de le récupérer depuis Redux
    if (!playerName && user) {
      playerName = user;
    }
    
    // Si toujours pas de nom, utiliser un nom par défaut pour les invités
    if (!playerName) {
      playerName = 'Invité';
    }
    
    const gameId = 'solo-' + Date.now(); // Génération d'un ID de jeu unique pour le mode solo
    
    try {
      // Dispatch de l'action pour préparer le jeu solo
      dispatch(prepareSoloGame({ playerName, gameId }));
      
      // Attendre que les questions soient récupérées avant de naviguer
      await dispatch(fetchQuestionsThunk()).unwrap();
      navigate('/game'); // Redirection vers la page de jeu
    } catch (error) {
      console.error('Erreur lors de la préparation du jeu solo:', error);
      // Optionnel: gérer l'erreur (afficher un message, etc.)
    }
  };

  const bentoItems = [
    {
      title: "Partie rapide",
      description: "Jouer à un quiz",
      tag: "Aleatoire",
      tagPosition: "none" as const,
      variant: "primary" as const,
      padding: "sm" as const,
      height: "h-32 md:h-40",
      hover: true,
      colSpan: 3,
      order: 1,
      mobileOrder: 1,
      alignment: "start" as const,
      mobileAlignment: "start" as const,
      onClick: () => navigate('/Play')
    },
    {
      title: "Entre ami",
      description: "Exclusif entre amis",
      tag: "Collectif",
      tagPosition: "right" as const,
      variant: "secondary" as const,
      padding: "sm" as const,
      height: "h-36 md:h-44",
      hover: true,
      colSpan: 2,
      order: 2,
      mobileOrder: 2,
      alignment: "start" as const,
      mobileAlignment: "end" as const,
      onClick: () => navigate('/Play')
    },
    {
      title: "Solo",
      description: "Jouer à un quiz",
      tag: "Local",
      tagPosition: "left" as const,
      variant: "primary" as const,
      padding: "sm" as const,
      height: "h-40 md:h-48",
      hover: true,
      colSpan: 3,
      order: 3,
      mobileOrder: 2,
      alignment: "start" as const,
      mobileAlignment: "start" as const,
      onClick: () => handleSoloGame()
    },
    {
      title: "Thème",
      description: "Créer un quiz solo avec un thème",
      tag: "Entrainement",
      tagPosition: "right" as const,
      variant: "secondary" as const,
      padding: "sm" as const,
      height: "h-32 md:h-40",
      hover: true,
      colSpan: 2,
      order: 2,
      mobileOrder: 3,
      alignment: "start" as const,
      mobileAlignment: "end" as const,
      onClick: () => navigate('/Play')
    }
  ];

  return (
    <div className="flex flex-col items-center justify-center gap-6">
        <Header />
        <div className="text-center lg:my-6 title">
            Que veux-tu faire ? 
        </div>

        <Button onClick={() => navigate('/globalRoom')}>Trouver une salle</Button>
        
        <Bento items={bentoItems} />
    </div>
  );
}

export default PlayPage; 
import { useNavigate } from 'react-router-dom';
import Bento from '../../components/ui/Bento';
import Header from '../../components/ui/Header';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { getAuthenticatedUserThunk } from '../auth/authThunks';

function PlayPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isAuthenticated, loading } = useSelector((state: any) => state.auth);

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    // Si on n'a pas de données utilisateur en state mais qu'on a un token
    if (!user && !isAuthenticated && token) {
      dispatch(getAuthenticatedUserThunk());
    }
    
    // Si on n'a pas de token, l'utilisateur est en mode invité
    if (!token) {
      console.log('Utilisateur en mode invité');
      // Optionnel: vous pouvez définir un état pour gérer le mode invité
    }
  }, [dispatch, user, isAuthenticated]);

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
      onClick: () => navigate('/Play')
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
    <div className="flex flex-col gap-6 justify-center items-center">
        <Header playerName= {localStorage.getItem('username')} />
        <div className="text-center lg:my-6 title">
            Que veux-tu faire ?
        </div>
        
        <Bento items={bentoItems} />
    </div>
  );
}

export default PlayPage; 
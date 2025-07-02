import React from 'react';
import logo from '../../assets/logo-squizzit-removed-bg.png';
import { useLocation, useNavigate } from 'react-router-dom';
import { logout } from '../../features/auth/authSlice';
import { useDispatch, useSelector } from 'react-redux';

interface HeaderProps {
  playerName?: string | null;
}

interface RootState {
  auth: {
    user: string | { name?: string; username?: string; display_name?: string; email?: string } | null;
    isAuthenticated: boolean;
  };
}

const Header: React.FC<HeaderProps> = ({ playerName }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  console.log(user);

  // Extraire le nom d'utilisateur de l'objet user
  const getUserName = (user: RootState['auth']['user']): string => {
  console.log(user);
    if (!user) return 'Invité';
    
    // Si c'est une chaîne, l'utiliser directement
    if (typeof user === 'string') return user;
    
    // Si c'est un objet, essayer d'extraire le nom
    if (typeof user === 'object') {
      // Essayer différents champs possibles
      return user.name ?? user.username ?? user.display_name ?? 'Invité';
    }
    
    return 'Invité';
  };

  // Utiliser le prop playerName s'il est fourni, sinon utiliser localStorage, puis Redux
  const displayName = playerName ?? localStorage.getItem('username') ?? getUserName(user) ?? 'Invité';

  // Vérifier si l'utilisateur est connecté
  const isUserConnected = isAuthenticated || (user !== null && user !== undefined);

  const handleLogout = () => {
    // Dispatch logout action
    dispatch(logout());
    // Redirect to home page or login page
    navigate('/');
  };

  return (
    <nav className="flex items-center justify-between w-full py-3 border-b lg:px-6 border-b-secondary">
      <div className="flex items-center gap-3">
        <button 
          onClick={() => navigate('/')}
          className="p-0 bg-transparent border-none cursor-pointer"
          aria-label="Retour à l'accueil"
        >
          <img 
            src={logo} 
            alt="Logo S-quizz-it" 
            className="w-20 h-auto" 
          />
        </button>
      </div>
      <div className='flex items-center gap-4'>
        {isUserConnected && (
          <button
            onClick={() => handleLogout()}
            className="px-4 py-2 font-semibold border-b-2 border-secondary text-secondary"
          >
            Se déconnecter
          </button>
        )}
        <div className="text-lg font-semibold">
          Bienvenue, {displayName}!
        </div>
        <img src='./src/assets/settings.png' width={25} onClick={() => navigate('/profile', { state: { from: location.pathname } })} className='cursor-pointer'/>
      </div>
    </nav>
  )
};

export default Header;

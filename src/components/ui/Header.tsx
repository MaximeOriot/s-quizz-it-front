import React from 'react';
import logo from '../../assets/logo-squizzit-removed-bg.png';
import { useLocation, useNavigate } from 'react-router-dom';
import { logout } from '../../features/auth/authSlice';
import { useDispatch, useSelector } from 'react-redux';

interface RootState {
  auth: {
    user: string | { name?: string; username?: string; display_name?: string; email?: string } | null;
    isAuthenticated: boolean;
  };
}

const Header: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  // Utiliser le prop playerName s'il est fourni, sinon utiliser localStorage, puis Redux
  const displayName = user

  // Vérifier si l'utilisateur est connecté
  const isUserConnected = isAuthenticated;
  const isGuest = user === 'Invité';

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
        {isGuest && (
          <button
            onClick={() => handleLogout()}
            className="px-4 py-2 font-semibold border-b-2 border-secondary text-secondary"
          >
            Retour à l'accueil
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

import React from 'react';
import logo from '../../assets/logo-squizzit-removed-bg.png';
import { useLocation, useNavigate } from 'react-router-dom';
import { logout } from '../../features/auth/authSlice';
import { useDispatch } from 'react-redux';

interface HeaderProps {
  playerName: string | null;
}

const Header: React.FC<HeaderProps> = ({ playerName }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  const handleLogout = () => {
    // Dispatch logout action
    dispatch(logout());
    // Redirect to home page or login page
    navigate('/');
  };

  return (
    <nav className="flex items-center justify-between w-full py-3 border-b lg:px-6 border-b-secondary">
      <div className="flex items-center gap-3">
        <img src={logo} alt="Logo S-quizz-it" className="w-20 h-auto" />
      </div>
      <div className='flex items-center gap-4'>
        <button
                onClick={() => handleLogout()}
                className="px-4 py-2 font-semibold border-b-2 border-secondary text-secondary"
              >
                Se déconnecter
              </button>
        <div className="text-lg font-semibold">
          {playerName ? `Bienvenue, ${playerName} !` : 'Bienvenue, invité!'}
        </div>
        <img src='./src/assets/settings.png' width={25} onClick={() => navigate('/profile', { state: { from: location.pathname } })} className='cursor-pointer'/>
      </div>
    </nav>
  )
};

export default Header;

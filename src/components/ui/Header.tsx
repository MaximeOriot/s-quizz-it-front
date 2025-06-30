import React from 'react';
import logo from '../../assets/logo-squizzit-removed-bg.png';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../features/auth/authSlice';
import { useDispatch } from 'react-redux';

interface HeaderProps {
  playerName: string | null;
}

const Header: React.FC<HeaderProps> = ({ playerName }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = () => {
    // Dispatch logout action
    dispatch(logout());
    // Redirect to home page or login page
    navigate('/');
  };

  return (
    <nav className="flex justify-between items-center py-3 w-full border-b lg:px-6 border-b-secondary">
      <div className="flex gap-3 items-center">
        <img src={logo} alt="Logo S-quizz-it" className="w-20 h-auto" />
      </div>
      <div className='flex gap-4 items-center'>
        <button
                onClick={() => handleLogout()}
                className="px-4 py-2 font-semibold border-b-2 border-secondary text-secondary"
              >
                Se déconnecter
              </button>
        <div className="text-lg font-semibold">
          {playerName ? `Bienvenue, ${playerName}!` : 'Bienvenue, invité!'}
        </div>
      </div>
    </nav>
  )
};

export default Header;
